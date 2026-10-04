import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Eye, 
  X, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  Printer, 
  Filter 
} from 'lucide-react';
import { Order } from '../../types';
import { updateOrderStatus } from '../../services/storeService';
import { useCart } from '../../context/CartContext';

interface OrderManagementProps {
  orders: Order[];
  onRefreshOrders: () => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({
  orders,
  onRefreshOrders,
}) => {
  const { showToast } = useCart();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchCust = o.customerName.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q);
      if (!matchNum && !matchCust) return false;
    }
    return true;
  });

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}`, 'success');
      onRefreshOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating order status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

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
    <div className="space-y-6">
      
      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, customer name, email..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium uppercase tracking-wider capitalize whitespace-nowrap cursor-pointer transition-all ${
                statusFilter === st
                  ? 'bg-[#1A1A18] text-white shadow-xs'
                  : 'bg-white border border-[#E5E0D8] text-zinc-600 hover:border-zinc-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#EFECE6] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600">
            <thead className="bg-[#FAF8F5] text-[11px] uppercase tracking-wider text-zinc-500 font-semibold border-b border-[#EFECE6]">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    No customer orders found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-zinc-900">
                      {ord.orderNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900">{ord.customerName}</div>
                      <div className="text-[11px] text-zinc-400">{ord.customerEmail}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-zinc-800">
                        {ord.items.reduce((acc, i) => acc + i.quantity, 0)} units
                      </span>
                      <div className="text-[10px] text-zinc-400">({ord.items.length} titles)</div>
                    </td>

                    <td className="py-3.5 px-4 font-serif text-sm font-semibold text-zinc-900">
                      ${ord.total}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        ord.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value as Order['status'])}
                        disabled={updatingId === ord.id}
                        className="py-1 px-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-lg text-xs font-semibold capitalize focus:outline-none focus:border-[#B89047]"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 text-zinc-400 hover:text-[#B89047] transition-colors"
                        title="View Detailed Order"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#EFECE6] p-6 sm:p-8 max-w-2xl w-full my-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#EFECE6]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#B89047]">
                  Order Dossier
                </span>
                <h3 className="font-serif text-2xl font-normal text-zinc-900">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Selector in Modal */}
            <div className="flex items-center justify-between bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFECE6]">
              <div>
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-semibold">
                  Fulfillment Status
                </span>
                <span className="text-xs text-zinc-700">Update status in customer tracking view:</span>
              </div>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as Order['status'])}
                className="py-1.5 px-3 bg-white border border-[#E5E0D8] rounded-xl text-xs font-semibold capitalize focus:outline-none focus:border-[#B89047]"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#FBFBF9] rounded-2xl border border-[#E5E0D8] space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B89047] block">
                  Customer
                </span>
                <div className="font-semibold text-zinc-900">{selectedOrder.customerName}</div>
                <div className="text-zinc-500">{selectedOrder.customerEmail}</div>
                <div className="text-zinc-500">{selectedOrder.customerPhone}</div>
              </div>

              <div className="p-4 bg-[#FBFBF9] rounded-2xl border border-[#E5E0D8] space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B89047] block">
                  Destination
                </span>
                <div>{selectedOrder.shippingAddress.street} {selectedOrder.shippingAddress.apartment}</div>
                <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</div>
                <div className="text-zinc-500">{selectedOrder.shippingAddress.country}</div>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-900 block">
                Purchased Pieces
              </span>
              <div className="divide-y divide-[#F2EFE9] border border-[#EFECE6] rounded-2xl p-4 bg-white">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3">
                    <img src={it.image} alt={it.productName} className="w-12 h-12 rounded-lg object-cover border border-zinc-200" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-zinc-900 truncate">{it.productName}</div>
                      {it.variantName && (
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                          {it.variantColorCode && (
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                              style={{ backgroundColor: it.variantColorCode }}
                            />
                          )}
                          <span>Variant: <strong>{it.variantName}</strong></span>
                        </div>
                      )}
                      <div className="text-[10px] text-zinc-400 font-mono">SKU: {it.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif text-sm font-semibold text-zinc-900">
                        ${it.price * it.quantity}
                      </div>
                      <div className="text-[10px] text-zinc-400">{it.quantity} × ${it.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 text-xs text-zinc-600 pt-2 border-t border-[#EFECE6]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${selectedOrder.subtotal}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-[#8F6C26]">
                  <span>Discount ({selectedOrder.discountCode || 'PROMO'})</span>
                  <span>-${selectedOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${selectedOrder.shipping}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-zinc-900 pt-2 border-t border-[#F2EFE9]">
                <span className="font-serif text-lg">Total</span>
                <span className="font-serif text-xl font-bold">${selectedOrder.total}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-[#1A1A18] hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
