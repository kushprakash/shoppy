import React, { useEffect, useState } from 'react';
import { X, Printer, ShieldCheck, Phone, Mail, MapPin, Building2, Award } from 'lucide-react';

export default function AgentIdCardModal({ isOpen, onClose, agent, branding: brandingProp = null }) {
  const [branding, setBranding] = useState(brandingProp);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (brandingProp) {
      setBranding(brandingProp);
      setLogoError(false);
    }
  }, [brandingProp]);

  useEffect(() => {
    if (!isOpen || brandingProp) return;
    let cancelled = false;

    const loadBranding = async () => {
      try {
        const res = await fetch('/api/master/settings', { cache: 'no-store' });
        const json = await res.json();
        if (!cancelled && res.ok && json?.data) {
          setBranding(json.data);
          setLogoError(false);
          return;
        }
      } catch (e) {
        // Fallback to public landing-data endpoint
      }

      try {
        const pubRes = await fetch('/api/public/landing-data', { cache: 'no-store' });
        const pubJson = await pubRes.json();
        if (!cancelled && pubRes.ok && pubJson?.settings) {
          setBranding(pubJson.settings);
          setLogoError(false);
        }
      } catch (e) {
        // Keep safe defaults
      }
    };

    loadBranding();
    return () => {
      cancelled = true;
    };
  }, [isOpen, brandingProp]);

  if (!isOpen || !agent) return null;

  const agentCode = agent.agent_code || agent.referral_code || 'AGT-DEMO-101';
  const idCardNo = agent.id_card_number || `ICARD-${agentCode}`;
  const referralLink = `${window.location.origin}/?ref=${agentCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(referralLink)}`;

  const dynamicLogoUrl = (!logoError && (branding?.site_logo || branding?.footer_logo))
    ? String(branding.site_logo || branding.footer_logo).trim()
    : '';
  const companyName = branding?.company_name || 'Enexa IT Solutions Private Limited';
  const companyCin = branding?.company_cin || 'U72900RJ2021PTC075482';
  const officialDomain = branding?.official_domain || 'shoppy.live';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in print:static print:bg-transparent print:p-0">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative my-8 print:border-0 print:shadow-none print:my-0 print:max-w-none print:bg-transparent">

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00a2c7] to-[#10b981] flex items-center justify-center text-white shadow-sm">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Official Channel Partner I-Card
              </h3>
              <p className="text-[11px] text-slate-400">
                Shoppy ERP • {companyName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print I-Card</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE ID CARD CONTAINER */}
        <div className="p-6 sm:p-8 flex justify-center bg-slate-100/60 dark:bg-slate-950/60 print:p-0 print:bg-transparent">
          <div
            id="printable-agent-id-card"
            className="w-full max-w-[350px] bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden relative text-slate-900 select-none print:shadow-none print:border print:border-slate-300 print:m-0"
          >
            {/* Top Brand Header with Dynamic Super Admin Logo */}
            <div className="bg-gradient-to-r from-[#0c192c] via-[#0f243d] to-[#008ba3] text-white px-5 pt-5 pb-4 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/10 rounded-full blur-xl pointer-events-none" />

              {dynamicLogoUrl ? (
                <div className="mb-2.5 flex justify-center relative z-10">
                  <div className="bg-white/95 rounded-xl px-3.5 py-2 shadow-md border border-white/40 inline-flex items-center justify-center max-w-[220px]">
                    <img
                      src={dynamicLogoUrl}
                      alt={branding?.brand_title || 'Shoppy ERP'}
                      onError={() => setLogoError(true)}
                      className="h-9 sm:h-10 w-auto max-w-[185px] object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-1.5 relative z-10">
                  <div className="w-7 h-7 rounded-lg bg-[#00a2c7] flex items-center justify-center text-white font-black text-xs shadow-md">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="font-black text-base tracking-tight">
                    Shoppy<span className="text-[#00a2c7]">ERP</span>
                  </span>
                </div>
              )}

              <span className="text-[9px] uppercase tracking-widest text-cyan-200 font-extrabold block relative z-10">
                {companyName}
              </span>
            </div>

            {/* Clean Accent Divider */}
            <div className="h-1 w-full bg-gradient-to-r from-[#00a2c7] to-[#10b981]" />

            {/* Certified Partner Pill & Agent Photo (No overlap) */}
            <div className="text-center pt-4 pb-1 px-4 relative z-10">
              <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[9px] font-black text-emerald-700 tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>CERTIFIED CHANNEL PARTNER</span>
              </div>

              <div className="w-24 h-24 mx-auto rounded-2xl bg-white p-1 border-2 border-[#00a2c7] shadow-lg overflow-hidden">
                <img
                  src={agent.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt={agent.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <h4 className="font-black text-base text-slate-900 mt-2.5">
                {agent.name}
              </h4>
              <span className="text-[10px] font-bold text-slate-400 tracking-wide block uppercase">
                Enterprise Business Consultant
              </span>

              {/* HIGHLIGHTED AGENT CODE BADGE */}
              <div className="mt-3 p-2.5 rounded-2xl bg-gradient-to-r from-cyan-50 via-slate-50 to-emerald-50 border-2 border-dashed border-[#00a2c7] text-center shadow-xs">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                  Official Agent Referral Code
                </span>
                <span className="text-lg font-mono font-black text-[#008ba3] tracking-widest block mt-0.5">
                  {agentCode}
                </span>
              </div>
            </div>

            {/* Agent Details & Contact Info */}
            <div className="p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 text-[11px]">
                <span className="text-slate-400 font-medium">Card Ref No:</span>
                <span className="font-mono font-bold text-slate-700">{idCardNo}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 text-[11px]">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#00a2c7]" /> Contact:
                </span>
                <span className="font-bold text-slate-800">{agent.phone}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 text-[11px]">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Mail className="w-3 h-3 text-emerald-500" /> Email:
                </span>
                <span className="font-semibold text-slate-700 truncate max-w-[170px]">{agent.email}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 text-[11px]">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-500" /> Jurisdiction:
                </span>
                <span className="font-bold text-slate-800">{agent.city || 'Jaipur'}, {agent.state ? agent.state.split('-')[0].trim() : 'RJ'}</span>
              </div>
            </div>

            {/* Dynamic QR Code & Corporate Verification */}
            <div className="p-3 mx-4 mb-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Scan to Verify Partner
                </span>
                <p className="text-[8px] text-slate-400 leading-tight">
                  Instant partner authentication & merchant signup referral portal.
                </p>
                <span className="text-[8px] font-mono text-[#008ba3] block pt-0.5">
                  {officialDomain}/?ref={agentCode}
                </span>
              </div>
              <div className="w-14 h-14 bg-white p-1 rounded-xl border border-slate-300 shrink-0 shadow-xs">
                <img src={qrUrl} alt="Agent QR" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Official Bottom Bar */}
            <div className="bg-slate-900 text-white px-4 py-2 text-center text-[8px] font-medium tracking-wide uppercase">
              <span>ISSUED BY {companyName} • CIN: {companyCin}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Notes */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center print:hidden">
          <p className="text-xs text-slate-500">
            This card is legally binding proof of authorization for field sales, merchant onboarding, and POS software distribution.
          </p>
        </div>
      </div>
    </div>
  );
}
