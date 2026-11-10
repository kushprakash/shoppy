<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP - Shoppy ERP</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f1f5f9;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 30px 10px;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 32px 28px;
      text-align: center;
      color: #ffffff;
      border-bottom: 3px solid #00a2c7;
    }
    .logo-badge {
      display: inline-block;
      background: rgba(0, 162, 199, 0.15);
      border: 1px solid #00a2c7;
      color: #38bdf8;
      border-radius: 10px;
      padding: 5px 14px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.3px;
    }
    .content {
      padding: 30px 28px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .lead {
      font-size: 13.5px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 22px;
    }
    .otp-card {
      background: #f8fafc;
      border: 2px dashed #00a2c7;
      border-radius: 16px;
      padding: 24px 20px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-subtitle {
      font-size: 11px;
      font-weight: 800;
      color: #0284c7;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: 900;
      letter-spacing: 10px;
      color: #0369a1;
      padding: 8px 16px;
      display: inline-block;
      background: #e0f2fe;
      border-radius: 12px;
    }
    .otp-expiry {
      font-size: 12px;
      font-weight: 600;
      color: #e11d48;
      margin-top: 12px;
    }
    .store-details {
      background: #f1f5f9;
      border-radius: 12px;
      padding: 14px 18px;
      margin: 20px 0;
      font-size: 12.5px;
    }
    .store-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }
    .store-row span:first-child {
      color: #64748b;
      font-weight: 600;
    }
    .store-row span:last-child {
      color: #0f172a;
      font-weight: 700;
    }
    .alert-box {
      background: #fff1f2;
      border-left: 4px solid #f43f5e;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 12px;
      color: #9f1239;
      line-height: 1.5;
      margin-top: 20px;
    }
    .footer {
      background: #0f172a;
      color: #94a3b8;
      padding: 22px 28px;
      font-size: 11px;
      text-align: center;
      line-height: 1.6;
    }
    .footer a {
      color: #38bdf8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="logo-badge">🔒 Security Verification</div>
        <h1>Password Reset Request</h1>
      </div>

      <!-- Main Body -->
      <div class="content">
        <div class="greeting">Dear {{ $ownerName }},</div>
        <div class="lead">
          We received a request to reset the terminal access password for your store account on <strong>Shoppy ERP</strong>.
        </div>

        <!-- OTP Card -->
        <div class="otp-card">
          <div class="otp-subtitle">Your One-Time Password (OTP)</div>
          <div class="otp-code">{{ $otp }}</div>
          <div class="otp-expiry">⏳ Valid for the next 10 minutes only</div>
        </div>

        <!-- Store Details -->
        <div class="store-details">
          <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
            <tr>
              <td style="color: #64748b; font-weight: 600; padding: 4px 0;">Store Name</td>
              <td style="text-align: right; color: #0f172a; font-weight: 700; padding: 4px 0;">{{ $storeName }}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-weight: 600; padding: 4px 0;">Store Code</td>
              <td style="text-align: right; font-family: monospace; color: #0369a1; font-weight: 800; padding: 4px 0;">{{ $storeCode }}</td>
            </tr>
            @if(!empty($requestedAt))
            <tr>
              <td style="color: #64748b; font-weight: 600; padding: 4px 0;">Requested At</td>
              <td style="text-align: right; color: #475569; font-weight: 600; padding: 4px 0;">{{ $requestedAt }}</td>
            </tr>
            @endif
          </table>
        </div>

        <div class="alert-box">
          <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone, including Shoppy or Enexa representatives. If you did not initiate this password reset, please ignore this email or reach out to our merchant security desk immediately.
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p><strong>Enexa IT Solutions Private Limited</strong> • Shoppy Cloud ERP</p>
        <p>Support: <a href="mailto:contact@enexa.in">contact@enexa.in</a> | Helpline: +91 95460 42639</p>
        <p style="color: #64748b; margin-top: 10px;">This is a system-generated authentication notification.</p>
      </div>
    </div>
  </div>
</body>
</html>

