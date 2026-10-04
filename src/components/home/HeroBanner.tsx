import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Package, RefreshCw } from 'lucide-react';
import { ViewMode } from '../../types';

interface HeroBannerProps {
  onNavigate: (view: ViewMode) => void;
  onSelectCategory: (cat: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onNavigate, onSelectCategory }) => {
  return (
    <div className="relative overflow-hidden bg-[#FBFBF9] border-b border-[#EFECE6]">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#DFBA73]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Text Column */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF5EB] border border-[#DFBA73]/40 text-[#8F6C26] text-xs font-semibold tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5 fill-[#DFBA73]" />
              <span>Multi-Category Supermarket & Tech Hub</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#1A1A18] leading-[1.12]">
              Elevate Everything <br />
              <span className="italic font-light text-[#B89047]">You Wear, Use &</span> Live In.
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-lg font-light">
              Explore thousands of verified products from premier electronics, mobile accessories, tailored apparel, and pantry provisions. Fast courier dispatch, transparent warranties, and guaranteed satisfaction.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  onSelectCategory('');
                  onNavigate('shop');
                }}
                className="px-7 py-3.5 bg-[#1A1A18] text-white hover:bg-zinc-800 text-xs font-semibold tracking-widest uppercase rounded-xl flex items-center gap-2.5 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <span>Shop Marketplace</span>
                <ArrowRight className="w-4 h-4 text-[#DFBA73] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  onSelectCategory('electronics');
                  onNavigate('shop');
                }}
                className="px-6 py-3.5 bg-white border border-[#E5E0D8] text-zinc-800 hover:border-[#B89047] hover:text-[#B89047] text-xs font-semibold tracking-widest uppercase rounded-xl transition-all cursor-pointer"
              >
                Top Tech Deals
              </button>
            </div>

            {/* Service Quick Highlights */}
            <div className="pt-6 border-t border-[#EFECE6] grid grid-cols-3 gap-3 text-left">
              <div>
                <span className="block font-serif text-lg font-semibold text-zinc-900">5,000+</span>
                <span className="text-[11px] text-zinc-500">Curated Items</span>
              </div>
              <div>
                <span className="block font-serif text-lg font-semibold text-zinc-900">100%</span>
                <span className="text-[11px] text-zinc-500">Authentic Brands</span>
              </div>
              <div>
                <span className="block font-serif text-lg font-semibold text-zinc-900">30-Day</span>
                <span className="text-[11px] text-zinc-500">Free Returns</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Stage */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Lifestyle Hero Photo */}
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-zinc-100 relative">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85"
                  alt="Zarorat Hub Marketplace Tech & Living"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <span className="text-xs uppercase tracking-widest text-[#DFBA73] font-semibold">
                    Featured Technology Drop
                  </span>
                  <p className="font-serif text-xl font-medium mt-0.5">
                    Aura Wireless ANC Headphones
                  </p>
                </div>
              </div>

              {/* Floating Feature Card */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#EFECE6] shadow-xl flex items-center gap-3 max-w-[240px]">
                <div className="w-10 h-10 rounded-xl bg-[#FAF5EB] border border-[#DFBA73]/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#B89047]" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#B89047]">
                    Free Delivery
                  </span>
                  <h4 className="text-xs font-semibold text-zinc-900">
                    On Orders Over $75
                  </h4>
                </div>
              </div>

              {/* Floating Department pill */}
              <div className="absolute -top-3 -right-3 sm:-right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#EFECE6] shadow-md hidden sm:flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-zinc-800">
                  <strong>11+</strong> Live Departments
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
