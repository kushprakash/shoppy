Shoppy ERP — Enexa IT Solutions Private Limited
Account Activation & Store Access Details

Dear {{ $ownerName }},

Your merchant account and isolated store database for "{{ $storeName }}" have been provisioned and activated.

Store Access Credentials:
- Store Name: {{ $storeName }}
- Member / Store ID: {{ $storeCode }}
- Login Email / User ID: {{ $ownerEmail }}
- Temporary Password: {{ $password }}
- Temporary M-PIN: {{ $mpin }}
@if(!empty($planName))
- Subscription Plan: {{ $planName }}
@endif
@if(!empty($validUntil))
- Valid Until: {{ $validUntil }}
@endif

Store Portal Login URL:
{{ $loginUrl }}

Security Notice:
Please sign in and update your password and M-PIN from Settings -> Security after your first login.

Support Desk:
Enexa IT Solutions Private Limited
Email: contact@enexa.in
Phone / WhatsApp: +91 95460 42639
Website: https://shoppy.live | https://www.enexa.in

