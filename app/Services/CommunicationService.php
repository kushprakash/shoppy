<?php

namespace App\Services;

use App\Mail\WelcomeStoreMail;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CommunicationService
{
    /**
     * Dispatch Welcome SMS via Buzzify HTTP API
     *
     * Template:
     * Dear $name, Congratulations on joining us! Your Member ID: $userid User ID & Password: $password Default M-PIN: 123456 Please change your password and M-PIN for security. We are excited to have you with us! ENEXA
     */
    public static function sendWelcomeSms(
        string $name,
        string $mobile,
        string $storeCode,
        string $password = 'admin123',
        string $mpin = '123456'
    ): array {
        $message = "Dear {$name}, Congratulations on joining us! Your Member ID: {$storeCode} User ID & Password: {$password} Default M-PIN: {$mpin} Please change your password and M-PIN for security. We are excited to have you with us! ENEXA";

        return self::sendSms($message, $mobile);
    }

    /**
     * Send Raw SMS via Buzzify HTTP API
     */
    public static function sendSms(
        string $message,
        string $number,
        ?string $templateId = null,
        $adminId = null
    ): array {
        try {
            // Strip non-numeric characters
            $cleanNumber = preg_replace('/[^0-9]/', '', $number);
            if (strlen($cleanNumber) > 10 && str_starts_with($cleanNumber, '91') && strlen($cleanNumber) === 12) {
                $cleanNumber = substr($cleanNumber, 2);
            }

            if (strlen($cleanNumber) < 10) {
                Log::warning("sendSms: Invalid phone number '{$number}'");
                return [
                    'status' => 0,
                    'message' => 'Invalid phone number.'
                ];
            }

            // Defaults from config / user credentials
            $apiKey = config('services.buzzify.api_key', 'Q5z3mfNGdXu6RtJI');
            $senderId = config('services.buzzify.sender_id', 'ENEXAI');

            // Optionally check database settings if present
            try {
                if (DB::connection('mysql')->getSchemaBuilder()->hasTable('settings')) {
                    $setting = null;
                    if ($adminId) {
                        $setting = DB::connection('mysql')->table('settings')->where('user_id', $adminId)->first();
                    }
                    if (!$setting) {
                        $setting = DB::connection('mysql')->table('settings')->where('user_id', 1)->first()
                            ?? DB::connection('mysql')->table('settings')->first();
                    }
                    if ($setting && !empty($setting->apikey) && !empty($setting->sender_id)) {
                        $apiKey = $setting->apikey;
                        $senderId = $setting->sender_id;
                    }
                }
            } catch (\Throwable $e) {
                // Ignore DB check and fallback to defaults
            }

            if (empty($apiKey) || empty($senderId)) {
                Log::warning("sendSms: SMS settings missing (apiKey or senderId empty).");
                return [
                    'status' => 0,
                    'message' => 'Message settings not configured.'
                ];
            }

            $encodedMessage = urlencode($message);
            $encodedKey = urlencode($apiKey);
            $encodedSender = urlencode($senderId);
            $encodedNumber = urlencode($cleanNumber);

            $url = "http://buzzify.in/V2/http-api.php?apikey={$encodedKey}&senderid={$encodedSender}&number={$encodedNumber}&message={$encodedMessage}&format=json";

            if (!empty($templateId)) {
                $url .= "&templateid=" . urlencode($templateId);
            }

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);

            $response = curl_exec($ch);
            $err = curl_error($ch);
            curl_close($ch);

            Log::info("sendSms to {$cleanNumber}: response = {$response}, curl_err = {$err}");

            if ($err) {
                return [
                    'status' => 0,
                    'message' => "cURL error: {$err}"
                ];
            }

            return [
                'status' => 1,
                'response' => $response
            ];
        } catch (\Throwable $e) {
            Log::error("sendSms error: " . $e->getMessage());
            return [
                'status' => 0,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Dispatch Welcome Email with rich HTML template using Gmail SMTP
     */
    public static function sendWelcomeEmail(
        string $ownerName,
        string $ownerEmail,
        string $storeCode,
        string $password = 'admin123',
        string $storeName = '',
        ?string $validUntil = null,
        ?string $planName = null,
        string $mpin = '123456'
    ): array {
        try {
            if (empty($ownerEmail) || !filter_var($ownerEmail, FILTER_VALIDATE_EMAIL)) {
                Log::warning("sendWelcomeEmail: Invalid or empty email '{$ownerEmail}' for store {$storeCode}");
                return [
                    'status' => 0,
                    'message' => 'Invalid email address.'
                ];
            }

            // Configure dynamic dedicated SMTP mailer for Enexa Gmail
            $host = config('services.enexa_mail.host', env('MAIL_HOST', 'smtp.gmail.com'));
            $port = (int)config('services.enexa_mail.port', env('MAIL_PORT', 587));
            $username = config('services.enexa_mail.username', env('MAIL_USERNAME', 'contact@enexa.in'));
            $passwordVal = config('services.enexa_mail.password', env('MAIL_PASSWORD', 'tmdvzyexqjermrfp'));
            $encryption = config('services.enexa_mail.encryption', env('MAIL_ENCRYPTION', 'tls'));
            $fromAddress = config('services.enexa_mail.from_address', env('MAIL_FROM_ADDRESS', 'contact@enexa.in'));
            $fromName = config('services.enexa_mail.from_name', env('MAIL_FROM_NAME', 'Shoppy ERP - Enexa IT'));

            Config::set('mail.mailers.enexa_smtp', [
                'transport' => 'smtp',
                'host' => $host,
                'port' => $port,
                'encryption' => $encryption,
                'username' => $username,
                'password' => $passwordVal,
                'timeout' => 20,
            ]);

            Config::set('mail.from', [
                'address' => $fromAddress,
                'name' => $fromName,
            ]);

            $mailable = new WelcomeStoreMail(
                ownerName: $ownerName,
                ownerEmail: $ownerEmail,
                storeCode: $storeCode,
                password: $password,
                storeName: $storeName ?: $storeCode,
                mpin: $mpin,
                validUntil: $validUntil,
                planName: $planName,
            );

            Mail::mailer('enexa_smtp')->to($ownerEmail)->send($mailable);

            Log::info("sendWelcomeEmail: Welcome email sent successfully to {$ownerEmail} for store {$storeCode}");

            return [
                'status' => 1,
                'message' => "Welcome email sent to {$ownerEmail}"
            ];
        } catch (\Throwable $e) {
            Log::error("sendWelcomeEmail error for {$ownerEmail}: " . $e->getMessage());
            return [
                'status' => 0,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Dispatch Password Reset OTP SMS via Buzzify HTTP API
     *
     * Template:
     * Your verification login (OTP) is: $otp. Do not share this OTP with anyone. It is valid for the next 10 minutes. ENEXA
     */
    public static function sendOtpSms(string $mobile, string $otp): array
    {
        $message = "Your verification login (OTP) is: {$otp}. Do not share this OTP with anyone. It is valid for the next 10 minutes. ENEXA";

        return self::sendSms($message, $mobile);
    }

    /**
     * Dispatch Password Reset OTP Email via Gmail SMTP
     */
    public static function sendOtpEmail(
        string $ownerName,
        string $ownerEmail,
        string $otp,
        string $storeCode,
        string $storeName = ''
    ): array {
        try {
            if (empty($ownerEmail) || !filter_var($ownerEmail, FILTER_VALIDATE_EMAIL)) {
                Log::warning("sendOtpEmail: Invalid or empty email '{$ownerEmail}'");
                return [
                    'status' => 0,
                    'message' => 'Invalid email address.'
                ];
            }

            // Configure dynamic dedicated SMTP mailer for Enexa Gmail
            $host = config('services.enexa_mail.host', env('MAIL_HOST', 'smtp.gmail.com'));
            $port = (int)config('services.enexa_mail.port', env('MAIL_PORT', 587));
            $username = config('services.enexa_mail.username', env('MAIL_USERNAME', 'contact@enexa.in'));
            $passwordVal = config('services.enexa_mail.password', env('MAIL_PASSWORD', 'tmdvzyexqjermrfp'));
            $encryption = config('services.enexa_mail.encryption', env('MAIL_ENCRYPTION', 'tls'));
            $fromAddress = config('services.enexa_mail.from_address', env('MAIL_FROM_ADDRESS', 'contact@enexa.in'));
            $fromName = config('services.enexa_mail.from_name', env('MAIL_FROM_NAME', 'Shoppy ERP Security'));

            Config::set('mail.mailers.enexa_smtp', [
                'transport' => 'smtp',
                'host' => $host,
                'port' => $port,
                'encryption' => $encryption,
                'username' => $username,
                'password' => $passwordVal,
                'timeout' => 20,
            ]);

            Config::set('mail.from', [
                'address' => $fromAddress,
                'name' => $fromName,
            ]);

            $mailable = new \App\Mail\OtpVerificationMail(
                ownerName: $ownerName,
                otp: $otp,
                storeCode: $storeCode,
                storeName: $storeName,
            );

            Mail::mailer('enexa_smtp')->to($ownerEmail)->send($mailable);

            Log::info("sendOtpEmail: OTP email sent successfully to {$ownerEmail} for store {$storeCode}");

            return [
                'status' => 1,
                'message' => "OTP email sent to {$ownerEmail}"
            ];
        } catch (\Throwable $e) {
            Log::error("sendOtpEmail error for {$ownerEmail}: " . $e->getMessage());
            return [
                'status' => 0,
                'message' => $e->getMessage()
            ];
        }
    }
}

