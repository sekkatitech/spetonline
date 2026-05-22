import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Grid3x3 } from 'lucide-react';
import { useCategories, useCategoryHeads } from '../lib/api';
import { SafeImage } from '../components/SafeImage';

export function CategoriesPage() {
  const { categories, loading } = useCategories();
  const { categoryHeads, categoryImages, loading: headsLoading } = useCategoryHeads();
  const navigate = useNavigate();

  const [deptPage, setDeptPage] = useState(1);
  const [subPage, setSubPage] = useState(1);

  // Group categories by CategoryHead
  const categoryMap = new Map<string, typeof categories>();
  for (const cat of categories) {
    const head = cat.parent_id || 'Other';
    if (!categoryMap.has(head)) categoryMap.set(head, []);
    categoryMap.get(head)!.push(cat);
  }

  const isLoading = loading || headsLoading;

  const deptPerPage = 10;
  const totalDeptPages = Math.ceil(categoryHeads.length / deptPerPage);
  const currentDepts = categoryHeads.slice((deptPage - 1) * deptPerPage, deptPage * deptPerPage);

  const subPerPage = 18;
  const totalSubPages = Math.ceil(categories.length / subPerPage);
  const currentSubs = categories.slice((subPage - 1) * subPerPage, subPage * subPerPage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pt-32 md:pt-36 pb-20 transition-colors duration-300">

      {/* Hero */}
      <section className="relative overflow-hidden mb-12">
        <div className="absolute inset-0">
          <img src="/images/store-hero.png" alt="Categories" className="w-full h-full object-cover opacity-30 dark:opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/90 dark:from-[#0a141d]/90 via-gray-50/70 dark:via-[#0a141d]/70 to-gray-50 dark:to-[#0a141d]" />
        </div>
        <div className="container mx-auto px-4 md:px-6 py-16 relative z-10">
          <button
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold text-gray-600 dark:text-lago-200 hover:bg-white/20 hover:border-lago-500 transition-all backdrop-blur-sm mb-4"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3 mb-4">
            <Grid3x3 className="w-5 h-5 text-lago-600 dark:text-lago-400" />
            <span className="text-lago-600 dark:text-lago-400 font-bold text-sm uppercase tracking-widest">Browse</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-gray-900 dark:text-white mb-4">
            All Categories
          </h1>
          <p className="text-gray-500 dark:text-lago-300 text-lg max-w-xl">
            Explore our full range of premium technology products — from cables and networking to laptops and smart devices.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6">

        {/* Department cards (CategoryHeads) */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Shop by Department</h2>
            <Link to="/shop" className="flex items-center gap-1.5 text-sm font-semibold text-lago-600 dark:text-lago-400 hover:text-lago-800 dark:hover:text-white transition-colors">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-gray-200 dark:bg-lago-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {currentDepts.map((head, i) => {
                const subCats = categoryMap.get(head) || [];
                return (
                  <motion.div
                    key={head}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      to={`/shop?categoryHead=${encodeURIComponent(head)}`}
                      className="group block bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl overflow-hidden hover:border-lago-400 dark:hover:border-lago-500 hover:shadow-xl dark:hover:shadow-lago-900/50 transition-all duration-300"
                    >
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-lago-600 to-lago-900 overflow-hidden">
                        {categoryImages[head] && (
                          <SafeImage
                            src={categoryImages[head]}
                            alt={head}
                            className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                            fallbackClassName="bg-transparent border-none dark:bg-transparent dark:border-none p-0"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow">
                            <ArrowRight className="w-4 h-4 text-lago-600" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3.5">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-lago-600 dark:group-hover:text-lago-400 transition-colors">
                          {head}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-lago-500 mt-0.5">
                          {subCats.length} sub-categor{subCats.length === 1 ? 'y' : 'ies'}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination for Departments */}
          {!isLoading && totalDeptPages > 1 && (
            <div className="flex justify-center mt-8 gap-2 flex-wrap">
              {Array.from({ length: totalDeptPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setDeptPage(i + 1)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    deptPage === i + 1 
                      ? 'bg-lago-600 text-white' 
                      : 'bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 text-gray-600 dark:text-lago-300 hover:border-lago-500'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sub-categories list */}
        {categoryHeads.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-8">All Sub-Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {currentSubs.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Link
                    to={`/shop?category=${encodeURIComponent(cat.name)}`}
                    className="group flex flex-col items-center text-center p-4 bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl hover:border-lago-400 dark:hover:border-lago-500 hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-lago-50 dark:bg-lago-800 flex items-center justify-center mb-3 group-hover:bg-lago-100 dark:group-hover:bg-lago-700 transition-colors">
                      <Grid3x3 className="w-5 h-5 text-lago-600 dark:text-lago-400" />
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-lago-600 dark:group-hover:text-lago-400 transition-colors leading-snug">{cat.name}</p>
                    {cat.parent_id && <p className="text-[10px] text-gray-400 dark:text-lago-500 mt-0.5">{cat.parent_id}</p>}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            {/* Pagination for SubCategories */}
            {totalSubPages > 1 && (
              <div className="flex justify-center mt-8 gap-2 flex-wrap">
                {Array.from({ length: totalSubPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSubPage(i + 1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      subPage === i + 1 
                        ? 'bg-lago-600 text-white' 
                        : 'bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 text-gray-600 dark:text-lago-300 hover:border-lago-500'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Browse all CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-lago-900 to-[#0a141d] border border-lago-700 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
              Can't find what you're looking for?
            </h2>
            <p className="text-lago-300">Search across all our products from top tech brands.</p>
          </div>
          <Link
            to="/shop"
            className="flex-shrink-0 flex items-center gap-2 px-8 py-4 rounded-full bg-lago-600 hover:bg-lago-500 text-white font-bold transition-colors shadow-lg shadow-lago-900/40"
          >
            Browse All Products <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
