<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeStoreMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $ownerName,
        public string $ownerEmail,
        public string $storeCode,
        public string $password,
        public string $storeName,
        public string $mpin = '123456',
        public ?string $validUntil = null,
        public ?string $planName = null,
        public ?string $loginUrl = null,
    ) {
        if (!$this->loginUrl) {
            $baseUrl = rtrim((string) config('app.url', 'https://shoppy.live'), '/');
            if ($baseUrl === '' || str_contains($baseUrl, 'localhost') || str_contains($baseUrl, '127.0.0.1')) {
                $baseUrl = 'https://shoppy.live';
            }
            $this->loginUrl = $baseUrl . '/portal/login?code=' . urlencode($this->storeCode);
        }
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
            subject: "Store Account Activated: {$this->storeName} ({$this->storeCode}) — Shoppy ERP",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome_store',
            text: 'emails.welcome_store_plain',
            with: [
                'ownerName' => $this->ownerName,
                'ownerEmail' => $this->ownerEmail,
                'storeCode' => $this->storeCode,
                'password' => $this->password,
                'storeName' => $this->storeName,
                'mpin' => $this->mpin,
                'validUntil' => $this->validUntil,
                'planName' => $this->planName,
                'loginUrl' => $this->loginUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

