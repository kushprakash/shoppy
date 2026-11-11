TAX INVOICE — ENEXA IT SOLUTIONS PRIVATE LIMITED (Shoppy ERP)

Invoice Number: {{ $invoiceNumber }}
Invoice Date: {{ $invoiceDate }}
Store Name: {{ $storeName }} ({{ $storeCode }})
Customer Name: {{ $ownerName }}
Email: {{ $ownerEmail }}
Plan: {{ $planName }} ({{ $billingCycle }})
Taxable Amount: INR {{ number_format($taxableAmount, 2) }}
@if($isInterstate)
IGST (18%): INR {{ number_format($igstAmount, 2) }}
@else
CGST (9%): INR {{ number_format($cgstAmount, 2) }}
SGST (9%): INR {{ number_format($sgstAmount, 2) }}
@endif
Grand Total (INR): {{ number_format($totalAmount, 2) }}
@if(!empty($transactionId))
Transaction Reference: {{ $transactionId }}
@endif
@if(!empty($validUntil))
Subscription Valid Until: {{ $validUntil }}
@endif

Issued by Enexa IT Solutions Private Limited | GSTIN: {{ $sellerGstin }}
Support: contact@enexa.in | +91 95460 42639

