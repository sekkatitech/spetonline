import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { User, Package, Heart, MapPin, LogOut, Edit2, Plus, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useOrders, useAddresses, useWishlist } from '../lib/api';
import { useProducts } from '../lib/api';
import { ProductCard } from '../components/ProductSections';
import { supabase } from '../lib/supabase';

const SA_PROVINCES = ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'];

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  shipped:    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  delivered:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  refunded:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export function AccountPage() {
  const { user, profile, signOut, loading } = useAuth();
  const [tab, setTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>('orders');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pt-40 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lago-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const tabs = [
    { key: 'orders',    label: 'My Orders',   icon: Package },
    { key: 'wishlist',  label: 'Wishlist',     icon: Heart },
    { key: 'addresses', label: 'Addresses',    icon: MapPin },
    { key: 'profile',   label: 'Profile',      icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pt-32 md:pt-36 pb-20 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white">
              My Account
            </h1>
            <p className="text-gray-500 dark:text-lago-400 mt-1">
              {profile?.first_name ? `Welcome back, ${profile.first_name}!` : user.email}
            </p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-lago-700 text-gray-600 dark:text-lago-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 transition-all text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl p-3 shadow-sm">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-1 last:mb-0 ${
                    tab === key
                      ? 'bg-lago-600 text-white shadow-md shadow-lago-600/20'
                      : 'text-gray-600 dark:text-lago-200 hover:bg-gray-50 dark:hover:bg-lago-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {tab === 'orders'    && <OrdersTab userId={user.id} />}
            {tab === 'wishlist'  && <WishlistTab userId={user.id} />}
            {tab === 'addresses' && <AddressesTab userId={user.id} />}
            {tab === 'profile'   && <ProfileTab user={user} profile={profile} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab({ userId }: { userId: string }) {
  const { orders, loading } = useOrders(userId);

  if (loading) return <TabSkeleton />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        desc="Your order history will appear here once you place your first order."
        cta="Start Shopping"
        href="/shop"
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <p className="font-mono text-sm font-bold text-gray-900 dark:text-white tracking-wider">{order.order_number}</p>
              <p className="text-xs text-gray-400 dark:text-lago-500 mt-0.5">
                {new Date(order.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[order.status] ?? STATUS_COLORS.pending}`}>
                {order.status}
              </span>
              <span className="text-lg font-black text-gray-900 dark:text-white">
                R {Number(order.total).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Order items summary */}
          {order.order_items && order.order_items.length > 0 && (
            <div className="border-t border-gray-100 dark:border-lago-800 pt-4 space-y-2">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-lago-100 dark:bg-lago-800 text-lago-600 dark:text-lago-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{item.qty}</span>
                    <span className="text-gray-700 dark:text-lago-100 truncate">{item.product_name}</span>
                  </div>
                  <span className="text-gray-900 dark:text-white font-semibold flex-shrink-0 ml-4">
                    R {Number(item.total).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Shipping address */}
          {order.shipping_address && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-lago-800">
              <p className="text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1">Shipped to</p>
              <p className="text-xs text-gray-600 dark:text-lago-200">
                {order.shipping_address.full_name} · {order.shipping_address.address_line1}, {order.shipping_address.city}, {order.shipping_address.province}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Wishlist Tab ─────────────────────────────────────────────────────────────

function WishlistTab({ userId }: { userId: string }) {
  const { wishlist } = useWishlist(userId);
  const { products, loading } = useProducts({ perPage: 50 });
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  if (loading) return <TabSkeleton />;

  if (wishlist.length === 0 || wishlistProducts.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        desc="Save products you love and come back to them anytime."
        cta="Browse Products"
        href="/shop"
      />
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-lago-400 mb-5">{wishlistProducts.length} saved item{wishlistProducts.length !== 1 ? 's' : ''}</p>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {wishlistProducts.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

// ─── Addresses Tab ────────────────────────────────────────────────────────────

function AddressesTab({ userId }: { userId: string }) {
  const { addresses, loading, saveAddress } = useAddresses(userId);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const blank = { label: 'Home', full_name: '', phone: '', address_line1: '', address_line2: '', city: '', province: 'Gauteng', postal_code: '', country: 'ZA', is_default: false };
  const [form, setForm] = useState(blank);

  function field(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await saveAddress(editing ? { ...form, id: editing.id } : form);
    setShowForm(false); setEditing(null); setForm(blank);
  }

  function startEdit(addr: any) {
    setForm(addr); setEditing(addr); setShowForm(true);
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-lago-800 border border-gray-200 dark:border-lago-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-lago-500 transition-colors';

  if (loading) return <TabSkeleton />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
        {!showForm && (
          <button onClick={() => { setForm(blank); setEditing(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lago-600 text-white text-sm font-bold hover:bg-lago-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Address
          </button>
        )}
      </div>

      {/* Address form */}
      {showForm && (
        <form onSubmit={submit} className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 dark:text-white">{editing ? 'Edit Address' : 'New Address'}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-lago-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Label</label>
              <input value={form.label} onChange={field('label')} className={inputClass} placeholder="Home, Work, etc." />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Full Name *</label>
              <input value={form.full_name} onChange={field('full_name')} required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Phone</label>
              <input value={form.phone} onChange={field('phone')} type="tel" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Province *</label>
              <select value={form.province} onChange={field('province')} required className={inputClass + ' cursor-pointer'}>
                {SA_PROVINCES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Address Line 1 *</label>
              <input value={form.address_line1} onChange={field('address_line1')} required className={inputClass} placeholder="Street address" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Address Line 2</label>
              <input value={form.address_line2} onChange={field('address_line2')} className={inputClass} placeholder="Suburb, complex (optional)" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">City *</label>
              <input value={form.city} onChange={field('city')} required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Postal Code *</label>
              <input value={form.postal_code} onChange={field('postal_code')} required maxLength={4} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-lago-600 text-white font-bold hover:bg-lago-700 transition-colors text-sm">
              <Check className="w-4 h-4" /> {editing ? 'Save Changes' : 'Add Address'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-lago-700 text-gray-600 dark:text-lago-200 font-semibold hover:bg-gray-50 dark:hover:bg-lago-800 transition-colors text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address cards */}
      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-16 text-gray-500 dark:text-lago-400">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No saved addresses yet.</p>
          <p className="text-sm mt-1">Add an address to speed up checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-white dark:bg-lago-900 border-2 rounded-2xl p-5 shadow-sm ${addr.is_default ? 'border-lago-500' : 'border-gray-200 dark:border-lago-800'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{addr.label ?? 'Address'}</p>
                  {addr.is_default && <span className="text-[10px] font-bold text-lago-600 dark:text-lago-400 uppercase tracking-wide">Default</span>}
                </div>
                <button onClick={() => startEdit(addr)} className="p-1.5 rounded-lg text-gray-400 hover:text-lago-600 dark:hover:text-lago-400 hover:bg-gray-100 dark:hover:bg-lago-800 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-700 dark:text-lago-100 font-medium">{addr.full_name}</p>
              <p className="text-sm text-gray-500 dark:text-lago-300">{addr.address_line1}</p>
              {addr.address_line2 && <p className="text-sm text-gray-500 dark:text-lago-300">{addr.address_line2}</p>}
              <p className="text-sm text-gray-500 dark:text-lago-300">{addr.city}, {addr.province} {addr.postal_code}</p>
              {addr.phone && <p className="text-sm text-gray-500 dark:text-lago-300 mt-1">{addr.phone}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({ user, profile }: { user: any; profile: any }) {
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName]   = useState(profile?.last_name ?? '');
  const [phone, setPhone]         = useState(profile?.phone ?? '');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-lago-800 border border-gray-200 dark:border-lago-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-lago-500 transition-colors';

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('profiles').update({ first_name: firstName, last_name: lastName, phone }).eq('id', user.id);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl p-6 shadow-sm max-w-lg">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h2>
      <form onSubmit={saveProfile} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">First Name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Last Name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Email Address</label>
          <input value={user.email} disabled className={inputClass + ' opacity-50 cursor-not-allowed'} />
          <p className="text-xs text-gray-400 dark:text-lago-500 mt-1">Email cannot be changed here.</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Phone Number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className={inputClass} placeholder="+27 000 000 0000" />
        </div>
        <div className="pt-2">
          <button type="submit" disabled={saving}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${saved ? 'bg-green-500 text-white' : 'bg-lago-600 hover:bg-lago-700 text-white'} disabled:opacity-60 shadow-lg shadow-lago-600/20`}>
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Account info */}
      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-lago-800">
        <p className="text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-3">Account Details</p>
        <div className="space-y-2 text-sm text-gray-600 dark:text-lago-200">
          <p>Role: <span className="font-semibold capitalize text-gray-900 dark:text-white">{profile?.role ?? 'customer'}</span></p>
          <p>Member since: <span className="font-semibold text-gray-900 dark:text-white">{new Date(user.created_at).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}</span></p>
        </div>
      </div>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1,2,3].map((i) => <div key={i} className="h-28 bg-gray-200 dark:bg-lago-800 rounded-2xl" />)}
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, cta, href }: { icon: any; title: string; desc: string; cta: string; href: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-lago-800 flex items-center justify-center mb-6 border-2 border-dashed border-gray-300 dark:border-lago-600">
        <Icon className="w-9 h-9 text-gray-400 dark:text-lago-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-lago-400 mb-8 max-w-xs text-sm">{desc}</p>
      <Link to={href} className="px-6 py-3 rounded-full bg-lago-600 text-white font-bold hover:bg-lago-700 transition-colors text-sm shadow-lg shadow-lago-600/20">
        {cta}
      </Link>
    </div>
  );
}
