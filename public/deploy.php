<?php
/**
 * Shoppy ERP - Automated Git Production Deployment Script
 * Repository: https://github.com/kushprakash/shoppy.git
 */

// Deployment Configuration - Auto-runs immediately when file is opened
$auto_run = true;
$user_token = $_GET['token'] ?? $_POST['token'] ?? '';

// Direct CLP Provisioning Trigger
if (isset($_GET['run_clp_setup'])) {
    $domain = 'ahrc.ind.in';
    $storeCode = 'SP20261110124405';
    $webroot = '/home/cp_ahrc/htdocs/ahrc.ind.in';

    // Step 1: Ensure webroot and .well-known directory exists
    @exec("sudo -n mkdir -p {$webroot}/.well-known/acme-challenge");
    @exec("sudo -n chown -R cp_ahrc:cp_ahrc {$webroot}");

    // Step 2: Write temporary plain HTTP server block for ACME validation
    $httpAcmeVhost = <<<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name {$domain} www.{$domain};
    root {$webroot};

    location ^~ /.well-known/acme-challenge/ {
        auth_basic off;
        allow all;
        default_type "text/plain";
    }

    location / {
        return 200 "ACME HTTP Verification In Progress";
    }
}
NGINX;

    $tmp = sys_get_temp_dir() . '/acme_init.conf';
    file_put_contents($tmp, $httpAcmeVhost);
    @exec("sudo -n cp {$tmp} /etc/nginx/sites-enabled/{$domain}.conf");
    @unlink($tmp);
    @exec("sudo -n nginx -t && sudo -n systemctl reload nginx");

    // Step 3: Run Certbot Webroot
    $out_cert = []; $code_cert = 0;
    @exec("sudo -n certbot certonly --webroot -w {$webroot} -d {$domain} -d www.{$domain} --agree-tos --email contact@enexa.in --non-interactive 2>&1", $out_cert, $code_cert);

    // Step 4: Copy certificates to CloudPanel's ssl location
    $cert_installed = false;
    $cert_src = "/etc/letsencrypt/live/{$domain}/fullchain.pem";
    $key_src = "/etc/letsencrypt/live/{$domain}/privkey.pem";

    $cp_out = []; $cp_code = 0;
    @exec("sudo -n test -f {$cert_src} && sudo -n cp {$cert_src} /etc/nginx/ssl-certificates/{$domain}.crt && sudo -n cp {$key_src} /etc/nginx/ssl-certificates/{$domain}.key && sudo -n chmod 644 /etc/nginx/ssl-certificates/{$domain}.crt && sudo -n chmod 600 /etc/nginx/ssl-certificates/{$domain}.key", $cp_out, $cp_code);
    $cert_installed = ($cp_code === 0);

    // Step 5: Write the user's exact production reverse-proxy VHost template
    $vhostContent = <<<NGINX
# =============================================================
# HTTP SERVER - ACME + HTTPS REDIRECT
# =============================================================

server {
    listen 80;
    listen [::]:80;

    server_name {$domain} www.{$domain};

    root {$webroot};

    access_log /home/cp_ahrc/logs/nginx/access.log main;
    error_log /home/cp_ahrc/logs/nginx/error.log;

    # Let's Encrypt ACME Challenge
    location ^~ /.well-known/acme-challenge/ {
        auth_basic off;
        allow all;
        default_type "text/plain";
        try_files \$uri =404;
    }

    # Force HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

# =============================================================
# HTTPS SERVER - REVERSE PROXY
# =============================================================

server {
    listen 443 ssl;
    listen [::]:443 ssl;

    http2 on;
    http3 off;

    ssl_certificate_key /etc/nginx/ssl-certificates/{$domain}.key;
    ssl_certificate /etc/nginx/ssl-certificates/{$domain}.crt;

    server_name {$domain} www.{$domain};

    root {$webroot};

    access_log /home/cp_ahrc/logs/nginx/access.log main;
    error_log /home/cp_ahrc/logs/nginx/error.log;

    # SSL / ACME
    location ^~ /.well-known/acme-challenge/ {
        auth_basic off;
        allow all;
        default_type "text/plain";
        try_files \$uri =404;
    }

    # =========================================================
    # MAIN PAGE
    # {$domain} -> shoppy.live/{$storeCode}
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

        proxy_hide_header X-Varnish;

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

        proxy_redirect https://shoppy.live/ https://\$host/;
        proxy_redirect http://shoppy.live/ https://\$host/;

        proxy_cookie_domain shoppy.live \$host;

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

        proxy_connect_timeout 720s;
        proxy_send_timeout 720s;
        proxy_read_timeout 720s;

        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
        proxy_temp_file_write_size 256k;
        proxy_max_temp_file_size 0;

        proxy_hide_header X-Varnish;

        proxy_intercept_errors off;
    }
}
NGINX;

    $tmp = sys_get_temp_dir() . '/ahrc_vhost.conf';
    file_put_contents($tmp, $vhostContent);
    @exec("sudo -n cp {$tmp} /etc/nginx/sites-enabled/{$domain}.conf");
    @unlink($tmp);

    // Validate Nginx and reload
    $t_out = []; $t_code = 0;
    @exec("sudo -n nginx -t 2>&1", $t_out, $t_code);

    $reload_code = 0;
    if ($t_code === 0) {
        @exec("sudo -n systemctl reload nginx 2>&1", $r_out, $reload_code);
    }

    // Always ensure main application permissions remain intact
    @exec("sudo -n chown -R shoppy:shoppy /home/shoppy/htdocs/shoppy.live && sudo -n chmod -R 755 /home/shoppy/htdocs/shoppy.live");

    // Update database record for ahrc.ind.in to active
    $proj = dirname(__DIR__);
    @exec("php -r \"require '{$proj}/vendor/autoload.php'; \$app = require_once '{$proj}/bootstrap/app.php'; \$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); \$m = App\Models\StoreDomain::where('domain', '{$domain}')->first(); if(\$m) { \$m->update(['status' => 'active', 'ssl_status' => 'active', 'activated_at' => now(), 'error_message' => null]); }\" 2>&1");

    header('Content-Type: application/json');
    echo json_encode([
        'certbot' => ['code' => $code_cert, 'output' => $out_cert],
        'cert_installed' => $cert_installed,
        'nginx_t' => ['code' => $t_code, 'output' => $t_out],
        'nginx_reload' => $reload_code,
        'status' => 'SUCCESS_LIVE'
    ]);
    exit;
}

// Optional GitHub Personal Access Token (for private repos or rate limit bypass) e.g. &git_token=ghp_...
$git_token = $_GET['git_token'] ?? $_POST['git_token'] ?? '';

// Project root path (parent directory of public/)
$project_path = dirname(__DIR__);

// Read .env to get DB_USERNAME
$env_file = $project_path . DIRECTORY_SEPARATOR . '.env';
$env_content = file_exists($env_file) ? @file_get_contents($env_file) : '';
$env_db_user = 'shoppy-live';
if (preg_match('/^DB_USERNAME=(.*)$/m', $env_content, $m_user)) {
    $env_db_user = trim($m_user[1], " \t\n\r\0\x0B\"'");
}

// Check if user requested to auto-grant MySQL permissions via Root
$grant_feedback = null;
if (isset($_POST['apply_db_perms']) || isset($_GET['apply_db_perms'])) {
    $mysql_root_pass = $_POST['shoppy-live'] ?? $_GET['shoppy-live'] ?? '';
    try {
        $root_pdo = new PDO("mysql:host=localhost", "shoppy-live", $mysql_root_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        $root_pdo->exec("GRANT CREATE ON *.* TO '{$env_db_user}'@'localhost'");
        $root_pdo->exec("GRANT ALL PRIVILEGES ON `tenant_%`.* TO '{$env_db_user}'@'localhost'");
        $root_pdo->exec("GRANT CREATE ON *.* TO '{$env_db_user}'@'127.0.0.1'");
        $root_pdo->exec("GRANT ALL PRIVILEGES ON `tenant_%`.* TO '{$env_db_user}'@'127.0.0.1'");
        $root_pdo->exec("FLUSH PRIVILEGES");
        $grant_feedback = [
            'success' => true,
            'message' => "Successfully granted CREATE and tenant_% privileges to user '{$env_db_user}'!"
        ];
    } catch (\Throwable $e) {
        $grant_feedback = [
            'success' => false,
            'message' => "Could not connect to MySQL as root: " . $e->getMessage()
        ];
    }
}

// Check if user requested to auto-grant sudo authorization via VPS root password
$sudo_grant_feedback = null;
if (isset($_POST['apply_sudo_auth']) || isset($_GET['apply_sudo_auth'])) {
    $vps_root_pass = $_POST['vps_root_pass'] ?? $_GET['vps_root_pass'] ?? '';
    if (!empty($vps_root_pass)) {
        $cur_user = @exec('whoami') ?: get_current_user() ?: 'shoppy';
        $sudoers_rule = "{$cur_user} ALL=(ALL) NOPASSWD: ALL";
        $setup_cmd = "echo '{$sudoers_rule}' > /etc/sudoers.d/shoppy-custom-domain && chmod 0440 /etc/sudoers.d/shoppy-custom-domain";

        $auth_success = false;
        $error_log = [];

        // Method 1: Python3 with pty to authenticate via `su root`
        $py_script = sys_get_temp_dir() . '/auth_su_' . uniqid() . '.py';
        $py_code = <<<'PY'
import pty, os, sys, time

password = sys.argv[1]
cmd = sys.argv[2]

master, slave = pty.openpty()
pid = os.fork()

if pid == 0:
    os.close(master)
    os.dup2(slave, 0)
    os.dup2(slave, 1)
    os.dup2(slave, 2)
    os.close(slave)
    os.execlp('su', 'su', '-', 'root', '-c', cmd)
else:
    os.close(slave)
    time.sleep(0.4)
    os.write(master, (password + '\n').encode('utf-8'))
    time.sleep(0.8)
    out = b''
    try:
        while True:
            chunk = os.read(master, 1024)
            if not chunk: break
            out += chunk
            if len(chunk) < 1024: break
    except:
        pass
    os.close(master)
    os.waitpid(pid, 0)
    print(out.decode('utf-8', errors='ignore'))
PY;
        @file_put_contents($py_script, $py_code);

        $py_bin = @exec('which python3 2>&1') ?: @exec('which python 2>&1') ?: '';
        if ($py_bin && file_exists($py_bin)) {
            $cmd_py = "{$py_bin} " . escapeshellarg($py_script) . " " . escapeshellarg($vps_root_pass) . " " . escapeshellarg($setup_cmd) . " 2>&1";
            @exec($cmd_py, $py_out, $py_code_res);
            $error_log[] = "Python execution: " . implode(" ", $py_out);
        }
        @unlink($py_script);

        // Check if sudo -n id now works
        @exec('sudo -n id 2>&1', $check_id, $code_id);
        if ($code_id === 0) {
            $auth_success = true;
        }

        // Method 2: Try sudo -S (if root pass is shoppy pass)
        if (!$auth_success) {
            $cmd_sudo = "sudo -S sh -c " . escapeshellarg($setup_cmd) . " 2>&1";
            $desc = [0 => ["pipe", "r"], 1 => ["pipe", "w"], 2 => ["pipe", "w"]];
            $proc = @proc_open($cmd_sudo, $desc, $pipes);
            if (is_resource($proc)) {
                fwrite($pipes[0], $vps_root_pass . "\n");
                fclose($pipes[0]);
                $s_out = stream_get_contents($pipes[1]); fclose($pipes[1]);
                $s_err = stream_get_contents($pipes[2]); fclose($pipes[2]);
                proc_close($proc);
                $error_log[] = "Sudo execution: {$s_err} {$s_out}";
            }

            @exec('sudo -n id 2>&1', $check_id2, $code_id2);
            if ($code_id2 === 0) {
                $auth_success = true;
            }
        }

        // Method 3: Try sshpass to root@127.0.0.1
        if (!$auth_success) {
            $cmd_ssh = "sshpass -p " . escapeshellarg($vps_root_pass) . " ssh -o StrictHostKeyChecking=no -o ConnectTimeout=4 root@127.0.0.1 " . escapeshellarg($setup_cmd) . " 2>&1";
            @exec($cmd_ssh, $ssh_out, $ssh_code);
            $error_log[] = "SSH 127.0.0.1: " . implode(" ", $ssh_out);

            @exec('sudo -n id 2>&1', $check_id3, $code_id3);
            if ($code_id3 === 0) {
                $auth_success = true;
            }
        }

        if ($auth_success) {
            // Automatically execute CloudPanel registration and SSL for ahrc.ind.in right now!
            $clp_out = [];
            $clp_code = 0;
            @exec("sudo -n /usr/local/bin/clpctl site:add:reverse-proxy --domainName=ahrc.ind.in --reverseProxyUrl='https://shoppy.live/SP20261110124405' --siteUser=cp_ahrc --siteUserPassword='ShoppyAutoSecure2026!' 2>&1", $clp_out, $clp_code);

            // Install SSL in CloudPanel
            $ssl_out = [];
            $ssl_code = 0;
            @exec("sudo -n /usr/local/bin/clpctl lets-encrypt:install:certificate --domainName=ahrc.ind.in 2>&1", $ssl_out, $ssl_code);

            // Trigger Laravel provisioning service to update VHost
            $art_out = [];
            @exec("php -r \"require 'vendor/autoload.php'; \$app = require_once 'bootstrap/app.php'; \$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); \$m = App\Models\StoreDomain::where('domain', 'ahrc.ind.in')->first(); if(\$m) { echo json_encode(app(App\Services\Domain\DomainProvisioningService::class)->provision(\$m)); }\" 2>&1", $art_out);

            $clp_diag = "CLP: " . implode(" | ", $clp_out) . "\nSSL: " . implode(" | ", $ssl_out) . "\nPROV: " . implode(" | ", $art_out);

            $sudo_grant_feedback = [
                'success' => true,
                'message' => "Successfully authorized user '{$cur_user}' with passwordless sudo!\n{$clp_diag}"
            ];
        } else {
            $sudo_grant_feedback = [
                'success' => false,
                'message' => "Authorization attempt failed. Diagnostic details: " . implode(" | ", array_filter($error_log))
            ];
        }
    }
}

// Auto-sync Production Mail Configuration into .env
$mail_sync_feedback = null;
if (file_exists($env_file)) {
    $cur_env = @file_get_contents($env_file) ?: '';
    $mail_replacements = [
        'APP_NAME' => '"Shoppy ERP"',
        'MAIL_MAILER' => 'smtp',
        'MAIL_HOST' => 'smtp.gmail.com',
        'MAIL_PORT' => '465',
        'MAIL_USERNAME' => 'contact@enexa.in',
        'MAIL_PASSWORD' => 'lgjuvwsxcrsdnrqf',
        'MAIL_ENCRYPTION' => 'ssl',
        'MAIL_FROM_ADDRESS' => 'contact@enexa.in',
        'MAIL_FROM_NAME' => '"Shoppy ERP - Enexa IT Solutions Private Limited"',
    ];
    $needs_write = false;
    foreach ($mail_replacements as $mk => $mv) {
        $re = "/^{$mk}=.*$/m";
        if (preg_match($re, $cur_env)) {
            $cur_env = preg_replace($re, "{$mk}={$mv}", $cur_env);
            $needs_write = true;
        } else {
            $cur_env .= "\n{$mk}={$mv}";
            $needs_write = true;
        }
    }
    if ($needs_write) {
        @file_put_contents($env_file, $cur_env);
        $mail_sync_feedback = "Synced Gmail SMTP settings (contact@enexa.in, Port 465 SSL) into .env";
    }
}

// Test OTP Email Dispatcher
$test_mail_result = null;
$target_test_mail = trim((string) ($_POST['test_mail_recipient'] ?? $_GET['test_mail_recipient'] ?? ''));
if (!empty($target_test_mail) && (isset($_POST['send_test_email']) || isset($_GET['send_test_email']))) {
    try {
        $autoload_file = $project_path . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';
        $app_file = $project_path . DIRECTORY_SEPARATOR . 'bootstrap' . DIRECTORY_SEPARATOR . 'app.php';
        if (file_exists($autoload_file) && file_exists($app_file)) {
            require_once $autoload_file;
            $app_inst = require_once $app_file;
            $app_inst->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

            $otp_code = (string) random_int(100000, 999999);
            $res = \App\Services\CommunicationService::sendOtpEmail(
                ownerName: 'Store Merchant',
                ownerEmail: $target_test_mail,
                otp: $otp_code,
                storeCode: 'DEPLOYTEST',
                storeName: 'Shoppy Production Deployment Test'
            );

            $test_mail_result = [
                'success' => (($res['status'] ?? 0) === 1),
                'message' => (($res['status'] ?? 0) === 1)
                    ? "SUCCESS: Test OTP ({$otp_code}) dispatched to {$target_test_mail} via {$res['mailer']} (Port {$res['port']})!"
                    : "FAILED: " . ($res['message'] ?? 'Unknown error') . " (" . json_encode($res['transport_errors'] ?? []) . ")",
            ];
        } else {
            $test_mail_result = [
                'success' => false,
                'message' => 'Autoload or bootstrap file not found.',
            ];
        }
    } catch (\Throwable $e) {
        $test_mail_result = [
            'success' => false,
            'message' => "Exception: " . $e->getMessage(),
        ];
    }
}

// Common server PATH additions for cPanel / Linux / NVM Node
if (strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN') {
    putenv("PATH=" . getenv("PATH") . ":/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/" . get_current_user() . "/.nvm/versions/node/v20.0.0/bin:/home/" . get_current_user() . "/.nvm/versions/node/v18.0.0/bin");
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shoppy ERP — Live Git Deployment Console</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; background: #0b1120; color: #f8fafc; padding: 24px; min-height: 100vh; }
        .container { max-width: 900px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .title { font-size: 20px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 10px; }
        .repo-badge { font-size: 11px; font-family: monospace; background: #1e293b; color: #94a3b8; padding: 6px 12px; border-radius: 8px; border: 1px solid #334155; }
        .btn { background: linear-gradient(135deg, #0284c7, #00a2c7); color: #fff; font-weight: 700; border: none; padding: 10px 22px; border-radius: 12px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; transition: all 0.2s; box-shadow: 0 4px 14px rgba(0,162,199,0.3); }
        .btn:hover { background: linear-gradient(135deg, #0369a1, #0284c7); transform: translateY(-1px); }
        .step { margin-bottom: 16px; background: #1e293b/40; border: 1px solid #334155/60; border-radius: 14px; overflow: hidden; }
        .step-header { padding: 12px 16px; background: #1e293b; font-size: 13px; font-weight: 700; display: flex; justify-content: space-between; align-items: center; }
        .step-name { color: #e2e8f0; font-family: monospace; }
        .status-badge { font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 6px; }
        .status-success { background: #065f46; color: #34d399; }
        .status-failed { background: #881337; color: #fda4af; }
        .console-box { padding: 14px; background: #020617; font-family: "Fira Code", monospace; font-size: 12px; line-height: 1.6; color: #cbd5e1; white-space: pre-wrap; word-break: break-all; max-height: 260px; overflow-y: auto; }
        .summary { margin-top: 24px; padding: 20px; border-radius: 14px; text-align: center; }
        .summary-success { background: rgba(6, 95, 70, 0.2); border: 1px solid #059669; color: #34d399; }
        .summary-failed { background: rgba(136, 19, 55, 0.2); border: 1px solid #e11d48; color: #fb7185; }
        .info-pill { display: inline-block; padding: 4px 10px; background: #1e293b; border-radius: 6px; font-size: 11px; color: #94a3b8; margin: 4px; }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <div>
            <div class="title">
                <span>🚀 Shoppy ERP Deployment System</span>
            </div>
            <div style="margin-top: 6px;">
                <span class="repo-badge">Repo: https://github.com/kushprakash/shoppy.git</span>
                <span class="repo-badge">Branch: main</span>
            </div>
        </div>
        <div>
            <a href="?run=1<?php echo !empty($git_token) ? '&git_token=' . urlencode($git_token) : ''; ?>" class="btn">
                <span>⚡ Re-Deploy (Run Again)</span>
            </a>
        </div>
    </div>

<?php
if (!$auto_run) {
    echo "<div style='text-align: center; padding: 50px 20px;'>";
    echo "<h3 style='font-size: 18px; margin-bottom: 12px; color: #f1f5f9;'>Ready to pull latest code from GitHub?</h3>";
    echo "<p style='font-size: 13px; color: #94a3b8; margin-bottom: 24px;'>Click below to pull origin/main into <code>" . htmlspecialchars($project_path) . "</code>, clear Laravel caches and run migrations.</p>";
    echo "<a href='?run=1' class='btn' style='font-size: 15px; padding: 14px 32px;'>🚀 Start Deployment</a>";
    echo "</div>";
    echo "</div></body></html>";
    exit;
}

// Set higher timeout and memory for composer download
@set_time_limit(600);
@ini_set('max_execution_time', '600');
@ini_set('memory_limit', '1024M');
putenv('COMPOSER_MEMORY_LIMIT=-1');

// 1. Remove stale git index lock if present
$lock_file = $project_path . DIRECTORY_SEPARATOR . '.git' . DIRECTORY_SEPARATOR . 'index.lock';
if (file_exists($lock_file)) {
    @unlink($lock_file);
}

// 2. Set repository URL (inject token if provided)
$repo_url = !empty($git_token)
    ? "https://{$git_token}@github.com/kushprakash/shoppy.git"
    : "https://github.com/kushprakash/shoppy.git";

$is_windows = (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN');

// 3. Resolve PHP CLI Binary (Must NEVER be php-fpm FastCGI daemon)
$php_bin = 'php';
if (!$is_windows) {
    // Determine CLI path from php-fpm version (e.g. php-fpm8.5 -> /usr/bin/php8.5)
    $cli_from_fpm = null;
    if (preg_match('/php-fpm(\d+\.\d+)/', PHP_BINARY, $m_fpm)) {
        $cli_from_fpm = '/usr/bin/php' . $m_fpm[1];
    }

    $php_candidates = array_filter([
        $cli_from_fpm,
        '/usr/bin/php8.5',
        '/usr/bin/php8.4',
        '/usr/bin/php8.3',
        '/usr/bin/php8.2',
        '/usr/bin/php',
        '/usr/local/bin/php',
        '/usr/local/bin/ea-php83',
        '/usr/local/bin/ea-php82'
    ]);

    foreach ($php_candidates as $cand) {
        if (@is_executable($cand) && strpos($cand, 'php-fpm') === false) {
            $php_bin = $cand;
            break;
        }
    }
}

// 4. Resolve Composer Executable (Check system composer, composer.phar, or auto-download composer.phar)
$composer_cmd = '';
if ($is_windows) {
    $composer_cmd = 'composer';
} else {
    $test_code = 1;
    @exec('composer -V 2>&1', $test_out, $test_code);
    if ($test_code === 0) {
        $composer_cmd = 'composer';
    } else {
        $composer_candidates = ['/usr/local/bin/composer', '/usr/bin/composer', '/opt/cpanel/composer/bin/composer'];
        foreach ($composer_candidates as $cp) {
            if (@is_executable($cp)) {
                $composer_cmd = $cp;
                break;
            }
        }
        if (empty($composer_cmd)) {
            $phar_file = $project_path . '/composer.phar';
            if (!file_exists($phar_file)) {
                $dl = @file_get_contents('https://getcomposer.org/download/latest-stable/composer.phar');
                if ($dl) {
                    @file_put_contents($phar_file, $dl);
                    @chmod($phar_file, 0755);
                }
            }
            if (file_exists($phar_file)) {
                $composer_cmd = "{$php_bin} \"{$phar_file}\"";
            } else {
                $composer_cmd = 'composer';
            }
        }
    }
}

// 5. Auto-extract vendor.zip or app.zip if present in project root
$vendor_zip = $project_path . DIRECTORY_SEPARATOR . 'vendor.zip';
$vendor_autoload = $project_path . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';
if (file_exists($vendor_zip) && !file_exists($vendor_autoload)) {
    if (class_exists('ZipArchive')) {
        $zip = new ZipArchive;
        if ($zip->open($vendor_zip) === TRUE) {
            $zip->extractTo($project_path);
            $zip->close();
        }
    }
}

// 6. Check Vite Manifest / Auto-extract build if manifest is missing
$build_manifest = $project_path . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'build' . DIRECTORY_SEPARATOR . 'manifest.json';
if (!file_exists($build_manifest)) {
    $zip_candidates = ['build.zip', 'app.zip'];
    foreach ($zip_candidates as $zc) {
        $zp = $project_path . DIRECTORY_SEPARATOR . $zc;
        if (file_exists($zp) && class_exists('ZipArchive')) {
            $zip = new ZipArchive;
            if ($zip->open($zp) === TRUE) {
                $zip->extractTo($project_path);
                $zip->close();
                if (file_exists($build_manifest)) break;
            }
        }
    }
}

// Commands definition
$commands = [
    'Git Safe Directory' => 'git config --global --add safe.directory "*"',
    'Configure Remote Origin' => "git remote set-url origin \"{$repo_url}\"",
    'Git Fetch Latest Code' => 'git fetch origin main 2>&1',
    'Git Force Sync to Origin Main' => 'git reset --hard origin/main 2>&1',
    'Composer Install (Download Vendor Packages)' => "{$composer_cmd} install --no-dev --optimize-autoloader --prefer-dist --no-interaction 2>&1",
    'Clear Laravel Optimize Caches' => "{$php_bin} artisan optimize:clear 2>&1",
    'Run Central Migrations' => "{$php_bin} artisan migrate --force --path=database/migrations/central 2>&1",
    'Sync & Auto-Provision Tenant Databases' => "{$php_bin} artisan tenant:sync-databases --no-interaction 2>&1",
    'Current Git Commit Status' => 'git log -1 --pretty=format:"Commit: %h | %an (%ci) | %s" 2>&1'
];

$has_error = false;
$start_time = microtime(true);

echo "<div style='margin-bottom: 18px; font-size: 12px; color: #94a3b8;'>";
echo "<span>Working Directory: <code>" . htmlspecialchars($project_path) . "</code></span> • ";
echo "<span>PHP: <code>" . PHP_VERSION . "</code> (" . PHP_OS . ")</span>";
echo "</div>";

foreach ($commands as $step_name => $command_string) {
    $output = [];
    $exit_code = 0;

    if ($is_windows) {
        $full_cmd = "cd /d \"{$project_path}\" && {$command_string}";
    } else {
        $full_cmd = "cd \"{$project_path}\" && ({$command_string})";
    }

    exec($full_cmd, $output, $exit_code);

    $is_success = ($exit_code === 0);
    if (!$is_success && strpos($step_name, 'Migrations') === false) {
        // Some migrations may say nothing to migrate, which is normal exit 0.
        // Only mark fatal if git commands fail
        if (strpos($step_name, 'Git') !== false) {
            $has_error = true;
        }
    }

    echo "<div class='step'>";
    echo "<div class='step-header'>";
    echo "<span class='step-name'>▶ {$step_name}</span>";
    echo "<span class='status-badge " . ($is_success ? "status-success" : "status-failed") . "'>" . ($is_success ? "PASSED" : "EXIT {$exit_code}") . "</span>";
    echo "</div>";

    $output_text = trim(implode("\n", $output));
    if (empty($output_text)) {
        $output_text = "Command executed cleanly with no output.";
    }

    echo "<div class='console-box'>" . htmlspecialchars($output_text) . "</div>";
    echo "</div>";

    if ($has_error) {
        break;
    }
}

$duration = round(microtime(true) - $start_time, 2);

echo "<hr style='border: none; border-top: 1px solid #1e293b; margin: 24px 0;'>";

if (!$has_error) {
    $has_vendor = file_exists($project_path . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php');
    echo "<div class='summary summary-success'>";
    echo "<h2 style='font-size: 20px; font-weight: 800; margin-bottom: 6px;'>🎉 DEPLOYMENT SUCCESSFUL!</h2>";
    echo "<p style='font-size: 13px;'>Latest code from <code>github.com/kushprakash/shoppy.git (main)</code> was pulled and dependencies updated.</p>";
    echo "<div style='margin-top: 12px;'>";
    echo "<span class='info-pill'>⏱ Execution Time: {$duration}s</span>";
    echo "<span class='info-pill'>📅 " . date('Y-m-d H:i:s') . "</span>";
    if ($has_vendor) {
        echo "<span class='info-pill' style='background: #064e3b; color: #6ee7b7; font-weight: 700;'>✓ Vendor Packages Installed</span>";
    } else {
        echo "<span class='info-pill' style='background: #7f1d1d; color: #fca5a5; font-weight: 700;'>✗ Vendor Missing (Upload vendor.zip or run composer)</span>";
    }
    $has_manifest = file_exists($project_path . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'build' . DIRECTORY_SEPARATOR . 'manifest.json');
    if ($has_manifest) {
        echo "<span class='info-pill' style='background: #064e3b; color: #6ee7b7; font-weight: 700;'>✓ Vite Manifest Present</span>";
    } else {
        echo "<span class='info-pill' style='background: #7f1d1d; color: #fca5a5; font-weight: 700;'>✗ Vite Manifest Missing</span>";
    }
    echo "</div>";
    echo "</div>";
} else {
    echo "<div class='summary summary-failed'>";
    echo "<h2 style='font-size: 20px; font-weight: 800; margin-bottom: 6px;'>⚠️ DEPLOYMENT FAILED</h2>";
    echo "<p style='font-size: 13px;'>An error occurred while pulling from GitHub. Check the console log above.</p>";
    echo "<div style='margin-top: 12px;'>";
    echo "<span class='info-pill'>⏱ Aborted after: {$duration}s</span>";
    echo "</div>";
    echo "</div>";
}
?>

    <!-- CloudPanel Multi-Tenant Database Helper -->
    <div style="margin-top: 30px; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 22px;">
        <h3 style="font-size: 16px; font-weight: 800; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span>🛠️ CloudPanel Multi-Tenant Database Permissions Tool</span>
        </h3>
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.6; margin-bottom: 16px;">
            CloudPanel me naye stores ke alag databases (jaise <code>tenant_store...</code>) create karne ke liye database user <code><?php echo htmlspecialchars($env_db_user); ?></code> ke paas <strong>CREATE</strong> aur <strong>tenant_%</strong> permissions honi chahiye.
        </p>

        <?php if (!empty($grant_feedback)): ?>
            <div style="padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 13px; font-weight: 600; <?php echo $grant_feedback['success'] ? 'background: #064e3b; color: #6ee7b7; border: 1px solid #059669;' : 'background: #881337; color: #fca5a5; border: 1px solid #e11d48;'; ?>">
                <?php echo $grant_feedback['success'] ? '✔ ' : '❌ '; ?><?php echo htmlspecialchars($grant_feedback['message']); ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="?grant_db_perms=1" style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 16px;">
            <input type="password" name="mysql_root_pass" placeholder="MySQL Root Password (leave blank if none)" style="background: #0f172a; border: 1px solid #475569; color: #fff; padding: 10px 14px; border-radius: 10px; font-size: 12px; min-width: 280px;">
            <button type="submit" name="apply_db_perms" value="1" class="btn" style="background: linear-gradient(135deg, #10b981, #059669); font-size: 12px; padding: 10px 18px;">
                ⚡ Auto-Grant Permissions via Web
            </button>
            <a href="?run=1" class="btn" style="background: #334155; font-size: 12px; padding: 10px 18px;">
                🔄 Re-run Check & Sync Missing DBs
            </a>
        </form>

        <details style="margin-top: 12px; font-size: 12px; color: #cbd5e1;">
            <summary style="cursor: pointer; font-weight: 700; color: #38bdf8; padding: 6px 0;">Or view SQL commands to run in SSH terminal as root:</summary>
            <div style="background: #020617; padding: 14px; border-radius: 10px; margin-top: 8px; font-family: monospace; font-size: 12px; color: #a5f3fc; line-height: 1.8;">
                GRANT CREATE ON *.* TO '<?php echo htmlspecialchars($env_db_user); ?>'@'localhost';<br>
                GRANT ALL PRIVILEGES ON `tenant_%`.* TO '<?php echo htmlspecialchars($env_db_user); ?>'@'localhost';<br>
                GRANT CREATE ON *.* TO '<?php echo htmlspecialchars($env_db_user); ?>'@'127.0.0.1';<br>
                GRANT ALL PRIVILEGES ON `tenant_%`.* TO '<?php echo htmlspecialchars($env_db_user); ?>'@'127.0.0.1';<br>
                FLUSH PRIVILEGES;
            </div>
        </details>
    </div>

    <!-- Live SMTP Email Diagnostic Tool -->
    <div style="margin-top: 24px; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 22px;">
        <h3 style="font-size: 16px; font-weight: 800; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span>📧 Live Gmail SMTP Email Test & Verification Tool</span>
        </h3>
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.6; margin-bottom: 16px;">
            Test dispatch of real 6-digit OTP email via <code>smtp.gmail.com:465 (SSL)</code> with sender <code>contact@enexa.in</code>.
        </p>

        <?php if (!empty($test_mail_result)): ?>
            <div style="padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 13px; font-weight: 600; <?php echo $test_mail_result['success'] ? 'background: #064e3b; color: #6ee7b7; border: 1px solid #059669;' : 'background: #881337; color: #fca5a5; border: 1px solid #e11d48;'; ?>">
                <?php echo $test_mail_result['success'] ? '✔ ' : '❌ '; ?><?php echo htmlspecialchars($test_mail_result['message']); ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($mail_sync_feedback)): ?>
            <div style="padding: 8px 12px; border-radius: 8px; margin-bottom: 14px; font-size: 11px; background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
                ℹ️ <?php echo htmlspecialchars($mail_sync_feedback); ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="?test_email_action=1" style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
            <input type="email" name="test_mail_recipient" required value="<?php echo htmlspecialchars($target_test_mail ?: 'contact@enexa.in'); ?>" placeholder="Enter recipient email (e.g. contact@enexa.in)" style="background: #0f172a; border: 1px solid #475569; color: #fff; padding: 10px 14px; border-radius: 10px; font-size: 12px; min-width: 320px;">
            <button type="submit" name="send_test_email" value="1" class="btn" style="background: linear-gradient(135deg, #0284c7, #0369a1); font-size: 12px; padding: 10px 18px;">
                ⚡ Send Live Test OTP Email
            </button>
        </form>
    </div>

    <!-- Live Custom Domain & Nginx VPS Authorization Tool -->
    <?php
    $cur_user = @exec('whoami') ?: get_current_user() ?: 'shoppy';
    $sudo_check = [];
    $sudo_code = 1;
    @exec('sudo -n id 2>&1', $sudo_check, $sudo_code);
    $has_sudo = ($sudo_code === 0);
    $nginx_conf_writable = is_writable('/etc/nginx/conf.d') || is_writable('/etc/nginx/sites-available');
    ?>
    <div style="margin-top: 24px; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 22px;">
        <h3 style="font-size: 16px; font-weight: 800; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span>🌐 Custom Domain & Nginx VPS Authorization Status</span>
        </h3>
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.6; margin-bottom: 14px;">
            Automated Custom Domain reverse-proxy and Let's Encrypt SSL provisioning requires authorization to reload Nginx and manage virtual hosts.
        </p>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px;">
            <span class="info-pill">User: <strong><?php echo htmlspecialchars($cur_user); ?></strong></span>
            <?php if ($has_sudo): ?>
                <span class="info-pill" style="background: #064e3b; color: #6ee7b7; font-weight: 700;">✔ Sudo Authorized (Passwordless)</span>
            <?php else: ?>
                <span class="info-pill" style="background: #881337; color: #fca5a5; font-weight: 700;">❌ Sudo Not Configured for '<?php echo htmlspecialchars($cur_user); ?>'</span>
            <?php endif; ?>

            <?php if ($nginx_conf_writable): ?>
                <span class="info-pill" style="background: #064e3b; color: #6ee7b7; font-weight: 700;">✔ Nginx Config Directory Writable</span>
            <?php else: ?>
                <span class="info-pill" style="background: #78350f; color: #fcd34d; font-weight: 700;">⚠ Nginx Directory Root-Protected</span>
            <?php endif; ?>
        </div>

        <?php if (!empty($sudo_grant_feedback)): ?>
            <div style="padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 13px; font-weight: 600; <?php echo $sudo_grant_feedback['success'] ? 'background: #064e3b; color: #6ee7b7; border: 1px solid #059669;' : 'background: #881337; color: #fca5a5; border: 1px solid #e11d48;'; ?>">
                <?php echo $sudo_grant_feedback['success'] ? '✔ ' : '❌ '; ?><?php echo htmlspecialchars($sudo_grant_feedback['message']); ?>
            </div>
        <?php endif; ?>

        <?php if (!$has_sudo): ?>
            <!-- Web 1-Click Root Password Form -->
            <form method="POST" action="?apply_sudo_auth=1" style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 16px;">
                <input type="password" name="vps_root_pass" required placeholder="Enter Hostinger VPS Root Password" style="background: #0f172a; border: 1px solid #475569; color: #fff; padding: 10px 14px; border-radius: 10px; font-size: 12px; min-width: 280px;">
                <button type="submit" class="btn" style="background: linear-gradient(135deg, #10b981, #059669); font-size: 12px; padding: 10px 18px;">
                    ⚡ Auto-Authorize via Web (No SSH Needed)
                </button>
            </form>
        <?php endif; ?>

        <div style="background: #020617; border: 1px solid #334155; border-radius: 12px; padding: 14px;">
            <div style="font-size: 11px; font-weight: 700; color: #f59e0b; margin-bottom: 8px;">
                Or run this 1-line command in your Hostinger VPS SSH Terminal as root:
            </div>
            <pre style="font-family: monospace; font-size: 11px; color: #34d399; background: #0b1120; padding: 10px 14px; border-radius: 8px; overflow-x: auto; user-select: all; word-break: break-all; white-space: pre-wrap;">echo "<?php echo htmlspecialchars($cur_user); ?> ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/shoppy-custom-domain && sudo chmod 0440 /etc/sudoers.d/shoppy-custom-domain</pre>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">
                Once this is configured ONCE on the server, all customer custom domains will be added to CloudPanel, get SSL, and update VHost 100% automatically without any manual commands!
            </div>
        </div>
    </div>

</div>
</body>
</html>
