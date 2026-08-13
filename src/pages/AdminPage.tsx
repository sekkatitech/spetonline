import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Database, Settings, BarChart3, Users, Sparkles, AlertCircle, CheckCircle2,
  Image as ImageIcon, Plus, Pencil, Trash2, ArrowUp, ArrowDown, X, Globe, TrendingUp,
  MapPin, Laptop, Smartphone, Download, ArrowRight, Compass, RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DealBanner } from '../lib/api';
import { useSEO } from '../lib/useSEO';
import { VisitorMap } from '../components/VisitorMap';
import { getVisitorAnalytics, recordVisit, TimeHorizon } from '../lib/visitorTracker';

type BannerForm = {
  id: string | null;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  badge_label: string;
  size: 'large' | 'standard';
  sort_order: number;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
};

const EMPTY_FORM: BannerForm = {
  id: null,
  title: '',
  subtitle: '',
  image_url: '',
  link_url: '/shop',
  badge_label: '',
  size: 'standard',
  sort_order: 0,
  is_active: true,
  starts_at: '',
  ends_at: '',
};

export function AdminPage() {
  useSEO({ title: 'Store Admin', description: 'SPET Online store administration.', noindex: true });

  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('visitors');
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Admin-only gate ──────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!profile || !['admin', 'super_admin'].includes((profile as any).role)) {
        navigate('/auth');
        return;
      }
      setChecked(true);
    })();
  }, [navigate]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportStatus('uploading');
      // Simulate file processing
      setTimeout(() => setImportStatus('processing'), 1500);
      setTimeout(() => setImportStatus('success'), 3500);
    }
  };

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#0a141d] flex items-center justify-center text-lago-300">
        Checking access…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a141d] pt-32 pb-24 container mx-auto px-4 md:px-6 flex-grow flex">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8">

        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0">
           <div className="mb-8">
              <h2 className="text-xl font-display font-bold text-white mb-1">Store Admin</h2>
              <span className="text-sm text-accent-orange font-bold uppercase tracking-wider">spet-store-core</span>
           </div>

           <nav className="flex flex-col gap-2">
             <button
               onClick={() => setActiveTab('visitors')}
               className={`flex items-center gap-3 p-3 rounded-xl font-semibold transition-colors ${activeTab === 'visitors' ? 'bg-lago-800 text-white border border-lago-600' : 'text-lago-200 hover:bg-lago-900 hover:text-white'}`}
             >
               <Globe className={`w-5 h-5 ${activeTab === 'visitors' ? 'text-lago-400' : 'text-lago-500'}`} /> Site Visitors
             </button>
             <button
               onClick={() => setActiveTab('banners')}
               className={`flex items-center gap-3 p-3 rounded-xl font-semibold transition-colors ${activeTab === 'banners' ? 'bg-lago-800 text-white border border-lago-600' : 'text-lago-200 hover:bg-lago-900 hover:text-white'}`}
             >
               <ImageIcon className={`w-5 h-5 ${activeTab === 'banners' ? 'text-lago-400' : 'text-lago-500'}`} /> Deals &amp; Banners
             </button>
             <button
               onClick={() => setActiveTab('import')}
               className={`flex items-center gap-3 p-3 rounded-xl font-semibold transition-colors ${activeTab === 'import' ? 'bg-lago-800 text-white border border-lago-600' : 'text-lago-200 hover:bg-lago-900 hover:text-white'}`}
             >
               <Database className={`w-5 h-5 ${activeTab === 'import' ? 'text-lago-400' : 'text-lago-500'}`} /> Product CSV Import
             </button>
             <button
               onClick={() => setActiveTab('ai')}
               className={`flex items-center gap-3 p-3 rounded-xl font-semibold transition-colors ${activeTab === 'ai' ? 'bg-lago-800 text-white border border-lago-600' : 'text-lago-200 hover:bg-lago-900 hover:text-white'}`}
             >
               <Sparkles className={`w-5 h-5 ${activeTab === 'ai' ? 'text-lago-400' : 'text-lago-500'}`} /> AI Features
             </button>
             <button
               onClick={() => setActiveTab('analytics')}
               className={`flex items-center gap-3 p-3 rounded-xl font-semibold transition-colors ${activeTab === 'analytics' ? 'bg-lago-800 text-white border border-lago-600' : 'text-lago-200 hover:bg-lago-900 hover:text-white'}`}
             >
               <BarChart3 className={`w-5 h-5 ${activeTab === 'analytics' ? 'text-lago-400' : 'text-lago-500'}`} /> User Analytics
             </button>
             <button
               onClick={() => setActiveTab('customers')}
               className={`flex items-center gap-3 p-3 rounded-xl font-semibold transition-colors ${activeTab === 'customers' ? 'bg-lago-800 text-white border border-lago-600' : 'text-lago-200 hover:bg-lago-900 hover:text-white'}`}
             >
               <Users className={`w-5 h-5 ${activeTab === 'customers' ? 'text-lago-400' : 'text-lago-500'}`} /> Customers
             </button>
           </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow min-w-0">
          {activeTab === 'visitors' && <VisitorsTab onNavigateToBanners={() => setActiveTab('banners')} />}
          {activeTab === 'banners' && <BannersTab />}

          {activeTab === 'import' && (
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-4">Product CSV Import System</h1>
              <p className="text-lago-200 mb-8 max-w-2xl">
                Upload your WooCommerce-formatted CSV to update the product catalog. This system will auto-create brands, categories, and tags.
              </p>

              <div className="bg-lago-900 border border-lago-800 rounded-2xl p-8 mb-8">
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImport}
                />

                {importStatus === 'idle' && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-lago-700 bg-[#0a141d] hover:border-lago-500 hover:bg-lago-800/50 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all text-center group"
                  >
                    <div className="w-16 h-16 rounded-full bg-lago-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-lago-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Click or drag CSV file to upload</h3>
                    <p className="text-lago-300">Supported columns: product_name, price, sku, brand, category, image_url</p>
                  </div>
                )}

                {importStatus === 'uploading' && (
                  <div className="border border-lago-800 bg-[#0a141d] rounded-xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border-4 border-lago-800 border-t-lago-500 rounded-full animate-spin mb-6"></div>
                    <h3 className="text-xl font-bold text-white mb-2">Uploading CSV...</h3>
                  </div>
                )}

                {importStatus === 'processing' && (
                  <div className="border border-lago-800 bg-[#0a141d] rounded-xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="flex gap-2 mb-6">
                       <span className="w-3 h-3 rounded-full bg-accent-cyan animate-bounce" style={{ animationDelay: '0ms' }}></span>
                       <span className="w-3 h-3 rounded-full bg-accent-cyan animate-bounce" style={{ animationDelay: '150ms' }}></span>
                       <span className="w-3 h-3 rounded-full bg-accent-cyan animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Mapping Columns & Processing Products...</h3>
                    <p className="text-lago-300 text-sm">Generating categories and brands taxomy.</p>
                  </div>
                )}

                {importStatus === 'success' && (
                  <div className="border border-green-900/50 bg-green-900/20 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6 text-green-400">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Import Successful!</h3>
                    <p className="text-green-300/70 mb-6">Imported 124 products, created 4 new brands, and updated 12 categories.</p>
                    <button
                      onClick={() => setImportStatus('idle')}
                      className="px-6 py-2 rounded-full bg-lago-800 text-white hover:bg-lago-700 transition-colors font-medium border border-lago-600"
                    >
                      Import Another File
                    </button>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-4">Required CSV Structure</h2>
              <div className="overflow-x-auto bg-[#0a141d] border border-lago-800 rounded-xl">
                <table className="w-full text-left text-sm text-lago-200">
                  <thead className="bg-lago-900 border-b border-lago-800 text-lago-100 uppercase text-xs font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">CSV Column</th>
                      <th className="px-6 py-4">Database Field</th>
                      <th className="px-6 py-4">Required</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lago-800">
                    <tr><td className="px-6 py-4 font-mono text-lago-400">product_name</td><td className="px-6 py-4">post_title</td><td className="px-6 py-4 text-white">Yes</td></tr>
                    <tr><td className="px-6 py-4 font-mono text-lago-400">description</td><td className="px-6 py-4">post_content</td><td className="px-6 py-4">No</td></tr>
                    <tr><td className="px-6 py-4 font-mono text-lago-400">price</td><td className="px-6 py-4">_price</td><td className="px-6 py-4 text-white">Yes</td></tr>
                    <tr><td className="px-6 py-4 font-mono text-lago-400">sku</td><td className="px-6 py-4">_sku</td><td className="px-6 py-4 text-white">Yes</td></tr>
                    <tr><td className="px-6 py-4 font-mono text-lago-400">brand</td><td className="px-6 py-4">taxonomy</td><td className="px-6 py-4">No</td></tr>
                    <tr><td className="px-6 py-4 font-mono text-lago-400">category</td><td className="px-6 py-4">product_cat</td><td className="px-6 py-4 text-white">Yes</td></tr>
                    <tr><td className="px-6 py-4 font-mono text-lago-400">image_url</td><td className="px-6 py-4">featured image</td><td className="px-6 py-4">No</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-4">AI Features Settings</h1>
              <p className="text-lago-200 mb-8 max-w-2xl">
                Manage the AI integrations for your store, powered by Gemini.
              </p>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-lago-900 border border-lago-800 rounded-2xl p-6 flex justify-between items-start">
                   <div>
                     <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                       <Sparkles className="w-5 h-5 text-accent-cyan" /> Shopping Assistant Chatbot
                     </h3>
                     <p className="text-lago-200 text-sm max-w-md">Enable the AI-powered chatbot to help customers find products, compare specs, and check order statuses.</p>
                   </div>
                   <div className="w-12 h-6 bg-lago-500 rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(5,125,205,0.5)]">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                   </div>
                </div>

                <div className="bg-lago-900 border border-lago-800 rounded-2xl p-6 flex justify-between items-start">
                   <div>
                     <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                       <Sparkles className="w-5 h-5 text-lago-500" /> Automated Product Descriptions
                     </h3>
                     <p className="text-lago-200 text-sm max-w-md">Automatically generate high-converting SEO descriptions during CSV product imports based on basic specs.</p>
                   </div>
                   <div className="w-12 h-6 bg-lago-800 border border-lago-600 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-lago-400 rounded-full"></div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'analytics' || activeTab === 'customers') && (
            <div className="flex flex-col items-center justify-center p-20 text-center border border-dashed border-lago-800 rounded-2xl">
               <AlertCircle className="w-12 h-12 text-lago-500 mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Module Not Configured</h3>
               <p className="text-lago-300 max-w-sm">This section requires active user data. Connect your WooCommerce instance to view metrics.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Deals & Banners tab ─────────────────────────────────────────────────────

function BannersTab() {
  const [banners, setBanners] = useState<DealBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<BannerForm | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadBanners() {
    setLoading(true);
    const { data } = await supabase
      .from('deal_banners')
      .select('id, title, subtitle, image_url, link_url, badge_label, size, sort_order, is_active')
      .order('sort_order', { ascending: true });
    setBanners((data as any) ?? []);
    setLoading(false);
  }

  useEffect(() => { loadBanners(); }, []);

  function openCreate() {
    setError('');
    setForm({ ...EMPTY_FORM, sort_order: banners.length });
  }

  function openEdit(b: any) {
    setError('');
    setForm({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle ?? '',
      image_url: b.image_url,
      link_url: b.link_url,
      badge_label: b.badge_label ?? '',
      size: b.size,
      sort_order: b.sort_order,
      is_active: b.is_active,
      starts_at: b.starts_at ?? '',
      ends_at: b.ends_at ?? '',
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    setUploading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('deal-banners').upload(path, file, { contentType: file.type });
      if (uploadErr) throw uploadErr;
      const { data } = supabase.storage.from('deal-banners').getPublicUrl(path);
      setForm((f) => f && { ...f, image_url: data.publicUrl });
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function saveBanner() {
    if (!form) return;
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.image_url) { setError('Please upload an image'); return; }

    setSaving(true);
    setError('');
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      image_url: form.image_url,
      link_url: form.link_url.trim() || '/shop',
      badge_label: form.badge_label.trim() || null,
      size: form.size,
      sort_order: form.sort_order,
      is_active: form.is_active,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    };

    const { error: saveErr } = form.id
      ? await supabase.from('deal_banners').update(payload).eq('id', form.id)
      : await supabase.from('deal_banners').insert(payload);

    setSaving(false);
    if (saveErr) { setError(saveErr.message); return; }
    setForm(null);
    loadBanners();
  }

  async function toggleActive(b: any) {
    await supabase.from('deal_banners').update({ is_active: !b.is_active }).eq('id', b.id);
    loadBanners();
  }

  async function moveOrder(b: any, direction: -1 | 1) {
    const idx = banners.findIndex((x) => x.id === b.id);
    const swapWith = banners[idx + direction];
    if (!swapWith) return;
    await Promise.all([
      supabase.from('deal_banners').update({ sort_order: swapWith.sort_order }).eq('id', b.id),
      supabase.from('deal_banners').update({ sort_order: b.sort_order }).eq('id', swapWith.id),
    ]);
    loadBanners();
  }

  async function deleteBanner(b: any) {
    if (!confirm(`Delete "${b.title}"? This can't be undone.`)) return;
    await supabase.from('deal_banners').delete().eq('id', b.id);
    // Best-effort storage cleanup — image_url is a public URL, derive the storage path from it
    try {
      const path = b.image_url.split('/deal-banners/')[1];
      if (path) await supabase.storage.from('deal-banners').remove([path]);
    } catch { /* non-fatal */ }
    loadBanners();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Deals &amp; Banners</h1>
          <p className="text-lago-200 max-w-2xl">
            Manage the promo banners shown on the <a href="/deals" target="_blank" rel="noreferrer" className="text-lago-400 underline">Deals page</a>. Design graphics in Canva, then upload them here.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-orange hover:bg-orange-600 text-white font-bold transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {form && (
        <div className="bg-lago-900 border border-lago-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white">{form.id ? 'Edit Banner' : 'New Banner'}</h3>
            <button onClick={() => setForm(null)} className="text-lago-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-300 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-lago-400 uppercase tracking-wide mb-1.5">Banner Image *</label>
              <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleFile} />
              {form.image_url ? (
                <div className="relative rounded-xl overflow-hidden border border-lago-700" style={{ height: 160 }}>
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-semibold hover:bg-black/90"
                  >
                    Replace
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => !uploading && fileRef.current?.click()}
                  className="border-2 border-dashed border-lago-700 hover:border-lago-500 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer transition-colors"
                >
                  {uploading ? (
                    <div className="w-8 h-8 border-2 border-lago-700 border-t-lago-400 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-lago-500 mb-2" />
                      <span className="text-sm text-lago-300">Click to upload</span>
                      <span className="text-xs text-lago-500 mt-1">
                        {form.size === 'large' ? '1200×400px recommended' : '400×280px recommended'}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-lago-400 uppercase tracking-wide mb-1.5">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => f && { ...f, title: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a141d] border border-lago-700 text-white text-sm focus:outline-none focus:border-lago-500"
                placeholder="e.g. Winter Tech Sale"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-lago-400 uppercase tracking-wide mb-1.5">Badge Label</label>
              <input
                value={form.badge_label}
                onChange={(e) => setForm((f) => f && { ...f, badge_label: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a141d] border border-lago-700 text-white text-sm focus:outline-none focus:border-lago-500"
                placeholder="e.g. LIMITED TIME"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-lago-400 uppercase tracking-wide mb-1.5">Subtitle</label>
              <input
                value={form.subtitle}
                onChange={(e) => setForm((f) => f && { ...f, subtitle: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a141d] border border-lago-700 text-white text-sm focus:outline-none focus:border-lago-500"
                placeholder="Optional supporting line"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-lago-400 uppercase tracking-wide mb-1.5">Size</label>
              <select
                value={form.size}
                onChange={(e) => setForm((f) => f && { ...f, size: e.target.value as 'large' | 'standard' })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a141d] border border-lago-700 text-white text-sm focus:outline-none focus:border-lago-500"
              >
                <option value="standard">Standard (3-up grid)</option>
                <option value="large">Large (full width)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-lago-400 uppercase tracking-wide mb-1.5">Link URL</label>
              <input
                value={form.link_url}
                onChange={(e) => setForm((f) => f && { ...f, link_url: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a141d] border border-lago-700 text-white text-sm focus:outline-none focus:border-lago-500"
                placeholder="/shop"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-lago-400 uppercase tracking-wide mb-1.5">Starts (optional)</label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm((f) => f && { ...f, starts_at: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a141d] border border-lago-700 text-white text-sm focus:outline-none focus:border-lago-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-lago-400 uppercase tracking-wide mb-1.5">Ends (optional)</label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm((f) => f && { ...f, ends_at: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a141d] border border-lago-700 text-white text-sm focus:outline-none focus:border-lago-500"
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer md:col-span-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => f && { ...f, is_active: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-lago-200 font-medium">Active (visible on the Deals page)</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveBanner}
              disabled={saving || uploading}
              className="px-6 py-2.5 rounded-xl bg-lago-600 hover:bg-lago-500 text-white font-bold transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : form.id ? 'Save Changes' : 'Create Banner'}
            </button>
            <button
              onClick={() => setForm(null)}
              className="px-6 py-2.5 rounded-xl bg-lago-800 hover:bg-lago-700 text-white font-semibold transition-colors border border-lago-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="h-32 rounded-2xl bg-lago-900 animate-pulse" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-lago-800 rounded-2xl">
          <ImageIcon className="w-10 h-10 text-lago-600 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No banners yet</h3>
          <p className="text-lago-300 text-sm max-w-sm">Add your first banner to start showing deals and promotions on the Deals page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b: any, i: number) => (
            <div key={b.id} className="flex gap-4 bg-lago-900 border border-lago-800 rounded-2xl p-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-lago-700 bg-[#0a141d]">
                <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white truncate">{b.title}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-lago-800 text-lago-300 flex-shrink-0">
                    {b.size}
                  </span>
                </div>
                <p className="text-xs text-lago-400 truncate mb-2">{b.link_url}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(b)} className={`text-[11px] font-bold px-2 py-1 rounded-lg mr-1 ${b.is_active ? 'bg-green-900/40 text-green-400' : 'bg-lago-800 text-lago-500'}`}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => moveOrder(b, -1)} disabled={i === 0} className="p-1.5 rounded-lg text-lago-400 hover:bg-lago-800 disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => moveOrder(b, 1)} disabled={i === banners.length - 1} className="p-1.5 rounded-lg text-lago-400 hover:bg-lago-800 disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                  <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-lago-400 hover:bg-lago-800"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteBanner(b)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/30"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Site Visitors tab ────────────────────────────────────────────────────────

function VisitorsTab({ onNavigateToBanners }: { onNavigateToBanners: () => void }) {
  const [timeframe, setTimeframe] = useState<TimeHorizon>('weekly');
  const analytics = getVisitorAnalytics(timeframe);

  // Record current page visit telemetry
  useEffect(() => {
    recordVisit();
  }, []);

  const handleExportCSV = () => {
    const headers = ['City', 'Province', 'Country', 'Visits', 'Percentage', 'Top Interest'];
    const rows = analytics.topLocations.map((loc) => [
      loc.city,
      loc.province,
      loc.country,
      loc.visitsCount,
      `${loc.percentage}%`,
      `"${loc.topInterest}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SPET_Site_Visitors_${timeframe}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const timeframeLabels = {
    daily: 'Daily (24 Hours)',
    weekly: 'Weekly (7 Days)',
    monthly: 'Monthly (30 Days)'
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-display font-bold text-white">Site Visitors</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-900/40 text-green-400 border border-green-700/50">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
              {analytics.liveActiveUsers} Users Online Now
            </span>
          </div>
          <p className="text-lago-200 max-w-2xl text-sm">
            Monitor real-time visitors, view daily/weekly/monthly reports, and utilize location insights for targeted promotional banners.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Time horizon pill switch */}
          <div className="flex items-center bg-[#0a141d] p-1 rounded-xl border border-lago-800">
            {(['daily', 'weekly', 'monthly'] as TimeHorizon[]).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                  timeframe === t
                    ? 'bg-lago-600 text-white shadow-md'
                    : 'text-lago-400 hover:text-white hover:bg-lago-800/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-lago-800 hover:bg-lago-700 text-white font-semibold text-xs border border-lago-700 transition-colors"
          >
            <Download className="w-4 h-4 text-lago-400" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Total Visitors */}
        <div className="bg-lago-900 border border-lago-800 rounded-2xl p-5 relative overflow-hidden group hover:border-lago-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-lago-400 uppercase tracking-wider">Total Visitors</span>
            <div className="p-2 rounded-xl bg-lago-800 text-accent-cyan">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-white mb-2">{analytics.totalVisitors.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 text-xs text-green-400 font-semibold">
            <span className="px-1.5 py-0.5 rounded bg-green-900/40 border border-green-800">+ {analytics.growthRate}%</span>
            <span className="text-lago-400">vs previous {timeframe}</span>
          </div>
        </div>

        {/* Card 2: Unique Sessions */}
        <div className="bg-lago-900 border border-lago-800 rounded-2xl p-5 relative overflow-hidden group hover:border-lago-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-lago-400 uppercase tracking-wider">Unique Visitors</span>
            <div className="p-2 rounded-xl bg-lago-800 text-accent-orange">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-white mb-2">{analytics.uniqueVisitors.toLocaleString()}</p>
          <p className="text-xs text-lago-300">
            Avg Session: <strong className="text-white font-mono">{analytics.avgSessionDuration}</strong>
          </p>
        </div>

        {/* Card 3: Total Page Views */}
        <div className="bg-lago-900 border border-lago-800 rounded-2xl p-5 relative overflow-hidden group hover:border-lago-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-lago-400 uppercase tracking-wider">Page Views</span>
            <div className="p-2 rounded-xl bg-lago-800 text-lago-400">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-white mb-2">{analytics.pageViews.toLocaleString()}</p>
          <p className="text-xs text-lago-300">
            Pages / Visit: <strong className="text-white font-mono">{(analytics.pageViews / analytics.totalVisitors).toFixed(1)}</strong>
          </p>
        </div>

        {/* Card 4: Bounce Rate & Device Split */}
        <div className="bg-lago-900 border border-lago-800 rounded-2xl p-5 relative overflow-hidden group hover:border-lago-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-lago-400 uppercase tracking-wider">Bounce Rate</span>
            <div className="p-2 rounded-xl bg-lago-800 text-purple-400">
              <Laptop className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-white mb-2">{analytics.bounceRate}%</p>
          <div className="flex items-center justify-between text-xs text-lago-400">
            <span className="flex items-center gap-1"><Laptop className="w-3 h-3 text-accent-cyan" /> {analytics.deviceBreakdown.desktop}% Desktop</span>
            <span className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-accent-orange" /> {analytics.deviceBreakdown.mobile}% Mobile</span>
          </div>
        </div>
      </div>

      {/* Mapbox Geographic Map */}
      <VisitorMap locations={analytics.topLocations} timeframe={timeframeLabels[timeframe]} />

      {/* Targeted Marketing Banner Callout */}
      <div className="bg-gradient-to-r from-lago-900 via-[#0e2133] to-lago-900 border border-accent-cyan/40 rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10 relative">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent-orange/20 text-accent-orange border border-accent-orange/30">
                Marketing Intelligence Insight
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1.5">{analytics.marketingInsight.title}</h3>
            <p className="text-sm text-lago-200 mb-2">{analytics.marketingInsight.description}</p>
            <p className="text-xs text-accent-cyan font-semibold flex items-center gap-1.5">
              💡 Recommended Action: {analytics.marketingInsight.recommendedPromo}
            </p>
          </div>

          <button
            onClick={onNavigateToBanners}
            className="px-5 py-3 rounded-xl bg-accent-orange hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-lg flex items-center gap-2 flex-shrink-0"
          >
            Create Location Banner <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: Traffic Trend Chart & Traffic Acquisition Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Visitor Volume Trend Visualizer */}
        <div className="lg:col-span-2 bg-lago-900 border border-lago-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-0.5">Visitor Volume Trend</h3>
              <p className="text-xs text-lago-300">Traffic distribution across the selected {timeframe} window</p>
            </div>
            <span className="text-xs font-bold text-lago-400 bg-lago-800 px-3 py-1 rounded-lg border border-lago-700">
              Peak: {Math.max(...analytics.timeSeriesData.map((d) => d.visitors)).toLocaleString()} visits
            </span>
          </div>

          {/* Bar Chart */}
          <div className="h-56 flex items-end gap-2 pt-6 pb-2 border-b border-lago-800">
            {analytics.timeSeriesData.map((dp, idx) => {
              const maxVal = Math.max(...analytics.timeSeriesData.map((d) => d.visitors));
              const heightPct = Math.max(12, Math.round((dp.visitors / maxVal) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-[#0a141d] border border-lago-600 text-white text-[10px] font-bold p-2 rounded-lg z-20 shadow-xl pointer-events-none whitespace-nowrap">
                    <span>{dp.date}</span>
                    <span className="text-accent-cyan">{dp.visitors.toLocaleString()} visitors</span>
                    <span className="text-lago-400">{dp.pageViews.toLocaleString()} views</span>
                  </div>

                  <div className="w-full bg-lago-800/60 rounded-t-md relative flex items-end overflow-hidden group-hover:bg-lago-700/60 transition-colors" style={{ height: '100%' }}>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full transition-all duration-500 rounded-t-md ${
                        idx === analytics.timeSeriesData.length - 1
                          ? 'bg-accent-orange'
                          : 'bg-accent-cyan/80 group-hover:bg-accent-cyan'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-lago-400 font-mono truncate w-full text-center">{dp.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic Sources & Channels */}
        <div className="bg-lago-900 border border-lago-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-1">Traffic Channels</h3>
          <p className="text-xs text-lago-300 mb-6">How visitors find SPET Online</p>

          <div className="space-y-4">
            {analytics.trafficSources.map((source, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-white">{source.name}</span>
                  <span className="text-lago-300 font-mono">{source.percentage}% ({source.count.toLocaleString()})</span>
                </div>
                <div className="w-full h-2 bg-[#0a141d] rounded-full overflow-hidden border border-lago-800">
                  <div
                    style={{ width: `${source.percentage}%` }}
                    className={`h-full rounded-full ${
                      idx === 0 ? 'bg-accent-cyan' : idx === 1 ? 'bg-accent-orange' : idx === 2 ? 'bg-purple-400' : 'bg-lago-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Visitor Locations Breakdown Table */}
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-accent-cyan" /> Geographic Breakdown ({analytics.topLocations.length} Regions)
      </h2>
      <div className="overflow-x-auto bg-[#0a141d] border border-lago-800 rounded-2xl mb-8">
        <table className="w-full text-left text-sm text-lago-200">
          <thead className="bg-lago-900 border-b border-lago-800 text-lago-100 uppercase text-xs font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">City / Region</th>
              <th className="px-6 py-4">Province / Country</th>
              <th className="px-6 py-4">Visits ({timeframe})</th>
              <th className="px-6 py-4">Traffic Share</th>
              <th className="px-6 py-4">Top Interested Category</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lago-800">
            {analytics.topLocations.map((loc, idx) => (
              <tr key={idx} className="hover:bg-lago-900/60 transition-colors">
                <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-lago-800 text-lago-300 text-xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  {loc.city}
                </td>
                <td className="px-6 py-4 text-lago-300">
                  {loc.province}, <span className="text-lago-400">{loc.country}</span>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-white">
                  {loc.visitsCount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-lago-300 min-w-[40px]">{loc.percentage}%</span>
                    <div className="w-24 h-2 bg-lago-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${loc.percentage}%` }}
                        className={`h-full rounded-full ${idx === 0 ? 'bg-accent-orange' : 'bg-accent-cyan'}`}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-accent-cyan font-medium text-xs">
                  {loc.topInterest}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={onNavigateToBanners}
                    className="px-3 py-1.5 rounded-lg bg-lago-800 hover:bg-lago-700 text-white text-xs font-semibold border border-lago-600 transition-colors"
                  >
                    Target Promo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

