<?php

namespace App\Console\Commands;

use App\Models\Central\Shop;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SyncTenantDatabases extends Command
{
    protected $signature = 'tenant:sync-databases {--shop= : Sync a specific shop by shop_code}';
    protected $description = 'Sync, create and migrate tenant MySQL databases for all registered shops';

    public function handle(): int
    {
        $this->info("=== Shoppy ERP Tenant Database Synchronizer ===");

        $centralDb = config('database.connections.mysql.database', 'shoppy_live');
        $this->line("Central Database: <fg=cyan>{$centralDb}</>");

        $shopFilter = $this->option('shop');
        $query = DB::connection('mysql')->table('shops');
        if ($shopFilter) {
            $query->where('shop_code', $shopFilter);
        }
        $shops = $query->get();

        if ($shops->isEmpty()) {
            $this->warn("No registered shops found in central database.");
            return Command::SUCCESS;
        }

        $this->line("Found {$shops->count()} shop(s) to inspect & synchronize.\n");

        $successCount = 0;
        $failedCount = 0;

        foreach ($shops as $shop) {
            $this->line("--------------------------------------------------");
            $this->line("Inspecting Shop: <fg=yellow>{$shop->name}</> (Code: <fg=cyan>{$shop->shop_code}</>)");

            // Calculate standardized database name: {centralDb}-{STORE-NAME}
            $targetDb = Shop::buildTenantDatabaseName($shop->name, $shop->shop_code);
            $currentDb = $shop->database_name;

            $this->line("• Current DB in shops table : <fg=gray>{$currentDb}</>");
            $this->line("• Standard Target DB        : <fg=green>{$targetDb}</>");

            // If shops table still holds old "tenant_sp..." or empty, update to targetDb
            if (empty($currentDb) || str_starts_with($currentDb, 'tenant_') || $currentDb !== $targetDb) {
                DB::connection('mysql')->table('shops')
                    ->where('id', $shop->id)
                    ->update([
                        'database_name' => $targetDb,
                        'updated_at' => now(),
                    ]);
                $this->info("✓ Updated shops table database_name to: `{$targetDb}`");
                $activeDb = $targetDb;
            } else {
                $activeDb = $currentDb;
            }

            $sanitizedDb = preg_replace('/[^a-zA-Z0-9_\-]/', '', $activeDb);

            // Step 1: Attempt to create database in MySQL
            $dbCreated = false;
            try {
                DB::connection('mysql')->statement(
                    "CREATE DATABASE IF NOT EXISTS `{$sanitizedDb}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
                );
                $this->info("✓ Database verified/created in MySQL: `{$sanitizedDb}`");
                $dbCreated = true;
            } catch (\Throwable $e) {
                $this->warn("⚠ Notice: Direct CREATE DATABASE query could not be executed: " . $e->getMessage());
                $this->warn("👉 If CloudPanel user does not have CREATE DATABASE privilege:");
                $this->warn("   Please open CloudPanel > Databases > Add Database: `{$sanitizedDb}`");
                $this->warn("   and assign your database user to it.");
            }

            // Step 2: Test connecting to tenant database
            Config::set('database.connections.tenant.database', $sanitizedDb);
            DB::purge('tenant');

            $canConnect = false;
            try {
                DB::connection('tenant')->getPdo();
                $canConnect = true;
                $this->info("✓ Successfully connected to tenant database: `{$sanitizedDb}`");
            } catch (\Throwable $e) {
                $this->error("✗ Cannot connect to database `{$sanitizedDb}`: " . $e->getMessage());
                $this->line("👉 For CloudPanel servers:");
                $this->line("   1. Go to CloudPanel -> Databases");
                $this->line("   2. Click 'Add Database'");
                $this->line("   3. Database Name: `{$sanitizedDb}`");
                $this->line("   4. User: Select your existing site database user (e.g. `shoppy-live` user)");
                $this->line("   5. Run deploy.php or this command again to finish migration!");
                $failedCount++;
                continue;
            }

            // Step 3: Run tenant migrations
            $this->line("Running tenant migrations on `{$sanitizedDb}`...");
            try {
                $exitCode = Artisan::call('migrate', [
                    '--database' => 'tenant',
                    '--path' => 'database/migrations/tenant',
                    '--force' => true,
                ]);

                if ($exitCode === 0) {
                    $this->info("✓ Tenant migrations executed cleanly!");
                } else {
                    $this->error("Migration warning: " . Artisan::output());
                }
            } catch (\Throwable $e) {
                $this->error("Migration error on `{$sanitizedDb}`: " . $e->getMessage());
            }

            // Step 4: Seed Official GST States
            try {
                (new \Database\Seeders\GstStatesSeeder)->run('tenant');
                $this->info("✓ Official GST States seeded (38 states & UTs).");
            } catch (\Throwable $e) {
                $this->warn("GST States note: " . $e->getMessage());
            }

            // Step 5: Seed Default Branch BR-01 if missing
            try {
                $branch = DB::connection('tenant')->table('branches')->first();
                if (!$branch) {
                    $branchId = DB::connection('tenant')->table('branches')->insertGetId([
                        'name' => 'Main Store',
                        'code' => 'BR-01',
                        'phone' => $shop->owner_phone ?: '9999999999',
                        'address' => 'Store Head Office',
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $this->info("✓ Default branch BR-01 created.");
                } else {
                    $branchId = $branch->id;
                }
            } catch (\Throwable $e) {
                $branchId = 1;
            }

            // Step 6: Seed Default Admin User if missing
            try {
                $userExists = DB::connection('tenant')->table('users')->where('role', 'admin')->exists();
                if (!$userExists) {
                    $adminEmail = $shop->owner_email ?: ('admin@' . strtolower($shop->shop_code) . '.shoppy.io');
                    DB::connection('tenant')->table('users')->insert([
                        'name' => $shop->owner_name ?: $shop->name,
                        'email' => $adminEmail,
                        'phone' => $shop->owner_phone,
                        'password' => Hash::make('admin123'),
                        'role' => 'admin',
                        'branch_id' => $branchId,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $this->info("✓ Default Admin user seeded: {$adminEmail} (password: admin123)");
                }
            } catch (\Throwable $e) {
                $this->warn("Admin user note: " . $e->getMessage());
            }

            // Step 7: Seed Initial Store Settings
            try {
                $settings = is_string($shop->settings) ? json_decode($shop->settings, true) : ($shop->settings ?? []);
                DB::connection('tenant')->table('settings')->insertOrIgnore([
                    ['key' => 'store_name', 'value' => $shop->name, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'owner_name', 'value' => $shop->owner_name ?? '', 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'contact_phone', 'value' => $shop->owner_phone ?? '', 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'state_code', 'value' => $settings['state_code'] ?? '10', 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'state_name', 'value' => $settings['state_name'] ?? 'BIHAR', 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'theme_color', 'value' => '#00a2c7', 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'currency', 'value' => 'INR', 'created_at' => now(), 'updated_at' => now()],
                ]);
                $this->info("✓ Store settings initialized.");
            } catch (\Throwable $e) {
                $this->warn("Settings note: " . $e->getMessage());
            }

            $successCount++;
        }

        // Restore central connection
        DB::purge('tenant');
        DB::reconnect('mysql');
        DB::setDefaultConnection('mysql');

        $this->line("\n==================================================");
        $this->info("Tenant Sync Complete: {$successCount} synchronized successfully, {$failedCount} failed.");

        return $failedCount === 0 ? Command::SUCCESS : Command::FAILURE;
    }
}
