import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  User, 
  ShieldCheck, 
  ChevronDown,
  Sparkles,
  ArrowRight,
  Flame,
  Grid,
  Zap,
  Tag
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ViewMode, Product, Category } from '../../types';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode, param?: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  products: Product[];
  categories: Category[];
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  selectedCategory,
  onSelectCategory,
  products,
  categories,
}) => {
  const { itemCount, wishlist, setIsDrawerOpen } = useCart();
  const { isAdmin } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', view: 'home', cat: '' },
    { label: 'Shop All', view: 'shop', cat: '' },
    { label: 'Flash Deals', view: 'shop', cat: '', isFlash: true, filter: 'flash' },
    { label: 'Electronics', view: 'shop', cat: 'electronics' },
    { label: 'Mobile & Tech', view: 'shop', cat: 'mobile-accessories' },
    { label: 'Fashion', view: 'shop', cat: 'fashion' },
    { label: 'Home & Living', view: 'shop', cat: 'home-living' },
    { label: 'Kitchen', view: 'shop', cat: 'kitchen' },
    { label: 'Gourmet Grocery', view: 'shop', cat: 'grocery' },
  ];

  const filteredSearch = searchQuery.trim() === '' ? [] : products.filter(p => {
    if (searchCategory && p.category !== searchCategory) return false;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }).slice(0, 6);

  const handleCategoryClick = (view: ViewMode, cat: string, filter?: string) => {
    onSelectCategory(cat);
    onNavigate(view, filter);
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  };

  const handleSearchResultClick = (slug: string) => {
    onNavigate('product-detail', slug);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-[#EFECE6] transition-all">
      
      {/* Top Announcement Bar */}
      <div className="bg-[#1A1A18] text-[#EFECE6] text-xs py-2 px-4 font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2 text-[#DFBA73]">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-zinc-300">Multi-Category Marketplace — Over 5,000 Curated Pieces</span>
          </div>
          
          <div className="text-center w-full sm:w-auto flex items-center justify-center gap-2">
            <span>Free Express Delivery on Orders Over $75</span>
            <span className="hidden md:inline text-[#DFBA73] font-semibold">• Code: AURORA15 (15% Off)</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-zinc-400">
            <button 
              onClick={() => onNavigate('my-orders')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Track Orders
            </button>
            <span>|</span>
            <button 
              onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'admin-login')}
              className="flex items-center gap-1 hover:text-[#DFBA73] transition-colors cursor-pointer text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#DFBA73]" />
              <span>{isAdmin ? 'Admin Console' : 'Merchant Portal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 sm:gap-8">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-zinc-700 hover:text-zinc-950 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Marketplace Brand Logo */}
          <div className="flex items-center shrink-0">
            <button 
              onClick={() => onNavigate('home')} 
              className="group flex flex-col items-start text-left cursor-pointer focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl sm:text-3xl font-normal tracking-[0.14em] text-[#1A1A18] uppercase">
                  Zarorat Hub
                </span>
                <span className="text-[10px] tracking-[0.2em] text-[#B89047] font-bold px-2 py-0.5 rounded-full bg-[#FAF5EB] border border-[#DFBA73]/50">
                  MARKETPLACE
                </span>
              </div>
              <span className="text-[9px] tracking-[0.28em] uppercase text-zinc-400 -mt-1 hidden sm:block">
                Electronics • Fashion • Home • Pantry
              </span>
            </button>
          </div>

          {/* Marketplace Search Bar with Category Select (Amazon/Daraz Style) */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <div className="flex w-full items-center bg-white border border-[#E5E0D8] rounded-2xl shadow-xs overflow-hidden focus-within:border-[#B89047] focus-within:ring-2 focus-within:ring-[#B89047]/20 transition-all">
              
              {/* Category Dropdown Filter */}
              <div className="relative border-r border-[#EFECE6] bg-[#FAF8F5] shrink-0">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="py-2.5 pl-3 pr-8 text-xs font-semibold text-zinc-700 bg-transparent focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="">All Departments</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across 5,000+ electronics, mobile gear, fashion, home essentials..."
                className="w-full px-3.5 py-2.5 text-xs text-zinc-900 bg-transparent focus:outline-none placeholder-zinc-400"
              />

              {/* Clear button */}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-zinc-400 hover:text-zinc-600 mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Submit Search Button */}
              <button
                onClick={() => {
                  onSelectCategory(searchCategory);
                  onNavigate('shop');
                }}
                className="px-4 py-2.5 bg-[#1A1A18] hover:bg-zinc-800 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4 text-[#DFBA73]" />
              </button>
            </div>

            {/* Predictive Results Overlay Dropdown */}
            {isSearchFocused && searchQuery.trim() !== '' && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-[#E5E0D8] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setIsSearchFocused(false)}
              >
                {filteredSearch.length > 0 ? (
                  <div className="divide-y divide-[#F2EFE9]">
                    <div className="p-2.5 bg-[#FAF8F5] text-[10px] uppercase font-bold tracking-widest text-[#B89047]">
                      Matching Marketplace Products
                    </div>
                    {filteredSearch.map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => handleSearchResultClick(prod.slug)}
                        className="w-full flex items-center justify-between p-3 hover:bg-[#F9F7F2] transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={prod.images[0]} 
                            alt={prod.name} 
                            className="w-11 h-11 rounded-lg object-cover bg-zinc-100 border border-zinc-200" 
                          />
                          <div>
                            <div className="text-xs font-semibold text-zinc-900 group-hover:text-[#B89047] transition-colors line-clamp-1">
                              {prod.name}
                            </div>
                            <div className="text-[11px] text-zinc-400 capitalize">
                              {prod.brand ? `${prod.brand} • ` : ''}{prod.category.replace('-', ' & ')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-serif text-sm font-semibold text-zinc-900">
                            ${prod.price}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#B89047] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        onSelectCategory(searchCategory);
                        onNavigate('shop');
                        setIsSearchFocused(false);
                      }}
                      className="w-full py-2.5 text-center text-xs font-semibold text-[#B89047] hover:bg-[#FAF8F5] transition-colors uppercase tracking-wider"
                    >
                      View All Search Results in Marketplace →
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    No results for "{searchQuery}". Try headphones, charger, hoodie, or olive oil.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('shop')}
              className="relative p-2.5 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer rounded-full hover:bg-zinc-100 hidden sm:block"
              aria-label="Wishlist"
              title="Saved Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-[#B89047] text-[#B89047]' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#B89047] text-white text-[10px] font-semibold flex items-center justify-center rounded-full">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* User / Orders / Admin */}
            <button
              onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'my-orders')}
              className="p-2.5 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer rounded-full hover:bg-zinc-100 relative"
              aria-label="Account"
              title={isAdmin ? "Admin Console" : "Customer Orders"}
            >
              <User className="w-5 h-5" />
              {isAdmin && (
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#B89047] rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Shopping Bag Button with Live Badge */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-[#1A1A18] text-white hover:bg-zinc-800 transition-all rounded-full cursor-pointer group shadow-sm hover:shadow"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#DFBA73] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold tracking-wide pr-0.5">Cart</span>
              <span className="w-5 h-5 bg-[#B89047] text-white text-[11px] font-bold flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Primary Navigation Bar & Categories Mega-Menu Trigger */}
      <div className="hidden lg:block border-t border-[#EFECE6] bg-[#FAF8F5]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11 text-xs">
            
            <div className="flex items-center gap-6">
              {/* Mega-Menu Trigger Button */}
              <div className="relative">
                <button
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1A18] text-white rounded-lg font-semibold tracking-wider uppercase text-[11px] hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  <Grid className="w-3.5 h-3.5 text-[#DFBA73]" />
                  <span>All Departments</span>
                  <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mega-Menu Modal Dropdown */}
                {megaMenuOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-[720px] bg-white rounded-3xl border border-[#E5E0D8] shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseLeave={() => setMegaMenuOpen(false)}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#F2EFE9] mb-4">
                      <span className="font-serif text-base font-semibold text-zinc-900">
                        Explore Marketplace Departments
                      </span>
                      <button
                        onClick={() => { onSelectCategory(''); onNavigate('shop'); setMegaMenuOpen(false); }}
                        className="text-xs text-[#B89047] hover:underline font-semibold"
                      >
                        View Full Marketplace Catalog →
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      {categories.map((cat) => (
                        <div key={cat.id} className="space-y-1.5">
                          <button
                            onClick={() => handleCategoryClick('shop', cat.slug)}
                            className="font-semibold text-xs text-zinc-900 hover:text-[#B89047] transition-colors flex items-center justify-between w-full text-left"
                          >
                            <span>{cat.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">({cat.productCount || 5})</span>
                          </button>
                          <ul className="space-y-1 pl-1">
                            {cat.subcategories?.slice(0, 3).map((sub) => (
                              <li key={sub}>
                                <button
                                  onClick={() => handleCategoryClick('shop', cat.slug)}
                                  className="text-[11px] text-zinc-500 hover:text-zinc-900 transition-colors"
                                >
                                  {sub}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Department Direct Links */}
              <nav className="flex items-center gap-5">
                {navLinks.map((item) => {
                  const isActive = (item.view === currentView && item.cat === selectedCategory) ||
                    (item.view === 'shop' && currentView === 'shop' && item.cat === selectedCategory);
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleCategoryClick(item.view as ViewMode, item.cat, (item as any).filter)}
                      className={`text-xs tracking-wide transition-all relative py-1 cursor-pointer font-medium flex items-center gap-1.5 ${
                        isActive 
                          ? 'text-[#1A1A18] font-bold' 
                          : 'text-zinc-600 hover:text-[#1A1A18]'
                      }`}
                    >
                      {item.isFlash && <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B89047] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right promotion pill */}
            <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
              <Tag className="w-3.5 h-3.5 text-[#B89047]" />
              <span>Flash Deals: Up to <strong>40% Off</strong> Select Electronics</span>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Search Bar (Only on small viewports) */}
      <div className="md:hidden px-4 py-3 bg-[#FAF8F5] border-t border-[#EFECE6]">
        <div className="flex items-center bg-white border border-[#E5E0D8] rounded-xl px-3 py-2 shadow-xs">
          <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all marketplace categories..."
            className="w-full text-xs text-zinc-900 bg-transparent focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery.trim() !== '' && filteredSearch.length > 0 && (
          <div className="mt-2 bg-white rounded-xl border border-[#E5E0D8] p-2 space-y-2 shadow-lg">
            {filteredSearch.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSearchResultClick(p.slug)}
                className="w-full flex items-center justify-between p-1.5 text-xs text-left text-zinc-800"
              >
                <span className="line-clamp-1">{p.name}</span>
                <span className="font-serif font-bold">${p.price}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#EFECE6] bg-[#FBFBF9] px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#B89047] px-3 block mb-1">
              Marketplace Departments
            </span>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCategoryClick('shop', c.slug)}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-zinc-800 hover:bg-zinc-100 hover:text-[#B89047] flex items-center justify-between"
              >
                <span>{c.name}</span>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-[#EFECE6] space-y-2 text-sm">
            <button
              onClick={() => { onNavigate('my-orders'); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-700 hover:bg-zinc-100"
            >
              <User className="w-4 h-4 text-zinc-500" />
              <span>Track Orders & Account</span>
            </button>
            <button
              onClick={() => { onNavigate(isAdmin ? 'admin-dashboard' : 'admin-login'); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#B89047] hover:bg-zinc-100 font-medium"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAdmin ? 'Admin Dashboard' : 'Merchant Login'}</span>
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
