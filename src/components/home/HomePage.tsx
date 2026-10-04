import React from 'react';
import { HeroBanner } from './HeroBanner';
import { CategoryBanners } from './CategoryBanners';
import { FlashSaleSection } from './FlashSaleSection';
import { PromotionalBanners } from './PromotionalBanners';
import { ProductCard } from '../product/ProductCard';
import { Product, Category, ViewMode } from '../../types';
import { ArrowRight, Flame, Sparkles, TrendingUp } from 'lucide-react';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  onNavigate: (view: ViewMode, param?: string) => void;
  onSelectCategory: (cat: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  onNavigate,
  onSelectCategory,
}) => {
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const bestSellers = products.filter(p => p.bestseller).slice(0, 4);
  const newArrivals = products.filter(p => p.newArrival).slice(0, 4);

  const handleOpenDetail = (slug: string) => {
    onNavigate('product-detail', slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAll = (categorySlug?: string) => {
    onSelectCategory(categorySlug || '');
    onNavigate('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10">
      
      {/* 1. Hero Marketplace Banner */}
      <HeroBanner onNavigate={onNavigate} onSelectCategory={onSelectCategory} />

      {/* 2. Popular Category Tiles */}
      <CategoryBanners
        categories={categories}
        onSelectCategory={onSelectCategory}
        onNavigate={onNavigate}
      />

      {/* 3. FLASH SALE SECTION with Live Countdown Timer */}
      <FlashSaleSection
        products={products}
        onOpenDetail={handleOpenDetail}
        onNavigate={onNavigate}
      />

      {/* 4. Featured Marketplace Creations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-[#EFECE6]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B89047]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked by Curators</span>
            </div>
            <h2 className="font-serif text-3xl font-normal text-zinc-900 mt-1">
              Featured Highlights
            </h2>
          </div>
          <button
            onClick={() => handleViewAll('')}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#B89047] hover:text-[#99752D] transition-colors mt-2 sm:mt-0"
          >
            <span>Explore All Marketplace Pieces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={handleOpenDetail}
            />
          ))}
        </div>
      </section>

      {/* 5. Promotional Category Banners */}
      <PromotionalBanners
        onNavigate={onNavigate}
        onSelectCategory={onSelectCategory}
      />

      {/* 6. Trending Now / Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-[#EFECE6]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B89047]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Customer Top Picks</span>
            </div>
            <h2 className="font-serif text-3xl font-normal text-zinc-900 mt-1">
              Marketplace Best Sellers
            </h2>
          </div>
          <button
            onClick={() => handleViewAll('')}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#B89047] hover:text-[#99752D] transition-colors mt-2 sm:mt-0"
          >
            <span>View All Bestsellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={handleOpenDetail}
            />
          ))}
        </div>
      </section>

      {/* 7. New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-[#EFECE6]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B89047]">
              Latest Releases
            </span>
            <h2 className="font-serif text-3xl font-normal text-zinc-900 mt-1">
              New Arrivals This Week
            </h2>
          </div>
          <button
            onClick={() => handleViewAll('')}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#B89047] hover:text-[#99752D] transition-colors mt-2 sm:mt-0"
          >
            <span>Browse All New In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={handleOpenDetail}
            />
          ))}
        </div>
      </section>

    </div>
  );
};
