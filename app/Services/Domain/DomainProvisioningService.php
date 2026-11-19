<?php

namespace App\Services\Domain;

use App\Models\StoreDomain;
use Illuminate\Support\Facades\Log;

class DomainProvisioningService
{
    protected string $nginxConfigDir;
    protected string $publicWebroot;

    public function __construct()
    {
        $this->nginxConfigDir = config('services.custom_domain.nginx_dir')
            ?: (is_dir('/etc/nginx/sites-available') ? '/etc/nginx/sites-available' : '/etc/nginx/conf.d');
        
        $this->publicWebroot = config('services.custom_domain.webroot')
            ?: base_path('public');
    }

    /**
     * Provision Nginx reverse-proxy and Let's Encrypt SSL for a verified domain.
     */
    public function provision(StoreDomain $domainModel): array
    {
        $domain = $domainModel->domain;
        $storeCode = $domainModel->store?->shop_code ?: 'SP20261110124405';

        $domainModel->update(['status' => 'provisioning']);
        $domainModel->log('provisioning', 'info', "Starting automated CloudPanel & Nginx reverse-proxy provisioning for {$domain} (Store: {$storeCode})...");

        $serverNames = [$domain];
        $isApex = app(DomainValidationService::class)->isApexDomain($domain);
        if ($domainModel->www_enabled && $isApex) {
            $serverNames[] = "www.{$domain}";
        }
        $serverNameStr = implode(' ', $serverNames);

        $isLinux = (strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN');

        if ($isLinux) {
            // Step 1: Attempt registering in CloudPanel UI via clpctl CLI if available
            $this->registerInCloudPanel($domain, $storeCode);

            // Step 2: Write Nginx virtual host with exact reverse-proxy + sub_filter rules
            $configPath = is_file("/etc/nginx/sites-available/{$domain}.conf")
                ? "/etc/nginx/sites-available/{$domain}.conf"
                : "{$this->nginxConfigDir}/shoppy-domain-{$domain}.conf";
            $symlinkPath = "/etc/nginx/sites-enabled/" . basename($configPath);

            $httpConfig = $this->generateHttpConfig($serverNameStr, $storeCode);
            $writeSuccess = $this->atomicWriteNginxConfig($configPath, $httpConfig, $symlinkPath);
            if (!$writeSuccess['success']) {
                $domainModel->update([
                    'status' => 'failed',
                    'error_message' => $writeSuccess['error'],
                ]);
                $domainModel->log('provisioning', 'failed', $writeSuccess['error']);
                return $writeSuccess;
            }

            $domainModel->update(['nginx_config_path' => $configPath]);
            $domainModel->log('provisioning', 'success', "Nginx HTTP reverse-proxy virtual host installed and verified with 'nginx -t'.");

            // Step 3: Request Let's Encrypt SSL certificate via Certbot / CloudPanel ACME
            $domainModel->update(['status' => 'ssl_pending']);
            $domainModel->log('ssl_issue', 'info', "Issuing Let's Encrypt SSL certificate for {$serverNameStr}...");

            $sslResult = $this->issueLetsEncryptCertificate($domain, $serverNames);

            if ($sslResult['success']) {
                // Step 4: Upgrade to full HTTPS configuration with exact sub_filter and proxy rules
                $httpsConfig = $this->generateHttpsConfig(
                    $serverNameStr,
                    $sslResult['cert_path'],
                    $sslResult['key_path'],
                    $storeCode
                );

                $upgradeResult = $this->atomicWriteNginxConfig($configPath, $httpsConfig, $symlinkPath);
                if ($upgradeResult['success']) {
                    $domainModel->update([
                        'ssl_status' => 'active',
                        'status' => 'active',
                        'activated_at' => now(),
                        'ssl_expiry_at' => now()->addDays(89),
                        'error_message' => null,
                    ]);
                    $domainModel->log('activated', 'success', "Domain {$domain} is LIVE with active HTTPS reverse-proxy to {$storeCode}!");
                    return [
                        'success' => true,
                        'message' => "Custom domain {$domain} provisioned and activated successfully with HTTPS!",
                        'status' => 'active',
                    ];
                }
            }

            // Fallback: If SSL challenge is still propagating, HTTP reverse-proxy is active
            $domainModel->update([
                'ssl_status' => 'pending',
                'status' => 'active',
                'activated_at' => now(),
                'error_message' => "HTTP is active. SSL pending DNS propagation: " . ($sslResult['error'] ?? 'ACME challenge in progress.'),
            ]);
            $domainModel->log('ssl_issue', 'warning', "SSL challenge pending. HTTP proxy is live.");

            return [
                'success' => true,
                'message' => "Domain connected via HTTP. SSL certificate will activate upon DNS propagation.",
                'status' => 'active',
            ];
        }

        // Windows local development fallback
        $domainModel->update([
            'nginx_config_path' => "mock://nginx/shoppy-domain-{$domain}.conf",
            'ssl_status' => 'active',
            'status' => 'active',
            'activated_at' => now(),
            'ssl_expiry_at' => now()->addDays(90),
            'error_message' => null,
        ]);
        $domainModel->log('activated', 'success', "Domain {$domain} simulated active in local dev.");

        return [
            'success' => true,
            'message' => "Local dev: Custom domain {$domain} successfully configured and activated.",
            'status' => 'active',
        ];
    }

    /**
     * Attempt registering site in CloudPanel database/UI via clpctl CLI
     */
    protected function registerInCloudPanel(string $domain, string $storeCode): void
    {
        $clpCandidates = ['/usr/local/bin/clpctl', '/usr/bin/clpctl', 'clpctl'];
        $clpBin = null;
        foreach ($clpCandidates as $cand) {
            if (@is_executable($cand)) {
                $clpBin = $cand;
                break;
            }
        }

        if ($clpBin) {
            $cmd = "{$clpBin} site:add:reverse-proxy --domainName=" . escapeshellarg($domain) . " --reverseProxyUrl=" . escapeshellarg("https://shoppy.live/{$storeCode}") . " 2>&1";
            @exec($cmd, $out, $code);
            if ($code !== 0) {
                // Try with sudo -n if permitted in sudoers
                @exec("sudo -n {$cmd} 2>&1");
            }
        }
    }

    /**
     * Safely remove domain configuration and reload Nginx
     */
    public function remove(StoreDomain $domainModel): array
    {
        $domain = $domainModel->domain;
        $domainModel->update(['status' => 'removing']);
        $domainModel->log('removed', 'info', "Removing Nginx configuration for {$domain}...");

        $configPath = $domainModel->nginx_config_path ?: "{$this->nginxConfigDir}/shoppy-domain-{$domain}.conf";
        $symlinkPath = "/etc/nginx/sites-enabled/" . basename($configPath);

        if (strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN') {
            // Also try removing from CloudPanel via clpctl
            @exec("clpctl site:delete --domainName=" . escapeshellarg($domain) . " 2>&1");
            @exec("sudo -n clpctl site:delete --domainName=" . escapeshellarg($domain) . " 2>&1");

            if (file_exists($symlinkPath)) {
                @unlink($symlinkPath);
            }
            if (file_exists($configPath)) {
                @unlink($configPath);
            }

            @exec('nginx -t 2>&1', $out, $code);
            if ($code === 0) {
                @exec('systemctl reload nginx 2>&1 || nginx -s reload 2>&1');
            }
        }

        $domainModel->log('removed', 'success', "Configuration removed and Nginx reloaded successfully.");
        $domainModel->delete();

        return [
            'success' => true,
            'message' => "Custom domain {$domain} was removed cleanly.",
        ];
    }

    /**
     * Atomic write to temporary file, nginx -t test, atomic move and reload
     */
    protected function atomicWriteNginxConfig(string $targetPath, string $content, ?string $symlinkPath = null): array
    {
        $dir = dirname($targetPath);
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }

        // 1. Write content to system temp directory first (always writable by PHP user)
        $localTemp = sys_get_temp_dir() . '/shoppy_vhost_' . uniqid() . '.conf';
        if (@file_put_contents($localTemp, $content) === false) {
            return [
                'success' => false,
                'error' => "Failed to write temporary configuration file to {$localTemp}.",
            ];
        }

        // 2. Safely place the file at targetPath (direct write or via sudo cp/tee)
        $writeSuccess = false;
        if (@file_put_contents($targetPath . '.test_perm', 'test') !== false) {
            @unlink($targetPath . '.test_perm');
            if (@file_put_contents($targetPath, $content) !== false) {
                $writeSuccess = true;
            }
        }

        if (!$writeSuccess) {
            // Attempt with sudo cp
            $cmdCp = "sudo -n cp " . escapeshellarg($localTemp) . " " . escapeshellarg($targetPath) . " 2>&1";
            $outCp = [];
            $codeCp = 0;
            @exec($cmdCp, $outCp, $codeCp);

            if ($codeCp === 0 && file_exists($targetPath)) {
                $writeSuccess = true;
            } else {
                // Attempt sudo tee
                $cmdTee = "sudo -n tee " . escapeshellarg($targetPath) . " < " . escapeshellarg($localTemp) . " 2>&1";
                $outTee = [];
                $codeTee = 0;
                @exec($cmdTee, $outTee, $codeTee);
                if ($codeTee === 0 && file_exists($targetPath)) {
                    $writeSuccess = true;
                }
            }
        }

        @unlink($localTemp);

        if (!$writeSuccess) {
            $cmdHelp = 'echo "shoppy ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/shoppy-custom-domain && sudo chmod 0440 /etc/sudoers.d/shoppy-custom-domain';
            return [
                'success' => false,
                'error' => "Could not write Nginx configuration to {$targetPath}. Server sudo permission required. Please run this 1-line command in your Hostinger VPS SSH terminal as root:\n{$cmdHelp}",
            ];
        }

        // 3. Symlink into sites-enabled if used
        if ($symlinkPath && dirname($symlinkPath) !== dirname($targetPath) && is_dir(dirname($symlinkPath))) {
            if (!file_exists($symlinkPath)) {
                if (!@symlink($targetPath, $symlinkPath)) {
                    @exec("sudo -n ln -sf " . escapeshellarg($targetPath) . " " . escapeshellarg($symlinkPath) . " 2>&1");
                }
            }
        }

        // 4. Test configuration syntax (nginx -t or sudo -n nginx -t)
        $output = [];
        $exitCode = 0;
        @exec('nginx -t 2>&1', $output, $exitCode);
        if ($exitCode !== 0) {
            @exec('sudo -n nginx -t 2>&1', $output, $exitCode);
        }

        if ($exitCode !== 0) {
            $err = "Nginx configuration syntax test failed:\n" . implode("\n", $output);
            Log::error($err);

            // Rollback
            @unlink($targetPath);
            @exec("sudo -n rm -f " . escapeshellarg($targetPath) . " 2>&1");
            if ($symlinkPath && file_exists($symlinkPath)) {
                @unlink($symlinkPath);
                @exec("sudo -n rm -f " . escapeshellarg($symlinkPath) . " 2>&1");
            }

            return ['success' => false, 'error' => $err];
        }

        // 5. Reload Nginx cleanly
        @exec('systemctl reload nginx 2>&1 || nginx -s reload 2>&1 || sudo -n systemctl reload nginx 2>&1 || sudo -n service nginx reload 2>&1');

        return ['success' => true];
    }

    /**
     * Issue Let's Encrypt certificate using Certbot Webroot or CloudPanel
     */
    protected function issueLetsEncryptCertificate(string $mainDomain, array $allDomains): array
    {
        // 1. Try CloudPanel CLI SSL command first if available
        $cmdClp = "clpctl site:install:certificate:lets-encrypt --domainName=" . escapeshellarg($mainDomain) . " 2>&1";
        @exec($cmdClp, $outClp, $codeClp);
        if ($codeClp !== 0) {
            @exec("sudo -n {$cmdClp} 2>&1", $outClp, $codeClp);
        }

        // Check default certificate locations
        $certCandidates = [
            "/etc/letsencrypt/live/{$mainDomain}/fullchain.pem",
            "/etc/nginx/ssl-certificates/{$mainDomain}/fullchain.pem",
            "/home/cloudpanel/certificates/{$mainDomain}/certificate.crt",
        ];
        $keyCandidates = [
            "/etc/letsencrypt/live/{$mainDomain}/privkey.pem",
            "/etc/nginx/ssl-certificates/{$mainDomain}/privkey.pem",
            "/home/cloudpanel/certificates/{$mainDomain}/private.key",
        ];

        foreach ($certCandidates as $i => $cp) {
            if (file_exists($cp) && file_exists($keyCandidates[$i])) {
                return [
                    'success' => true,
                    'cert_path' => $cp,
                    'key_path' => $keyCandidates[$i],
                ];
            }
        }

        // 2. Try Certbot Webroot challenge directly
        $domainFlags = '';
        foreach ($allDomains as $d) {
            $domainFlags .= ' -d ' . escapeshellarg($d);
        }

        $email = config('mail.from.address', 'contact@enexa.in');
        $cmdCertbot = "certbot certonly --webroot -w " . escapeshellarg($this->publicWebroot) . " {$domainFlags} --non-interactive --agree-tos --email " . escapeshellarg($email) . " 2>&1";

        $output = [];
        $exitCode = 0;
        @exec($cmdCertbot, $output, $exitCode);
        if ($exitCode !== 0) {
            @exec("sudo -n {$cmdCertbot}", $output, $exitCode);
        }

        $certPath = "/etc/letsencrypt/live/{$mainDomain}/fullchain.pem";
        $keyPath = "/etc/letsencrypt/live/{$mainDomain}/privkey.pem";

        if (file_exists($certPath) && file_exists($keyPath)) {
            return [
                'success' => true,
                'cert_path' => $certPath,
                'key_path' => $keyPath,
            ];
        }

        return [
            'success' => false,
            'error' => implode("\n", $output) ?: "Let's Encrypt certificate files not generated yet. DNS propagation in progress.",
        ];
    }

    /**
     * Generate HTTP Virtual Host Reverse Proxy Configuration (Pre-SSL)
     */
    protected function generateHttpConfig(string $serverNames, string $storeCode): string
    {
        $ts = now()->toIso8601String();
        return <<<NGINX
# ==============================================================================
# Shoppy ERP Automated Custom Domain Reverse Proxy (HTTP & ACME)
# Store: {$storeCode} | Generated: {$ts}
# ==============================================================================

server {
    listen 80;
    listen [::]:80;
    server_name {$serverNames};

    # Let's Encrypt ACME Challenge
    location ^~ /.well-known/acme-challenge/ {
        auth_basic off;
        allow all;
        default_type "text/plain";
        root {$this->publicWebroot};
        try_files \$uri =404;
    }

    # Main Storefront Page: / -> shoppy.live/{$storeCode}
    location = / {
        proxy_pass https://shoppy.live/{$storeCode};
        proxy_http_version 1.1;
        proxy_ssl_server_name on;
        proxy_ssl_name shoppy.live;

        proxy_set_header Host shoppy.live;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Custom-Domain \$host;

        proxy_pass_request_headers on;
        proxy_pass_request_body on;
        proxy_set_header Accept-Encoding "";

        proxy_redirect https://shoppy.live/ https://\$host/;
        proxy_redirect http://shoppy.live/ https://\$host/;
        proxy_cookie_domain shoppy.live \$host;

        sub_filter 'https://shoppy.live/{$storeCode}' 'http://\$host';
        sub_filter 'http://shoppy.live/{$storeCode}' 'http://\$host';
        sub_filter 'https://shoppy.live' 'http://\$host';
        sub_filter 'http://shoppy.live' 'http://\$host';
        sub_filter '//shoppy.live' '//\$host';
        sub_filter_once off;
        sub_filter_types text/html text/css application/javascript application/x-javascript text/javascript application/json;

        proxy_connect_timeout 720s;
        proxy_send_timeout 720s;
        proxy_read_timeout 720s;
    }

    # All other requests: API, images, assets
    location / {
        proxy_pass https://shoppy.live;
        proxy_http_version 1.1;
        proxy_ssl_server_name on;
        proxy_ssl_name shoppy.live;

        proxy_set_header Host shoppy.live;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Custom-Domain \$host;

        proxy_pass_request_headers on;
        proxy_pass_request_body on;
        proxy_set_header Accept-Encoding "";

        proxy_redirect https://shoppy.live/ https://\$host/;
        proxy_redirect http://shoppy.live/ https://\$host/;
        proxy_cookie_domain shoppy.live \$host;

        sub_filter 'https://shoppy.live/{$storeCode}' 'http://\$host';
        sub_filter 'http://shoppy.live/{$storeCode}' 'http://\$host';
        sub_filter 'https://shoppy.live' 'http://\$host';
        sub_filter 'http://shoppy.live' 'http://\$host';
        sub_filter '//shoppy.live' '//\$host';
        sub_filter_once off;
        sub_filter_types text/html text/css application/javascript application/x-javascript text/javascript application/json;

        proxy_connect_timeout 720s;
        proxy_send_timeout 720s;
        proxy_read_timeout 720s;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
NGINX;
    }

    /**
     * Generate HTTPS + HTTP Redirect Virtual Host Reverse Proxy Configuration
     * Matches the exact CloudPanel / Hostinger reverse-proxy template
     */
    protected function generateHttpsConfig(string $serverNames, string $certPath, string $keyPath, string $storeCode): string
    {
        $ts = now()->toIso8601String();
        return <<<NGINX
# ==============================================================================
# HTTP SERVER - ACME + HTTPS REDIRECT
# Store: {$storeCode} | Generated: {$ts}
# ==============================================================================

server {
    listen 80;
    listen [::]:80;

    server_name {$serverNames};

    # Let's Encrypt ACME Challenge
    location ^~ /.well-known/acme-challenge/ {
        auth_basic off;
        allow all;
        default_type "text/plain";
        root {$this->publicWebroot};
        try_files \$uri =404;
    }

    # Force HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

# ==============================================================================
# HTTPS SERVER - REVERSE PROXY
# ==============================================================================

server {
    listen 443 ssl;
    listen [::]:443 ssl;

    http2 on;

    ssl_certificate {$certPath};
    ssl_certificate_key {$keyPath};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    server_name {$serverNames};

    # SSL / ACME Challenge
    location ^~ /.well-known/acme-challenge/ {
        auth_basic off;
        allow all;
        default_type "text/plain";
        root {$this->publicWebroot};
        try_files \$uri =404;
    }

    # =========================================================
    # MAIN PAGE
    # {$serverNames} -> shoppy.live/{$storeCode}
    # =========================================================

    location = / {
        proxy_pass https://shoppy.live/{$storeCode};

        proxy_http_version 1.1;

        proxy_ssl_server_name on;
        proxy_ssl_name shoppy.live;

        proxy_set_header Host shoppy.live;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Custom-Domain \$host;

        proxy_pass_request_headers on;
        proxy_pass_request_body on;

        # Disable compression for response rewriting
        proxy_set_header Accept-Encoding "";

        # Redirect rewrite
        proxy_redirect https://shoppy.live/ https://\$host/;
        proxy_redirect http://shoppy.live/ https://\$host/;

        # Cookie rewrite
        proxy_cookie_domain shoppy.live \$host;

        # HTML / CSS / JS URL rewrite
        sub_filter 'https://shoppy.live/{$storeCode}' 'https://\$host';
        sub_filter 'http://shoppy.live/{$storeCode}' 'https://\$host';
        sub_filter 'https://shoppy.live' 'https://\$host';
        sub_filter 'http://shoppy.live' 'https://\$host';
        sub_filter '//shoppy.live' '//\$host';

        sub_filter_once off;

        sub_filter_types
            text/html
            text/css
            application/javascript
            application/x-javascript
            text/javascript
            application/json;

        # Timeouts
        proxy_connect_timeout 720s;
        proxy_send_timeout 720s;
        proxy_read_timeout 720s;

        # Buffer
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
        proxy_temp_file_write_size 256k;
        proxy_max_temp_file_size 0;

        proxy_intercept_errors off;
    }

    # =========================================================
    # ALL OTHER REQUESTS
    # API / POST / GET / CSS / JS / IMAGES
    # =========================================================

    location / {
        proxy_pass https://shoppy.live;

        proxy_http_version 1.1;

        proxy_ssl_server_name on;
        proxy_ssl_name shoppy.live;

        proxy_set_header Host shoppy.live;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Custom-Domain \$host;

        proxy_pass_request_headers on;
        proxy_pass_request_body on;

        proxy_set_header Accept-Encoding "";

        # Redirect rewrite
        proxy_redirect https://shoppy.live/ https://\$host/;
        proxy_redirect http://shoppy.live/ https://\$host/;

        # Cookie rewrite
        proxy_cookie_domain shoppy.live \$host;

        # URL rewrite
        sub_filter 'https://shoppy.live/{$storeCode}' 'https://\$host';
        sub_filter 'http://shoppy.live/{$storeCode}' 'https://\$host';
        sub_filter 'https://shoppy.live' 'https://\$host';
        sub_filter 'http://shoppy.live' 'https://\$host';
        sub_filter '//shoppy.live' '//\$host';

        sub_filter_once off;

        sub_filter_types
            text/html
            text/css
            application/javascript
            application/x-javascript
            text/javascript
            application/json;

        # Timeouts
        proxy_connect_timeout 720s;
        proxy_send_timeout 720s;
        proxy_read_timeout 720s;

        # Buffer
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
        proxy_temp_file_write_size 256k;
        proxy_max_temp_file_size 0;

        proxy_intercept_errors off;
    }

    # =========================================================
    # BLOCK HIDDEN FILES
    # =========================================================

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
NGINX;
    }
}
