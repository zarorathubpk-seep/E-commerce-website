import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Printer, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Order, ViewMode } from '../../types';
import { getOrderById } from '../../services/storeService';

interface OrderConfirmationPageProps {
  orderId?: string;
  initialOrder?: Order | null;
  onNavigate: (view: ViewMode) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderId,
  initialOrder,
  onNavigate,
}) => {
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder && !!orderId);

  useEffect(() => {
    if (!initialOrder && orderId) {
      getOrderById(orderId).then((res) => {
        if (res) setOrder(res);
        setLoading(false);
      });
    }
  }, [orderId, initialOrder]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#B89047] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-zinc-600 text-sm">Retrieving your order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-3xl font-medium text-zinc-900 mb-3">
          Order Summary Unavailable
        </h2>
        <p className="text-zinc-500 text-sm mb-6">
          We could not find records for this order ID. You can track orders using your email address.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 bg-[#1A1A18] text-white text-xs font-semibold rounded-xl"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const steps = [
    { label: 'Order Placed', status: 'completed', desc: 'Received & Queued' },
    { label: 'Atelier Processing', status: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'completed' : order.status === 'confirmed' ? 'active' : 'pending', desc: 'Inspected & Wrapped' },
    { label: 'In Transit', status: order.status === 'shipped' || order.status === 'delivered' ? 'completed' : order.status === 'processing' ? 'active' : 'pending', desc: 'With Courier' },
    { label: 'Delivered', status: order.status === 'delivered' ? 'completed' : 'pending', desc: 'At Your Door' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Success Banner */}
      <div className="bg-white rounded-3xl border border-[#EFECE6] p-8 sm:p-12 text-center shadow-xs mb-10">
        <div className="w-16 h-16 rounded-full bg-[#FAF5EB] border border-[#DFBA73]/50 flex items-center justify-center mx-auto mb-4 text-[#B89047]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-widest text-[#B89047]">
          Acquisition Confirmed
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-900 mt-1 mb-2">
          Thank you for choosing Zarorat Hub
        </h1>
        <p className="text-zinc-600 text-sm max-w-md mx-auto leading-relaxed">
          Your order has been recorded in our atelier ledger. A full receipt with tracking coordinates has been dispatched to <strong>{order.customerEmail}</strong>.
        </p>

        {/* Order Details Header Pill */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 bg-[#FBFBF9] border border-[#E5E0D8] px-6 py-3 rounded-2xl text-xs text-zinc-700">
          <div>
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-semibold">Order ID</span>
            <strong className="font-mono text-zinc-900 text-sm">{order.orderNumber}</strong>
          </div>
          <span className="text-zinc-300 hidden sm:inline">|</span>
          <div>
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-semibold">Date Placed</span>
            <span>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <span className="text-zinc-300 hidden sm:inline">|</span>
          <div>
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-semibold">Status</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize bg-amber-50 text-amber-800 border border-amber-200">
              {order.status}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white rounded-3xl border border-[#EFECE6] p-6 sm:p-8 mb-10 shadow-xs">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-900 mb-6">
          Fulfillment Timeline
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {steps.map((st, idx) => {
            const isCompleted = st.status === 'completed';
            const isActive = st.status === 'active';
            return (
              <div key={st.label} className="flex flex-col items-center text-center space-y-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted 
                    ? 'bg-[#B89047] text-white shadow-xs' 
                    : isActive 
                      ? 'bg-amber-100 text-[#8F6C26] ring-2 ring-[#B89047]' 
                      : 'bg-zinc-100 text-zinc-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <div>
                  <div className={`text-xs font-semibold ${isCompleted || isActive ? 'text-zinc-900' : 'text-zinc-400'}`}>
                    {st.label}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {st.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items & Shipping Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-10">
        
        {/* Ordered Items Table */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-[#EFECE6] p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-serif text-xl font-medium text-zinc-900 pb-3 border-b border-[#EFECE6]">
            Purchased Artifacts
          </h3>
          <div className="divide-y divide-[#F2EFE9] space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="pt-3 first:pt-0 flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-16 h-16 rounded-xl object-cover border border-zinc-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-zinc-900 truncate">
                    {item.productName}
                  </h4>
                  {item.variantName && (
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                      {item.variantColorCode && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                          style={{ backgroundColor: item.variantColorCode }}
                        />
                      )}
                      <span>Variation: <strong>{item.variantName}</strong></span>
                    </div>
                  )}
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Qty: {item.quantity} × ${item.price} • SKU: {item.sku}
                  </div>
                </div>
                <div className="font-serif text-sm font-semibold text-zinc-900">
                  ${item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-[#EFECE6] pt-4 space-y-2 text-xs text-zinc-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-zinc-900">${order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[#8F6C26] font-medium">
                <span>Discount {order.discountCode ? `(${order.discountCode})` : ''}</span>
                <span>-${order.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? <strong className="text-emerald-700">Complimentary</strong> : `$${order.shipping}`}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-zinc-900 pt-2 border-t border-[#F2EFE9]">
              <span className="font-serif text-lg">Total Paid</span>
              <span className="font-serif text-xl font-bold text-zinc-900">${order.total}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Summary */}
        <div className="md:col-span-5 bg-white rounded-3xl border border-[#EFECE6] p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#B89047] mb-3">
              Delivery Destination
            </h3>
            <div className="text-xs text-zinc-700 space-y-1">
              <p className="font-semibold text-zinc-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street} {order.shippingAddress.apartment}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="text-zinc-500 pt-1">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F4F1EA]">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#B89047] mb-2">
              Payment & Settlement
            </h3>
            <p className="text-xs text-zinc-700">
              Method: <strong>{order.paymentMethod}</strong>
            </p>
            <p className="text-xs text-zinc-500 capitalize">
              Payment Status: <strong>{order.paymentStatus}</strong>
            </p>
          </div>

          <div className="pt-4 border-t border-[#F4F1EA]">
            <button
              onClick={() => window.print()}
              className="w-full py-2.5 px-4 bg-[#FBFBF9] hover:bg-zinc-100 border border-[#E5E0D8] rounded-xl text-xs font-medium text-zinc-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Invoice</span>
            </button>
          </div>
        </div>

      </div>

      {/* Return to store button */}
      <div className="text-center">
        <button
          onClick={() => onNavigate('shop')}
          className="px-8 py-4 bg-[#1A1A18] hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold uppercase tracking-widest inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <span>Continue Exploring Catalog</span>
          <ArrowRight className="w-4 h-4 text-[#DFBA73]" />
        </button>
      </div>

    </div>
  );
};
