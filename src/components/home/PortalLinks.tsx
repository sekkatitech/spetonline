import { Link } from 'react-router-dom';
import { Apple, ArrowRight, Building2 } from 'lucide-react';

export function PortalLinks() {
  return (
    <section aria-label="Business and Apple purchasing" className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
      <Link
        to="/b2b"
        className="group flex min-h-[140px] flex-col justify-between rounded-2xl bg-spet-navy p-6 transition-colors hover:bg-[#152836]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[22px] font-semibold text-white">Business purchasing</h2>
            <p className="mt-2 max-w-[380px] text-[14px] leading-relaxed text-white/65">
              Quotes, credit terms and bulk pricing for schools and companies.
            </p>
          </div>
          <Building2 className="h-[26px] w-[26px] shrink-0 text-white/30" aria-hidden="true" />
        </div>
        <span className="mt-4 flex items-center gap-2 text-[14px] font-semibold text-white">
          Open business portal
          <ArrowRight className="h-[15px] w-[15px] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Link>

      <Link
        to="/enterprise/apple"
        className="group flex min-h-[140px] flex-col justify-between rounded-2xl border border-spet-line bg-spet-surface p-6 transition-colors hover:border-spet-blue"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[22px] font-semibold text-spet-ink">Apple portal</h2>
            <p className="mt-2 max-w-[380px] text-[14px] leading-relaxed text-spet-ink-2">
              MacBook, iPad, AirPods and Apple Watch with authorised warranty support.
            </p>
          </div>
          <Apple className="h-[26px] w-[26px] shrink-0 text-spet-was" aria-hidden="true" />
        </div>
        <span className="mt-4 flex items-center gap-2 text-[14px] font-semibold text-spet-blue">
          Open Apple portal
          <ArrowRight className="h-[15px] w-[15px] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Link>
    </section>
  );
}
