import { motion } from 'motion/react';
import { Heart, ShoppingCart, Star, ArrowRight, Eye, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts, useCategories, useCategoryHeads, Product } from '../lib/api';
import { useCartStore } from '../lib/cartStore';
import { useAuth } from '../lib/AuthContext';
import { useWishlist } from '../lib/api';
import { useState } from 'react';
import { SafeImage } from './SafeImage';

// ─── Shared Product Card ──────────────────────────────────────────────────────

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const { user } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist(user?.id ?? null);
  const [added, setAdded] = useState(false);

  const primaryImage = product.image;
  const inWishlist = wishlist.includes(product.id);
  const inStock = (product.AvailableQty ?? 0) > 0;
  const price = product.is_on_sale && product.sale_price ? product.sale_price : product.Price;
  const brand = product.Brand ?? '';

  function handleAddToCart(e: any) {
    e.preventDefault();
    addItem({
      id: product.id,
      product_id: product.id,
      name: product.ProductName,
      brand,
      price,
      image: primaryImage || '',
      sku: product.ProductCode,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group bg-white dark:bg-lago-900 rounded-2xl border border-gray-200 dark:border-lago-800 overflow-hidden hover:border-lago-400 dark:hover:border-lago-600 hover:shadow-xl dark:hover:shadow-lago-900/50 transition-all duration-300 flex flex-col"
    >
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden bg-gray-50 dark:bg-lago-800/50 aspect-square">
        <SafeImage
          src={primaryImage}
          brand={brand}
          alt={product.ProductName}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_on_sale && (
            <span className="bg-accent-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full">SALE</span>
          )}
          {product.is_featured && (
            <span className="bg-lago-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">FEATURED</span>
          )}
          {!inStock && (
            <span className="bg-gray-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">OUT OF STOCK</span>
          )}
        </div>
        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white dark:bg-lago-800 border border-gray-200 dark:border-lago-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:scale-110"
          aria-label="Add to wishlist"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-lago-300'}`} />
        </button>
        {/* Quick view overlay */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-center gap-1 bg-white/90 dark:bg-lago-800/90 backdrop-blur-sm rounded-xl py-1.5 text-xs font-semibold text-gray-700 dark:text-lago-100">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </div>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        {brand && <p className="text-xs font-semibold text-lago-500 dark:text-lago-400 uppercase tracking-wide mb-1">{brand}</p>}
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-2 line-clamp-2 hover:text-lago-600 dark:hover:text-lago-400 transition-colors">
            {product.ProductName}
          </h3>
        </Link>

        {/* Rating placeholder */}
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className={`w-3 h-3 ${s <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-lago-700'}`} />
          ))}
          <span className="text-xs text-gray-500 dark:text-lago-400 ml-1">(4.0)</span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              R {price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
            </p>
            {product.is_on_sale && product.sale_price && (
              <p className="text-xs text-gray-400 line-through">
                R {product.Price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              added
                ? 'bg-green-500 text-white scale-95'
                : inStock
                ? 'bg-lago-600 hover:bg-lago-700 text-white'
                : 'bg-gray-200 dark:bg-lago-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {added ? 'Added!' : inStock ? 'Add' : 'N/A'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Product Grid Skeleton ────────────────────────────────────────────────────

export function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-lago-900 rounded-2xl border border-gray-200 dark:border-lago-800 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200 dark:bg-lago-800" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 dark:bg-lago-800 rounded w-1/3" />
        <div className="h-4 bg-gray-200 dark:bg-lago-800 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-lago-800 rounded w-3/4" />
        <div className="flex justify-between items-center mt-4">
          <div className="h-5 bg-gray-200 dark:bg-lago-800 rounded w-1/3" />
          <div className="h-8 w-16 bg-gray-200 dark:bg-lago-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Featured Products ─────────────────────────────────────────────────────────

export function FeaturedProducts() {
  const { products, loading } = useProducts({ sortBy: 'newest', perPage: 8 });

  return (
    <section className="py-20 bg-white dark:bg-[#0a141d] transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-lago-600 dark:text-lago-400 font-bold text-sm uppercase tracking-widest mb-2">Handpicked for You</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white">Featured Products</h2>
          </div>
          <Link to="/shop?sort=featured" className="hidden md:flex items-center gap-2 text-sm font-semibold text-lago-600 dark:text-lago-400 hover:text-lago-800 dark:hover:text-white transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)
          }
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-lago-500 text-lago-600 dark:text-lago-400 font-semibold hover:bg-lago-50 dark:hover:bg-lago-800 transition-colors">
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Featured Categories ──────────────────────────────────────────────────────

export function FeaturedCategories() {
  const { categories, loading } = useCategories();
  // Group by CategoryHead for display, take the first 6 unique CategoryHeads
  const categoryHeadsMap = new Map<string, string[]>();
  for (const cat of categories) {
    const head = cat.parent_id || 'Other';
    if (!categoryHeadsMap.has(head)) categoryHeadsMap.set(head, []);
    categoryHeadsMap.get(head)!.push(cat.name);
  }
  const displayHeads = [...categoryHeadsMap.keys()].slice(0, 6);

  return (
    <section className="py-20 bg-gray-50 dark:bg-lago-900 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-lago-600 dark:text-lago-400 font-bold text-sm uppercase tracking-widest mb-2">Explore</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white">Shop by Category</h2>
          </div>
          <Link to="/categories" className="hidden md:flex items-center gap-2 text-sm font-semibold text-lago-600 dark:text-lago-400 hover:text-lago-800 dark:hover:text-white transition-colors">
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-lago-800 rounded-2xl animate-pulse" />
              ))
            : displayHeads.map((head, i) => (
                <motion.div
                  key={head}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    to={`/shop?categoryHead=${encodeURIComponent(head)}`}
                    className="group block rounded-2xl overflow-hidden relative aspect-square border border-gray-200 dark:border-lago-800 hover:border-lago-500 dark:hover:border-lago-500 transition-all shadow-sm hover:shadow-lg bg-gradient-to-br from-lago-600 to-lago-900"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-0 right-0 text-center px-2">
                      <p className="text-white font-bold text-sm drop-shadow">{head}</p>
                      <p className="text-lago-200 text-[10px] mt-0.5">{categoryHeadsMap.get(head)?.length || 0} sub-categories</p>
                    </div>
                  </Link>
                </motion.div>
              ))
          }
        </div>
      </div>
    </section>
  );
}

// ─── Best Sellers ─────────────────────────────────────────────────────────────

export function BestSellers() {
  const { products, loading } = useProducts({ sortBy: 'price_asc', perPage: 4 });

  return (
    <section className="py-20 bg-gray-50 dark:bg-[#0a141d] transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-accent-orange font-bold text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Top Sellers
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white">Customer Favourites</h2>
          </div>
          <Link to="/shop?sort=newest" className="hidden md:flex items-center gap-2 text-sm font-semibold text-lago-600 dark:text-lago-400 hover:text-lago-800 dark:hover:text-white transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </div>
    </section>
  );
}
