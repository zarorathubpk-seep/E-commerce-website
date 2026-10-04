import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { HomePage } from './components/home/HomePage';
import { ShopPage } from './components/shop/ShopPage';
import { ProductDetailPage } from './components/product/ProductDetailPage';
import { CartPage } from './components/cart/CartPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderConfirmationPage } from './components/order/OrderConfirmationPage';
import { MyOrdersPage } from './components/order/MyOrdersPage';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { initializeStoreData, getProducts, getCategories, getOrders } from './services/storeService';
import { Product, Category, Order, ViewMode } from './types';
import { Sparkles, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ADMIN_EMAIL } from './config/admin';

const AppContent: React.FC = () => {
  const { toast } = useCart();
  const { user, isAdmin, loading: authLoading, logout } = useAuth();

  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize public store catalog from Firestore
  const loadStoreData = async () => {
    try {
      const init = await initializeStoreData();
      setProducts(init.products);
      setCategories(init.categories);
      if (isAdmin) {
        const fetchedOrders = await getOrders();
        setOrders(fetchedOrders);
      }
    } catch (e) {
      console.warn('Initialization error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, []);

  // When admin logs in, load orders securely
  useEffect(() => {
    if (isAdmin) {
      getOrders().then(setOrders).catch(console.warn);
    }
  }, [isAdmin]);

  // Route guard on user state changes
  useEffect(() => {
    if (currentView.startsWith('admin-')) {
      if (user && user.email && user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        // Requirement 3: If any other logged-in user tries to open the admin route, 
        // redirect them to the storefront with no hint that an admin panel exists.
        logout().finally(() => {
          setCurrentView('home');
          setViewParam(undefined);
        });
      } else if (!isAdmin && currentView !== 'admin-login') {
        setCurrentView('admin-login');
        setViewParam(undefined);
      }
    }
  }, [user, isAdmin, currentView, logout]);

  const handleNavigate = (view: ViewMode, param?: string) => {
    // If navigating to admin route
    if (view.startsWith('admin-')) {
      // Check if user is signed in with unauthorized email
      if (user && user.email && user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        logout().finally(() => {
          setCurrentView('home');
          setViewParam(undefined);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        return;
      }

      // If not fully verified admin
      if (!isAdmin && view !== 'admin-login') {
        setCurrentView('admin-login');
        setViewParam(undefined);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setCurrentView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderPlaced = (order: Order) => {
    setPlacedOrder(order);
    setOrders(prev => [order, ...prev]);
    // Refresh catalog stock in state
    getProducts().then(setProducts);
  };

  // Find active product for PDP
  const activeProduct = viewParam 
    ? products.find(p => p.slug === viewParam || p.id === viewParam)
    : undefined;

  // Determine if viewing an admin screen
  const isAdminView = currentView.startsWith('admin-') && currentView !== 'admin-login' && isAdmin;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#1A1A18] font-sans selection:bg-[#DFBA73]/30">
      
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-medium ${
            toast.type === 'error'
              ? 'bg-red-950 text-red-100 border-red-800'
              : toast.type === 'info'
                ? 'bg-zinc-900 text-zinc-100 border-zinc-700'
                : 'bg-[#1A1A18] text-[#FAF5EB] border-[#B89047]'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-zinc-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#DFBA73] shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer onNavigate={handleNavigate} />

      {/* Header (Hidden on full Admin Dashboard) */}
      {!isAdminView && (
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          products={products}
          categories={categories}
        />
      )}

      {/* Main Content Router */}
      <main className="flex-1">
        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-2 border-[#B89047] border-t-transparent rounded-full animate-spin" />
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#B89047] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Initializing Zarorat Hub...</span>
            </div>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomePage
                products={products}
                categories={categories}
                onNavigate={handleNavigate}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {currentView === 'shop' && (
              <ShopPage
                products={products}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onNavigate={handleNavigate}
                filterParam={viewParam}
              />
            )}

            {currentView === 'product-detail' && activeProduct && (
              <ProductDetailPage
                product={activeProduct}
                allProducts={products}
                onNavigate={handleNavigate}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {currentView === 'cart' && (
              <CartPage onNavigate={handleNavigate} />
            )}

            {currentView === 'checkout' && (
              <CheckoutPage
                onNavigate={handleNavigate}
                onOrderPlaced={handleOrderPlaced}
              />
            )}

            {currentView === 'order-confirmation' && (
              <OrderConfirmationPage
                orderId={viewParam}
                initialOrder={placedOrder}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'my-orders' && (
              <MyOrdersPage onNavigate={handleNavigate} />
            )}

            {currentView.startsWith('admin-') && !isAdmin && (
              <AdminLogin onNavigate={handleNavigate} />
            )}

            {isAdminView && (
              <AdminDashboard
                products={products}
                categories={categories}
                orders={orders}
                onRefreshData={loadStoreData}
                onNavigate={handleNavigate}
              />
            )}
          </>
        )}
      </main>

      {/* Footer (Hidden on full Admin Dashboard) */}
      {!isAdminView && (
        <Footer
          onNavigate={handleNavigate}
          onSelectCategory={setSelectedCategory}
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
