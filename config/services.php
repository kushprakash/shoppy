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
        'key' => env('PAYU_MERCHANT_KEY', env('PAYU_KEY', '3VzQpX')),
        'salt' => env('PAYU_MERCHANT_SALT', env('PAYU_SALT', '5suoTv1yxsgU53Q5fr1Ucb2gapTG9yBa')),
        'env' => env('PAYU_ENV', 'production'), // 'test' or 'production'
    ],

    'payu' => [
        'key' => env('PAYU_MERCHANT_KEY', env('PAYU_KEY', 'gtKFFx')),
        'salt' => env('PAYU_MERCHANT_SALT', env('PAYU_SALT', 'eCwWELxi')),
        'env' => env('PAYU_ENV', 'test'), // 'test' or 'production'
    ],

];
