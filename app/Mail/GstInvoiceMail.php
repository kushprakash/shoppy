<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GstInvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $sellerName = 'ENEXA IT SOLUTIONS PRIVATE LIMITED';
    public string $sellerGstin = '10AAICE1567H1ZX';
    public string $sellerPan = 'AAICE1567H';
    public string $sellerState = 'Bihar ( 10 )';
    public string $sellerPhone = '+91 9546042639';
    public string $sellerEmail = 'contact@enexa.in';
    public string $sellerWeb = 'www.enexa.in';

    public float $taxableAmount;
    public float $gstAmount;
    public float $cgstAmount;
    public float $sgstAmount;
    public float $igstAmount;
    public bool $isInterstate;
    public string $amountInWords;

    public function __construct(
        public string $ownerName,
        public string $ownerEmail,
        public string $storeCode,
        public string $storeName,
        public string $invoiceNumber,
        public float $totalAmount,
        public string $planName = 'Monthly Package',
        public string $billingCycle = 'monthly',
        public ?string $stateCode = '10',
        public ?string $stateName = 'BIHAR',
        public ?string $ownerPhone = '9546042639',
        public ?string $transactionId = null,
        public ?string $validUntil = null,
        public ?string $invoiceDate = null,
    ) {
        $this->invoiceDate = $this->invoiceDate ?: now()->format('d-M-Y');

        // Total amount is inclusive of 18% GST: Total = Taxable * 1.18
        $this->taxableAmount = round($this->totalAmount / 1.18, 2);
        $this->gstAmount = round($this->totalAmount - $this->taxableAmount, 2);

        // Place of supply: Bihar (State Code 10) is Intra-state (CGST + SGST)
        // Any other state is Inter-state (IGST 18%)
        $normState = trim((string)$this->stateCode);
        $this->isInterstate = ($normState !== '10' && !str_contains(strtoupper((string)$this->stateName), 'BIHAR'));

        if ($this->isInterstate) {
            $this->igstAmount = $this->gstAmount;
            $this->cgstAmount = 0.0;
            $this->sgstAmount = 0.0;
        } else {
            $halfGst = round($this->gstAmount / 2, 2);
            $this->cgstAmount = $halfGst;
            $this->sgstAmount = round($this->gstAmount - $halfGst, 2);
            $this->igstAmount = 0.0;
        }

        $this->amountInWords = strtoupper(self::convertNumberToWords((int)round($this->totalAmount)));
    }

    public function envelope(): Envelope
    {
        $fromAddress = config('services.enexa_mail.from_address', 'contact@enexa.in');
        $fromName = config('services.enexa_mail.from_name', 'Shoppy ERP - Enexa IT Solutions Private Limited');

        return new Envelope(
            from: new Address($fromAddress, $fromName),
            replyTo: [new Address($fromAddress, $fromName)],
            subject: "TAX INVOICE [{$this->invoiceNumber}] — Shoppy ERP Software Subscription — ENEXA IT SOLUTIONS PRIVATE LIMITED",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.gst_invoice',
            text: 'emails.gst_invoice_plain',
            with: [
                'sellerName' => $this->sellerName,
                'sellerGstin' => $this->sellerGstin,
                'sellerPan' => $this->sellerPan,
                'sellerState' => $this->sellerState,
                'sellerPhone' => $this->sellerPhone,
                'sellerEmail' => $this->sellerEmail,
                'sellerWeb' => $this->sellerWeb,
                'ownerName' => $this->ownerName,
                'ownerEmail' => $this->ownerEmail,
                'ownerPhone' => $this->ownerPhone,
                'storeCode' => $this->storeCode,
                'storeName' => $this->storeName,
                'invoiceNumber' => $this->invoiceNumber,
                'invoiceDate' => $this->invoiceDate,
                'totalAmount' => $this->totalAmount,
                'taxableAmount' => $this->taxableAmount,
                'gstAmount' => $this->gstAmount,
                'cgstAmount' => $this->cgstAmount,
                'sgstAmount' => $this->sgstAmount,
                'igstAmount' => $this->igstAmount,
                'isInterstate' => $this->isInterstate,
                'amountInWords' => $this->amountInWords,
                'planName' => $this->planName,
                'billingCycle' => $this->billingCycle,
                'stateCode' => $this->stateCode,
                'stateName' => $this->stateName,
                'transactionId' => $this->transactionId,
                'validUntil' => $this->validUntil,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }

    /**
     * Convert integer amount to Indian English words
     */
    public static function convertNumberToWords(int $num): string
    {
        $ones = [
            0 => '', 1 => 'One', 2 => 'Two', 3 => 'Three', 4 => 'Four', 5 => 'Five',
            6 => 'Six', 7 => 'Seven', 8 => 'Eight', 9 => 'Nine', 10 => 'Ten',
            11 => 'Eleven', 12 => 'Twelve', 13 => 'Thirteen', 14 => 'Fourteen', 15 => 'Fifteen',
            16 => 'Sixteen', 17 => 'Seventeen', 18 => 'Eighteen', 19 => 'Nineteen'
        ];
        $tens = [
            2 => 'Twenty', 3 => 'Thirty', 4 => 'Forty', 5 => 'Fifty',
            6 => 'Sixty', 7 => 'Seventy', 8 => 'Eighty', 9 => 'Ninety'
        ];

        if ($num === 0) {
            return 'Zero Rupees Only';
        }

        $res = '';

        if ($num >= 10000000) {
            $crore = (int)($num / 10000000);
            $res .= self::convertUnderThousand($crore, $ones, $tens) . ' Crore ';
            $num %= 10000000;
        }

        if ($num >= 100000) {
            $lakh = (int)($num / 100000);
            $res .= self::convertUnderThousand($lakh, $ones, $tens) . ' Lakh ';
            $num %= 100000;
        }

        if ($num >= 1000) {
            $thousand = (int)($num / 1000);
            $res .= self::convertUnderThousand($thousand, $ones, $tens) . ' Thousand ';
            $num %= 1000;
        }

        if ($num > 0) {
            $res .= self::convertUnderThousand($num, $ones, $tens);
        }

        return trim($res) . ' Rupees Only';
    }

    private static function convertUnderThousand(int $num, array $ones, array $tens): string
    {
        $str = '';
        if ($num >= 100) {
            $str .= $ones[(int)($num / 100)] . ' Hundred ';
            $num %= 100;
        }
        if ($num >= 20) {
            $str .= $tens[(int)($num / 10)] . ' ';
            $num %= 10;
        }
        if ($num > 0) {
            $str .= $ones[$num] . ' ';
        }
        return trim($str);
    }
}
