import React, { useState } from 'react';
import { 
  Trash2, 
  Heart, 
  ArrowRight, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Tag, 
  Check,
  RotateCcw
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ViewMode } from '../../types';

interface CartPageProps {
  onNavigate: (view: ViewMode) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    itemCount,
    shipping,
    freeShippingThreshold,
    discount,
    discountCode,
    applyPromoCode,
    removePromoCode,
    grandTotal,
    toggleWishlist,
    isInWishlist,
  } = useCart();

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoMsg, setPromoMsg] = useState<{ text: string; error: boolean } | null>(null);

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    const res = applyPromoCode(promoCodeInput);
    if (res.success) {
      setPromoMsg({ text: res.message, error: false });
      setPromoCodeInput('');
    } else {
      setPromoMsg({ text: res.message, error: true });
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-[#F4F1EA] flex items-center justify-center mx-auto mb-6 text-[#B89047]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-900 mb-3">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-zinc-500 text-sm max-w-md mx-auto mb-8 font-light">
          Your bag awaits exceptional culinary cutlery, sensorial candles, and crafted pantry goods.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-8 py-4 bg-[#1A1A18] text-white hover:bg-zinc-800 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer shadow-md"
        >
          Explore Storefront
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title & Item Count */}
      <div className="mb-8 pb-4 border-b border-[#EFECE6] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#B89047]">
            Review Selections
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-900 mt-1">
            Shopping Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Items</span>
        </button>
      </div>

      {/* Free Shipping Alert Bar */}
      <div className="bg-[#FAF7F0] border border-[#DFBA73]/40 rounded-2xl p-4 sm:p-5 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-2">
          {amountToFreeShipping > 0 ? (
            <span className="text-zinc-700">
              Add <strong className="text-zinc-900 font-bold">${amountToFreeShipping}</strong> more to qualify for complimentary white-glove shipping.
            </span>
          ) : (
            <span className="text-[#8F6C26] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#B89047]" />
              Complimentary White-Glove Shipping Unlocked!
            </span>
          )}
          <span className="text-zinc-400">{progressPercent}% of $100 goal</span>
        </div>
        <div className="w-full h-2 bg-[#EFECE6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#B89047] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Cart Items (Left) + Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Cart Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="divide-y divide-[#EFECE6] bg-white rounded-3xl border border-[#EFECE6] shadow-xs overflow-hidden">
            {items.map((item) => {
              const favorited = isInWishlist(item.productId);
              return (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-24 h-24 rounded-2xl object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-900 truncate">
                      {item.productName}
                    </h3>

                    {/* Variant Snapshot */}
                    {item.selectedVariant && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                        {item.selectedVariant.colorCode && (
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: item.selectedVariant.colorCode }}
                          />
                        )}
                        <span>Option: <strong>{item.selectedVariant.name}</strong></span>
                        {item.selectedVariant.size && (
                          <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-[10px] text-zinc-700 font-semibold border border-zinc-200">
                            {item.selectedVariant.size}
                          </span>
                        )}
                        <span className="text-zinc-300">|</span>
                        <span className="font-mono text-[11px]">SKU: {item.selectedVariant.sku}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => toggleWishlist(item.productId)}
                        className={`text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                          favorited ? 'text-[#B89047]' : 'text-zinc-400 hover:text-zinc-700'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-[#B89047]' : ''}`} />
                        <span>{favorited ? 'Saved in Wishlist' : 'Save for Later'}</span>
                      </button>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-zinc-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Quantity & Pricing */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F4F1EA]">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-[#E5E0D8] rounded-xl bg-[#FBFBF9] p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded-lg text-xs"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold text-xs text-zinc-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded-lg text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    {/* Price Calculation */}
                    <div className="text-right">
                      <div className="font-serif text-lg font-semibold text-zinc-900">
                        ${item.price * item.quantity}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        ${item.price} each
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => onNavigate('shop')}
              className="text-xs font-semibold uppercase tracking-wider text-[#B89047] hover:underline flex items-center gap-2 cursor-pointer"
            >
              <span>← Continue Shopping</span>
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl border border-[#EFECE6] p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="font-serif text-xl font-normal text-zinc-900 pb-3 border-b border-[#EFECE6]">
              Order Summary
            </h2>

            {/* Promo Code Input */}
            <div>
              {discountCode ? (
                <div className="flex items-center justify-between bg-[#F8F6F0] p-3 rounded-xl border border-[#DFBA73]/50 text-xs text-[#8F6C26]">
                  <div className="flex items-center gap-2 font-medium">
                    <Tag className="w-4 h-4" />
                    <span>Applied: <strong>{discountCode}</strong></span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-zinc-500 hover:text-red-500 underline text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder="Promo Code (ZARORAT10)"
                      className="flex-1 px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs uppercase focus:outline-none focus:border-[#B89047]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#1A1A18] text-white text-xs font-semibold rounded-xl hover:bg-zinc-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMsg && (
                    <p className={`text-xs ${promoMsg.error ? 'text-red-500' : 'text-emerald-600'}`}>
                      {promoMsg.text}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-xs text-zinc-600 border-t border-[#F2EFE9] pt-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-zinc-900">${subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#8F6C26] font-medium">
                  <span>Promotion Discount</span>
                  <span>-${discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>White-Glove Shipping</span>
                <span>{shipping === 0 ? <strong className="text-emerald-700">Complimentary</strong> : `$${shipping}`}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-zinc-900 pt-3 border-t border-[#F2EFE9]">
                <span className="font-serif text-lg">Total Amount</span>
                <span className="font-serif text-xl font-bold text-zinc-900">${grandTotal}</span>
              </div>
            </div>

            {/* Primary Checkout CTA */}
            <button
              onClick={() => onNavigate('checkout')}
              className="w-full py-4 px-6 bg-[#1A1A18] hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all cursor-pointer group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#DFBA73] group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Assurance Guarantees */}
            <div className="space-y-2.5 pt-4 border-t border-[#F2EFE9] text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B89047] shrink-0" />
                <span>256-bit bank-grade SSL security</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#B89047] shrink-0" />
                <span>Hassle-free 30-day returns policy</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
