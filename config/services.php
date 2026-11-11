<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'payu' => [
        'key' => env('PAYU_MERCHANT_KEY', '3VzQpX'),
        'salt' => env('PAYU_MERCHANT_SALT', '5suoTv1yxsgU53Q5fr1Ucb2gapTG9yBa'),
        'env' => env('PAYU_ENV', 'production'),
    ],

    'paytm' => [
        'upi' => 'paytm.s1lcife@pty',
        'key' => 'oMLHAD02125387471881',
        'salt' => 'AAuN7izDWN5cb8A5scnUiNME+LkZqI2DWgkXlN1McoP6WZABa/KkFTiLvuPRP6/nWK8BPg/rPhb+u4QMrUEX10UsANTDbJaALcSM9b8Wk218X+55T/zOzb7xoiB+BcX8yYuYayELImXJHIgL/c7nkAnHrwUCmbM97nRbCVVRvU0ku3Tr',
        'env' => 'production',
    ],

    'buzzify' => [
        'api_key' => env('BUZZIFY_API_KEY', 'Q5z3mfNGdXu6RtJI'),
        'sender_id' => env('BUZZIFY_SENDER_ID', 'ENEXAI'),
    ],

    'enexa_mail' => [
        'host' => 'smtp.gmail.com',
        'port' => 465,
        'username' => 'contact@enexa.in',
        'password' => 'tmdvzyexqjermrfp',
        'encryption' => 'ssl',
        'from_address' => 'contact@enexa.in',
        'from_name' => 'Shoppy ERP - Enexa IT',
    ],

];
