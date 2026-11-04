import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Check, Heart, LogOut, MapPin, Package, Pencil, Plus, X } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useAddresses, useOrders } from '../lib/api';
import { useWishlistProducts } from '../lib/productAdapters';
import { formatMoney } from '../lib/productDisplay';
import { supabase } from '../lib/supabase';
import { useSEO } from '../lib/useSEO';
import { ProductTile } from '../components/product/ProductTile';
import { useWishlistState, WishlistProvider } from '../components/WishlistProvider';
import { Button, ButtonLink, EmptyState, IconButton, PageShell, SelectField, Skeleton, Tabs, TextField, panelStyles } from '../components/ui';

const SA_PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'];
const PROVINCE_OPTIONS = SA_PROVINCES.map((province) => ({ value: province, label: province }));

const TABS = [
  { id: 'orders', label: 'Orders' },
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'profile', label: 'Profile' },
];

export function AccountPage() {
  useSEO({ title: 'My Account', description: 'Manage your SPET Online account.', noindex: true });

  const { user, profile, signOut, loading } = useAuth();
  const [tab, setTab] = useState('orders');

  if (loading) {
    return (
      <PageShell title="My account">
        <TabSkeleton />
      </PageShell>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <WishlistProvider>
      <PageShell
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Account' }]}
        title="My account"
        description={profile?.first_name ? `Welcome back, ${profile.first_name}.` : user.email}
        actions={
          <Button variant="secondary" onClick={signOut}>
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
          </Button>
        }
      >
        <Tabs label="Account sections" items={TABS} value={tab} onChange={setTab} className="mb-6" />

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'orders' && <OrdersTab userId={user.id} />}
          {tab === 'wishlist' && <WishlistTab />}
          {tab === 'addresses' && <AddressesTab userId={user.id} />}
          {tab === 'profile' && <ProfileTab user={user} profile={profile} />}
        </div>
      </PageShell>
    </WishlistProvider>
  );
}

function OrdersTab({ userId }: { userId: string }) {
  const { orders, loading } = useOrders(userId);

  if (loading) return <TabSkeleton />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-6 w-6" />}
        title="No orders yet"
        description="Your order history will appear here once you place your first order."
        action={<ButtonLink to="/shop">Start shopping</ButtonLink>}
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <article key={order.id} className={`${panelStyles} p-5`}>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="break-all font-mono text-[13px] font-semibold text-spet-ink">{order.order_number}</p>
              <p className="mt-0.5 text-[12px] text-spet-muted">
                {new Date(order.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="rounded-lg bg-spet-tint px-3 py-1 text-[12px] font-semibold capitalize text-spet-link">{order.status}</span>
              <span className="text-[17px] font-semibold tabular-nums text-spet-ink">{formatMoney(Number(order.total))}</span>
            </div>
          </div>

          {order.order_items?.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-spet-line-2 pt-4">
              {order.order_items.map((item: any) => (
                <li key={item.id} className="flex items-center justify-between gap-4 text-[13px]">
                  <span className="min-w-0 truncate text-spet-ink-2">
                    <span className="font-semibold tabular-nums text-spet-ink">{item.qty} ×</span> {item.name}
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-spet-ink">{formatMoney(Number(item.line_total))}</span>
                </li>
              ))}
            </ul>
          )}

          {order.shipping_address && (
            <div className="mt-4 border-t border-spet-line-2 pt-4">
              <p className="text-[12px] font-semibold text-spet-muted">Shipped to</p>
              <p className="mt-0.5 text-[13px] text-spet-ink-2">
                {[order.shipping_address.full_name, order.shipping_address.address_line1, order.shipping_address.city, order.shipping_address.province]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function WishlistTab() {
  const wishlist = useWishlistState();
  const ids = wishlist?.ids ?? [];
  const { items, loading } = useWishlistProducts(ids);
  const saved = items.filter(({ product }) => ids.includes(product.id));

  if (loading) return <TabSkeleton />;

  if (saved.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="h-6 w-6" />}
        title="Your wishlist is empty"
        description="Save products you like and come back to them anytime."
        action={<ButtonLink to="/shop">Browse products</ButtonLink>}
      />
    );
  }

  return (
    <>
      <p className="mb-4 text-[13px] text-spet-ink-2">
        {saved.length} saved item{saved.length === 1 ? '' : 's'}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {saved.map(({ product, supplier }) => (
          <ProductTile key={product.id} product={product} supplier={supplier} />
        ))}
      </div>
    </>
  );
}

const BLANK_ADDRESS = {
  label: 'Home',
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  province: 'Gauteng',
  postal_code: '',
  country: 'ZA',
  is_default: false,
};

function AddressesTab({ userId }: { userId: string }) {
  const { addresses, loading, saveAddress } = useAddresses(userId);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<typeof BLANK_ADDRESS>(BLANK_ADDRESS);

  function field(key: keyof typeof BLANK_ADDRESS) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await saveAddress(editing ? { ...form, id: editing.id } : form);
    setShowForm(false);
    setEditing(null);
    setForm(BLANK_ADDRESS);
  }

  function startEdit(address: any) {
    setForm(address);
    setEditing(address);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  if (loading) return <TabSkeleton />;

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-[20px] font-semibold text-spet-ink">Saved addresses</h2>
        {!showForm && (
          <Button
            onClick={() => {
              setForm(BLANK_ADDRESS);
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add address
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className={`${panelStyles} mb-6 p-5 md:p-6`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-display text-[18px] font-semibold text-spet-ink">{editing ? 'Edit address' : 'New address'}</h3>
            <IconButton label="Close address form" onClick={closeForm}>
              <X className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField id="address-label" label="Label" placeholder="Home, work" value={form.label} onChange={field('label')} />
            <TextField id="address-name" label="Full name" required autoComplete="name" value={form.full_name} onChange={field('full_name')} />
            <TextField id="address-phone" label="Phone" type="tel" autoComplete="tel" value={form.phone} onChange={field('phone')} />
            <SelectField id="address-province" label="Province" required options={PROVINCE_OPTIONS} value={form.province} onChange={field('province')} />
            <TextField id="address-line1" wrapperClassName="md:col-span-2" label="Address line 1" required autoComplete="address-line1" value={form.address_line1} onChange={field('address_line1')} />
            <TextField id="address-line2" wrapperClassName="md:col-span-2" label="Address line 2 (optional)" autoComplete="address-line2" value={form.address_line2 ?? ''} onChange={field('address_line2')} />
            <TextField id="address-city" label="City" required autoComplete="address-level2" value={form.city} onChange={field('city')} />
            <TextField id="address-postal" label="Postal code" required autoComplete="postal-code" maxLength={4} value={form.postal_code} onChange={field('postal_code')} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="submit">
              <Check className="h-4 w-4" aria-hidden="true" /> {editing ? 'Save changes' : 'Add address'}
            </Button>
            <Button type="button" variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <EmptyState
          icon={<MapPin className="h-6 w-6" />}
          title="No saved addresses yet"
          description="Add an address to speed up checkout."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className={`rounded-2xl border bg-spet-surface p-5 ${address.is_default ? 'border-spet-blue' : 'border-spet-line'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[14px] font-semibold text-spet-ink">{address.label ?? 'Address'}</h3>
                  {address.is_default && <p className="text-[12px] font-semibold text-spet-link">Default</p>}
                </div>
                <IconButton label={`Edit ${address.label ?? 'address'}`} className="-mr-2 -mt-2" onClick={() => startEdit(address)}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </IconButton>
              </div>
              <div className="mt-2 text-[13px] leading-relaxed text-spet-ink-2">
                <p className="font-medium text-spet-ink">{address.full_name}</p>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>{address.city}, {address.province} {address.postal_code}</p>
                {address.phone && <p className="mt-1">{address.phone}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function ProfileTab({ user, profile }: { user: any; profile: any }) {
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    await supabase.from('profiles').update({ first_name: firstName, last_name: lastName, phone }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className={`${panelStyles} max-w-lg p-5 md:p-6`}>
      <h2 className="mb-4 font-display text-[20px] font-semibold text-spet-ink">Profile information</h2>
      <form onSubmit={saveProfile} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="profile-first" label="First name" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          <TextField id="profile-last" label="Last name" autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
        </div>
        <TextField id="profile-email" label="Email address" hint="Email cannot be changed here." value={user.email} disabled />
        <TextField id="profile-phone" label="Phone number" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <Button type="submit" loading={saving}>
          {saved && <Check className="h-4 w-4" aria-hidden="true" />}
          {saved ? 'Saved' : saving ? 'Saving…' : 'Save changes'}
        </Button>
      </form>

      <div className="mt-6 border-t border-spet-line-2 pt-5 text-[13px] text-spet-ink-2">
        <h3 className="mb-2 text-[13px] font-semibold text-spet-ink">Account details</h3>
        <p>
          Role: <span className="font-semibold capitalize text-spet-ink">{profile?.role ?? 'customer'}</span>
        </p>
        <p className="mt-1">
          Member since:{' '}
          <span className="font-semibold text-spet-ink">
            {new Date(user.created_at).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
          </span>
        </p>
      </div>
    </div>
  );
}

function TabSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}
