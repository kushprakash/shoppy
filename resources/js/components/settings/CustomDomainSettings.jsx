import React, { useState, useEffect } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Server,
  Link2,
  Lock,
  ArrowRight,
  Info,
  HelpCircle,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Radio
} from 'lucide-react';

export default function CustomDomainSettings({ storeCode, storeName, showToast }) {
  const [loading, setLoading] = useState(true);
  const [domainData, setDomainData] = useState(null);
  const [defaultStoreUrl, setDefaultStoreUrl] = useState(`https://shoppy.live/shop/${storeCode}`);
  const [serverIp, setServerIp] = useState('82.29.167.224');

  // Form State
  const [inputDomain, setInputDomain] = useState('');
  const [wwwEnabled, setWwwEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Actions State
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Copy Feedback
  const [copiedKey, setCopiedKey] = useState(null);

  // Fetch Domain Details from API
  const fetchDomainData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/store/domains', {
        headers: {
          'Accept': 'application/json',
          'X-Shop-Code': storeCode,
        },
      });
      const data = await res.json();
      if (data.success) {
        setDomainData(data.domain || null);
        if (data.default_store_url) setDefaultStoreUrl(data.default_store_url);
        if (data.server_ip) setServerIp(data.server_ip);
      }
    } catch (e) {
      console.error('Failed to load custom domain data', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomainData();
  }, [storeCode]);

  // Handle Copy to Clipboard
  const handleCopy = (text, key) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      if (showToast) showToast('Copied to clipboard!');
    } catch (e) {}
  };

  // Connect Domain Submit
  const handleConnectDomain = async (e) => {
    e.preventDefault();
    setFormError('');

    let clean = inputDomain.trim().toLowerCase();
    clean = clean.replace(/^https?:\/\//i, '').replace(/[/\\?#].*$/, '').replace(/:\d+$/, '');

    if (!clean) {
      setFormError('Please enter a valid domain name (e.g. mystore.in).');
      return;
    }

    if (!clean.includes('.') || clean.endsWith('.')) {
      setFormError('Invalid domain format. Example: mystore.in or shop.brand.com');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/store/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Shop-Code': storeCode,
        },
        body: JSON.stringify({
          domain: clean,
          www_enabled: wwwEnabled,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(data.message || 'Domain registered! Please configure your DNS.');
        setInputDomain('');
        await fetchDomainData();
      } else {
        setFormError(data.message || 'Failed to register domain.');
      }
    } catch (err) {
      setFormError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify DNS Action
  const handleVerifyDns = async () => {
    if (!domainData?.id) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/store/domains/${domainData.id}/verify`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Shop-Code': storeCode,
        },
      });

      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(data.message || 'DNS verified & domain activated successfully!');
        await fetchDomainData();
      } else {
        if (showToast) showToast(data.message || 'DNS verification failed. Please check records.', 'error');
        await fetchDomainData(true);
      }
    } catch (e) {
      if (showToast) showToast('Failed to contact verification server.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  // Retry Provisioning Action
  const handleRetryProvisioning = async () => {
    if (!domainData?.id) return;
    setIsRetrying(true);
    try {
      const res = await fetch(`/api/store/domains/${domainData.id}/retry`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Shop-Code': storeCode,
        },
      });

      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(data.message || 'Provisioning completed successfully!');
      } else {
        if (showToast) showToast(data.message || 'Retry failed. Check DNS propagation.', 'error');
      }
      await fetchDomainData(true);
    } catch (e) {
      if (showToast) showToast('Network request failed.', 'error');
    } finally {
      setIsRetrying(false);
    }
  };

  // Remove Domain Action
  const handleRemoveDomain = async () => {
    if (!domainData?.id) return;
    setIsRemoving(true);
    try {
      const res = await fetch(`/api/store/domains/${domainData.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'X-Shop-Code': storeCode,
        },
      });

      const data = await res.json();
      if (data.success) {
        if (showToast) showToast('Custom domain removed cleanly.');
        setShowRemoveConfirm(false);
        setDomainData(null);
        await fetchDomainData();
      } else {
        if (showToast) showToast(data.message || 'Failed to remove domain.', 'error');
      }
    } catch (e) {
      if (showToast) showToast('Network request failed.', 'error');
    } finally {
      setIsRemoving(false);
    }
  };

  // Status Badge Component
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Active &amp; HTTPS Secured</span>
          </span>
        );
      case 'provisioning':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-800 shadow-xs">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Server Provisioning...</span>
          </span>
        );
      case 'ssl_pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-300 dark:border-sky-800 shadow-xs">
            <Lock className="w-3.5 h-3.5" />
            <span>Issuing Let's Encrypt SSL...</span>
          </span>
        );
      case 'dns_verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>DNS Verified</span>
          </span>
        );
      case 'dns_verification_failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>DNS Records Missing / Incorrect</span>
          </span>
        );
      case 'pending_verification':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending DNS Setup</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#00a2c7] animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Loading custom domain details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Hero Card */}
      <div className="bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 skew-x-12 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Automated Custom Domain &amp; Free Let's Encrypt SSL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Connect Your Custom Domain
            </h2>
            <p className="text-sm text-sky-100 leading-relaxed">
              Brand your Shoppy storefront with your own domain (e.g. <strong className="text-white">mystore.in</strong>).
              Our automated system verifies your DNS, dynamically configures high-speed Nginx reverse proxy, and installs auto-renewing SSL certificates.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0 space-y-1.5 min-w-[260px]">
            <span className="text-[11px] font-bold text-sky-200 uppercase tracking-wider block">Default Store URL</span>
            <a
              href={defaultStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono font-bold text-white hover:underline flex items-center gap-1.5"
            >
              <span className="truncate max-w-[220px]">{defaultStoreUrl}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
            <div className="pt-1 text-[11px] text-sky-200 flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-sky-300" />
              <span>Server Target IP: <strong>{serverIp}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Connected Domain Status Card OR Add Domain Form */}
      {domainData ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Connected Domain</span>
              <div className="flex items-center gap-3 mt-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-6 h-6 text-sky-500" />
                  <span>{domainData.domain}</span>
                </h3>
                {renderStatusBadge(domainData.status)}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {domainData.status === 'active' && (
                <a
                  href={`https://${domainData.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit Storefront</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleVerifyDns}
                disabled={isVerifying}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? 'Verifying DNS...' : 'Verify DNS Now'}</span>
              </button>

              {domainData.status !== 'active' && (
                <button
                  type="button"
                  onClick={handleRetryProvisioning}
                  disabled={isRetrying}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Zap className={`w-3.5 h-3.5 text-amber-500 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>{isRetrying ? 'Retrying...' : 'Retry Provisioning'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowRemoveConfirm(true)}
                className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block">DNS Verification</span>
              <span className={`text-xs font-black capitalize flex items-center gap-1.5 ${domainData.dns_status === 'verified' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {domainData.dns_status === 'verified' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {domainData.dns_status}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block">SSL Certificate</span>
              <span className={`text-xs font-black capitalize flex items-center gap-1.5 ${domainData.ssl_status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {domainData.ssl_status === 'active' ? "Let's Encrypt Active" : domainData.ssl_status}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block">SSL Expiry</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {domainData.ssl_expiry_at ? new Date(domainData.ssl_expiry_at).toLocaleDateString() : 'Auto-renewing'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block">Connected Date</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {new Date(domainData.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Error Message if any */}
          {domainData.error_message && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-rose-900 dark:text-rose-200">DNS or SSL Diagnostic Notice:</span>
                <p className="text-rose-700 dark:text-rose-300 font-mono leading-relaxed">{domainData.error_message}</p>
              </div>
            </div>
          )}

          {/* 3. DNS Configuration Instructions Table */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-sky-500" />
                  <span>Required DNS Records for {domainData.domain}</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Log in to your domain registrar (GoDaddy, Cloudflare, Hostinger, Namecheap) and add the following 3 records:
                </p>
              </div>

              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
                TTL: 300 or Auto
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Name / Host</th>
                    <th className="px-4 py-3">Value / Target</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                  {/* Record 1: A Record */}
                  <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 font-black text-[10px]">
                        A
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold">@</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-sky-600 dark:text-sky-400">{serverIp}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-[11px]">Points apex domain to Shoppy ERP server</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopy(serverIp, 'a_record')}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'a_record' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'a_record' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </td>
                  </tr>

                  {/* Record 2: CNAME Record */}
                  <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-black text-[10px]">
                        CNAME
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold">www</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">{domainData.domain}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-[11px]">Routes www subdomain to apex domain</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopy(domainData.domain, 'cname_record')}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'cname_record' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'cname_record' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </td>
                  </tr>

                  {/* Record 3: TXT Ownership Verification Record */}
                  <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 bg-amber-50/20 dark:bg-amber-950/10">
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-black text-[10px]">
                        TXT
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold">_shoppy-verification</td>
                    <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-amber-700 dark:text-amber-300 max-w-[240px] truncate" title={domainData.verification_token}>
                      {domainData.verification_token}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-[11px]">Proves cryptographic domain ownership</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopy(domainData.verification_token, 'txt_record')}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'txt_record' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'txt_record' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Live Activity & Provisioning Logs */}
          {domainData.logs && domainData.logs.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Recent Domain Audit &amp; Provisioning Events</span>
              </h4>
              <div className="space-y-2">
                {domainData.logs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        log.status === 'success' ? 'bg-emerald-500' :
                        log.status === 'failed' ? 'bg-rose-500' :
                        log.status === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
                      }`} />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{log.message}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State & Add Domain Form */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8">
          <div className="max-w-xl mx-auto text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto shadow-sm">
              <Globe className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Connect Your Custom Domain
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Replace the default <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{defaultStoreUrl}</span> URL with your brand's unique domain name.
            </p>
          </div>

          <form onSubmit={handleConnectDomain} className="max-w-xl mx-auto space-y-4">
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Your Domain Name *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-400 font-bold text-xs select-none">
                  https://
                </div>
                <input
                  type="text"
                  required
                  placeholder="mystore.in or shop.yourbrand.com"
                  value={inputDomain}
                  onChange={(e) => setInputDomain(e.target.value)}
                  className="w-full pl-20 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-sky-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 block">
                Do not include http:// or slashes. Enter root domain or subdomain.
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="www_enabled"
                checked={wwwEnabled}
                onChange={(e) => setWwwEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <label htmlFor="www_enabled" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Also support <span className="font-mono">www.{inputDomain || 'mystore.in'}</span> with automatic redirect
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white text-xs font-black shadow-md shadow-sky-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Registering Domain...</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  <span>Connect Domain &amp; Get DNS Instructions</span>
                </>
              )}
            </button>
          </form>

          {/* Helpful 3-Step Setup Guide */}
          <div className="max-w-2xl mx-auto pt-6 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 text-center mb-4">
              How Custom Domain Setup Works (3 Easy Steps)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-black text-xs inline-flex items-center justify-center">1</span>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">Submit Domain</h5>
                <p className="text-[11px] text-slate-500">Enter your domain name above to generate unique DNS ownership verification records.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs inline-flex items-center justify-center">2</span>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">Add DNS Records</h5>
                <p className="text-[11px] text-slate-500">Add the provided A and TXT records in your registrar DNS management portal.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs inline-flex items-center justify-center">3</span>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">Auto SSL &amp; Live</h5>
                <p className="text-[11px] text-slate-500">Click Verify DNS. Nginx reverse proxy and Let's Encrypt SSL are provisioned automatically!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Remove Custom Domain?</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to disconnect <strong className="text-slate-900 dark:text-white">{domainData?.domain}</strong>?
              This will remove the Nginx virtual host and SSL configuration. Your store will still be accessible via <span className="font-mono">{defaultStoreUrl}</span>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveDomain}
                disabled={isRemoving}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isRemoving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isRemoving ? 'Removing...' : 'Confirm Disconnect'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
