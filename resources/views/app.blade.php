<!DOCTYPE html>
<html lang="en" class="h-full {{ $htmlClass ?? 'bg-slate-950 text-slate-100' }} antialiased">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ $title ?? 'Shoppy — Multi-Tenant E-Commerce & Retail ERP' }}</title>

    <!-- Google Fonts: Outfit & Inter & Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        }
        h1, h2, h3, h4, .font-heading {
            font-family: 'Outfit', system-ui, -apple-system, sans-serif;
        }
    </style>

    <script>
        (function() {
            try {
                var theme = localStorage.getItem('shoppy_erp_theme');
                var cookieMatch = document.cookie.match(/(?:^|; )shoppy_erp_theme=([^;]*)/);
                var cookieTheme = cookieMatch ? cookieMatch[1] : null;
                var activeTheme = theme || cookieTheme || 'light';
                if (activeTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } catch(e) {}
        })();
    </script>

    @viteReactRefresh
    @if(isset($entry) && $entry !== 'app' && file_exists(resource_path('js/entries/' . $entry . '.jsx')))
        @vite(['resources/css/app.css', 'resources/js/entries/' . $entry . '.jsx'])
    @else
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @endif
</head>
<body class="min-h-full flex flex-col {{ $bodyClass ?? 'selection:bg-indigo-500 selection:text-white' }}">
    <div id="root" class="flex-1 flex flex-col" data-shop-code="{{ $shopCode ?? 'SHP-A4IFYK' }}"></div>
</body>
</html>
