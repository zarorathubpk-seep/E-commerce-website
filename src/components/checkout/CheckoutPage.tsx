import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  Banknote, 
  Building2, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../services/storeService';
import { ViewMode, Order, ShippingAddress } from '../../types';

interface CheckoutPageProps {
  onNavigate: (view: ViewMode, param?: string) => void;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderPlaced }) => {
  const { items, subtotal, shipping, discount, discountCode, grandTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'transfer'>('card');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvc: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-3xl font-medium text-zinc-900 mb-3">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-zinc-500 text-sm mb-6">
          Please add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-3 bg-[#1A1A18] text-white text-xs font-semibold rounded-xl uppercase tracking-wider"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const calculatedShipping = shippingMethod === 'express' ? shipping + 18 : shipping;
  const finalTotal = subtotal - discount + calculatedShipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Form validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.street || !formData.city || !formData.postalCode) {
      setErrorMsg('Please complete all required shipping and contact fields.');
      return;
    }

    if (!formData.email.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingAddress: ShippingAddress = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        street: formData.street,
        apartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      };

      const orderItems = items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        productSlug: i.productSlug,
        variantId: i.selectedVariant?.id,
        variantName: i.selectedVariant?.name,
        variantColorCode: i.selectedVariant?.colorCode,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        sku: i.selectedVariant?.sku || 'AUR-SKU',
      }));

      // Create Order in Firestore and decrement stock
      const order = await createOrder({
        customerEmail: formData.email,
        customerName: formData.fullName,
        customerPhone: formData.phone,
        shippingAddress,
        items: orderItems,
        subtotal,
        shipping: calculatedShipping,
        discount,
        discountCode: discountCode || undefined,
        total: finalTotal,
        paymentMethod: paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'cod' ? 'Pay on Delivery' : 'Direct Bank Wire',
        paymentStatus: paymentMethod === 'card' ? 'paid' : 'pending',
        status: 'pending',
      });

      // Clear cart
      clearCart();

      // Trigger confirmation
      onOrderPlaced(order);
      onNavigate('order-confirmation', order.id);
    } catch (err: any) {
      console.error('Order placement failure:', err);
      setErrorMsg(err.message || 'There was an issue processing your order. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="mb-8 pb-4 border-b border-[#EFECE6] flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#B89047]">
            Secure Checkout
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-900 mt-1">
            Shipping & Payment
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Contact Information */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFECE6] shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-medium text-zinc-900 pb-2 border-b border-[#F4F1EA]">
              1. Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Lady Vivienne Montgomery"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vivienne@domain.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Phone Number (for courier dispatch) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 234-5678"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFECE6] shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-medium text-zinc-900 pb-2 border-b border-[#F4F1EA]">
              2. Delivery Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="740 Park Avenue"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Apartment, Suite, or Penthouse (optional)
                </label>
                <input
                  type="text"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleChange}
                  placeholder="Suite 14B"
                  className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="New York"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="NY"
                    className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Postal / ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="10021"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="France">France</option>
                  <option value="Japan">Japan</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Shipping Options */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFECE6] shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-medium text-zinc-900 pb-2 border-b border-[#F4F1EA]">
              3. Delivery Method
            </h2>
            <div className="space-y-3">
              <label 
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  shippingMethod === 'standard' 
                    ? 'border-[#B89047] bg-[#FAF7F0]' 
                    : 'border-[#E5E0D8] hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="accent-[#B89047]"
                  />
                  <div>
                    <div className="text-xs font-semibold text-zinc-900">
                      Standard White-Glove Courier (2–4 Business Days)
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Carbon-neutral transit with signature verification
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-zinc-900">
                  {shipping === 0 ? 'Complimentary' : `$${shipping}`}
                </span>
              </label>

              <label 
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  shippingMethod === 'express' 
                    ? 'border-[#B89047] bg-[#FAF7F0]' 
                    : 'border-[#E5E0D8] hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className="accent-[#B89047]"
                  />
                  <div>
                    <div className="text-xs font-semibold text-zinc-900">
                      Priority Express Courier (1–2 Business Days)
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Next-flight-out priority handling & live GPS tracking
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-zinc-900">
                  ${shipping + 18}
                </span>
              </label>
            </div>
          </div>

          {/* 4. Payment Method */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFECE6] shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-medium text-zinc-900 pb-2 border-b border-[#F4F1EA]">
              4. Payment Method
            </h2>

            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-[#B89047] bg-[#FAF7F0] text-zinc-900'
                    : 'border-[#E5E0D8] text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-[#B89047]" />
                <span className="text-[11px] font-semibold block">Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-[#B89047] bg-[#FAF7F0] text-zinc-900'
                    : 'border-[#E5E0D8] text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <Banknote className="w-5 h-5 mx-auto mb-1 text-[#B89047]" />
                <span className="text-[11px] font-semibold block">Pay on Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'transfer'
                    ? 'border-[#B89047] bg-[#FAF7F0] text-zinc-900'
                    : 'border-[#E5E0D8] text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <Building2 className="w-5 h-5 mx-auto mb-1 text-[#B89047]" />
                <span className="text-[11px] font-semibold block">Bank Wire</span>
              </button>
            </div>

            {/* Card Inputs */}
            {paymentMethod === 'card' && (
              <div className="p-4 bg-[#FBFBF9] rounded-2xl border border-[#EFECE6] space-y-3">
                <div className="flex justify-between items-center text-xs text-zinc-500 mb-1">
                  <span>Card Information</span>
                  <span className="text-[10px] text-zinc-400">Sandbox Test Mode Ready</span>
                </div>

                <div>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardData.cardNumber}
                    onChange={handleCardChange}
                    placeholder="4532 •••• •••• 8921"
                    maxLength={19}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E0D8] rounded-xl text-xs font-mono focus:outline-none focus:border-[#B89047]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="expiry"
                    value={cardData.expiry}
                    onChange={handleCardChange}
                    placeholder="MM / YY"
                    maxLength={5}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E0D8] rounded-xl text-xs font-mono focus:outline-none focus:border-[#B89047]"
                  />
                  <input
                    type="text"
                    name="cvc"
                    value={cardData.cvc}
                    onChange={handleCardChange}
                    placeholder="CVC (3 digits)"
                    maxLength={4}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E0D8] rounded-xl text-xs font-mono focus:outline-none focus:border-[#B89047]"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="p-4 bg-[#FAF7F0] rounded-2xl border border-[#DFBA73]/40 text-xs text-zinc-700">
                You will be requested to settle the order total of <strong>${finalTotal}</strong> upon courier handover at your doorstep. Cash, card tap, and mobile wallets accepted.
              </div>
            )}

            {paymentMethod === 'transfer' && (
              <div className="p-4 bg-[#FAF7F0] rounded-2xl border border-[#DFBA73]/40 text-xs text-zinc-700">
                Direct wire instructions will be displayed on the confirmation receipt and dispatched to your email address.
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Order Summary Review */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFECE6] shadow-xs space-y-6 sticky top-28">
            <h2 className="font-serif text-xl font-medium text-zinc-900 pb-3 border-b border-[#EFECE6]">
              Order Review ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>

            {/* Line Items Snapshot */}
            <div className="max-h-72 overflow-y-auto divide-y divide-[#F2EFE9] space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3.5">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-zinc-900 truncate">
                      {item.productName}
                    </h4>
                    {item.selectedVariant && (
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                          style={{ backgroundColor: item.selectedVariant.colorCode || '#888' }}
                        />
                        <span>{item.selectedVariant.name}</span>
                      </div>
                    )}
                    <span className="text-[11px] text-zinc-400">Qty: {item.quantity}</span>
                  </div>
                  <div className="font-serif text-sm font-semibold text-zinc-900">
                    ${item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-[#EFECE6] text-xs text-zinc-600">
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
                <span>Shipping ({shippingMethod === 'standard' ? 'Standard' : 'Express'})</span>
                <span>{calculatedShipping === 0 ? <strong className="text-emerald-700">Complimentary</strong> : `$${calculatedShipping}`}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-zinc-900 pt-3 border-t border-[#EFECE6]">
                <span className="font-serif text-lg">Total Due</span>
                <span className="font-serif text-xl font-bold text-zinc-900">${finalTotal}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-xl text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all cursor-pointer ${
                isSubmitting ? 'bg-zinc-400 text-white cursor-not-allowed' : 'bg-[#1A1A18] hover:bg-zinc-800 text-white'
              }`}
            >
              {isSubmitting ? (
                <span>Securing Your Order...</span>
              ) : (
                <>
                  <span>Place Order • ${finalTotal}</span>
                  <ArrowRight className="w-4 h-4 text-[#DFBA73]" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-[#B89047]" />
              <span>Full buyer protection & instant confirmation</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
