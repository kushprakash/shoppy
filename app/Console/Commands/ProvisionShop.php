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
                            {--slug= : Optional custom slug}';

    protected $description = 'Provision a new shop tenant with its dedicated MySQL database, migrations, and seeds';

    public function handle(TenantManager $tenantManager): int
    {
        $name = $this->argument('name');
        $ownerName = $this->argument('owner_name');
        $ownerEmail = $this->argument('owner_email');
        $ownerPhone = $this->argument('owner_phone');
        $agentCode = $this->option('agent');
        $slug = $this->option('slug');

        $this->info("Provisioning new shop: {$name}...");

        try {
            $shop = $tenantManager->provisionNewShop([
                'name' => $name,
                'owner_name' => $ownerName,
                'owner_email' => $ownerEmail,
                'owner_phone' => $ownerPhone,
                'agent_referral_code' => $agentCode,
                'slug' => $slug,
                'password' => 'Admin@12345',
            ]);

            $this->info("✓ Shop provisioned successfully!");
            $this->line("• Shop Code: " . $shop->shop_code);
            $this->line("• Slug: " . $shop->slug);
            $this->line("• Tenant DB: " . $shop->database_name);
            $this->line("• Status: " . $shop->status);
            $this->line("• Default Admin: {$ownerEmail} / Admin@12345");

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("Failed to provision shop: " . $e->getMessage());
            $this->line($e->getTraceAsString());
            return Command::FAILURE;
        }
    }
}
