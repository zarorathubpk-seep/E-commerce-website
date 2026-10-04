import React, { useState, useMemo, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  Search, 
  X, 
  ArrowUpDown, 
  RotateCcw,
  Sparkles,
  Zap,
  Tag
} from 'lucide-react';
import { Product, Category, ViewMode } from '../../types';
import { ProductCard } from '../product/ProductCard';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onNavigate: (view: ViewMode, param?: string) => void;
  filterParam?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  onNavigate,
  filterParam,
}) => {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'bestselling' | 'discount'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [flashDealsOnly, setFlashDealsOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(250);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (filterParam === 'flash') {
      setFlashDealsOnly(true);
    } else if (filterParam === 'new') {
      setSortBy('newest');
    } else if (filterParam === 'bestsellers') {
      setSortBy('bestselling');
    }
  }, [filterParam]);

  // Available unique brands
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands);
  }, [products]);

  // Available unique colors across all products
  const availableColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    products.forEach(p => {
      p.variants?.forEach(v => {
        const val = v.color || v.value;
        if (val && v.colorCode) {
          colorMap.set(val, v.colorCode);
        }
      });
    });
    return Array.from(colorMap.entries()).map(([name, code]) => ({ name, code }));
  }, [products]);

  // Current category subcategories
  const currentCategoryObj = categories.find(c => c.slug === selectedCategory);
  const availableSubcategories = currentCategoryObj?.subcategories || [];

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategory && product.category !== selectedCategory) {
        return false;
      }
      // Subcategory filter
      if (selectedSubcategory && product.subcategory !== selectedSubcategory) {
        return false;
      }
      // Brand filter
      if (selectedBrand && product.brand !== selectedBrand) {
        return false;
      }
      // Flash deals only
      if (flashDealsOnly && !product.isFlashSale) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand?.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesSku = product.sku.toLowerCase().includes(query);
        const matchesTag = product.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesName && !matchesBrand && !matchesDesc && !matchesSku && !matchesTag) return false;
      }
      // Stock filter
      if (inStockOnly && product.stock <= 0) {
        return false;
      }
      // Max price
      if (product.price > maxPrice) {
        return false;
      }
      // Color variant filter
      if (selectedColor) {
        const hasColor = product.variants?.some(v => 
          (v.color && v.color.toLowerCase() === selectedColor.toLowerCase()) ||
          (v.value && v.value.toLowerCase() === selectedColor.toLowerCase())
        );
        if (!hasColor) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'bestselling') return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0);
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'discount') {
        const discA = a.compareAtPrice ? (a.compareAtPrice - a.price) : 0;
        const discB = b.compareAtPrice ? (b.compareAtPrice - b.price) : 0;
        return discB - discA;
      }
      // Default: featured first, then rating
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating;
    });
  }, [products, selectedCategory, selectedSubcategory, selectedBrand, flashDealsOnly, searchQuery, inStockOnly, maxPrice, selectedColor, sortBy]);

  const resetAllFilters = () => {
    onSelectCategory('');
    setSelectedSubcategory('');
    setSelectedBrand('');
    setSearchQuery('');
    setInStockOnly(false);
    setFlashDealsOnly(false);
    setMaxPrice(250);
    setSelectedColor('');
    setSortBy('featured');
  };

  const handleOpenDetail = (slug: string) => {
    onNavigate('product-detail', slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFiltersCount = 
    (selectedCategory ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (flashDealsOnly ? 1 : 0) +
    (maxPrice < 250 ? 1 : 0) +
    (selectedColor ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B89047]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Category Marketplace</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-900 mt-1">
          {currentCategoryObj ? currentCategoryObj.name : 'The Complete Marketplace'}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-xl font-light">
          {currentCategoryObj ? currentCategoryObj.description : 'Explore verified electronic acoustics, mobile gear, fashion pieces, home living, and gourmet provisions.'}
        </p>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-[#EFECE6] no-scrollbar">
        <button
          onClick={() => {
            onSelectCategory('');
            setSelectedSubcategory('');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer ${
            selectedCategory === ''
              ? 'bg-[#1A1A18] text-white shadow-xs'
              : 'bg-white border border-[#E5E0D8] text-zinc-700 hover:border-zinc-400'
          }`}
        >
          All Departments
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              onSelectCategory(cat.slug);
              setSelectedSubcategory('');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat.slug
                ? 'bg-[#1A1A18] text-white shadow-xs'
                : 'bg-white border border-[#E5E0D8] text-zinc-700 hover:border-zinc-400'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Subcategory Pills Bar (if category selected) */}
      {availableSubcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 text-xs">
          <span className="text-zinc-400 uppercase tracking-widest text-[10px] font-semibold pl-1">
            Subcategory:
          </span>
          <button
            onClick={() => setSelectedSubcategory('')}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedSubcategory === '' 
                ? 'bg-[#DFBA73]/30 text-[#85611B] font-semibold' 
                : 'text-zinc-600 hover:text-zinc-900 bg-[#F4F1EA]'
            }`}
          >
            All
          </button>
          {availableSubcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                selectedSubcategory === sub 
                  ? 'bg-[#DFBA73]/30 text-[#85611B] font-semibold' 
                  : 'text-zinc-600 hover:text-zinc-900 bg-[#F4F1EA]'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-[#EFECE6] mb-6 shadow-xs">
        {/* Search inside shop */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, brand, or SKU..."
            className="w-full pl-9 pr-8 py-2 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[#E5E0D8] rounded-xl text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#B89047]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 bg-[#B89047] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
            <span className="text-zinc-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2 px-3 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs text-zinc-800 focus:outline-none focus:border-[#B89047] font-medium cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="bestselling">Best Selling</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-zinc-400 font-medium">Active Filters:</span>
          {selectedCategory && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E0D8] rounded-full text-xs text-zinc-700">
              Department: {currentCategoryObj?.name}
              <button onClick={() => onSelectCategory('')}><X className="w-3 h-3 text-zinc-400 hover:text-zinc-600" /></button>
            </span>
          )}
          {selectedSubcategory && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E0D8] rounded-full text-xs text-zinc-700">
              Sub: {selectedSubcategory}
              <button onClick={() => setSelectedSubcategory('')}><X className="w-3 h-3 text-zinc-400 hover:text-zinc-600" /></button>
            </span>
          )}
          {selectedBrand && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E0D8] rounded-full text-xs text-zinc-700">
              Brand: {selectedBrand}
              <button onClick={() => setSelectedBrand('')}><X className="w-3 h-3 text-zinc-400 hover:text-zinc-600" /></button>
            </span>
          )}
          {flashDealsOnly && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-full text-xs text-amber-800 font-medium">
              Flash Deals Only
              <button onClick={() => setFlashDealsOnly(false)}><X className="w-3 h-3 text-amber-600 hover:text-amber-800" /></button>
            </span>
          )}
          {selectedColor && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E0D8] rounded-full text-xs text-zinc-700">
              Color: {selectedColor}
              <button onClick={() => setSelectedColor('')}><X className="w-3 h-3 text-zinc-400 hover:text-zinc-600" /></button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E0D8] rounded-full text-xs text-zinc-700">
              In Stock Only
              <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3 text-zinc-400 hover:text-zinc-600" /></button>
            </span>
          )}
          {maxPrice < 250 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E0D8] rounded-full text-xs text-zinc-700">
              Under ${maxPrice}
              <button onClick={() => setMaxPrice(250)}><X className="w-3 h-3 text-zinc-400 hover:text-zinc-600" /></button>
            </span>
          )}
          <button
            onClick={resetAllFilters}
            className="text-xs text-[#B89047] hover:underline font-semibold ml-2 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Main Shop Layout: Sidebar Filters + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className={`lg:block ${showMobileFilters ? 'block mb-6' : 'hidden'} space-y-6`}>
          <div className="p-6 bg-white rounded-3xl border border-[#EFECE6] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2EFE9]">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-900">
                Marketplace Filters
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-[11px] text-[#B89047] hover:underline font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Price Range Filter */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-zinc-700">Max Price</span>
                <span className="font-semibold text-zinc-900">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#B89047] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                <span>$20</span>
                <span>$250+</span>
              </div>
            </div>

            {/* Quick Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-[#F2EFE9]">
              <label className="flex items-center gap-2.5 text-xs text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flashDealsOnly}
                  onChange={(e) => setFlashDealsOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-[#B89047] focus:ring-[#B89047] border-zinc-300 cursor-pointer"
                />
                <span className="flex items-center gap-1 font-medium text-amber-700">
                  <Zap className="w-3.5 h-3.5 fill-amber-500" />
                  Flash Deals Only
                </span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-[#B89047] focus:ring-[#B89047] border-zinc-300 cursor-pointer"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Brand Filter */}
            {availableBrands.length > 0 && (
              <div className="pt-2 border-t border-[#F2EFE9]">
                <span className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                  Featured Brands
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {availableBrands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(selectedBrand === b ? '' : b)}
                      className={`w-full text-left px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        selectedBrand === b 
                          ? 'bg-[#FAF5EB] text-[#8F6C26] font-semibold' 
                          : 'text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      <span>{b}</span>
                      {selectedBrand === b && <span className="w-1.5 h-1.5 rounded-full bg-[#B89047]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Swatch Filter */}
            <div className="pt-2 border-t border-[#F2EFE9]">
              <span className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2.5">
                Color Variation
              </span>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((c) => {
                  const isSelected = selectedColor.toLowerCase() === c.name.toLowerCase();
                  return (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(isSelected ? '' : c.name)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                        isSelected 
                          ? 'border-[#B89047] bg-[#FAF7F0] font-semibold text-zinc-900 shadow-xs' 
                          : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                      }`}
                      title={c.name}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        style={{ backgroundColor: c.code }}
                      />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </aside>

        {/* Product Grid Area (Responsive 4-5 cols desktop, 2-3 cols tablet, 2 cols mobile) */}
        <div className="lg:col-span-3">
          {/* Results Summary Counter */}
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-6 pb-2 border-b border-[#EFECE6]">
            <span>Showing <strong>{filteredProducts.length}</strong> marketplace items</span>
            <span className="hidden sm:inline">Certified Authentic Brands • Insured Worldwide Shipping</span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={handleOpenDetail}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-[#EFECE6] p-8 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#FAF5EB] flex items-center justify-center mx-auto mb-4 text-[#B89047]">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-medium text-zinc-900 mb-2">
                No matching products found
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto mb-6">
                Try widening your price range, clearing active filters, or exploring other marketplace categories.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-6 py-2.5 bg-[#1A1A18] text-white text-xs font-semibold rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
