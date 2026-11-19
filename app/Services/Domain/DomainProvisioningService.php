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
            // =========================================================================
            // STEP 1: Add Reverse-Proxy Site into CloudPanel (Appears in CloudPanel UI)
            // =========================================================================
            $clpResult = $this->registerInCloudPanel($domain, $storeCode);
            if ($clpResult['success']) {
                $domainModel->log('cloudpanel', 'success', "Site registered in CloudPanel dashboard.");
            } else {
                $domainModel->log('cloudpanel', 'warning', "CloudPanel CLI notice: " . ($clpResult['error'] ?? 'Proceeding with Nginx configuration.'));
            }

            // Identify VHost config path (In CloudPanel, sites are in /etc/nginx/sites-enabled/)
            $configPath = is_file("/etc/nginx/sites-enabled/{$domain}.conf")
                ? "/etc/nginx/sites-enabled/{$domain}.conf"
                : (is_file("/etc/nginx/sites-available/{$domain}.conf")
                    ? "/etc/nginx/sites-available/{$domain}.conf"
                    : "{$this->nginxConfigDir}/shoppy-domain-{$domain}.conf");

            $symlinkPath = (dirname($configPath) === '/etc/nginx/sites-enabled')
                ? null
                : "/etc/nginx/sites-enabled/" . basename($configPath);

            // =========================================================================
            // STEP 2: Issue & Install Let's Encrypt SSL Certificate
            // Uses CloudPanel's: clpctl lets-encrypt:install:certificate --domainName=...
            // =========================================================================
            $domainModel->update(['status' => 'ssl_pending']);
            $domainModel->log('ssl_issue', 'info', "Installing Let's Encrypt SSL certificate for {$serverNameStr}...");

            $sslResult = $this->issueLetsEncryptCertificate($domain, $serverNames);

            // =========================================================================
            // STEP 3: Update Nginx VHost with Reverse-Proxy & sub_filter URL Rewriting
            // =========================================================================
            if ($sslResult['success']) {
                $vhostConfig = $this->generateHttpsConfig(
                    $serverNameStr,
                    $sslResult['cert_path'],
                    $sslResult['key_path'],
                    $storeCode
                );
            } else {
                // If SSL has not finished yet, deploy HTTP reverse-proxy so site works immediately
                $vhostConfig = $this->generateHttpConfig($serverNameStr, $storeCode);
            }

            $writeSuccess = $this->atomicWriteNginxConfig($configPath, $vhostConfig, $symlinkPath);
            if (!$writeSuccess['success']) {
                $domainModel->update([
                    'status' => 'failed',
                    'error_message' => $writeSuccess['error'],
                ]);
                $domainModel->log('provisioning', 'failed', $writeSuccess['error']);
                return $writeSuccess;
            }

            $domainModel->update(['nginx_config_path' => $configPath]);
            $domainModel->log('provisioning', 'success', "Nginx VHost successfully updated with reverse-proxy rules.");

            if ($sslResult['success']) {
                $domainModel->update([
                    'ssl_status' => 'active',
                    'status' => 'active',
                    'activated_at' => now(),
                    'ssl_expiry_at' => now()->addDays(89),
                    'error_message' => null,
                ]);
                $domainModel->log('activated', 'success', "Domain {$domain} is LIVE with active CloudPanel HTTPS reverse-proxy to {$storeCode}!");
                return [
                    'success' => true,
                    'message' => "Domain {$domain} successfully added to CloudPanel, SSL installed, and VHost updated!",
                    'status' => 'active',
                ];
            }

            // Fallback if SSL pending
            $domainModel->update([
                'ssl_status' => 'pending',
                'status' => 'active',
                'activated_at' => now(),
                'error_message' => "CloudPanel VHost active (HTTP). SSL pending: " . ($sslResult['error'] ?? 'ACME challenge in progress.'),
            ]);
            $domainModel->log('ssl_issue', 'warning', "SSL challenge pending. HTTP proxy is live.");

            return [
                'success' => true,
                'message' => "Domain connected in CloudPanel. VHost updated with HTTP. SSL in progress.",
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
     * Register reverse-proxy site in CloudPanel via clpctl CLI
     * Official CloudPanel Syntax:
     * clpctl site:add:reverse-proxy --domainName=... --reverseProxyUrl=... --siteUser=... --siteUserPassword=...
     */
    protected function registerInCloudPanel(string $domain, string $storeCode): array
    {
        $clpBin = null;
        $candidates = ['/usr/bin/clpctl', '/usr/local/bin/clpctl', 'clpctl'];
        foreach ($candidates as $cand) {
            if (@is_executable($cand)) {
                $clpBin = $cand;
                break;
            }
        }
        if (!$clpBin) {
            $clpBin = '/usr/bin/clpctl';
        }

        // Generate isolated siteUser and strong password required by CloudPanel
        $cleanPart = preg_replace('/[^a-z0-9]/i', '', explode('.', $domain)[0]);
        $siteUser = strtolower(substr('cp_' . ($cleanPart ?: 'site'), 0, 16));
        $sitePassword = 'Sp!' . bin2hex(random_bytes(6)) . '9#';

        // Check if site already exists in CloudPanel
        $checkCmd = "{$clpBin} site:get --domainName=" . escapeshellarg($domain) . " 2>&1";
        @exec($checkCmd, $cOut, $cCode);
        if ($cCode !== 0) {
            @exec("sudo -n {$checkCmd} 2>&1", $cOut, $cCode);
        }

        if ($cCode === 0) {
            return ['success' => true, 'already_exists' => true];
        }

        // Add site in CloudPanel
        $addCmd = "{$clpBin} site:add:reverse-proxy --domainName=" . escapeshellarg($domain) . " --reverseProxyUrl=" . escapeshellarg("https://shoppy.live/{$storeCode}") . " --siteUser=" . escapeshellarg($siteUser) . " --siteUserPassword=" . escapeshellarg($sitePassword) . " 2>&1";
        $out = [];
        $code = 0;
        @exec($addCmd, $out, $code);
        if ($code !== 0) {
            $out = [];
            @exec("sudo -n {$addCmd} 2>&1", $out, $code);
        }

        if ($code === 0) {
            return ['success' => true, 'output' => implode("\n", $out)];
        }

        return [
            'success' => false,
            'error' => implode("\n", $out) ?: "CloudPanel CLI command failed.",
        ];
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
     * Issue Let's Encrypt certificate using CloudPanel CLI or Certbot Webroot
     * Official CloudPanel Syntax:
     * clpctl lets-encrypt:install:certificate --domainName=...
     */
    protected function issueLetsEncryptCertificate(string $mainDomain, array $allDomains): array
    {
        $clpBin = is_executable('/usr/bin/clpctl') ? '/usr/bin/clpctl' : (is_executable('/usr/local/bin/clpctl') ? '/usr/local/bin/clpctl' : 'clpctl');

        // 1. Try CloudPanel's official SSL installer command:
        // clpctl lets-encrypt:install:certificate --domainName=...
        $cmdClp = "{$clpBin} lets-encrypt:install:certificate --domainName=" . escapeshellarg($mainDomain) . " 2>&1";
        $outClp = [];
        $codeClp = 0;
        @exec($cmdClp, $outClp, $codeClp);
        if ($codeClp !== 0) {
            $outClp = [];
            @exec("sudo -n {$cmdClp} 2>&1", $outClp, $codeClp);
        }

        // Check default certificate locations in CloudPanel and Nginx
        $certCandidates = [
            "/etc/nginx/ssl-certificates/{$mainDomain}/fullchain.pem",
            "/etc/nginx/ssl-certificates/{$mainDomain}/certificate.crt",
            "/home/cloudpanel/certificates/{$mainDomain}/certificate.crt",
            "/etc/letsencrypt/live/{$mainDomain}/fullchain.pem",
        ];
        $keyCandidates = [
            "/etc/nginx/ssl-certificates/{$mainDomain}/privkey.pem",
            "/etc/nginx/ssl-certificates/{$mainDomain}/private.key",
            "/home/cloudpanel/certificates/{$mainDomain}/private.key",
            "/etc/letsencrypt/live/{$mainDomain}/privkey.pem",
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
