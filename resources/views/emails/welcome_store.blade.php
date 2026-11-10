<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Shoppy ERP</title>
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
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #00a2c7 0%, #0369a1 100%);
      padding: 36px 30px;
      text-align: center;
      color: #ffffff;
    }
    .logo-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 12px;
      padding: 6px 16px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 8px 0 0;
      font-size: 14px;
      color: #e0f2fe;
    }
    .content {
      padding: 32px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .lead {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 22px;
      margin-bottom: 24px;
    }
    .card-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #0284c7;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
    }
    .cred-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px dashed #e2e8f0;
      font-size: 13px;
    }
    .cred-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .cred-label {
      color: #64748b;
      font-weight: 600;
    }
    .cred-value {
      font-weight: 700;
      color: #0f172a;
      text-align: right;
    }
    .badge-code {
      background: #e0f2fe;
      color: #0369a1;
      padding: 4px 10px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 14px;
      font-weight: 800;
      border: 1px solid #bae6fd;
    }
    .badge-pass {
      background: #fef3c7;
      color: #92400e;
      padding: 4px 10px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 13px;
      font-weight: 800;
      border: 1px solid #fde68a;
    }
    .cta-container {
      text-align: center;
      margin: 30px 0 24px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #00a2c7 0%, #0284c7 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 800;
      font-size: 15px;
      padding: 14px 34px;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(0, 162, 199, 0.35);
      transition: all 0.2s ease;
    }
    .alert-box {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 14px 18px;
      border-radius: 10px;
      font-size: 12px;
      color: #92400e;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .steps {
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      margin-top: 20px;
    }
    .steps-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .steps-list {
      margin: 0;
      padding-left: 20px;
      font-size: 12px;
      color: #475569;
      line-height: 1.8;
    }
    .footer {
      background: #0f172a;
      color: #94a3b8;
      padding: 24px 30px;
      font-size: 11px;
      text-align: center;
      line-height: 1.7;
    }
    .footer a {
      color: #38bdf8;
      text-decoration: none;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="logo-badge">⚡ Shoppy ERP Cloud</div>
        <h1>Welcome to Shoppy ERP</h1>
        <p>Dedicated Cloud Retail POS & Automated GST Billing Software</p>
      </div>

      <!-- Main Body -->
      <div class="content">
        <div class="greeting">Dear {{ $ownerName }},</div>
        <div class="lead">
          Congratulations on joining us! Your merchant account and dedicated high-performance database for <strong>{{ $storeName }}</strong> have been successfully provisioned and activated.
        </div>

        <!-- Credentials Card -->
        <div class="card">
          <div class="card-title">🔑 STORE ACCESS CREDENTIALS</div>

          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px dashed #e2e8f0;">
              <td style="padding: 9px 0; color: #64748b; font-size: 13px; font-weight: 600;">Store Name</td>
              <td style="padding: 9px 0; text-align: right; color: #0f172a; font-size: 13px; font-weight: 800;">{{ $storeName }}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #e2e8f0;">
              <td style="padding: 9px 0; color: #64748b; font-size: 13px; font-weight: 600;">Member / Store ID</td>
              <td style="padding: 9px 0; text-align: right;">
                <span class="badge-code">{{ $storeCode }}</span>
              </td>
            </tr>
            <tr style="border-bottom: 1px dashed #e2e8f0;">
              <td style="padding: 9px 0; color: #64748b; font-size: 13px; font-weight: 600;">User ID / Login Email</td>
              <td style="padding: 9px 0; text-align: right; color: #0f172a; font-size: 13px; font-weight: 700;">{{ $ownerEmail }}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #e2e8f0;">
              <td style="padding: 9px 0; color: #64748b; font-size: 13px; font-weight: 600;">Default Password</td>
              <td style="padding: 9px 0; text-align: right;">
                <span class="badge-pass">{{ $password }}</span>
              </td>
            </tr>
            <tr style="border-bottom: 1px dashed #e2e8f0;">
              <td style="padding: 9px 0; color: #64748b; font-size: 13px; font-weight: 600;">Default M-PIN</td>
              <td style="padding: 9px 0; text-align: right;">
                <span class="badge-pass">{{ $mpin }}</span>
              </td>
            </tr>
            @if(!empty($planName))
            <tr style="border-bottom: 1px dashed #e2e8f0;">
              <td style="padding: 9px 0; color: #64748b; font-size: 13px; font-weight: 600;">Subscription Plan</td>
              <td style="padding: 9px 0; text-align: right; color: #0284c7; font-size: 13px; font-weight: 700;">{{ $planName }}</td>
            </tr>
            @endif
            @if(!empty($validUntil))
            <tr>
              <td style="padding: 9px 0; color: #64748b; font-size: 13px; font-weight: 600;">Valid Until</td>
              <td style="padding: 9px 0; text-align: right; color: #16a34a; font-size: 13px; font-weight: 700;">{{ $validUntil }}</td>
            </tr>
            @endif
          </table>
        </div>

        <!-- Call To Action -->
        <div class="cta-container">
          <a href="{{ $loginUrl }}" target="_blank" class="cta-button">
            🚀 Launch &amp; Login to Your Store
          </a>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
            Or copy login link: <a href="{{ $loginUrl }}" style="color: #0284c7;">{{ $loginUrl }}</a>
          </p>
        </div>

        <!-- Security Warning -->
        <div class="alert-box">
          <strong>⚠️ Security Advisory:</strong> For the security of your store and billing transactions, please update your default password and M-PIN immediately after your first login via <em>Settings &rarr; Security</em>.
        </div>

        <!-- Quick 3-Step Guide -->
        <div class="steps">
          <div class="steps-title">⚡ Quick Start in 3 Easy Steps:</div>
          <ol class="steps-list">
            <li>Click <strong>Launch Store</strong> above and enter your <strong>Store ID</strong> (or Email) and <strong>Password</strong>.</li>
            <li>Configure your GSTIN, Business Header, and Thermal / A4 Print layouts.</li>
            <li>Add your inventory products and start printing high-speed GST bills!</li>
          </ol>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p><strong>Enexa IT Solutions Private Limited</strong> • Shoppy Cloud ERP</p>
        <p>Need support? Contact our merchant desk at <a href="mailto:contact@enexa.in">contact@enexa.in</a> or WhatsApp/Call +91 95460 42639.</p>
        <p style="color: #64748b; margin-top: 12px;">This is an automated system confirmation for store provisioning.</p>
      </div>
    </div>
  </div>
</body>
</html>
