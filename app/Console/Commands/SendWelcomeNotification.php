<?php

namespace App\Console\Commands;

use App\Services\CommunicationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SendWelcomeNotification extends Command
{
    protected $signature = 'store:send-welcome {code : The Shop Code (e.g. SP20261106150505)} {--email= : Optional override recipient email} {--phone= : Optional override recipient phone}';

    protected $description = 'Send Welcome Email and Welcome SMS with credentials to a store owner';

    public function handle(): int
    {
        $code = strtoupper(trim($this->argument('code')));
        $shop = DB::connection('mysql')->table('shops')->where('shop_code', $code)->first();

        if (!$shop) {
            $this->error("Store with code [{$code}] not found in central database.");
            return 1;
        }

        $email = $this->option('email') ?: $shop->owner_email;
        $phone = $this->option('phone') ?: $shop->owner_phone;
        $name = $shop->owner_name ?: $shop->name;
        $storeName = $shop->name;
        $settings = json_decode($shop->settings, true) ?: [];
        $validUntil = $settings['valid_until'] ?? null;
        $planName = $settings['plan_name'] ?? 'Active Plan';

        $this->info("Sending Welcome Notifications for Store: {$storeName} ({$code})");
        $this->line("Recipient: {$name}");
        $this->line("Email: {$email}");
        $this->line("Phone: {$phone}");

        // 1. Dispatch SMS
        $this->info("\n--- Dispatching Welcome SMS via Buzzify ---");
        $smsResult = CommunicationService::sendWelcomeSms(
            name: $name,
            mobile: $phone,
            storeCode: $code,
            password: 'admin123',
            mpin: '123456'
        );

        if (($smsResult['status'] ?? 0) === 1) {
            $this->info("✓ SMS sent successfully: " . ($smsResult['response'] ?? 'OK'));
        } else {
            $this->warn("✗ SMS failed: " . ($smsResult['message'] ?? 'Unknown error'));
        }

        // 2. Dispatch Email
        $this->info("\n--- Dispatching Welcome Email via Gmail SMTP ---");
        $emailResult = CommunicationService::sendWelcomeEmail(
            ownerName: $name,
            ownerEmail: $email,
            storeCode: $code,
            password: 'admin123',
            storeName: $storeName,
            validUntil: $validUntil,
            planName: $planName,
            mpin: '123456'
        );

        if (($emailResult['status'] ?? 0) === 1) {
            $this->info("✓ Email sent successfully to {$email}");
        } else {
            $this->warn("✗ Email failed: " . ($emailResult['message'] ?? 'Unknown error'));
        }

        return 0;
    }
}

