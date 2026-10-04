import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Category, ViewMode } from '../../types';

interface CategoryBannersProps {
  categories: Category[];
  onSelectCategory: (cat: string) => void;
  onNavigate: (view: ViewMode) => void;
}

export const CategoryBanners: React.FC<CategoryBannersProps> = ({
  categories,
  onSelectCategory,
  onNavigate,
}) => {
  const handleClick = (slug: string) => {
    onSelectCategory(slug);
    onNavigate('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#B89047] uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Marketplace Departments</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-900">
            Popular Categories
          </h2>
        </div>
        <button
          onClick={() => { onSelectCategory(''); onNavigate('shop'); }}
          className="text-xs font-semibold uppercase tracking-wider text-[#B89047] hover:underline flex items-center gap-1.5 mt-2 md:mt-0"
        >
          <span>Explore All 11+ Departments</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Category Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.slice(0, 6).map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleClick(cat.slug)}
            className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-lg transition-all duration-300 border border-[#EFECE6]"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Title & Count */}
            <div className="absolute inset-0 p-3.5 flex flex-col justify-end text-white">
              <span className="text-[10px] uppercase font-semibold text-[#DFBA73] tracking-wider mb-0.5">
                {cat.productCount || 6} Items
              </span>
              <h3 className="font-medium text-xs sm:text-sm text-white line-clamp-1 group-hover:text-[#DFBA73] transition-colors">
                {cat.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Category Pill Bar for quick browsing */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {categories.slice(6, 11).map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleClick(cat.slug)}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#EFECE6] hover:border-[#DFBA73] shadow-xs text-left group transition-all"
          >
            <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-lg object-cover border border-zinc-200" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-zinc-900 group-hover:text-[#B89047] block truncate">
                {cat.name}
              </span>
              <span className="text-[10px] text-zinc-400">
                Explore department →
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
