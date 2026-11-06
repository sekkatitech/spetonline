import { NewsletterForm } from './NewsletterForm';

/** Newsletter sign-up section that sits directly above the site footer. */
export function NewsletterBand() {
  return (
    <section aria-labelledby="newsletter-band-title" className="mx-auto mt-12 w-full max-w-[1400px] px-4 md:px-6">
      <div className="relative overflow-hidden rounded-2xl bg-spet-orange text-[#101820]">
        {/* Perforated top edge */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-2 bg-[radial-gradient(circle_at_6px_0,var(--color-spet-canvas)_4px,transparent_4.5px)] bg-[length:18px_8px] bg-repeat-x"
        />
        <div className="grid items-center gap-8 px-6 py-9 md:px-12 md:py-11 lg:grid-cols-[1fr_520px] lg:gap-16">
          <div>
            <h2
              id="newsletter-band-title"
              className="max-w-[460px] font-display text-[28px] font-semibold leading-[1.08] tracking-[-0.02em] md:text-[36px]"
            >
              Stay connected with SPET Online
            </h2>
            <p className="mt-4 max-w-[420px] text-[15px] leading-relaxed text-[#101820]/80 md:text-[16px]">
              Get updates on IT products, new arrivals and special offers for your business.
            </p>
          </div>
          <NewsletterForm idPrefix="band-newsletter" source="footer_band" variant="band" />
        </div>
      </div>
    </section>
  );
}
