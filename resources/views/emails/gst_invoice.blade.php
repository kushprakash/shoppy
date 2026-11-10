<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice — ENEXA IT SOLUTIONS PRIVATE LIMITED</title>
</head>
<body style="margin:0; padding:0; background-color:#e2e8f0; font-family:Arial, Helvetica, sans-serif; color:#000000; -webkit-font-smoothing:antialiased;">

  <div style="width:100%; padding:24px 8px; background-color:#e2e8f0;">
    <table cellpadding="0" cellspacing="0" border="0" style="max-width:720px; margin:0 auto; background:#ffffff; box-shadow:0 4px 14px rgba(0,0,0,0.12); border-radius:4px;">

      {{-- ===================== TOP COMPANY HEADER ===================== --}}
      <tr>
        <td style="padding:22px 24px 0 24px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="vertical-align:top; width:62%;">
                <div style="font-size:22px; font-weight:900; color:#0f172a; letter-spacing:0.3px; font-family:'Arial Black',Arial,sans-serif; text-transform:uppercase; margin:0 0 2px;">
                  ENEXA IT SOLUTIONS PRIVATE LIMITED
                </div>
              </td>
              <td style="vertical-align:top; width:38%; text-align:right;">
                {{-- SHOPPY ERP LOGO AREA --}}
                <table cellpadding="0" cellspacing="0" border="0" style="float:right;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#008ba3,#00b9d6); border-radius:10px; padding:8px 14px; text-align:center;">
                      <div style="font-size:18px; font-weight:900; color:#ffffff; font-family:'Arial Black',Arial,sans-serif; letter-spacing:0.5px;">SHOPPY ERP</div>
                      <div style="font-size:9px; font-weight:700; color:#e0f7fa; letter-spacing:1px; text-transform:uppercase;">Cloud Retail Billing</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      {{-- TEAL BANNER --}}
      <tr>
        <td style="padding:6px 24px 0 24px;">
          <div style="background-color:#008ba3; color:#ffffff; padding:5px 12px; font-size:12px; font-weight:700; letter-spacing:0.4px;">
            Software, Cloud &amp; Automated Retail POS ERP Solutions
          </div>
        </td>
      </tr>

      {{-- ADDRESS / CONTACT BAR --}}
      <tr>
        <td style="padding:8px 24px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:10.5px; color:#334155; line-height:1.5;">
            <tr>
              <td style="vertical-align:top; width:58%;">
                <div>Registered Office: Bihar, India</div>
                <div>Tel / Helpline: +91 9546042639</div>
                <div>Web: www.enexa.in &nbsp;|&nbsp; shoppy.live</div>
                <div>Email: <span style="color:#008ba3; font-weight:bold;">contact@enexa.in</span></div>
              </td>
              <td style="vertical-align:top; width:42%; text-align:right; font-size:10px;">
                <div style="color:#16a34a; font-weight:bold;">&#10003; 100% PAID VIA PAYTM UPI</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      {{-- ===================== MAIN INVOICE TABLE ===================== --}}
      <tr>
        <td style="padding:0 24px;">

          <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse; border:1.5px solid #000000; font-size:11px;">

            {{-- ROW 1: PAN / TAX INVOICE / ORIGINAL --}}
            <tr>
              <td colspan="4" style="border:1px solid #000; padding:6px 8px; width:36%; vertical-align:top;">
                <div><strong>PAN :</strong> {{ $sellerPan }}</div>
                <div><strong>GSTIN :</strong> {{ $sellerGstin }}</div>
              </td>
              <td colspan="3" style="border:1px solid #000; padding:8px; text-align:center; vertical-align:middle;">
                <div style="font-size:16px; font-weight:900; font-family:'Arial Black',Arial,sans-serif;">TAX INVOICE</div>
              </td>
              <td colspan="2" style="border:1px solid #000; padding:6px 8px; text-align:right; vertical-align:middle; font-size:10px;">
                ORIGINAL FOR RECIPIENT
              </td>
            </tr>

            {{-- ROW 2: CUSTOMER DETAIL + INVOICE METADATA --}}
            <tr>
              {{-- Left: Customer Detail --}}
              <td colspan="5" style="border:1px solid #000; padding:0; vertical-align:top; width:55%;">
                <div style="text-align:center; font-weight:800; font-size:10.5px; padding:4px; border-bottom:1px solid #000; background:#f8fafc;">Customer Detail</div>
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:10.5px; line-height:1.5; padding:6px 8px;">
                  <tr><td style="padding:2px 8px; width:30%; font-weight:bold;">M/S</td><td style="padding:2px 4px; font-weight:bold;">{{ $storeName }}</td></tr>
                  <tr><td style="padding:2px 8px; font-weight:bold;">Owner Name</td><td style="padding:2px 4px;">{{ $ownerName }}</td></tr>
                  <tr><td style="padding:2px 8px; font-weight:bold;">Address</td><td style="padding:2px 4px;">{{ $stateName }}, India</td></tr>
                  <tr><td style="padding:2px 8px; font-weight:bold;">Phone</td><td style="padding:2px 4px;">{{ $ownerPhone }}</td></tr>
                  <tr><td style="padding:2px 8px; font-weight:bold;">Email</td><td style="padding:2px 4px;">{{ $ownerEmail }}</td></tr>
                  <tr><td style="padding:2px 8px; font-weight:bold;">Store Code</td><td style="padding:2px 4px; font-weight:bold; color:#008ba3; font-family:monospace;">{{ $storeCode }}</td></tr>
                  <tr><td style="padding:2px 8px; font-weight:bold;">Place of Supply</td><td style="padding:2px 4px; font-weight:bold;">{{ $stateName }} ( {{ $stateCode }} )</td></tr>
                </table>
              </td>

              {{-- Right: Invoice Meta --}}
              <td colspan="4" style="border:1px solid #000; padding:0; vertical-align:top; width:45%;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:10.5px; line-height:1.5;">
                  <tr><td style="padding:4px 8px; width:40%; font-weight:bold; border-bottom:1px solid #ddd;">Invoice No.</td><td style="padding:4px 6px; font-weight:bold; border-bottom:1px solid #ddd; font-family:monospace; font-size:10px;">{{ $invoiceNumber }}</td></tr>
                  <tr><td style="padding:4px 8px; font-weight:bold; border-bottom:1px solid #ddd;">Invoice Date</td><td style="padding:4px 6px; font-weight:bold; border-bottom:1px solid #ddd;">{{ $invoiceDate }}</td></tr>
                  <tr><td style="padding:4px 8px; font-weight:bold; border-bottom:1px solid #ddd;">Plan</td><td style="padding:4px 6px; border-bottom:1px solid #ddd;">{{ $planName }}</td></tr>
                  <tr><td style="padding:4px 8px; font-weight:bold; border-bottom:1px solid #ddd;">Period</td><td style="padding:4px 6px; border-bottom:1px solid #ddd;">{{ ucfirst($billingCycle) }}</td></tr>
                  @if($validUntil)
                  <tr><td style="padding:4px 8px; font-weight:bold; border-bottom:1px solid #ddd;">Valid Till</td><td style="padding:4px 6px; font-weight:bold; border-bottom:1px solid #ddd;">{{ $validUntil }}</td></tr>
                  @endif
                  <tr><td style="padding:4px 8px; font-weight:bold; border-bottom:1px solid #ddd;">Payment Mode</td><td style="padding:4px 6px; border-bottom:1px solid #ddd;">Paytm UPI Dynamic QR</td></tr>
                  @if($transactionId)
                  <tr><td style="padding:4px 8px; font-weight:bold; border-bottom:1px solid #ddd;">Order / UTR</td><td style="padding:4px 6px; font-family:monospace; font-size:9.5px; border-bottom:1px solid #ddd;">{{ $transactionId }}</td></tr>
                  @endif
                  <tr><td style="padding:4px 8px; font-weight:bold;">Payment Status</td><td style="padding:4px 6px; font-weight:bold; color:#16a34a;">SUCCESS / PAID</td></tr>
                </table>
              </td>
            </tr>

            {{-- ROW 3: LINE ITEMS HEADER --}}
            <tr style="background:#f1f5f9;">
              <td style="border:1px solid #000; padding:6px 4px; text-align:center; font-weight:800; font-size:10px; width:6%;">Sr.<br>No.</td>
              <td colspan="2" style="border:1px solid #000; padding:6px 4px; text-align:center; font-weight:800; font-size:10px; width:30%;">Name of Product / Service</td>
              <td style="border:1px solid #000; padding:6px 4px; text-align:center; font-weight:800; font-size:10px; width:10%;">HSN /<br>SAC</td>
              <td style="border:1px solid #000; padding:6px 4px; text-align:center; font-weight:800; font-size:10px; width:7%;">Qty</td>
              <td style="border:1px solid #000; padding:6px 4px; text-align:center; font-weight:800; font-size:10px; width:12%;">Rate (₹)</td>
              <td style="border:1px solid #000; padding:6px 4px; text-align:center; font-weight:800; font-size:10px; width:13%;">Taxable<br>Value (₹)</td>
              @if($isInterstate)
              <td style="border:1px solid #000; padding:6px 4px; text-align:center; font-weight:800; font-size:10px; width:12%;">IGST 18%<br>Amount (₹)</td>
              @else
              <td style="border:1px solid #000; padding:6px 4px; text-align:center; font-weight:800; font-size:9px; width:12%;">CGST 9% +<br>SGST 9% (₹)</td>
              @endif
              <td style="border:1px solid #000; padding:6px 4px; text-align:center; font-weight:800; font-size:10px; width:10%;">Total<br>(₹)</td>
            </tr>

            {{-- ROW 4: LINE ITEM 1 --}}
            <tr>
              <td style="border:1px solid #000; padding:10px 4px; text-align:center; vertical-align:top;">1</td>
              <td colspan="2" style="border:1px solid #000; padding:10px 6px; vertical-align:top;">
                <strong style="font-size:12px; color:#0f172a;">Shoppy ERP</strong><br>
                <span style="font-size:10px; color:#475569;">Cloud Retail POS &amp; Automated GST Billing Software</span><br>
                <span style="font-size:9.5px; color:#008ba3; font-weight:bold;">License: {{ $planName }} ({{ ucfirst($billingCycle) }})</span>
              </td>
              <td style="border:1px solid #000; padding:10px 4px; text-align:center; vertical-align:top; font-weight:bold; font-family:monospace;">997331</td>
              <td style="border:1px solid #000; padding:10px 4px; text-align:center; vertical-align:top;">1<br><span style="font-size:9px;">NOS</span></td>
              <td style="border:1px solid #000; padding:10px 6px; text-align:right; vertical-align:top;">{{ number_format($taxableAmount, 2) }}</td>
              <td style="border:1px solid #000; padding:10px 6px; text-align:right; vertical-align:top; font-weight:bold;">{{ number_format($taxableAmount, 2) }}</td>
              @if($isInterstate)
              <td style="border:1px solid #000; padding:10px 6px; text-align:right; vertical-align:top;">{{ number_format($igstAmount, 2) }}</td>
              @else
              <td style="border:1px solid #000; padding:10px 6px; text-align:right; vertical-align:top;">{{ number_format($cgstAmount, 2) }}<br><span style="font-size:9px; color:#64748b;">+ {{ number_format($sgstAmount, 2) }}</span></td>
              @endif
              <td style="border:1px solid #000; padding:10px 6px; text-align:right; vertical-align:top; font-weight:bold; font-size:12px;">{{ number_format($totalAmount, 2) }}</td>
            </tr>

            {{-- ROW 5: TOTAL ROW --}}
            <tr style="background:#f8fafc; font-weight:bold;">
              <td style="border:1px solid #000; padding:7px 4px; text-align:center;" colspan="3">Total</td>
              <td style="border:1px solid #000; padding:7px 4px; text-align:center;"></td>
              <td style="border:1px solid #000; padding:7px 4px; text-align:center;">1 NOS</td>
              <td style="border:1px solid #000; padding:7px 6px; text-align:right;"></td>
              <td style="border:1px solid #000; padding:7px 6px; text-align:right;">{{ number_format($taxableAmount, 2) }}</td>
              <td style="border:1px solid #000; padding:7px 6px; text-align:right;">{{ number_format($gstAmount, 2) }}</td>
              <td style="border:1px solid #000; padding:7px 6px; text-align:right; font-size:12px;">{{ number_format($totalAmount, 2) }}</td>
            </tr>

            {{-- ROW 6: LOWER SECTION (Left: Words/Bank/Terms — Right: Tax Summary/Signatory) --}}
            <tr>
              {{-- LEFT LOWER: Total in words, Payment details, Terms --}}
              <td colspan="5" style="border:1px solid #000; padding:0; vertical-align:top;">

                {{-- TOTAL IN WORDS --}}
                <div style="padding:8px 10px; border-bottom:1px solid #000;">
                  <div style="font-size:9px; font-weight:800; text-transform:uppercase; color:#64748b; margin-bottom:2px;">Total in words</div>
                  <div style="font-size:11px; font-weight:900; color:#000;">{{ $amountInWords }}</div>
                </div>

                {{-- PAYMENT / GATEWAY DETAILS --}}
                <div style="padding:8px 10px; border-bottom:1px solid #000;">
                  <div style="font-size:9px; font-weight:800; text-transform:uppercase; color:#64748b; margin-bottom:4px;">Payment / Gateway Details</div>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:10px;">
                    <tr>
                      <td style="vertical-align:top; width:65%; padding-right:6px;">
                        <div><strong>Gateway:</strong> Paytm UPI Dynamic QR</div>
                        <div><strong>Merchant VPA:</strong> paytm.s1lcife@pty</div>
                        <div><strong>Merchant MID:</strong> oMLHAD02125387471881</div>
                        <div><strong>Payment Status:</strong> <span style="color:#16a34a; font-weight:bold;">PAID (100% RECEIVED)</span></div>
                      </td>
                      <td style="vertical-align:top; width:35%; text-align:center;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&margin=3&data=upi%3A%2F%2Fpay%3Fpa%3Dpaytm.s1lcife%40pty%26pn%3DShoppy%20ERP" alt="UPI QR" width="80" height="80" style="display:block; margin:0 auto;">
                        <div style="font-size:8px; font-weight:bold; color:#008ba3; margin-top:2px;">Verified UPI Receipt</div>
                      </td>
                    </tr>
                  </table>
                </div>

                {{-- TERMS AND CONDITIONS --}}
                <div style="padding:8px 10px; border-bottom:1px solid #000;">
                  <div style="font-size:9px; font-weight:800; text-transform:uppercase; color:#64748b; margin-bottom:3px;">Terms and Conditions</div>
                  <div style="font-size:9.5px; color:#334155; line-height:1.4;">
                    1. Subject to Patna, Bihar Jurisdiction.<br>
                    2. Cloud SaaS Software subscription is non-refundable once store database is provisioned.<br>
                    3. Includes automated cloud database sync, GST reporting &amp; POS updates.
                  </div>
                </div>

                {{-- CUSTOMER SIGNATURE --}}
                <div style="padding:10px 10px 14px;">
                  <div style="font-size:10px; font-weight:bold;">Customer Signature: _______________________</div>
                </div>

              </td>

              {{-- RIGHT LOWER: Tax Breakdown + Signatory --}}
              <td colspan="4" style="border:1px solid #000; padding:0; vertical-align:top;">

                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:11px;">
                  {{-- Taxable Amount --}}
                  <tr>
                    <td style="padding:6px 8px; border-bottom:1px solid #ccc; font-weight:bold;">Taxable Amount</td>
                    <td style="padding:6px 8px; border-bottom:1px solid #ccc; text-align:right; font-weight:bold;">{{ number_format($taxableAmount, 2) }}</td>
                  </tr>

                  @if($isInterstate)
                  <tr>
                    <td style="padding:5px 8px; border-bottom:1px solid #ccc;">Add : IGST (18%)</td>
                    <td style="padding:5px 8px; border-bottom:1px solid #ccc; text-align:right;">{{ number_format($igstAmount, 2) }}</td>
                  </tr>
                  @else
                  <tr>
                    <td style="padding:5px 8px; border-bottom:1px solid #ccc;">Add : CGST (9%)</td>
                    <td style="padding:5px 8px; border-bottom:1px solid #ccc; text-align:right;">{{ number_format($cgstAmount, 2) }}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 8px; border-bottom:1px solid #ccc;">Add : SGST (9%)</td>
                    <td style="padding:5px 8px; border-bottom:1px solid #ccc; text-align:right;">{{ number_format($sgstAmount, 2) }}</td>
                  </tr>
                  @endif

                  <tr>
                    <td style="padding:5px 8px; border-bottom:1px solid #ccc; font-weight:bold;">Total Tax</td>
                    <td style="padding:5px 8px; border-bottom:1px solid #ccc; text-align:right; font-weight:bold;">{{ number_format($gstAmount, 2) }}</td>
                  </tr>

                  {{-- GRAND TOTAL --}}
                  <tr style="background:#f1f5f9;">
                    <td style="padding:8px; border-bottom:1.5px solid #000; font-weight:900; font-size:11.5px;">Total Amount<br>After Tax</td>
                    <td style="padding:8px; border-bottom:1.5px solid #000; text-align:right; font-weight:900; font-size:15px; color:#000;">₹{{ number_format($totalAmount, 2) }}</td>
                  </tr>

                  <tr>
                    <td colspan="2" style="padding:3px 8px; text-align:right; font-size:9.5px; font-style:italic;">(E &amp; O.E.)</td>
                  </tr>

                  <tr>
                    <td colspan="2" style="padding:6px 8px; text-align:center; font-size:9px; color:#475569;">
                      Certified that the particulars given above are true and correct.
                    </td>
                  </tr>

                  {{-- FOR COMPANY NAME --}}
                  <tr>
                    <td colspan="2" style="padding:6px 8px; text-align:center; border-top:1px solid #ccc;">
                      <div style="font-weight:800; font-size:10px; text-transform:uppercase; line-height:1.3;">
                        For ENEXA IT SOLUTIONS<br>PRIVATE LIMITED
                      </div>

                      {{-- Computer Generated Seal --}}
                      <div style="display:inline-block; transform:rotate(-5deg); border:1.5px dashed #008ba3; padding:5px 10px; color:#008ba3; font-size:9px; font-weight:800; text-transform:uppercase; margin:10px 0; background-color:#f0fdfa; line-height:1.3;">
                        THIS IS A COMPUTER<br>GENERATED INVOICE<br>NO SIGNATURE REQUIRED.
                      </div>

                      <div style="font-size:10px; font-weight:bold; border-top:1px dashed #94a3b8; padding-top:5px; margin-top:4px;">
                        Authorised Signatory
                      </div>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

          </table>

        </td>
      </tr>

      {{-- FOOTER THANK YOU --}}
      <tr>
        <td style="padding:14px 24px 18px; text-align:center;">
          <div style="font-size:10.5px; font-weight:bold; color:#008ba3;">
            Thank you for choosing Shoppy ERP® — Enexa IT Solutions Private Limited!
          </div>
        </td>
      </tr>

    </table>
  </div>

</body>
</html>
