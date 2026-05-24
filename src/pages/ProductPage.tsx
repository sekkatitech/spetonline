import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ChevronLeft, Star, Truck, ShieldCheck, RefreshCw, ZoomIn } from 'lucide-react';
import { fetchProductBySlug, useProducts, Product } from '../lib/api';
import { useCartStore } from '../lib/cartStore';
import { useAuth } from '../lib/AuthContext';
import { useWishlist } from '../lib/api';
import { ProductCard } from '../components/ProductSections';
import { SafeImage } from '../components/SafeImage';

const SA_PROVINCES = ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'];

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  const addItem = useCartStore((s) => s.addItem);
  const { user } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist(user?.id ?? null);

  // Related products — same category, limited to 4
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { products: related } = useProducts({ categories: category ? [category] : undefined, perPage: 5 });
  const relatedFiltered = related.filter((p) => p.id !== product?.id).slice(0, 4);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProductBySlug(slug).then(({ data }) => {
      setProduct(data);
      setCategory(data?.Category ?? undefined);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-44 md:pt-52 bg-gray-50 dark:bg-[#0a141d] transition-colors duration-300">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-lago-800 rounded-3xl" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-lago-800 rounded w-1/4" />
              <div className="h-8 bg-gray-200 dark:bg-lago-800 rounded w-3/4" />
              <div className="h-6 bg-gray-200 dark:bg-lago-800 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-44 md:pt-52 bg-gray-50 dark:bg-[#0a141d] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product not found</h2>
          <Link to="/shop" className="px-6 py-3 bg-lago-600 text-white rounded-full font-semibold hover:bg-lago-700 transition-colors">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage = product.image;
  const images: string[] = [primaryImage || '']; // Single image from data feed

  const inWishlist = wishlist.includes(product.id);
  const inStock = (product.AvailableQty ?? 0) > 0;
  const price = product.is_on_sale && product.sale_price ? product.sale_price : product.Price;
  const discount = product.is_on_sale && product.sale_price
    ? Math.round((1 - product.sale_price / product.Price) * 100)
    : 0;

  function handleAddToCart() {
    addItem({
      id: product.id,
      product_id: product.id,
      name: product.ProductName,
      brand: product.Brand ?? '',
      price,
      image: primaryImage,
      sku: product.ProductCode,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] transition-colors duration-300 pt-44 md:pt-52">
      <div className="container mx-auto px-4 md:px-6 py-8">

        {/* Back Button */}
        <button
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate('/shop');
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-700 text-sm font-semibold text-gray-600 dark:text-lago-200 hover:border-lago-500 hover:text-lago-600 dark:hover:text-white transition-all shadow-sm mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-lago-400 mb-8">
          <Link to="/" className="hover:text-lago-600 dark:hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-lago-600 dark:hover:text-white transition-colors">Shop</Link>
          {product.CategoryHead && (
            <>
              <span>/</span>
              <Link to={`/shop?categoryHead=${encodeURIComponent(product.CategoryHead)}`} className="hover:text-lago-600 dark:hover:text-white transition-colors">{product.CategoryHead}</Link>
            </>
          )}
          {product.Category && (
            <>
              <span>/</span>
              <Link to={`/shop?category=${encodeURIComponent(product.Category)}`} className="hover:text-lago-600 dark:hover:text-white transition-colors">{product.Category}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium line-clamp-1">{product.ProductName}</span>
        </nav>

        {/* Main product section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 mb-20">

          {/* Image gallery */}
          <div className="space-y-4">
            <div className="relative bg-white dark:bg-lago-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-lago-800 aspect-square group shadow-sm">
              <SafeImage
                src={images[selectedImage]}
                brand={product.Brand}
                alt={product.ProductName}
                className="w-full h-full object-contain p-6 md:p-10"
                referrerPolicy="no-referrer"
              />
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-lago-800/80 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-lago-200 flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5" /> {selectedImage + 1}/{images.length}
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-accent-orange text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  -{discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden bg-white dark:bg-lago-900 transition-all ${
                      selectedImage === i ? 'border-lago-500 shadow-md' : 'border-gray-200 dark:border-lago-800 hover:border-lago-400'
                    }`}
                  >
                    <SafeImage src={img} brand={product.Brand} alt={`View ${i + 1}`} className="w-full h-full object-contain p-1.5"
                      referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product details */}
          <div>
            {product.Brand && (
              <p className="text-sm font-bold text-lago-500 dark:text-lago-400 uppercase tracking-widest mb-2">{product.Brand}</p>
            )}
            <h1 className="text-2xl md:text-3xl xl:text-4xl font-display font-bold text-gray-900 dark:text-white leading-snug mb-4">
              {product.ProductName}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-lago-700'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-lago-300">(4.0) · No reviews yet</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-black text-gray-900 dark:text-white">
                R {price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </span>
              {product.is_on_sale && product.sale_price && (
                <span className="text-xl text-gray-400 line-through">
                  R {product.Price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 ${
              inStock ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              {inStock ? `In Stock (${product.AvailableQty ?? '—'} available)` : 'Out of Stock'}
            </div>

            {/* SKU & Condition */}
            <div className="flex items-center gap-4 mb-6">
              <p className="text-xs text-gray-400 dark:text-lago-500">SKU: {product.ProductCode}</p>
              {product.Condition && (
                <p className="text-xs text-gray-400 dark:text-lago-500">Condition: {product.Condition}</p>
              )}
            </div>

            {/* Quantity + actions */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-gray-300 dark:border-lago-700 rounded-xl overflow-hidden bg-white dark:bg-lago-900">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center text-gray-600 dark:text-lago-200 hover:bg-gray-100 dark:hover:bg-lago-800 transition-colors font-bold text-lg">−</button>
                <span className="w-12 text-center text-gray-900 dark:text-white font-bold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-11 h-11 flex items-center justify-center text-gray-600 dark:text-lago-200 hover:bg-gray-100 dark:hover:bg-lago-800 transition-colors font-bold text-lg">+</button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 h-11 flex items-center justify-center gap-2 rounded-xl font-bold transition-all text-sm ${
                  added ? 'bg-green-500 text-white' :
                  inStock ? 'bg-lago-600 hover:bg-lago-700 text-white shadow-lg shadow-lago-600/20' :
                  'bg-gray-200 dark:bg-lago-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {added ? 'Added to Cart!' : inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-11 h-11 flex items-center justify-center rounded-xl border-2 transition-all ${
                  inWishlist ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-gray-300 dark:border-lago-700 text-gray-500 dark:text-lago-300 hover:border-red-400 hover:text-red-500'
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-8 py-5 border-y border-gray-200 dark:border-lago-800">
              {[
                { icon: Truck, label: 'Nationwide Delivery', sub: '3–7 business days' },
                { icon: ShieldCheck, label: 'Manufacturer Warranty', sub: 'As per product' },
                { icon: RefreshCw, label: '7-Day Returns', sub: 'Hassle-free' },
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-lago-50 dark:bg-lago-800 flex items-center justify-center">
                    <badge.icon className="w-5 h-5 text-lago-600 dark:text-lago-400" />
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{badge.label}</p>
                  <p className="text-[10px] text-gray-500 dark:text-lago-400">{badge.sub}</p>
                </div>
              ))}
            </div>

            {/* Category & Brand tags */}
            <div className="flex flex-wrap gap-2">
              {product.CategoryHead && (
                <Link to={`/shop?categoryHead=${encodeURIComponent(product.CategoryHead)}`} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-lago-800 text-xs font-semibold text-gray-600 dark:text-lago-200 hover:bg-lago-100 dark:hover:bg-lago-700 transition-colors">
                  {product.CategoryHead}
                </Link>
              )}
              {product.Category && (
                <Link to={`/shop?category=${encodeURIComponent(product.Category)}`} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-lago-800 text-xs font-semibold text-gray-600 dark:text-lago-200 hover:bg-lago-100 dark:hover:bg-lago-700 transition-colors">
                  {product.Category}
                </Link>
              )}
              {product.Brand && (
                <Link to={`/shop?brand=${encodeURIComponent(product.Brand)}`} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-lago-800 text-xs font-semibold text-gray-600 dark:text-lago-200 hover:bg-lago-100 dark:hover:bg-lago-700 transition-colors">
                  {product.Brand}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tabs: Description / Specs */}
        <div className="mb-20">
          <div className="flex border-b border-gray-200 dark:border-lago-800 mb-8">
            {(['description', 'specs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3.5 text-sm font-bold capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-lago-600 text-lago-600 dark:text-lago-400'
                    : 'border-transparent text-gray-500 dark:text-lago-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab === 'specs' ? 'Specifications' : tab}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="prose dark:prose-invert max-w-3xl text-gray-700 dark:text-lago-100 leading-relaxed text-sm md:text-base">
              {product.ProductDescription ? (
                <div dangerouslySetInnerHTML={{ __html: product.ProductDescription }} />
              ) : product.ProductSummary ? (
                <p>{product.ProductSummary}</p>
              ) : (
                <p className="text-gray-500 dark:text-lago-400 italic">No detailed description available for this product. Please contact us for more information.</p>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Product Code', product.ProductCode],
                    ['Brand', product.Brand],
                    ['Category', product.Category],
                    ['Condition', product.Condition],
                    product.LengthCM ? ['Length', `${product.LengthCM} cm`] : null,
                    product.WidthCM ? ['Width', `${product.WidthCM} cm`] : null,
                    product.HeightCM ? ['Height', `${product.HeightCM} cm`] : null,
                    product.MassKG ? ['Weight', `${product.MassKG} kg`] : null,
                    product.ShippingProductClass ? ['Shipping Class', product.ShippingProductClass] : null,
                  ].filter(Boolean).map((spec, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50 dark:bg-lago-900/50' : 'bg-white dark:bg-transparent'}`}>
                      <td className="py-3 px-4 font-semibold text-gray-700 dark:text-lago-200 w-1/3 rounded-l-lg">{spec![0]}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-lago-100 rounded-r-lg">{spec![1] || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Related products */}
        {relatedFiltered.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-lago-600 dark:text-lago-400 font-bold text-xs uppercase tracking-widest mb-1">You may also like</p>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white">Related Products</h2>
              </div>
              <Link to={`/shop?category=${encodeURIComponent(product.Category || '')}`} className="text-sm font-semibold text-lago-600 dark:text-lago-400 hover:text-lago-800 dark:hover:text-white transition-colors flex items-center gap-1">
                View All <ChevronLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedFiltered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
