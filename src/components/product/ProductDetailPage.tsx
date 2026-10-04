import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Star, 
  ShoppingBag, 
  Check, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles, 
  Share2, 
  CheckCircle2,
  Plus,
  ArrowRight,
  Zap,
  Clock
} from 'lucide-react';
import { Product, ProductVariant, ViewMode } from '../../types';
import { useCart } from '../../context/CartContext';
import { ProductCard } from './ProductCard';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onNavigate: (view: ViewMode, param?: string) => void;
  onSelectCategory: (cat: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onNavigate,
  onSelectCategory,
}) => {
  const { addToCart, wishlist, toggleWishlist, setIsDrawerOpen, showToast } = useCart();

  // Initialize selected variant
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );

  // Active displayed main image
  const [activeImage, setActiveImage] = useState<string>(
    selectedVariant?.image || product.images[0]
  );

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    selectedVariant?.size || undefined
  );

  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'shipping'>('overview');
  const [isAdding, setIsAdding] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // When variant changes: update image, check quantity against available variant stock
  useEffect(() => {
    if (selectedVariant) {
      if (selectedVariant.image) {
        setActiveImage(selectedVariant.image);
      }
      if (selectedVariant.size) {
        setSelectedSize(selectedVariant.size);
      }
      if (quantity > selectedVariant.stock) {
        setQuantity(Math.max(1, selectedVariant.stock));
      }
    }
  }, [selectedVariant]);

  // When product prop changes
  useEffect(() => {
    const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : undefined;
    setSelectedVariant(firstVariant);
    setActiveImage(firstVariant?.image || product.images[0]);
    setSelectedSize(firstVariant?.size || undefined);
    setQuantity(1);
  }, [product]);

  const isFavorited = wishlist.includes(product.id);
  const currentPrice = selectedVariant?.price !== undefined ? selectedVariant.price : product.price;
  const comparePrice = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentSku = selectedVariant?.sku || product.sku;

  const discountPercent = comparePrice && comparePrice > currentPrice
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : product.flashDiscount || null;

  // Build gallery images: active variant image first, plus base product images
  const galleryImages = Array.from(new Set([
    selectedVariant?.image || product.images[0],
    ...product.images,
    ...(selectedVariant?.images || [])
  ])).filter(Boolean);

  // Color variants list
  const colorVariants = product.variants?.filter(v => v.colorCode || v.color) || product.variants || [];

  // Available unique sizes if defined
  const availableSizes = Array.from(new Set(
    product.variants?.map(v => v.size).filter(Boolean) as string[]
  ));

  const handleVariantSelect = (v: ProductVariant) => {
    setSelectedVariant(v);
    if (v.image) {
      setActiveImage(v.image);
    }
    if (v.size) {
      setSelectedSize(v.size);
    }
  };

  const handleSizeSelect = (sz: string) => {
    setSelectedSize(sz);
    // Find variant with this size if exists
    const matching = product.variants.find(v => v.size === sz && (!selectedVariant?.color || v.color === selectedVariant.color));
    if (matching) {
      handleVariantSelect(matching);
    }
  };

  const handleAddToCart = () => {
    if (currentStock <= 0) return;
    setIsAdding(true);
    addToCart(product, selectedVariant, quantity);
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const handleBuyNow = () => {
    if (currentStock <= 0) return;
    addToCart(product, selectedVariant, quantity);
    setIsDrawerOpen(false);
    onNavigate('checkout');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Product link copied to clipboard', 'info');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Related products from same category
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  // Frequently bought together companion
  const companionProduct = allProducts.find(p => p.id !== product.id && p.category === product.category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6 overflow-x-auto whitespace-nowrap">
        <button 
          onClick={() => onNavigate('home')} 
          className="hover:text-zinc-900 transition-colors"
        >
          Marketplace
        </button>
        <span>/</span>
        <button 
          onClick={() => { onSelectCategory(product.category); onNavigate('shop'); }} 
          className="hover:text-zinc-900 capitalize transition-colors"
        >
          {product.category.replace('-', ' & ')}
        </button>
        <span>/</span>
        <span className="text-zinc-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Left: Gallery Section */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Stage Image */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#F7F6F2] border border-[#EFECE6] shadow-xs">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-500"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isFlashSale && (
                <span className="px-3 py-1 bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-full shadow-md flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>Flash Deal</span>
                </span>
              )}
              {product.bestseller && !product.isFlashSale && (
                <span className="px-3 py-1 bg-[#1A1A18] text-[#DFBA73] text-xs font-semibold uppercase tracking-wider rounded-full shadow-md">
                  Bestseller
                </span>
              )}
              {discountPercent && (
                <span className="px-2.5 py-1 bg-[#B89047] text-white text-xs font-bold rounded-full shadow-md w-fit">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Quick Share and Wishlist Buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/85 hover:bg-white text-zinc-700 shadow-xs transition-all cursor-pointer"
                title="Share product"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-full transition-all shadow-xs cursor-pointer ${
                  isFavorited ? 'bg-[#B89047] text-white' : 'bg-white/85 hover:bg-white text-zinc-700'
                }`}
                title={isFavorited ? 'Saved to Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Thumbnails Carousel */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
              {galleryImages.map((img, idx) => {
                const isActive = activeImage === img;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-[#F7F6F2] border-2 transition-all shrink-0 cursor-pointer ${
                      isActive 
                        ? 'border-[#B89047] ring-2 ring-[#B89047]/20 scale-105' 
                        : 'border-[#EFECE6] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Details */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
              <span className="uppercase tracking-widest text-[#B89047] font-bold">
                {product.brand ? `${product.brand} • ` : ''}{product.subcategory}
              </span>
              <span className="font-mono text-zinc-400">SKU: {currentSku}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-3 mt-2.5">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-zinc-800">{product.rating}</span>
              <span className="text-zinc-400 text-xs">({product.reviewCount} customer reviews)</span>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="font-serif text-3xl font-semibold text-zinc-900">
                ${currentPrice}
              </span>
              {comparePrice && (
                <span className="text-base text-zinc-400 line-through">
                  ${comparePrice}
                </span>
              )}
              {discountPercent && comparePrice && (
                <span className="text-xs font-semibold text-[#8F6C26] bg-[#FAF5EB] px-2.5 py-1 rounded-full border border-[#DFBA73]/50">
                  Save ${comparePrice - currentPrice} ({discountPercent}%)
                </span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
            {product.shortDescription}
          </p>

          <hr className="border-[#EFECE6]" />

          {/* CRITICAL VARIATION SELECTOR: COLOR VARIATIONS */}
          {colorVariants.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-900 uppercase tracking-wider">
                  Color Option:{' '}
                  <strong className="text-[#8F6C26] font-bold">
                    {selectedVariant?.name || 'Default'}
                  </strong>
                </span>
                <span className="text-zinc-500 text-[11px]">
                  {currentStock > 0 ? (
                    <span className="text-emerald-700 font-medium">● {currentStock} in stock</span>
                  ) : (
                    <span className="text-rose-600 font-medium">● Out of stock</span>
                  )}
                </span>
              </div>

              {/* Color Swatch Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {colorVariants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleVariantSelect(v)}
                      className={`group relative flex items-center gap-2 p-1.5 pr-3 rounded-full border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#B89047] bg-[#FAF7F0] ring-2 ring-[#B89047]/30 shadow-xs' 
                          : 'border-zinc-200 bg-white hover:border-zinc-400'
                      }`}
                      title={v.name}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/10 shadow-inner shrink-0"
                        style={{ backgroundColor: v.colorCode || '#888' }}
                      />
                      <span className="text-xs font-medium text-zinc-800">
                        {v.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional Size / Capacity Selector */}
          {availableSizes.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-900">
                Select Size / Specification:
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => handleSizeSelect(sz)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase border transition-all cursor-pointer ${
                      selectedSize === sz
                        ? 'border-[#B89047] bg-[#FAF5EB] text-[#8F6C26] ring-1 ring-[#B89047]'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Stock Limits */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Quantity:
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#E5E0D8] rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded-lg text-sm"
                >
                  -
                </button>
                <span className="w-10 text-center font-semibold text-xs text-zinc-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock}
                  className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-zinc-500">
                {currentStock > 0 ? (
                  <>Max {currentStock} units available</>
                ) : (
                  <span className="text-red-500 font-medium">Currently Sold Out</span>
                )}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={currentStock <= 0 || isAdding}
              className={`w-full py-4 px-6 rounded-xl text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer ${
                currentStock <= 0
                  ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                  : isAdding
                    ? 'bg-[#B89047] text-white'
                    : 'bg-[#1A1A18] hover:bg-zinc-800 text-white'
              }`}
            >
              {isAdding ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Shopping Bag</span>
                </>
              ) : currentStock <= 0 ? (
                <span>Sold Out</span>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#DFBA73]" />
                  <span>Add to Shopping Bag • ${(currentPrice * quantity)}</span>
                </>
              )}
            </button>

            {currentStock > 0 && (
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 rounded-xl text-xs font-semibold uppercase tracking-widest bg-[#DFBA73] hover:bg-[#c9a159] text-[#1A1A18] transition-all cursor-pointer shadow-xs"
              >
                Instant Buy Now
              </button>
            )}
          </div>

          {/* Assurance Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#EFECE6] text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#B89047] shrink-0" />
              <span>Free delivery on orders over $75</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#B89047] shrink-0" />
              <span>30-Day hassle-free returns</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B89047] shrink-0" />
              <span>100% Verified genuine brand</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B89047] shrink-0" />
              <span>Official manufacturer warranty</span>
            </div>
          </div>

        </div>
      </div>

      {/* Frequently Bought Together Bundle */}
      {companionProduct && (
        <div className="mt-16 p-6 sm:p-8 bg-white rounded-3xl border border-[#EFECE6] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B89047] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Marketplace Pairing</span>
          </div>
          <h3 className="font-serif text-2xl font-normal text-zinc-900 mb-6">
            Frequently Bought Together
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {/* Primary Item */}
              <div className="flex items-center gap-3">
                <img src={activeImage} alt={product.name} className="w-16 h-16 rounded-xl object-cover border border-zinc-200" />
                <div>
                  <div className="text-xs font-medium text-zinc-900 line-clamp-1 max-w-[180px]">{product.name}</div>
                  <div className="text-xs font-serif font-semibold text-zinc-900">${currentPrice}</div>
                </div>
              </div>

              <div className="text-zinc-400 font-bold text-lg">+</div>

              {/* Companion Item */}
              <div className="flex items-center gap-3">
                <img src={companionProduct.images[0]} alt={companionProduct.name} className="w-16 h-16 rounded-xl object-cover border border-zinc-200" />
                <div>
                  <div className="text-xs font-medium text-zinc-900 line-clamp-1 max-w-[180px]">{companionProduct.name}</div>
                  <div className="text-xs font-serif font-semibold text-zinc-900">${companionProduct.price}</div>
                </div>
              </div>
            </div>

            {/* Bundle Action */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              <div>
                <span className="text-[11px] text-zinc-400 block">Combined Price</span>
                <span className="font-serif text-xl font-bold text-zinc-900">
                  ${currentPrice + companionProduct.price}
                </span>
              </div>
              <button
                onClick={() => {
                  addToCart(product, selectedVariant, 1);
                  addToCart(companionProduct, companionProduct.variants?.[0], 1);
                  showToast('Added bundle items to your shopping bag!', 'success');
                }}
                className="px-5 py-3 bg-[#1A1A18] hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#DFBA73]" />
                <span>Add Both to Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Section: Specifications, Overview, Shipping */}
      <div className="mt-14 bg-white rounded-3xl border border-[#EFECE6] p-6 sm:p-10 shadow-xs">
        <div className="flex items-center gap-6 border-b border-[#EFECE6] pb-4 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`text-xs font-semibold uppercase tracking-wider pb-1 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'text-[#B89047] border-b-2 border-[#B89047]'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`text-xs font-semibold uppercase tracking-wider pb-1 transition-all cursor-pointer ${
              activeTab === 'specifications'
                ? 'text-[#B89047] border-b-2 border-[#B89047]'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`text-xs font-semibold uppercase tracking-wider pb-1 transition-all cursor-pointer ${
              activeTab === 'shipping'
                ? 'text-[#B89047] border-b-2 border-[#B89047]'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Shipping & Warranty
          </button>
        </div>

        <div className="text-zinc-700 text-xs sm:text-sm leading-relaxed max-w-3xl">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <p>{product.description}</p>
              <p className="text-zinc-500 text-xs">
                Sourced and distributed through Zarorat Hub authorized brand channels. Every purchase includes full manufacturer packaging, authentic barcodes, and verified quality seals.
              </p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(product.specifications || {}).map(([key, val]) => (
                <div key={key} className="p-3 bg-[#FBFBF9] rounded-xl border border-[#EFECE6]">
                  <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-0.5">
                    {key}
                  </span>
                  <span className="text-xs font-medium text-zinc-900">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3 text-xs leading-relaxed">
              <p>
                <strong>Express Courier Dispatch:</strong> Dispatched from regional fulfillment hubs within 24 hours. Transit time is 2–4 business days with end-to-end GPS courier tracking.
              </p>
              <p>
                <strong>30-Day Hassle-Free Returns:</strong> Items may be returned within 30 days of arrival in original packaging for replacement or 100% store refund.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#EFECE6]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#B89047]">
                Similar Marketplace Products
              </span>
              <h2 className="font-serif text-3xl font-normal text-zinc-900 mt-1">
                Customers Also Viewed
              </h2>
            </div>
            <button
              onClick={() => {
                onSelectCategory(product.category);
                onNavigate('shop');
              }}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#B89047] hover:underline"
            >
              <span>View Department</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onOpenDetail={(slug) => {
                  onNavigate('product-detail', slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
