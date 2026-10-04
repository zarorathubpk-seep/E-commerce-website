import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Layers, 
  FolderTree, 
  LogOut, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck,
  Plus
} from 'lucide-react';
import { Product, Category, Order, ViewMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ProductManagement } from './ProductManagement';
import { OrderManagement } from './OrderManagement';
import { InventoryManagement } from './InventoryManagement';
import { CategoryManagement } from './CategoryManagement';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  onRefreshData: () => void;
  onNavigate: (view: ViewMode, param?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  orders,
  onRefreshData,
  onNavigate,
}) => {
  const { user, logout, adminEmail } = useAuth();
  const { showToast } = useCart();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'inventory' | 'categories'>('overview');

  // Inactivity auto sign-out after 30 minutes (1,800,000 ms)
  useEffect(() => {
    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
    let timerId: NodeJS.Timeout;

    const handleTimeout = async () => {
      try {
        await logout();
      } catch (err) {
        console.warn('Logout error on inactivity:', err);
      }
      showToast('Signed out automatically after 30 minutes of inactivity.', 'info');
      onNavigate('home');
    };

    const resetTimer = () => {
      clearTimeout(timerId);
      timerId = setTimeout(handleTimeout, INACTIVITY_TIMEOUT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timerId);
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
    };
  }, [logout, onNavigate, showToast]);

  // Calculated Metrics
  const totalSales = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.total : 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock < 10).length;

  const recentOrders = orders.slice(0, 5);
  const recentProducts = products.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      
      {/* Admin Top Navigation Bar */}
      <header className="bg-[#1A1A18] text-white border-b border-zinc-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Title */}
            <div className="flex items-center gap-3">
              <span className="font-serif text-xl tracking-[0.16em] font-normal uppercase text-white">
                Zarorat Hub
              </span>
              <span className="text-[10px] tracking-[0.2em] text-[#DFBA73] font-semibold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
                ADMIN CONSOLE
              </span>
            </div>

            {/* User & Storefront Links */}
            <div className="flex items-center gap-4 text-xs">
              <button
                onClick={() => onNavigate('home')}
                className="hidden sm:flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors"
              >
                <span>Client Storefront</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#DFBA73]" />
              </button>

              <span className="text-zinc-600 hidden sm:inline">|</span>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-zinc-300 text-[11px] truncate max-w-[150px]">
                  {user?.email || adminEmail}
                </span>
              </div>

              <button
                onClick={async () => {
                  await logout();
                  onNavigate('home');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-red-950/60 hover:text-red-300 text-zinc-300 rounded-xl transition-colors cursor-pointer border border-zinc-700 hover:border-red-900 font-medium text-xs"
                title="Sign out of Admin Console"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60">
          <nav className="flex items-center gap-1 sm:gap-4 overflow-x-auto py-2 no-scrollbar text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all font-medium ${
                activeTab === 'overview'
                  ? 'bg-zinc-800 text-[#DFBA73]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all font-medium ${
                activeTab === 'products'
                  ? 'bg-zinc-800 text-[#DFBA73]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products ({totalProducts})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all font-medium ${
                activeTab === 'orders'
                  ? 'bg-zinc-800 text-[#DFBA73]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders ({totalOrders})</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all font-medium ${
                activeTab === 'inventory'
                  ? 'bg-zinc-800 text-[#DFBA73]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Inventory {lowStockCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500" />}</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all font-medium ${
                activeTab === 'categories'
                  ? 'bg-zinc-800 text-[#DFBA73]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Departments</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Top Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white rounded-3xl border border-[#EFECE6] p-6 shadow-xs">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider">Gross Revenue</span>
                  <div className="p-2 rounded-xl bg-[#FAF5EB] text-[#B89047]">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif text-3xl font-semibold text-zinc-900">
                  ${totalSales.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Real-time settled orders</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#EFECE6] p-6 shadow-xs">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider">Total Orders</span>
                  <div className="p-2 rounded-xl bg-[#FAF5EB] text-[#B89047]">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif text-3xl font-semibold text-zinc-900">
                  {totalOrders}
                </div>
                <div className="text-[11px] text-zinc-500 mt-2">
                  Across all global destinations
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#EFECE6] p-6 shadow-xs">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider">Active Catalog</span>
                  <div className="p-2 rounded-xl bg-[#FAF5EB] text-[#B89047]">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif text-3xl font-semibold text-zinc-900">
                  {totalProducts}
                </div>
                <div className="text-[11px] text-zinc-500 mt-2">
                  Curated across 4 luxury departments
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#EFECE6] p-6 shadow-xs">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider">Low Stock Alert</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif text-3xl font-semibold text-amber-700">
                  {lowStockCount}
                </div>
                <div className="text-[11px] text-amber-600 mt-2">
                  Units below 10 remaining threshold
                </div>
              </div>

            </div>

            {/* Split Grid: Recent Orders & Catalog Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Recent Orders Table */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-[#EFECE6] p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F4F1EA]">
                  <h3 className="font-serif text-xl font-medium text-zinc-900">
                    Recent Customer Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#B89047] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-[#F2EFE9]">
                  {recentOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-400">
                      No customer orders have been recorded yet.
                    </div>
                  ) : (
                    recentOrders.map((ord) => (
                      <div key={ord.id} className="py-3.5 first:pt-0 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-zinc-900">{ord.orderNumber}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize bg-zinc-100 text-zinc-700">
                              {ord.status}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5">
                            {ord.customerName} • {ord.items.length} items
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-serif text-sm font-semibold text-zinc-900">
                            ${ord.total}
                          </span>
                          <span className="text-[11px] text-zinc-400 block">
                            {new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions & Recent Inventory */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Shortcuts */}
                <div className="bg-white rounded-3xl border border-[#EFECE6] p-6 shadow-xs space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 mb-2">
                    Quick Operational Tools
                  </h4>

                  <button
                    onClick={() => setActiveTab('products')}
                    className="w-full py-2.5 px-4 bg-[#1A1A18] hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between cursor-pointer"
                  >
                    <span>Add New Product</span>
                    <Plus className="w-4 h-4 text-[#DFBA73]" />
                  </button>

                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="w-full py-2.5 px-4 bg-[#FBFBF9] hover:bg-zinc-100 border border-[#E5E0D8] text-zinc-800 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between cursor-pointer"
                  >
                    <span>Update Stock Counts</span>
                    <Layers className="w-4 h-4 text-[#B89047]" />
                  </button>
                </div>

                {/* Top Stock items */}
                <div className="bg-white rounded-3xl border border-[#EFECE6] p-6 shadow-xs space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 mb-2">
                    Catalog Highlights
                  </h4>
                  <div className="divide-y divide-[#F2EFE9]">
                    {recentProducts.map((p) => (
                      <div key={p.id} className="py-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-zinc-200" />
                          <span className="font-medium text-zinc-900 truncate">{p.name}</span>
                        </div>
                        <span className="font-serif font-semibold text-zinc-900 shrink-0">${p.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* PRODUCTS MANAGEMENT TAB */}
        {activeTab === 'products' && (
          <ProductManagement
            products={products}
            categories={categories}
            onRefreshProducts={onRefreshData}
          />
        )}

        {/* ORDERS MANAGEMENT TAB */}
        {activeTab === 'orders' && (
          <OrderManagement
            orders={orders}
            onRefreshOrders={onRefreshData}
          />
        )}

        {/* INVENTORY MANAGEMENT TAB */}
        {activeTab === 'inventory' && (
          <InventoryManagement
            products={products}
            onRefreshProducts={onRefreshData}
          />
        )}

        {/* CATEGORIES MANAGEMENT TAB */}
        {activeTab === 'categories' && (
          <CategoryManagement
            categories={categories}
            onRefreshCategories={onRefreshData}
          />
        )}

      </main>

    </div>
  );
};
