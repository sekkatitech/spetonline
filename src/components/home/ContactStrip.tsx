import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

export function ContactStrip() {
  return (
    <section
      aria-labelledby="contact-title"
      className="mt-10 grid overflow-hidden rounded-2xl border border-spet-line bg-spet-surface md:grid-cols-[240px_1fr]"
    >
      <img
        src="/images/store-hero.png"
        alt="SPET Online electronics store interior"
        className="h-[180px] w-full object-cover md:h-full"
        loading="lazy"
        decoding="async"
      />

      <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-3 md:p-6">
        <div>
          <h2 id="contact-title" className="font-display text-[24px] font-semibold tracking-tight text-spet-ink md:text-[26px]">
            Contact
          </h2>
          <p className="mt-2 flex items-center gap-2 text-[14px] text-spet-ink-2">
            <MapPin className="h-[15px] w-[15px] shrink-0 text-spet-blue" aria-hidden="true" />
            Pretoria, Gauteng
          </p>
          <p className="mt-1.5 text-[13px] text-spet-muted">Mon–Fri 08:00–17:00</p>
        </div>

        <div className="space-y-2.5 md:border-l md:border-spet-line-2 md:pl-6">
          <a href="tel:0870881483" className="flex items-center gap-2.5 text-[14px] text-spet-ink transition-colors hover:text-spet-blue">
            <Phone className="h-[15px] w-[15px] shrink-0 text-spet-muted" aria-hidden="true" />
            0870 881 483
          </a>
          <a
            href="https://wa.me/27741164295"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 text-[14px] text-spet-ink transition-colors hover:text-spet-blue"
          >
            <MessageCircle className="h-[15px] w-[15px] shrink-0 text-spet-muted" aria-hidden="true" />
            WhatsApp +27 74 116 4295
          </a>
          <a
            href="mailto:sales@spetonline.co.za"
            className="flex items-center gap-2.5 text-[14px] text-spet-ink transition-colors hover:text-spet-blue"
          >
            <Mail className="h-[15px] w-[15px] shrink-0 text-spet-muted" aria-hidden="true" />
            sales@spetonline.co.za
          </a>
        </div>

        <div className="md:border-l md:border-spet-line-2 md:pl-6">
          <p className="text-[13px] font-semibold text-spet-ink">Delivery and returns</p>
          <p className="mt-2 text-[13px] leading-relaxed text-spet-ink-2">
            Free delivery over R2 500. Orders under R2 500 ship at R90 for parcels up to 5 kg. Returns within 7 days.
          </p>
          <a
            href="/contact"
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-spet-blue transition-colors hover:text-spet-blue-dark"
          >
            Read the delivery policy
          </a>
        </div>
      </div>
    </section>
  );
}
