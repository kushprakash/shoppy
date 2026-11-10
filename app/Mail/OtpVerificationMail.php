<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
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
        $fromAddress = config('services.enexa_mail.from_address', 'contact@enexa.in');
        $fromName = config('services.enexa_mail.from_name', 'Shoppy ERP Security');

        return new Envelope(
            from: new Address($fromAddress, $fromName),
            subject: "Your Shoppy ERP Verification Code: {$this->otp} (Valid for 10 mins)",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp_verification',
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

