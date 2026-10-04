import React from 'react';
import { ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { ViewMode } from '../../types';

interface PromotionalBannersProps {
  onNavigate: (view: ViewMode, param?: string) => void;
  onSelectCategory: (cat: string) => void;
}

export const PromotionalBanners: React.FC<PromotionalBannersProps> = ({
  onNavigate,
  onSelectCategory,
}) => {
  return (
    <section className="py-12 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Banner 1: Upgrade Your Tech (Electronics Hero) */}
      <div className="bg-[#1A1A18] rounded-3xl overflow-hidden shadow-xl text-white grid grid-cols-1 lg:grid-cols-12 items-center">
        <div className="p-8 sm:p-12 lg:p-16 lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#DFBA73]">
            <Zap className="w-3.5 h-3.5 fill-[#DFBA73]" />
            <span>Featured Tech Showcase</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
            Next-Gen Acoustics. <br />
            <span className="italic text-[#DFBA73] font-light">Wireless Precision & Active Noise Cancel.</span>
          </h2>

          <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-lg font-light">
            Immerse yourself in studio-grade 40mm beryllium acoustics, 45-hour battery endurance, and compact 65W GaN wall chargers. Engineered for modern high-performance lifestyles.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => {
                onSelectCategory('electronics');
                onNavigate('shop');
              }}
              className="px-6 py-3.5 bg-[#DFBA73] text-[#1A1A18] hover:bg-[#c9a159] text-xs font-semibold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer group"
            >
              <span>Explore Tech & Audio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="text-xs text-zinc-400">
              Free Express Delivery Over $75
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 h-80 lg:h-full relative overflow-hidden bg-zinc-900">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
            alt="Aura Studio Headphones"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Banner 2 & 3 Split: Fashion & Home */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Fashion Banner */}
        <div 
          onClick={() => { onSelectCategory('fashion'); onNavigate('shop'); }}
          className="relative rounded-3xl overflow-hidden h-[380px] shadow-md group cursor-pointer"
        >
          <img
            src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80"
            alt="New Season Fashion"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#DFBA73] mb-1">
              New Season Apparel
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white mb-2">
              Heavyweight Organic French Terry
            </h3>
            <p className="text-xs text-zinc-300 max-w-sm mb-4 font-light">
              480 GSM oversized streetwear hoodies, organic combed tees, and Portuguese leather court sneakers.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#DFBA73] group-hover:translate-x-1 transition-transform">
              <span>Shop Fashion Edit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Home & Living Banner */}
        <div 
          onClick={() => { onSelectCategory('home-living'); onNavigate('shop'); }}
          className="relative rounded-3xl overflow-hidden h-[380px] shadow-md group cursor-pointer"
        >
          <img
            src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=80"
            alt="Home Sanctuary"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#DFBA73] mb-1">
              Sanctuary Living
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white mb-2">
              Solid Brass & French Linen
            </h3>
            <p className="text-xs text-zinc-300 max-w-sm mb-4 font-light">
              Elevate everyday spaces with sensory soy candles, solid unlacquered brass vanity trays, and stonewashed linen.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#DFBA73] group-hover:translate-x-1 transition-transform">
              <span>View Sanctuary Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};
