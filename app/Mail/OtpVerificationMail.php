<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;

class OtpVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $ownerName,
        public string $otp,
        public string $storeCode,
        public string $storeName = '',
        public ?string $requestedAt = null
    ) {
        $this->requestedAt = $this->requestedAt ?: now()->format('d M Y, h:i A');
    }

    public function envelope(): Envelope
    {
        $fromAddress = config('services.enexa_mail.from_address') ?: 'contact@enexa.in';
        $rawFromName = config('services.enexa_mail.from_name') ?: 'Shoppy ERP - Enexa IT Solutions';
        $fromName = (empty($rawFromName) || strtolower(trim((string)$rawFromName)) === 'laravel')
            ? 'Shoppy ERP - Enexa IT Solutions'
            : trim((string)$rawFromName);

        return new Envelope(
            from: new Address($fromAddress, $fromName),
            replyTo: [new Address($fromAddress, $fromName)],
            subject: "Shoppy ERP - Verification Code: {$this->otp}",
        );
    }

    public function headers(): Headers
    {
        return new Headers(
            text: [
                'X-Mailer' => 'Shoppy ERP Cloud Mailer',
                'X-Priority' => '1 (Highest)',
                'Importance' => 'High',
                'Auto-Submitted' => 'auto-generated',
                'X-Auto-Response-Suppress' => 'All',
            ]
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp_verification',
            text: 'emails.otp_verification_plain',
            with: [
                'ownerName' => $this->ownerName,
                'otp' => $this->otp,
                'storeCode' => $this->storeCode,
                'storeName' => $this->storeName ?: $this->storeCode,
                'requestedAt' => $this->requestedAt,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

