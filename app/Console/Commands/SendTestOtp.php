<?php

namespace App\Console\Commands;

use App\Services\CommunicationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SendTestOtp extends Command
{
    protected $signature = 'store:send-otp {code : The Shop Code or Mobile} {--otp= : Optional specific 6-digit OTP}';

    protected $description = 'Send a test verification OTP via SMS (Buzzify) and Email (Gmail SMTP)';

    public function handle(): int
    {
        $code = strtoupper(trim($this->argument('code')));
        $shop = DB::connection('mysql')->table('shops')
            ->where('shop_code', $code)
            ->orWhere('owner_email', strtolower($code))
            ->orWhere('owner_phone', $code)
            ->first();

        if (!$shop) {
            $this->error("Store with identifier [{$code}] not found in database.");
            return 1;
        }

        $otp = $this->option('otp') ?: (string) random_int(100000, 999999);

        $this->info("=== Sending Verification OTP for Store: {$shop->name} ({$shop->shop_code}) ===");
        $this->line("OTP: {$otp}");
        $this->line("Mobile: {$shop->owner_phone}");
        $this->line("Email: {$shop->owner_email}");

        // 1. Send SMS
        $this->info("\n--- Dispatching SMS via Buzzify ---");
        $smsRes = CommunicationService::sendOtpSms($shop->owner_phone, $otp);
        if (($smsRes['status'] ?? 0) === 1) {
            $this->info("✓ SMS response: " . ($smsRes['response'] ?? 'OK'));
        } else {
            $this->warn("✗ SMS failed: " . ($smsRes['message'] ?? 'Error'));
        }

        // 2. Send Email
        $this->info("\n--- Dispatching Email via Gmail SMTP ---");
        $emailRes = CommunicationService::sendOtpEmail(
            ownerName: $shop->owner_name ?: $shop->name,
            ownerEmail: $shop->owner_email,
            otp: $otp,
            storeCode: $shop->shop_code,
            storeName: $shop->name
        );
        if (($emailRes['status'] ?? 0) === 1) {
            $this->info("✓ Email sent to: {$shop->owner_email}");
        } else {
            $this->warn("✗ Email failed: " . ($emailRes['message'] ?? 'Error'));
        }

        return 0;
    }
}
