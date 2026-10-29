import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { 
  Building2, Users, CreditCard, PlusCircle, CheckCircle2, 
  ShieldCheck, RefreshCw, ArrowUpRight, DollarSign, Database, 
  Store, Award, Clock, ArrowRight, ExternalLink
} from 'lucide-react';

export default function CentralAdmin() {
  const [stats, setStats] = useState({});
  const [shops, setShops] = useState([]);
  const [agents, setAgents] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [activeTab, setActiveTab] = useState('shops');
  const [provisionModal, setProvisionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [provisioning, setProvisioning] = useState(false);
  const [newShopForm, setNewShopForm] = useState({
    name: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    agent_referral_code: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, shopsRes, agentsRes, commRes] = await Promise.all([
        axios.get('/api/central/stats'),
        axios.get('/api/central/shops'),
        axios.get('/api/central/agents'),
        axios.get('/api/central/commissions'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (shopsRes.data.success) setShops(shopsRes.data.data.data || []);
      if (agentsRes.data.success) setAgents(agentsRes.data.agents || []);
      if (commRes.data.success) setCommissions(commRes.data.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProvisionShop = async (e) => {
    e.preventDefault();
    try {
      setProvisioning(true);
      const res = await axios.post('/api/central/shops/provision', newShopForm);
      if (res.data.success) {
        alert('Shop tenant provisioned with dedicated database!');
        setProvisionModal(false);
        setNewShopForm({ name: '', owner_name: '', owner_email: '', owner_phone: '', agent_referral_code: '' });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Provisioning failed');
    } finally {
      setProvisioning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-violet-600/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold font-heading text-white tracking-tight">Shoppy Central SaaS Platform</h1>
            <p className="text-xs text-slate-400">Master Multi-Tenant Administration & Partner Network</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setProvisionModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Provision New Shop</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl w-full mx-auto p-6 space-y-6 flex-1">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Total Shops</span>
              <Store className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black font-heading text-white mt-2">{stats.total_shops || 0}</div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <span>{stats.active_shops || 0} Active Databases</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Partner Agents</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black font-heading text-white mt-2">{stats.total_agents || 0}</div>
            <div className="text-xs text-amber-400 mt-1">
              <span>{stats.approved_agents || 0} Approved Partners</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Pending Commission</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black font-heading text-white mt-2">₹{stats.pending_commissions || '0.00'}</div>
            <div className="text-xs text-slate-400 mt-1">Payable after 5% TDS</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Settled Payouts</span>
              <ShieldCheck className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-3xl font-black font-heading text-white mt-2">₹{stats.total_payouts_settled || '0.00'}</div>
            <div className="text-xs text-slate-400 mt-1">Direct Bank / UPI Transferred</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button 
            onClick={() => setActiveTab('shops')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'shops' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Active Shops & Databases ({shops.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('agents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'agents' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Partner Agents & Referrals ({agents.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('commissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'commissions' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Commission Ledger ({commissions.length})</span>
          </button>
        </div>

        {/* TAB 1: SHOPS TABLE */}
        {activeTab === 'shops' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Provisioned Shop Tenants</h3>
              <span className="text-xs text-slate-500">Each shop uses dedicated MySQL database</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-mono">
                  <tr>
                    <th className="px-5 py-3">Shop Info</th>
                    <th className="px-5 py-3">Shop Code</th>
                    <th className="px-5 py-3">Tenant Database</th>
                    <th className="px-5 py-3">Owner Contact</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {shops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white">{shop.name}</div>
                        <span className="text-xs text-indigo-400 font-mono">{shop.primary_domain?.domain || `${shop.slug}.shoppy.local`}</span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-bold text-slate-300">{shop.shop_code}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400">
                          {shop.database_name}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <div className="text-white font-medium">{shop.owner_name}</div>
                        <div className="text-slate-400">{shop.owner_phone} • {shop.owner_email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {shop.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a 
                          href={`/shop-admin?shop_code=${shop.shop_code}`} 
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition inline-flex items-center gap-1 border border-slate-700"
                        >
                          <span>Manage ERP</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: AGENTS */}
        {activeTab === 'agents' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-5">
            <h3 className="font-bold text-white text-base mb-4">Partner Referral Agents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agents.map((ag) => (
                <div key={ag.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {ag.referral_code}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                        {ag.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base">{ag.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{ag.phone} • {ag.email}</p>

                    <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                      <div>Commission Rate: <strong className="text-white">{ag.commission_rate_percent}% on Renewals</strong></div>
                      <div>Signup Bonus: <strong className="text-emerald-400">₹{ag.fixed_signup_bonus} per Shop</strong></div>
                      <div>Shops Referred: <strong className="text-indigo-400 font-mono">{ag.referrals_count || 1}</strong></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COMMISSIONS */}
        {activeTab === 'commissions' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 font-bold text-white text-base">
              Agent Commission Audit Ledger
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-mono">
                  <tr>
                    <th className="px-5 py-3">Agent</th>
                    <th className="px-5 py-3">Shop</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Gross Commission</th>
                    <th className="px-5 py-3">TDS (5%)</th>
                    <th className="px-5 py-3">Net Payable</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {commissions.map((c) => (
                    <tr key={c.id}>
                      <td className="px-5 py-3 font-semibold text-white">{c.agent?.name}</td>
                      <td className="px-5 py-3 text-slate-400">{c.shop?.name}</td>
                      <td className="px-5 py-3 uppercase text-xs font-bold text-indigo-400">{c.commission_type}</td>
                      <td className="px-5 py-3 font-mono">₹{c.commission_amount}</td>
                      <td className="px-5 py-3 font-mono text-rose-400">-₹{c.tds_amount}</td>
                      <td className="px-5 py-3 font-mono text-emerald-400 font-bold">₹{c.net_payable}</td>
                      <td className="px-5 py-3"><span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400">{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Provision Shop Modal */}
      {provisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-white mb-1">Provision New Tenant Shop</h3>
            <p className="text-xs text-slate-400 mb-4">
              Creates isolated MySQL database, seeds initial branch, warehouse, 5 payment gateways, and assigns agent commission.
            </p>

            <form onSubmit={handleProvisionShop} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Shop Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Laxmi Supermarket" 
                  value={newShopForm.name} 
                  onChange={(e) => setNewShopForm({...newShopForm, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Owner Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Owner Full Name" 
                    value={newShopForm.owner_name} 
                    onChange={(e) => setNewShopForm({...newShopForm, owner_name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Owner Phone</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Mobile Number" 
                    value={newShopForm.owner_phone} 
                    onChange={(e) => setNewShopForm({...newShopForm, owner_phone: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Owner Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="owner@business.com" 
                  value={newShopForm.owner_email} 
                  onChange={(e) => setNewShopForm({...newShopForm, owner_email: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Partner Agent Referral Code (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. AGT-DEMO-101" 
                  value={newShopForm.agent_referral_code} 
                  onChange={(e) => setNewShopForm({...newShopForm, agent_referral_code: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setProvisionModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button 
                  type="submit" 
                  disabled={provisioning}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  {provisioning ? 'Creating MySQL Database & Provisioning...' : 'Provision Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<CentralAdmin />);
}
