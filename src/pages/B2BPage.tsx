import { Link } from 'react-router-dom';
import { Building2, ChevronRight, CheckCircle, ShieldCheck, Truck, HeadphonesIcon, Server, Monitor, HardDrive, Wifi } from 'lucide-react';
import { NavSpacer } from '../components/Layout';
import { useSEO } from '../lib/useSEO';

export function B2BPage() {
  useSEO({
    title: 'B2B & Enterprise Technology Solutions',
    description: 'Bulk pricing, dedicated account management and enterprise procurement for businesses — SPET Online B2B solutions across South Africa.',
  });

  return (
    <div className="min-h-screen bg-gray-30 dark:bg-[#0a141d]">
      <NavSpacer />
      
      {/* ── Hero Section ── */}
      <section className="relative bg-white dark:bg-lago-900 border-b border-gray-200 dark:border-lago-800 overflow-hidden">
        {/* Placeholder Banner Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/office-enterprise-hero.jpg" 
            alt="Office workspace" 
            className="w-full h-full object-cover opacity-100 dark:opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-lago-900 dark:via-lago-900/90 dark:to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lago-100 dark:bg-lago-800/50 text-lago-700 dark:text-lago-300 text-sm font-bold mb-6">
              <Building2 className="w-4 h-4" />
              For Business & Schools
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-gray-900 dark:text-white leading-tight mb-6">
              Wholesale Technology <span className="text-lago-600 dark:text-lago-400">Procurement</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Equip your organisation with the best IT infrastructure, networking, and security solutions. Get access to bulk discounts, formal quotes, and flexible credit terms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/enterprise"
                className="inline-flex items-center justify-center gap-2 bg-lago-600 hover:bg-lago-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-lago-600/20 hover:-translate-y-0.5"
              >
                Enter Enterprise Portal
                <ChevronRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-lago-800 hover:bg-gray-50 dark:hover:bg-lago-700 text-gray-900 dark:text-white border border-gray-200 dark:border-lago-700 font-bold px-8 py-4 rounded-xl transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">Why choose SPET Enterprise?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We streamline the procurement process for large organisations, ensuring compliance, speed, and reliability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <ShieldCheck />, title: 'Vetted Brands', desc: 'Authorised supplier for Dell, HP, Hikvision, and Ubiquiti.' },
              { icon: <CheckCircle />, title: 'Formal Quotes', desc: 'Instantly generate PDF quotes for your finance department.' },
              { icon: <Truck />, title: 'Priority Delivery', desc: 'Fast, insured nationwide shipping directly to your sites.' },
              { icon: <HeadphonesIcon />, title: 'Dedicated Support', desc: 'Your own account manager and technical engineering team.' },
            ].map((f, i) => (
              <div key={i} className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-lago-100 dark:bg-lago-800/50 rounded-xl flex items-center justify-center text-lago-600 dark:text-lago-400 mb-6">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories Section ── */}
      <section className="py-20 bg-white dark:bg-[#081017] border-y border-gray-200 dark:border-lago-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">Solutions we provide</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl">
                From endpoint devices for staff, to the server room infrastructure that powers your business.
              </p>
            </div>
            <Link to="/enterprise" className="text-lago-600 dark:text-lago-400 font-bold hover:underline">
              View all products →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Monitor />, name: 'IT & Computing', desc: 'Laptops, desktops, and workstations for every role.', img: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=600&q=80' },
              { icon: <Server />, name: 'Servers & Storage', desc: 'Rackmount servers, NAS, and enterprise SAN solutions.', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80' },
              { icon: <Wifi />, name: 'Networking', desc: 'Switches, routers, and high-density Wi-Fi infrastructure.', img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80' },
              { icon: <HardDrive />, name: 'Security & CCTV', desc: 'Surveillance cameras, access control, and NVRs.', img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80' },
            ].map((cat, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-lago-800 bg-gray-50 dark:bg-lago-900">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lago-600 dark:text-lago-400">{cat.icon}</span>
                    <h3 className="font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brands Marquee (Static Placeholder) ── */}
      <section className="py-16 border-b border-gray-200 dark:border-lago-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-8">Authorised partner for industry leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 dark:opacity-30 grayscale">
            {/* Placeholder Brand Names instead of SVGs for now */}
            {['DELL Technologies', 'HP Enterprise', 'Lenovo', 'Ubiquiti', 'Hikvision', 'Microsoft'].map(brand => (
              <span key={brand} className="text-xl md:text-2xl font-black font-display text-gray-900 dark:text-white">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto bg-lago-600 rounded-3xl p-8 md:p-16 text-center shadow-2xl shadow-lago-600/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-6">
              Ready to upgrade your procurement?
            </h2>
            <p className="text-lago-100 text-lg mb-10 max-w-2xl mx-auto">
              Join hundreds of schools, municipalities, and businesses across South Africa that trust SPET for their technology needs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/enterprise"
                className="inline-flex items-center justify-center gap-2 bg-white text-lago-700 hover:bg-gray-50 font-bold px-8 py-4 rounded-xl transition-colors"
              >
                Access Enterprise Portal
              </Link>
              <a
                href="mailto:sales@spetonline.co.za"
                className="inline-flex items-center justify-center gap-2 bg-lago-700 hover:bg-lago-800 text-white border border-lago-500 font-bold px-8 py-4 rounded-xl transition-colors"
              >
                Contact Sales Team
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
