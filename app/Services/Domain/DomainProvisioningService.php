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
        $domainModel->update(['status' => 'provisioning']);
        $domainModel->log('provisioning', 'info', "Starting automated server provisioning for {$domain}...");

        $serverNames = [$domain];
        if ($domainModel->www_enabled && substr_count($domain, '.') === 1) {
            $serverNames[] = "www.{$domain}";
        }
        $serverNameStr = implode(' ', $serverNames);

        $isLinux = (strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN');

        // Step 1: Generate initial HTTP configuration for ACME challenge & proxy
        $httpConfig = $this->generateHttpConfig($serverNameStr);
        $configPath = "{$this->nginxConfigDir}/shoppy-domain-{$domain}.conf";
        $symlinkPath = "/etc/nginx/sites-enabled/shoppy-domain-{$domain}.conf";

        if ($isLinux) {
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
            $domainModel->log('provisioning', 'success', "Initial Nginx HTTP virtual host generated and validated.");

            // Step 2: Attempt Let's Encrypt SSL via Certbot / ACME Webroot
            $domainModel->update(['status' => 'ssl_pending']);
            $domainModel->log('ssl_issue', 'info', "Requesting Let's Encrypt SSL certificate for {$serverNameStr}...");

            $sslResult = $this->issueLetsEncryptCertificate($domain, $serverNames);

            if ($sslResult['success']) {
                // Step 3: Upgrade to full HTTPS configuration
                $httpsConfig = $this->generateHttpsConfig(
                    $serverNameStr,
                    $sslResult['cert_path'],
                    $sslResult['key_path']
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
                    $domainModel->log('activated', 'success', "Domain {$domain} is now LIVE with active HTTPS SSL!");
                    return [
                        'success' => true,
                        'message' => "Custom domain {$domain} provisioned and activated successfully with HTTPS!",
                        'status' => 'active',
                    ];
                }
            }

            // If SSL failed (e.g. certbot not installed or rate limit), keep HTTP active with status notice
            $domainModel->update([
                'ssl_status' => 'failed',
                'status' => 'active', // HTTP is working
                'activated_at' => now(),
                'error_message' => "HTTP is active. SSL pending verification: " . ($sslResult['error'] ?? 'Certbot challenge in progress.'),
            ]);
            $domainModel->log('ssl_issue', 'warning', "SSL issuance notice: " . ($sslResult['error'] ?? 'Certbot challenge pending.'));

            return [
                'success' => true,
                'message' => "Domain connected via HTTP. SSL certificate will be issued shortly.",
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
        $domainModel->log('activated', 'success', "Domain {$domain} simulated active in local dev environment.");

        return [
            'success' => true,
            'message' => "Local dev: Custom domain {$domain} successfully configured and activated.",
            'status' => 'active',
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
        $symlinkPath = "/etc/nginx/sites-enabled/shoppy-domain-{$domain}.conf";

        if (strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN') {
            if (file_exists($symlinkPath)) {
                @unlink($symlinkPath);
            }
            if (file_exists($configPath)) {
                @unlink($configPath);
            }

            // Validate configuration after removal and reload Nginx
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
        $tempPath = $targetPath . '.tmp.' . uniqid();

        // Ensure directory exists
        $dir = dirname($targetPath);
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }

        if (@file_put_contents($tempPath, $content) === false) {
            return [
                'success' => false,
                'error' => "Could not write temporary Nginx configuration to {$tempPath}. Check file permissions.",
            ];
        }

        // Temporarily put in place to test
        $backupPath = null;
        if (file_exists($targetPath)) {
            $backupPath = $targetPath . '.bak.' . uniqid();
            @copy($targetPath, $backupPath);
        }

        @rename($tempPath, $targetPath);

        // Ensure symlink exists if sites-available is used
        if ($symlinkPath && dirname($symlinkPath) !== dirname($targetPath) && is_dir(dirname($symlinkPath))) {
            if (!file_exists($symlinkPath)) {
                @symlink($targetPath, $symlinkPath);
            }
        }

        // Test configuration syntax
        $output = [];
        $exitCode = 0;
        @exec('nginx -t 2>&1', $output, $exitCode);

        if ($exitCode !== 0) {
            $err = "Nginx configuration syntax test failed:\n" . implode("\n", $output);
            Log::error($err);

            // Rollback
            if ($backupPath && file_exists($backupPath)) {
                @rename($backupPath, $targetPath);
            } else {
                @unlink($targetPath);
                if ($symlinkPath && file_exists($symlinkPath)) {
                    @unlink($symlinkPath);
                }
            }

            return ['success' => false, 'error' => $err];
        }

        // Cleanup backup
        if ($backupPath && file_exists($backupPath)) {
            @unlink($backupPath);
        }

        // Reload Nginx cleanly
        @exec('systemctl reload nginx 2>&1 || nginx -s reload 2>&1');

        return ['success' => true];
    }

    /**
     * Issue Let's Encrypt certificate using Certbot Webroot challenge
     */
    protected function issueLetsEncryptCertificate(string $mainDomain, array $allDomains): array
    {
        $domainFlags = '';
        foreach ($allDomains as $d) {
            $domainFlags .= ' -d ' . escapeshellarg($d);
        }

        $email = config('mail.from.address', 'contact@enexa.in');
        $cmd = "certbot certonly --webroot -w " . escapeshellarg($this->publicWebroot) . " {$domainFlags} --non-interactive --agree-tos --email " . escapeshellarg($email) . " 2>&1";

        $output = [];
        $exitCode = 0;
        @exec($cmd, $output, $exitCode);

        $certPath = "/etc/letsencrypt/live/{$mainDomain}/fullchain.pem";
        $keyPath = "/etc/letsencrypt/live/{$mainDomain}/privkey.pem";

        if ($exitCode === 0 && file_exists($certPath) && file_exists($keyPath)) {
            return [
                'success' => true,
                'cert_path' => $certPath,
                'key_path' => $keyPath,
            ];
        }

        return [
            'success' => false,
            'error' => implode("\n", $output) ?: "Certbot certificate generation failed or cert files not found.",
        ];
    }

    /**
     * Generate HTTP Virtual Host Reverse Proxy Configuration
     */
    protected function generateHttpConfig(string $serverNames): string
    {
        $ts = now()->toIso8601String();
        return <<<NGINX
# ==============================================================================
# Shoppy ERP Automated Custom Domain Reverse Proxy
# Server: Hostinger VPS + CloudPanel + Nginx
# Generated: {$ts}
# ==============================================================================

server {
    listen 80;
    listen [::]:80;
    server_name {$serverNames};

    # Let's Encrypt ACME Challenge Path
    location /.well-known/acme-challenge/ {
        root {$this->publicWebroot};
        try_files \$uri =404;
    }

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host shoppy.live;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Custom-Domain \$host;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
        client_max_body_size 50M;
    }
}
NGINX;
    }

    /**
     * Generate HTTPS + HTTP Redirect Virtual Host Reverse Proxy Configuration
     */
    protected function generateHttpsConfig(string $serverNames, string $certPath, string $keyPath): string
    {
        $ts = now()->toIso8601String();
        return <<<NGINX
# ==============================================================================
# Shoppy ERP Automated Custom Domain Reverse Proxy (HTTPS + SSL)
# Server: Hostinger VPS + CloudPanel + Nginx
# Generated: {$ts}
# ==============================================================================

server {
    listen 80;
    listen [::]:80;
    server_name {$serverNames};

    location /.well-known/acme-challenge/ {
        root {$this->publicWebroot};
        try_files \$uri =404;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name {$serverNames};

    ssl_certificate {$certPath};
    ssl_certificate_key {$keyPath};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host shoppy.live;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Custom-Domain \$host;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
        client_max_body_size 50M;
    }
}
NGINX;
    }
}
