<?php

namespace App\Console\Commands;

use App\Tenancy\TenantManager;
use Illuminate\Console\Command;

class ProvisionShop extends Command
{
    protected $signature = 'shop:provision 
                            {name : Name of the shop} 
                            {owner_name : Name of the shop owner} 
                            {owner_email : Email of the shop owner} 
                            {owner_phone : Phone number of the shop owner}
                            {--agent= : Optional agent referral code}
                            {--slug= : Optional custom slug}
                            {--password= : Optional terminal and admin password (default: Admin@12345)}
                            {--city= : Optional city location}
                            {--plan= : Optional subscription plan code}
                            {--code= : Optional store code (e.g. STORE789012)}';

    protected $description = 'Provision a new shop tenant with its dedicated MySQL database, migrations, and seeds';

    public function handle(TenantManager $tenantManager): int
    {
        $name = $this->argument('name');
        $ownerName = $this->argument('owner_name');
        $ownerEmail = $this->argument('owner_email');
        $ownerPhone = $this->argument('owner_phone');
        $agentCode = $this->option('agent');
        $slug = $this->option('slug');
        $password = $this->option('password') ?: 'Admin@12345';
        $city = $this->option('city') ?: 'Jaipur, Rajasthan';
        $planCode = $this->option('plan') ?: 'gst-billing-ecommerce-whatsapp';
        $storeCode = $this->option('code');

        $this->info("Provisioning new shop: {$name}...");

        try {
            $settings = [
                'city' => $city,
                'plan_id' => $planCode,
                'plan_name' => 'GST Billing Software + Ecommerce + Whatsapp Messaging',
                'billing_cycle' => 'yearly',
                'has_ecommerce' => true,
                'whatsapp_mode' => 'platform_number',
                'terminal_password' => $password,
                'due_amount' => 0,
                'valid_until' => now()->addYear()->format('Y-m-d'),
                'theme_color' => '#00a2c7',
                'currency' => 'INR',
            ];

            $shop = $tenantManager->provisionNewShop([
                'name' => $name,
                'shop_code' => $storeCode,
                'owner_name' => $ownerName,
                'owner_email' => $ownerEmail,
                'owner_phone' => $ownerPhone,
                'agent_referral_code' => $agentCode,
                'slug' => $slug,
                'password' => $password,
                'settings' => $settings,
            ]);

            $this->info("✓ Shop provisioned successfully!");
            $this->line("• Shop Code: " . $shop->shop_code);
            $this->line("• Slug: " . $shop->slug);
            $this->line("• Tenant DB: " . $shop->database_name);
            $this->line("• Default Admin: {$ownerEmail} / {$password}");
            $this->line("• Terminal Password: {$password}");

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("Failed to provision shop: " . $e->getMessage());
            $this->line($e->getTraceAsString());
            return Command::FAILURE;
        }
    }
}
