import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, Check, Zap } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (slug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  
  // Default to first variant if available
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isFavorited = wishlist.includes(product.id);
  const displayImage = selectedVariant?.image || product.images[0];
  const secondaryImage = product.images[1] || displayImage;
  const currentPrice = selectedVariant?.price !== undefined ? selectedVariant.price : product.price;
  const comparePrice = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const discountPercent = comparePrice && comparePrice > currentPrice
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : product.flashDiscount || null;

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, selectedVariant, 1);
    setTimeout(() => {
      setIsAdding(false);
    }, 1200);
  };

  const handleVariantClick = (e: React.MouseEvent, variant: ProductVariant) => {
    e.stopPropagation();
    setSelectedVariant(variant);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div 
      onClick={() => onOpenDetail(product.slug)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-white rounded-2xl border border-[#EFECE6] overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 cursor-pointer"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F7F6F2]">
        <img
          src={isHovered && !selectedVariant ? secondaryImage : displayImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isFlashSale && (
            <span className="px-2 py-0.5 bg-amber-500 text-black text-[9px] font-bold tracking-wider uppercase rounded-full shadow-sm flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 fill-black" />
              <span>Flash Deal</span>
            </span>
          )}
          {product.bestseller && !product.isFlashSale && (
            <span className="px-2.5 py-0.5 bg-[#1A1A18] text-[#DFBA73] text-[9px] font-semibold tracking-wider uppercase rounded-full shadow-sm">
              Bestseller
            </span>
          )}
          {product.newArrival && !product.bestseller && !product.isFlashSale && (
            <span className="px-2.5 py-0.5 bg-white/95 backdrop-blur-sm text-zinc-900 border border-zinc-200 text-[9px] font-semibold tracking-wider uppercase rounded-full shadow-sm">
              New
            </span>
          )}
          {discountPercent && (
            <span className="px-2 py-0.5 bg-[#B89047] text-white text-[9px] font-bold rounded-full w-fit">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isFavorited 
              ? 'bg-[#B89047] text-white' 
              : 'bg-white/80 hover:bg-white text-zinc-700 hover:text-zinc-900 shadow-sm'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorited ? 'fill-white' : ''}`} />
        </button>

        {/* Quick Add overlay button on hover */}
        <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={handleQuickAdd}
            disabled={currentStock <= 0 || isAdding}
            className={`w-full py-2 px-3 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer ${
              currentStock <= 0 
                ? 'bg-zinc-300 text-zinc-600 cursor-not-allowed'
                : isAdding
                  ? 'bg-[#B89047] text-white'
                  : 'bg-[#1A1A18] hover:bg-zinc-800 text-white'
            }`}
          >
            {isAdding ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : currentStock <= 0 ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#DFBA73]" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand & Subcategory & Rating */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span className="uppercase tracking-wider font-semibold text-zinc-500 truncate max-w-[120px]">
              {product.brand || product.subcategory}
            </span>
            <div className="flex items-center gap-1 text-amber-500 shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-zinc-700 text-[10px]">{product.rating}</span>
              <span className="text-zinc-400 text-[9px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-medium text-zinc-900 line-clamp-1 group-hover:text-[#B89047] transition-colors">
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5 font-light">
            {product.shortDescription}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#F2EFE9] flex items-center justify-between gap-1">
          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-semibold text-zinc-900 font-serif">
              ${currentPrice}
            </span>
            {comparePrice && (
              <span className="text-[11px] text-zinc-400 line-through">
                ${comparePrice}
              </span>
            )}
          </div>

          {/* Color Variation Swatches */}
          {product.variants && product.variants.length > 1 && (
            <div className="flex items-center gap-1 shrink-0" title="Color options">
              {product.variants.slice(0, 3).map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={(e) => handleVariantClick(e, v)}
                    className={`w-3 h-3 rounded-full border transition-all ${
                      isSelected 
                        ? 'ring-2 ring-[#B89047] ring-offset-1 scale-110' 
                        : 'border-zinc-300 hover:scale-110'
                    }`}
                    style={{ backgroundColor: v.colorCode || '#888' }}
                    title={v.name}
                    aria-label={v.name}
                  />
                );
              })}
              {product.variants.length > 3 && (
                <span className="text-[9px] text-zinc-400 font-mono">
                  +{product.variants.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
