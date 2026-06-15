import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, CheckCircle } from 'lucide-react';
import { NavSpacer } from '../components/Layout';

export function B2BPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pb-20">
      <NavSpacer />
      <div className="max-w-3xl mx-auto px-4 text-center">

        {/* Icon */}
        <div className="w-20 h-20 bg-lago-100 dark:bg-lago-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-10 h-10 text-lago-600 dark:text-lago-400" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 dark:text-white mb-4">
          Business & Schools
        </h1>
        <p className="text-xl text-gray-500 dark:text-lago-400 mb-8 leading-relaxed">
          Our dedicated B2B portal is coming soon — built specifically for schools, businesses, and bulk buyers across South Africa.
        </p>

        {/* What to expect */}
        <div className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl p-8 mb-8 text-left">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">What to expect</h2>
          <ul className="space-y-4">
            {[
              'Dedicated pricing for registered businesses and schools',
              'Bulk order discounts and volume pricing',
              'Networking, VoIP, and IP telephony solutions',
              'Dedicated account manager for your organisation',
              'Official quotes and invoices for procurement',
              'Nationwide delivery with tracking',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-lago-600 dark:text-lago-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-lago-300 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Register interest */}
        <div className="bg-lago-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-xl font-bold mb-2">Register your interest</h2>
          <p className="text-lago-200 text-sm mb-6">
            Be the first to know when our B2B portal launches. Contact us today to discuss your organisation's requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:sales@spetonline.co.za?subject=B2B Enquiry"
              className="flex items-center justify-center gap-2 bg-white text-lago-700 font-bold px-6 py-3 rounded-xl hover:bg-lago-50 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Us
            </a>
            <a
              href="tel:0870881483"
              className="flex items-center justify-center gap-2 bg-lago-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-lago-800 transition-colors border border-lago-500"
            >
              <Phone className="w-4 h-4" />
              Call Us
            </a>
          </div>
        </div>

        <Link
          to="/shop"
          className="text-lago-600 dark:text-lago-400 hover:underline text-sm font-semibold"
        >
          ← Back to Shop
        </Link>
      </div>
    </div>
  );
}
