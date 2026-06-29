// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Grid3x3, Zap, Home } from 'lucide-react';
import { useCategories, useCategoryHeads } from '../lib/api';
import { SafeImage } from '../components/SafeImage';
import { NavSpacer } from '../components/Layout';
import { supabase } from '../lib/supabase';

// ── Fetches first product image for a Syntech category ────────────────────────
function CategoryImage({ categoryName }: { categoryName: string }) {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('syntech_products')
      .select('thumbnail_url, images')
      .eq('category', categoryName)
      .eq('is_active', true)
      .not('thumbnail_url', 'is', null)
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.thumbnail_url) setImage(data.thumbnail_url);
      });
  }, [categoryName]);

  if (!image) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-lago-50 flex items-center justify-center">
        <Zap className="w-8 h-8 text-lago-400" />
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={categoryName}
      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
      referrerPolicy="no-referrer"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

// ── Syntech categories with friendly display names ────────────────────────────
const SYNTECH_CATEGORY_NAMES: Record<string, string> = {
  'Computer peripherals': 'Computer Peripherals',
  'Components':           'PC Components',
  'Cables':               'Cables & Adapters',
  'Bags & luggage':       'Bags & Luggage',
  'Appliances':           'Appliances',
  'Power':                'Power Solutions',
  'Networking & security':'Networking & Security',
  'TV & audio':           'TV & Audio',
  'Mobile':               'Mobile Accessories',
  'Software':             'Software',
  'Lifestyle & home tech':'Lifestyle & Home Tech',
  'Computers':            'Computers',
};

function useSyntechCategories() {
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('syntech_products')
      .select('category')
      .eq('is_active', true)
      .not('category', 'is', null)
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        (data ?? []).forEach((d: any) => {
          if (d.category) counts[d.category] = (counts[d.category] || 0) + 1;
        });
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => ({ name, count }));
        setCategories(sorted);
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}

export function CategoriesPage() {
  const { categories, loading } = useCategories();
  const { categoryHeads, categoryImages, loading: headsLoading } = useCategoryHeads();
  const { categories: syntechCats, loading: syntechLoading } = useSyntechCategories();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'home' | 'gaming'>('home');

  // Group categories by CategoryHead
  const categoryMap = new Map<string, typeof categories>();
  for (const cat of categories) {
    const head = cat.parent_id || 'Other';
    if (!categoryMap.has(head)) categoryMap.set(head, []);
    categoryMap.get(head)!.push(cat);
  }

  const isLoading = loading || headsLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pb-20">
    
     {/* ── Hero banner — fixed parallax ── */}
      <div
        className="relative w-full flex flex-col items-center justify-center text-center px-4"
       style={{
          height: '100vh',
          backgroundImage: 'url(/images/store-hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <NavSpacer />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-3 drop-shadow-lg">
            All Categories
          </h1>
          <p className="text-gray-200 text-base drop-shadow max-w-xl mx-auto">
            Browse our full range of technology products across all departments.
          </p>
        </div>
      </div>

      {/* ── Page header ── */}
      <div className="bg-white dark:bg-lago-900 border-b border-gray-200 dark:border-lago-800">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <button
            onClick={() => window.history.state?.idx > 0 ? navigate(-1) : navigate('/')}
            className="text-sm text-gray-500 dark:text-lago-400 hover:text-lago-600 dark:hover:text-lago-300 font-medium mb-4 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Grid3x3 className="w-5 h-5 text-lago-600 dark:text-lago-400" />
            <span className="text-lago-600 dark:text-lago-400 font-bold text-sm uppercase tracking-widest">Browse</span>
          </div>
          
        </div>

        {/* Tab switcher */}
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex gap-0 border-b border-gray-200 dark:border-lago-800">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'home'
                  ? 'border-lago-600 text-lago-600 dark:text-lago-400 dark:border-lago-400'
                  : 'border-transparent text-gray-500 dark:text-lago-500 hover:text-gray-700 dark:hover:text-lago-300'
              }`}
            >
              <Home className="w-4 h-4" />
              Home & Entertainment
            </button>
            <button
              onClick={() => setActiveTab('gaming')}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'gaming'
                  ? 'border-lago-600 text-lago-600 dark:text-lago-400 dark:border-lago-400'
                  : 'border-transparent text-gray-500 dark:text-lago-500 hover:text-gray-700 dark:hover:text-lago-300'
              }`}
            >
              <Zap className="w-4 h-4" />
              Gaming & Computing
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-10">

        {/* ── HOME & ENTERTAINMENT tab ── */}
        {activeTab === 'home' && (
          <>
            {/* Department cards */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">
                  Shop by Department
                </h2>
                <Link to="/shop/home" className="flex items-center gap-1.5 text-sm font-semibold text-lago-600 dark:text-lago-400 hover:text-lago-800 dark:hover:text-white transition-colors">
                  All products <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="aspect-[4/3] bg-gray-200 dark:bg-lago-800 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {categoryHeads.map((head, i) => {
                    const subCats = categoryMap.get(head) || [];
                    return (
                      <motion.div
                        key={head}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link
                          to={`/shop/home?categoryHead=${encodeURIComponent(head)}`}
                          className="group block bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl overflow-hidden hover:border-lago-400 dark:hover:border-lago-500 hover:shadow-lg transition-all duration-300"
                        >
                          {/* ✅ White background on product image — no blue overlay */}
                          <div className="relative aspect-[4/3] bg-white dark:bg-gray-100 overflow-hidden">
                            {categoryImages[head] ? (
                              <SafeImage
                                src={categoryImages[head]}
                                alt={head}
                                className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-108 transition-transform duration-500"
                                fallbackClassName="bg-transparent border-none"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Grid3x3 className="w-10 h-10 text-gray-300" />
                              </div>
                            )}
                            {/* Subtle bottom fade only */}
                            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
                            {/* Explore button on hover */}
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-7 h-7 rounded-full bg-lago-600 flex items-center justify-center shadow">
                                <ArrowRight className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          </div>
                          <div className="p-3.5">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-lago-600 dark:group-hover:text-lago-400 transition-colors leading-snug">
                              {head}
                            </h3>
                            <p className="text-xs text-gray-400 dark:text-lago-500 mt-0.5">
                              {subCats.length > 0 ? `${subCats.length} sub-categor${subCats.length === 1 ? 'y' : 'ies'}` : 'View products'}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sub-categories */}
            {categoryHeads.length > 0 && !isLoading && (
              <div className="mb-12">
                <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-6">All Sub-Categories</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {categories.map((cat, i) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <Link
                        to={`/shop/home?category=${encodeURIComponent(cat.name)}`}
                        className="group flex flex-col items-center text-center p-4 bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl hover:border-lago-400 dark:hover:border-lago-500 hover:shadow-md transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl bg-lago-50 dark:bg-lago-800 flex items-center justify-center mb-2 group-hover:bg-lago-100 dark:group-hover:bg-lago-700 transition-colors">
                          <Grid3x3 className="w-4 h-4 text-lago-600 dark:text-lago-400" />
                        </div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-lago-600 dark:group-hover:text-lago-400 transition-colors leading-snug">
                          {cat.name}
                        </p>
                        {cat.parent_id && (
                          <p className="text-[10px] text-gray-400 dark:text-lago-500 mt-0.5">{cat.parent_id}</p>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── GAMING & COMPUTING tab ── */}
        {activeTab === 'gaming' && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">
                Gaming & Computing Categories
              </h2>
              <Link to="/shop/tech" className="flex items-center gap-1.5 text-sm font-semibold text-lago-600 dark:text-lago-400 hover:text-lago-800 dark:hover:text-white transition-colors">
                All products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {syntechLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] bg-gray-200 dark:bg-lago-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {syntechCats.map((cat, i) => {
                  const displayName = SYNTECH_CATEGORY_NAMES[cat.name] ?? cat.name;
                  return (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        to={`/shop/tech?category=${encodeURIComponent(cat.name)}`}
                        className="group block bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl overflow-hidden hover:border-lago-400 dark:hover:border-lago-500 hover:shadow-lg transition-all duration-300"
                      >
                        {/* Product image from category — fetch first product image */}
                        <div className="relative aspect-[4/3] bg-white dark:bg-gray-100 overflow-hidden flex items-center justify-center p-6">
                          <div className="w-full h-full flex items-center justify-center">
                            <CategoryImage categoryName={cat.name} />
                          </div>
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-7 h-7 rounded-full bg-lago-600 flex items-center justify-center shadow">
                              <ArrowRight className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="p-3.5">
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-lago-600 dark:group-hover:text-lago-400 transition-colors leading-snug">
                            {displayName}
                          </h3>
                          <p className="text-xs text-gray-400 dark:text-lago-500 mt-0.5">
                            {cat.count} product{cat.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CTA ── */}
        <div className="rounded-3xl bg-gradient-to-r from-lago-900 to-[#0a141d] border border-lago-700 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
              Can't find what you're looking for?
            </h2>
            <p className="text-lago-300">Search across all our products from top tech brands.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link
              to="/shop/home"
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-lago-800 font-bold transition-colors hover:bg-lago-50 shadow-lg"
            >
              <Home className="w-4 h-4" /> Home & Entertainment
            </Link>
            <Link
              to="/shop/tech"
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-lago-600 hover:bg-lago-500 text-white font-bold transition-colors shadow-lg"
            >
              <Zap className="w-4 h-4" /> Gaming & Computing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
