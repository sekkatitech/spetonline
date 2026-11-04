import { Link } from 'react-router-dom';
import { CheckCircle, ChevronRight, HardDrive, HeadphonesIcon, Monitor, Server, ShieldCheck, Truck, Wifi } from 'lucide-react';
import { useSEO } from '../lib/useSEO';
import { ButtonLink, PageShell, SectionHeader, panelStyles } from '../components/ui';

const FEATURES = [
  { icon: ShieldCheck, title: 'Vetted brands', description: 'Authorised partner for Dell, HP, Hikvision and Ubiquiti.' },
  { icon: CheckCircle, title: 'Formal quotes', description: 'Instantly generate PDF quotes for your finance department.' },
  { icon: Truck, title: 'Priority delivery', description: 'Fast, insured nationwide shipping directly to your sites.' },
  { icon: HeadphonesIcon, title: 'Dedicated support', description: 'Your own account manager and technical engineering team.' },
];

const SOLUTIONS = [
  { icon: Monitor, name: 'IT & computing', description: 'Laptops, desktops and workstations for every role.' },
  { icon: Server, name: 'Servers & storage', description: 'Rackmount servers, NAS and enterprise SAN solutions.' },
  { icon: Wifi, name: 'Networking', description: 'Switches, routers and high-density Wi-Fi infrastructure.' },
  { icon: HardDrive, name: 'Security & CCTV', description: 'Surveillance cameras, access control and NVRs.' },
];

const BRANDS = ['Dell Technologies', 'HP Enterprise', 'Lenovo', 'Ubiquiti', 'Hikvision', 'Microsoft'];

export function B2BPage() {
  useSEO({
    title: 'B2B & Enterprise Technology Solutions',
    description: 'Bulk pricing, dedicated account management and enterprise procurement for businesses — SPET Online B2B solutions across South Africa.',
  });

  return (
    <PageShell breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Business' }]}>
      <section className={`${panelStyles} grid grid-cols-1 overflow-hidden lg:grid-cols-2`}>
        <div className="p-6 md:p-10">
          <h1 className="font-display text-[32px] font-semibold leading-tight tracking-tight text-spet-ink md:text-[44px]">
            Technology procurement for business and schools
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-spet-ink-2">
            Equip your organisation with IT infrastructure, networking and security solutions. Get access to bulk discounts, formal quotes and flexible credit terms.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink to="/enterprise" size="lg">
              Enter enterprise portal <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <a
              href="mailto:sales@spetonline.co.za"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-spet-line bg-spet-surface px-6 text-[15px] font-semibold text-spet-ink transition-colors hover:border-spet-blue hover:text-spet-blue"
            >
              Contact sales
            </a>
          </div>
          <p className="mt-4 text-[13px] text-spet-muted">The portal has a Back to shop link on every page.</p>
        </div>
        <img src="/images/office-enterprise-hero.jpg" alt="" decoding="async" className="h-56 w-full object-cover lg:h-full" />
      </section>

      <section aria-label="Why SPET Enterprise" className="mt-10">
        <SectionHeader title="Why SPET Enterprise" description="A simpler procurement process for large organisations." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <article key={title} className={`${panelStyles} p-5`}>
              <Icon className="h-6 w-6 text-spet-blue" aria-hidden="true" />
              <h3 className="mt-3 font-display text-[18px] font-semibold text-spet-ink">{title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-spet-ink-2">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Solutions" className="mt-10">
        <SectionHeader
          title="Solutions we provide"
          description="From staff devices to the server room."
          action={
            <Link to="/enterprise" className="flex min-h-11 shrink-0 items-center text-[13px] font-semibold text-spet-link hover:underline">
              View all products
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SOLUTIONS.map(({ icon: Icon, name, description }) => (
            <article key={name} className={`${panelStyles} p-5`}>
              <Icon className="h-6 w-6 text-spet-blue" aria-hidden="true" />
              <h3 className="mt-3 font-display text-[18px] font-semibold text-spet-ink">{name}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-spet-ink-2">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Partner brands" className="mt-10 border-y border-spet-line py-8 text-center">
        <h2 className="text-[13px] font-semibold text-spet-muted">Authorised partner for industry leaders</h2>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {BRANDS.map((brand) => (
            <li key={brand} className="font-display text-[20px] font-semibold text-spet-ink-2">{brand}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-2xl bg-spet-navy p-6 text-center md:p-12">
        <h2 className="font-display text-[28px] font-semibold tracking-tight text-white md:text-[36px]">Ready to upgrade your procurement?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] text-white/75">
          Talk to SPET about technology for your school, municipality or business, anywhere in South Africa.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/enterprise" size="lg">Access enterprise portal</ButtonLink>
          <a
            href="mailto:sales@spetonline.co.za"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-white/30 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
          >
            Contact sales team
          </a>
        </div>
      </section>
    </PageShell>
  );
}
