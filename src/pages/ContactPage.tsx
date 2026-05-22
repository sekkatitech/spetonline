import { Mail, MapPin, Phone } from 'lucide-react';

export function ContactPage() {
  return (
    <div className="pt-32 pb-24 container mx-auto px-4 md:px-6">
      
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
        <p className="text-gray-600 dark:text-lago-200 text-lg">We're here to help. Reach out to us for support, inquiries, or feedback.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
        <div className="lg:col-span-1 space-y-8">
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-full bg-lago-100 dark:bg-lago-800/50 text-lago-600 dark:text-lago-400 flex items-center justify-center mb-2">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Call Us</h3>
            <p className="text-gray-600 dark:text-lago-200 text-sm">Mon-Fri from 8am to 5pm.</p>
            <p className="text-lago-600 dark:text-lago-400 font-semibold">
              Sales: <a href="tel:0870881483" className="hover:underline">0870 881 483</a><br/>
              Support: <a href="tel:+27743507142" className="hover:underline">+27 74 350 7142</a>
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-full bg-lago-100 dark:bg-lago-800/50 text-lago-600 dark:text-lago-400 flex items-center justify-center mb-2">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Email Us</h3>
            <p className="text-gray-600 dark:text-lago-200 text-sm">Our friendly team is here to help.</p>
            <p className="text-lago-600 dark:text-lago-400 font-semibold">
              <a href="mailto:sales@spetonline.co.za" className="hover:underline">sales@spetonline.co.za</a>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-full bg-lago-100 dark:bg-lago-800/50 text-lago-600 dark:text-lago-400 flex items-center justify-center mb-2">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Visit Us</h3>
            <p className="text-gray-600 dark:text-lago-200 text-sm">Come say hello at our retail store.</p>
            <p className="text-lago-600 dark:text-lago-400 font-semibold">Pretoria, Gauteng<br/>South Africa</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 p-8 md:p-10 rounded-3xl shadow-sm dark:shadow-none">
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-white">First Name</label>
                <input type="text" className="h-12 px-4 rounded-lg bg-gray-50 dark:bg-[#0a141d] border border-gray-300 dark:border-lago-700 text-gray-900 dark:text-white focus:outline-none focus:border-lago-500 shadow-sm dark:shadow-none transition-colors" placeholder="First Name" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-white">Last Name</label>
                <input type="text" className="h-12 px-4 rounded-lg bg-gray-50 dark:bg-[#0a141d] border border-gray-300 dark:border-lago-700 text-gray-900 dark:text-white focus:outline-none focus:border-lago-500 shadow-sm dark:shadow-none transition-colors" placeholder="Last Name" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Email Address</label>
              <input type="email" className="h-12 px-4 rounded-lg bg-gray-50 dark:bg-[#0a141d] border border-gray-300 dark:border-lago-700 text-gray-900 dark:text-white focus:outline-none focus:border-lago-500 shadow-sm dark:shadow-none transition-colors" placeholder="your@email.com" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Message</label>
              <textarea rows={5} className="p-4 rounded-lg bg-gray-50 dark:bg-[#0a141d] border border-gray-300 dark:border-lago-700 text-gray-900 dark:text-white focus:outline-none focus:border-lago-500 resize-none shadow-sm dark:shadow-none transition-colors" placeholder="How can we help you?"></textarea>
            </div>

            <button type="submit" className="h-14 mt-4 px-8 rounded-full bg-lago-600 hover:bg-lago-700 text-white font-bold transition-colors w-full sm:w-auto self-start shadow-[0_4px_14px_rgba(5,125,205,0.3)]">
              Send Message
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
