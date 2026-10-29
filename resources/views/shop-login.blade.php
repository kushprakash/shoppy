<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950 text-slate-100 antialiased">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $shopName ?? 'Store Billing Software' }} — POS & ERP Login</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    @vite(['resources/css/app.css'])
    
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-heading { font-family: 'Outfit', sans-serif; }
    </style>
</head>
<body class="min-h-full flex flex-col justify-center items-center p-4 bg-gradient-to-br from-[#0c1421] via-[#101b2b] to-[#152338]">
    <div class="max-w-md w-full space-y-6">
        <!-- Store Brand Card -->
        <div class="text-center space-y-2">
            <div class="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#008ba3] via-[#00a8cc] to-[#10b981] items-center justify-center text-white shadow-xl shadow-cyan-500/20 mb-2">
                <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
                    <path d="M2 7h20"/>
                    <circle cx="12" cy="12" r="2"/>
                </svg>
            </div>
            <h1 class="text-2xl font-extrabold text-white font-heading tracking-tight">
                {{ $shopName ?? 'Retail Store ERP' }}
            </h1>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-mono font-bold text-cyan-400">
                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Store Code: {{ $shopCode }}
            </div>
        </div>

        @if($isGenericStoreLogin ?? false)
        <div class="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs flex items-center gap-2.5 shadow-lg">
            <svg class="w-4 h-4 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2"/>
                <path d="M7 7h10M7 12h10M7 17h10"/>
            </svg>
            <span>Multi-Tenant Merchant Store ERP Portal. Select or enter store credentials below.</span>
        </div>
        @else
        <!-- Plan Notice Alert -->
        <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1 shadow-lg">
            <div class="flex items-center gap-2 font-bold text-amber-300">
                <svg class="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>Online Ecommerce Storefront Not Active</span>
            </div>
            <p class="text-amber-200/80 leading-relaxed pl-6">
                Yeh store <strong>GST Billing Software</strong> plan par active hai. Ecommerce storefront is plan me shamil nahi hai, isliye seedha Billing Software login page open hua hai.
            </p>
        </div>
        @endif

        <!-- Login Form Card -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
            <div class="border-b border-slate-800 pb-3">
                <h2 class="text-base font-bold text-white font-heading">Merchant & Cashier Login</h2>
                <p class="text-xs text-slate-400">Enter your Store Code and Password to access the terminal</p>
            </div>

            <form action="/shop-admin" method="GET" class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1.5">Store Code</label>
                    <input 
                        type="text" 
                        name="store"
                        value="{{ $shopCode ?? '' }}" 
                        placeholder="e.g. SHP-A4IFYK"
                        required
                        class="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs font-bold font-mono tracking-wider focus:outline-none focus:border-cyan-500 transition"
                    />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                    <input 
                        type="password" 
                        name="password"
                        placeholder="Enter password" 
                        required
                        class="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-cyan-500 transition"
                    />
                </div>

                <div class="pt-2 space-y-2.5">
                    <button 
                        type="submit" 
                        class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00a8cc] to-[#008ba3] hover:from-[#0096b7] hover:to-[#007b91] text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span>Login to Retail Billing Software</span>
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </button>

                    <a 
                        href="/pos-terminal" 
                        class="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-emerald-400 font-bold text-xs transition flex items-center justify-center gap-2"
                    >
                        <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                        </svg>
                        <span>Direct Launch High-Speed POS Counter</span>
                    </a>
                </div>
            </form>

            <div class="pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
                <span>Want to activate Online Ecommerce Storefront?</span><br/>
                <a href="/master" class="text-cyan-400 hover:underline font-bold mt-1 inline-block">
                    Upgrade to Ecommerce Plan in Master Admin &rarr;
                </a>
            </div>
        </div>
    </div>
</body>
</html>
