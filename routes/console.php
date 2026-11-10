<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/**
 * Diagnostic tool: Test if MySQL user can create tenant databases on CloudPanel/VPS
 */
Artisan::command('tenant:check-db', function () {
    $dbUser = config('database.connections.mysql.username');
    $dbHost = config('database.connections.mysql.host');
    $this->info("Checking database permissions for user: [{$dbUser}] on host: [{$dbHost}]...");

    try {
        $testDb = 'tenant_test_perm_' . time();
        $this->line("Attempting to execute: CREATE DATABASE `{$testDb}`...");
        DB::connection('mysql')->statement("CREATE DATABASE `{$testDb}`");
        $this->info("✔ SUCCESS: Database created successfully!");

        DB::connection('mysql')->statement("DROP DATABASE `{$testDb}`");
        $this->info("✔ SUCCESS: Test database dropped cleanly.");
        $this->info("\n🎉 All good! Your MySQL user [{$dbUser}] has full permissions to dynamically create tenant databases on this server.");
    } catch (\Throwable $e) {
        $this->error("\n❌ PERMISSION ERROR: " . $e->getMessage());
        $this->newLine();
        $this->warn("==================================================================");
        $this->warn("HOW TO GRANT CREATE DATABASE PERMISSION IN CLOUDPANEL (VIA SSH):");
        $this->warn("==================================================================");
        $this->line("1. Connect to your CloudPanel server via SSH as root:");
        $this->comment("   ssh root@your-server-ip");
        $this->line("2. Open MySQL as root:");
        $this->comment("   mysql -u root");
        $this->line("3. Run the following SQL queries to grant multi-tenant creation rights:");
        $this->comment("   GRANT CREATE ON *.* TO '{$dbUser}'@'localhost';");
        $this->comment("   GRANT ALL PRIVILEGES ON `tenant_%`.* TO '{$dbUser}'@'localhost';");
        $this->comment("   GRANT CREATE ON *.* TO '{$dbUser}'@'127.0.0.1';");
        $this->comment("   GRANT ALL PRIVILEGES ON `tenant_%`.* TO '{$dbUser}'@'127.0.0.1';");
        $this->comment("   FLUSH PRIVILEGES;");
        $this->comment("   EXIT;");
        $this->line("4. Re-run this check: php artisan tenant:check-db");
        $this->warn("==================================================================");
    }
})->purpose('Check if current DB user can create isolated tenant databases on CloudPanel/VPS');

/**
 * Auto-repair tool: Find shops in central DB whose tenant database was not created, and create them.
 */
Artisan::command('tenant:fix-missing-dbs', function () {
    $this->info("Scanning central 'shops' table for missing tenant databases...");

    $shops = DB::connection('mysql')->table('shops')->get();
    if ($shops->isEmpty()) {
        $this->warn("No shops found in central database.");
        return;
    }

    $createdCount = 0;
    foreach ($shops as $shop) {
        $dbName = $shop->database_name;
        if (empty($dbName)) {
            $dbName = 'tenant_' . strtolower(preg_replace('/[^a-zA-Z0-9_]/', '', $shop->shop_code));
        }

        // Check if database exists
        $exists = DB::connection('mysql')->select("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?", [$dbName]);

        if (empty($exists)) {
            $this->warn("Shop [{$shop->shop_code}] - {$shop->name}: Database `{$dbName}` is MISSING! Creating now...");

            try {
                // 1. Create DB
                DB::connection('mysql')->statement("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

                // 2. Run migrations
                Config::set('database.connections.tenant.database', $dbName);
                DB::purge('tenant');
                DB::reconnect('tenant');

                Artisan::call('migrate', [
                    '--database' => 'tenant',
                    '--path' => 'database/migrations/tenant',
                    '--force' => true,
                ]);

                // 3. Seed GST states
                if (class_exists(\Database\Seeders\GstStatesSeeder::class)) {
                    (new \Database\Seeders\GstStatesSeeder)->run('tenant');
                }

                // 4. Seed branch
                $branchId = DB::connection('tenant')->table('branches')->insertGetId([
                    'name' => 'Main Store',
                    'code' => 'BR-01',
                    'phone' => $shop->owner_phone ?: '9999999999',
                    'address' => 'Store Head Office',
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // 5. Seed default admin user
                $settings = json_decode($shop->settings ?? '{}', true) ?: [];
                $pwd = $settings['terminal_password'] ?? 'admin123';

                DB::connection('tenant')->table('users')->insertOrIgnore([
                    'name' => $shop->owner_name ?: 'Admin',
                    'email' => $shop->owner_email ?: ('admin@' . strtolower($shop->shop_code) . '.shoppy.io'),
                    'password' => bcrypt($pwd),
                    'role' => 'admin',
                    'branch_id' => $branchId,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $this->info("✔ Shop [{$shop->shop_code}]: Database `{$dbName}` created, migrated, and seeded successfully!");
                $createdCount++;
            } catch (\Throwable $e) {
                $this->error("❌ Failed to create `{$dbName}`: " . $e->getMessage());
            }
        } else {
            $this->line("✔ Shop [{$shop->shop_code}] - {$shop->name}: Database `{$dbName}` already exists.");
        }
    }

    $this->info("\nDone! Repaired {$createdCount} missing database(s).");
})->purpose('Detect and create missing tenant databases for all registered shops');

/**
 * Backward compatibility alias: tenant:sync-databases
 */
Artisan::command('tenant:sync-databases', function () {
    $this->call('tenant:fix-missing-dbs');
})->purpose('Sync and create all missing tenant databases');

