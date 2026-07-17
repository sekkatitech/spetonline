import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Database, Settings, BarChart3, Users, Sparkles, AlertCircle, CheckCircle2,
  Image as ImageIcon, Plus, Pencil, Trash2, ArrowUp, ArrowDown, X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DealBanner } from '../lib/api';
import { useSEO } from '../lib/useSEO';

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
  const [activeTab, setActiveTab] = useState('banners');
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
