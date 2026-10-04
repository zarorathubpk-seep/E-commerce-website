import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Tag, 
  Check, 
  ShieldCheck 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ViewMode } from '../../types';

interface CartDrawerProps {
  onNavigate: (view: ViewMode) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    itemCount,
    shipping,
    freeShippingThreshold,
    discount,
    discountCode,
    applyPromoCode,
    removePromoCode,
    grandTotal,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isDrawerOpen) return null;

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setPromoError('');
      setPromoInput('');
    }
  };

  const handleCheckoutClick = () => {
    setIsDrawerOpen(false);
    onNavigate('checkout');
  };

  const handleFullCartClick = () => {
    setIsDrawerOpen(false);
    onNavigate('cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FBFBF9] shadow-2xl flex flex-col justify-between border-l border-[#EFECE6] animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-[#EFECE6] bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#B89047]" />
                <h2 className="text-base font-medium tracking-wide uppercase text-zinc-900 font-serif">
                  Shopping Bag ({itemCount})
                </h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="mt-4 pt-4 border-t border-[#F2EFE9]">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                {amountToFreeShipping > 0 ? (
                  <span className="text-zinc-600">
                    Add <strong className="text-zinc-900">${amountToFreeShipping}</strong> more for complimentary delivery
                  </span>
                ) : (
                  <span className="text-[#B89047] flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    You unlocked Complimentary White-Glove Shipping!
                  </span>
                )}
                <span className="text-zinc-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#EFECE6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B89047] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-[#F2EFE9] flex items-center justify-center text-zinc-400 mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-1 text-[#B89047]" />
                </div>
                <h3 className="font-serif text-lg font-medium text-zinc-900 mb-1">
                  Your Bag is Empty
                </h3>
                <p className="text-xs text-zinc-500 max-w-xs mb-6">
                  Explore our curated collections of artisanal knives, kitchenware, and sensorial home accessories.
                </p>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onNavigate('shop');
                  }}
                  className="px-6 py-2.5 bg-[#1A1A18] text-white text-xs font-semibold rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 bg-white rounded-xl border border-[#EFECE6] shadow-xs"
                >
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-20 h-20 rounded-lg object-cover bg-zinc-100 shrink-0 border border-zinc-200"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-semibold text-zinc-900 line-clamp-1">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant Badge */}
                      {item.selectedVariant && (
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-500">
                          {item.selectedVariant.colorCode && (
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-zinc-300 inline-block shrink-0"
                              style={{ backgroundColor: item.selectedVariant.colorCode }}
                            />
                          )}
                          <span>{item.selectedVariant.name}</span>
                          {item.selectedVariant.size && (
                            <span className="bg-zinc-100 px-1.5 py-0.2 rounded text-[10px] text-zinc-700 font-semibold border border-zinc-200">
                              {item.selectedVariant.size}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F7F6F2]">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#E5E0D8] rounded-lg bg-[#FBFBF9]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-zinc-600 hover:bg-zinc-100 rounded-l-lg"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-zinc-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="w-6 h-6 flex items-center justify-center text-xs text-zinc-600 hover:bg-zinc-100 rounded-r-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-sm font-semibold font-serif text-zinc-900">
                          ${item.price * item.quantity}
                        </span>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-zinc-400">
                            (${item.price} each)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Totals & CTA */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-[#EFECE6] space-y-4">
              
              {/* Promo Code Input */}
              <div>
                {discountCode ? (
                  <div className="flex items-center justify-between bg-[#F8F6F0] p-2.5 rounded-xl border border-[#DFBA73]/40 text-xs text-[#8A6A24]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Promotion Applied: <strong>{discountCode}</strong></span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-zinc-500 hover:text-red-500 text-[11px] underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value); setPromoError(''); }}
                      placeholder="Promo Code (e.g. ZARORAT10)"
                      className="flex-1 px-3 py-2 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs uppercase focus:outline-none focus:border-[#B89047]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-[#1A1A18] text-white text-xs font-semibold rounded-xl hover:bg-zinc-800 transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoError && (
                  <p className="text-[11px] text-red-500 mt-1">{promoError}</p>
                )}
              </div>

              {/* Summary Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-600 border-t border-[#F2EFE9] pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">${subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#8A6A24] font-medium">
                    <span>Discount</span>
                    <span>-${discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span>{shipping === 0 ? <strong className="text-emerald-700">Free</strong> : `$${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-zinc-900 pt-2 border-t border-[#F2EFE9]">
                  <span className="font-serif text-base">Grand Total</span>
                  <span className="font-serif text-base font-bold">${grandTotal}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3.5 px-4 bg-[#1A1A18] hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#DFBA73]" />
                </button>

                <button
                  onClick={handleFullCartClick}
                  className="w-full py-2.5 text-center text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  View Full Cart & Summary
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B89047]" />
                <span>Guaranteed Safe & Encrypted Checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
