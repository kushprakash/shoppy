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
     * Dispatch Official GST Tax Invoice Email from ENEXA IT SOLUTIONS PRIVATE LIMITED
     * with 18% GST breakdown (CGST+SGST or IGST) matching Indian GST Standard
     */
    public static function sendGstInvoiceEmail(
        string $ownerName,
        string $ownerEmail,
        string $storeCode,
        string $storeName,
        float $totalAmount,
        string $invoiceNumber,
        string $planName = 'Monthly Package',
        string $billingCycle = 'monthly',
        ?string $stateCode = '10',
        ?string $stateName = 'BIHAR',
        ?string $ownerPhone = '9546042639',
        ?string $transactionId = null,
        ?string $validUntil = null
    ): array {
        try {
            $cleanEmail = trim($ownerEmail);
            if (empty($cleanEmail) || !filter_var($cleanEmail, FILTER_VALIDATE_EMAIL)) {
                Log::warning("sendGstInvoiceEmail: Invalid or empty email '{$cleanEmail}' for store {$storeCode}");
                return [
                    'status' => 0,
                    'message' => 'Invalid email address.'
                ];
            }

            if (str_ends_with(strtolower($cleanEmail), '.shoppy.io')) {
                Log::info("sendGstInvoiceEmail: Skipping dummy domain email '{$cleanEmail}' for store {$storeCode}");
                return [
                    'status' => 0,
                    'message' => 'Skipping placeholder dummy email.'
                ];
            }

            $mailable = new \App\Mail\GstInvoiceMail(
                ownerName: $ownerName,
                ownerEmail: $cleanEmail,
                storeCode: $storeCode,
                storeName: $storeName ?: $storeCode,
                invoiceNumber: $invoiceNumber,
                totalAmount: $totalAmount,
                planName: $planName,
                billingCycle: $billingCycle,
                stateCode: $stateCode,
                stateName: $stateName,
                ownerPhone: $ownerPhone,
                transactionId: $transactionId,
                validUntil: $validUntil
            );

            return self::sendMailWithFallback($cleanEmail, $mailable, "GstInvoiceMail [{$invoiceNumber}]");
        } catch (\Throwable $e) {
            Log::error("sendGstInvoiceEmail error for {$ownerEmail}: " . $e->getMessage());
            return [
                'status' => 0,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Dispatch Welcome Email with rich HTML template using Gmail SMTP with multi-port fallback
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
            $cleanEmail = trim($ownerEmail);
            if (empty($cleanEmail) || !filter_var($cleanEmail, FILTER_VALIDATE_EMAIL)) {
                Log::warning("sendWelcomeEmail: Invalid or empty email '{$cleanEmail}' for store {$storeCode}");
                return [
                    'status' => 0,
                    'message' => 'Invalid email address.'
                ];
            }

            // Skip dummy auto-generated placeholder emails
            if (str_ends_with(strtolower($cleanEmail), '.shoppy.io')) {
                Log::info("sendWelcomeEmail: Skipping dummy domain email '{$cleanEmail}' for store {$storeCode}");
                return [
                    'status' => 0,
                    'message' => 'Skipping placeholder dummy email.'
                ];
            }

            $mailable = new WelcomeStoreMail(
                ownerName: $ownerName,
                ownerEmail: $cleanEmail,
                storeCode: $storeCode,
                password: $password,
                storeName: $storeName ?: $storeCode,
                mpin: $mpin,
                validUntil: $validUntil,
                planName: $planName,
            );

            return self::sendMailWithFallback($cleanEmail, $mailable, "WelcomeStoreMail [{$storeCode}]");
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
     * Dispatch Password Reset OTP Email via Gmail SMTP with multi-port fallback
     */
    public static function sendOtpEmail(
        string $ownerName,
        string $ownerEmail,
        string $otp,
        string $storeCode,
        string $storeName = ''
    ): array {
        try {
            $cleanEmail = trim($ownerEmail);
            if (empty($cleanEmail) || !filter_var($cleanEmail, FILTER_VALIDATE_EMAIL)) {
                Log::warning("sendOtpEmail: Invalid or empty email '{$cleanEmail}'");
                return [
                    'status' => 0,
                    'message' => 'Invalid email address.'
                ];
            }

            if (str_ends_with(strtolower($cleanEmail), '.shoppy.io')) {
                Log::info("sendOtpEmail: Skipping dummy domain email '{$cleanEmail}'");
                return [
                    'status' => 0,
                    'message' => 'Skipping placeholder dummy email.'
                ];
            }

            $mailable = new \App\Mail\OtpVerificationMail(
                ownerName: $ownerName,
                otp: $otp,
                storeCode: $storeCode,
                storeName: $storeName,
            );

            return self::sendMailWithFallback($cleanEmail, $mailable, "OtpVerificationMail [{$storeCode}]");
        } catch (\Throwable $e) {
            Log::error("sendOtpEmail error for {$ownerEmail}: " . $e->getMessage());
            return [
                'status' => 0,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Robust mail dispatch with automatic Port 465 (SSL) -> Port 587 (TLS) -> direct Gmail SMTP fallback
     */
    public static function sendMailWithFallback(string $toEmail, \Illuminate\Mail\Mailable $mailable, string $context = 'Mail'): array
    {
        $host = config('services.enexa_mail.host', 'smtp.gmail.com');
        $username = config('services.enexa_mail.username', 'contact@enexa.in');
        $passwordVal = config('services.enexa_mail.password', 'tmdvzyexqjermrfp');
        $fromAddress = config('services.enexa_mail.from_address', 'contact@enexa.in');
        $fromName = config('services.enexa_mail.from_name', 'Shoppy ERP - Enexa IT Solutions Private Limited');
        $ehloDomain = config('services.enexa_mail.ehlo_domain', 'enexa.in');

        Config::set('mail.from', [
            'address' => $fromAddress,
            'name' => $fromName,
        ]);

        $buildMailerConfig = static fn (int $port, string $encryption): array => [
            'transport' => 'smtp',
            'host' => $host,
            'port' => $port,
            'encryption' => $encryption,
            'username' => $username,
            'password' => $passwordVal,
            'timeout' => 25,
            'local_domain' => $ehloDomain,
            'stream' => [
                'ssl' => [
                    'allow_self_signed' => true,
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ],
            ],
        ];

        $mailers = [
            'enexa_smtp_ssl' => $buildMailerConfig(465, 'ssl'),
            'enexa_smtp' => $buildMailerConfig(587, 'tls'),
            'smtp' => $buildMailerConfig(465, 'ssl'),
        ];

        $transportErrors = [];

        foreach ($mailers as $mailerName => $config) {
            try {
                Config::set("mail.mailers.{$mailerName}", $config);
                Mail::purge($mailerName);

                $mailableCopy = clone $mailable;
                Mail::mailer($mailerName)->to($toEmail)->send($mailableCopy);

                Log::info("{$context}: Email delivered successfully to {$toEmail} via {$mailerName} (Port {$config['port']})");

                return [
                    'status' => 1,
                    'mailer' => $mailerName,
                    'host' => $config['host'],
                    'port' => $config['port'],
                    'message' => "Email sent successfully to {$toEmail}"
                ];
            } catch (\Throwable $e) {
                $transportErrors[$mailerName] = "Port {$config['port']}: " . $e->getMessage();
                Log::warning("{$context}: Delivery via {$mailerName} (Port {$config['port']}) failed: " . $e->getMessage() . ". Retrying next transport...");
            }
        }

        Log::error("{$context}: All mail transports failed for recipient {$toEmail}. Errors: " . json_encode($transportErrors));

        return [
            'status' => 0,
            'message' => 'Mail delivery failed on all transports.',
            'transport_errors' => $transportErrors
        ];
    }
}

