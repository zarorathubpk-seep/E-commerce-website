import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Clock, 
  ChevronRight, 
  ArrowRight, 
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';
import { Order, ViewMode } from '../../types';
import { getOrders } from '../../services/storeService';
import { useAuth } from '../../context/AuthContext';

interface MyOrdersPageProps {
  onNavigate: (view: ViewMode, param?: string) => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState(user?.email || '');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    getOrders().then(all => {
      setOrders(all);
      setLoading(false);
    });
  }, []);

  const filteredOrders = searchEmail.trim()
    ? orders.filter(o => 
        o.customerEmail.toLowerCase().includes(searchEmail.toLowerCase()) ||
        o.orderNumber.toLowerCase().includes(searchEmail.toLowerCase())
      )
    : orders;

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Delivered</span>;
      case 'shipped':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">Shipped</span>;
      case 'processing':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">Processing</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">Confirmed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">Pending</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-[#EFECE6] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#B89047]">
            Client History
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-900 mt-1">
            Orders & Acquisitions
          </h1>
        </div>

        {/* Search by email/order number */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Search email or AUR-..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#B89047] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-zinc-500 text-xs">Loading order ledger...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border border-[#EFECE6] p-8 text-center shadow-xs">
          <Package className="w-12 h-12 text-[#B89047] mx-auto mb-3" />
          <h3 className="font-serif text-xl font-medium text-zinc-900 mb-1">
            No orders found
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
            We could not find any placed orders matching your query. Place your first acquisition from our collection.
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-2.5 bg-[#1A1A18] text-white text-xs font-semibold rounded-xl"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-3xl border border-[#EFECE6] p-6 shadow-xs hover:border-[#B89047]/60 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F1EA]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF5EB] border border-[#DFBA73]/40 flex items-center justify-center text-[#B89047] shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-semibold text-zinc-900 block">
                      {ord.orderNumber}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Placed on {new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {getStatusBadge(ord.status)}
                  <span className="font-serif text-base font-semibold text-zinc-900">
                    ${ord.total}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ord.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-[#FBFBF9] border border-[#EFECE6]">
                    <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-lg object-cover border border-zinc-200" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-zinc-900 truncate">{item.productName}</h4>
                      {item.variantName && (
                        <div className="text-[10px] text-zinc-500">Color: {item.variantName}</div>
                      )}
                      <div className="text-[10px] text-zinc-400">Qty: {item.quantity} • ${item.price}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-zinc-500">
                  Recipient: <strong>{ord.shippingAddress.fullName}</strong> ({ord.shippingAddress.city}, {ord.shippingAddress.state})
                </span>
                <button
                  onClick={() => onNavigate('order-confirmation', ord.id)}
                  className="text-[#B89047] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>View Full Tracking Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
