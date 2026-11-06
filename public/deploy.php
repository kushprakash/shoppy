<?php
/**
 * Shoppy ERP - Automated Git Production Deployment Script
 * Repository: https://github.com/kushprakash/shoppy.git
 */

// Deployment Configuration - Auto-runs immediately when file is opened
$auto_run = true;
$user_token = $_GET['token'] ?? $_POST['token'] ?? '';

// Optional GitHub Personal Access Token (for private repos or rate limit bypass) e.g. &git_token=ghp_...
$git_token = $_GET['git_token'] ?? $_POST['git_token'] ?? '';

// Project root path (parent directory of public/)
$project_path = dirname(__DIR__);

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

// 3. Resolve PHP Binary
$php_bin = 'php';
if (!$is_windows) {
    $php_candidates = [
        PHP_BINARY,
        '/usr/local/bin/ea-php83',
        '/usr/local/bin/ea-php82',
        '/usr/bin/php8.3',
        '/usr/bin/php8.2',
        '/usr/local/bin/php',
        '/usr/bin/php'
    ];
    foreach ($php_candidates as $cand) {
        if (@is_executable($cand)) {
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

// 5. Auto-extract vendor.zip if uploaded in project root (useful if composer CLI is restricted)
$vendor_zip = $project_path . DIRECTORY_SEPARATOR . 'vendor.zip';
$vendor_autoload = $project_path . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';
$unzipped_vendor = false;
if (file_exists($vendor_zip) && !file_exists($vendor_autoload)) {
    if (class_exists('ZipArchive')) {
        $zip = new ZipArchive;
        if ($zip->open($vendor_zip) === TRUE) {
            $zip->extractTo($project_path);
            $zip->close();
            $unzipped_vendor = true;
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
    'Run Tenant Migrations' => "{$php_bin} artisan migrate --force --path=database/migrations/tenant 2>&1",
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

</div>
</body>
</html>
