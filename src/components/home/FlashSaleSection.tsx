import React, { useState, useEffect } from 'react';
import { Zap, Clock, ArrowRight, Flame } from 'lucide-react';
import { Product, ViewMode } from '../../types';
import { ProductCard } from '../product/ProductCard';

interface FlashSaleSectionProps {
  products: Product[];
  onOpenDetail: (slug: string) => void;
  onNavigate: (view: ViewMode, param?: string) => void;
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  products,
  onOpenDetail,
  onNavigate,
}) => {
  // Flash sale products (tagged or high discount)
  const flashProducts = products.filter(p => p.isFlashSale || (p.compareAtPrice && p.compareAtPrice > p.price)).slice(0, 4);

  // Live countdown timer state (24-hour cycle)
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 36,
    seconds: 42,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (flashProducts.length === 0) return null;

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Flash Sale Banner Header */}
      <div className="bg-gradient-to-r from-[#1A1A18] via-zinc-900 to-[#2A261C] rounded-3xl p-6 sm:p-8 text-white mb-8 border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Title and Icon */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B89047]/20 border border-[#DFBA73]/40 rounded-full text-[#DFBA73] text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-[#DFBA73]" />
            <span>Limited Time Marketplace Drop</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-white flex items-center gap-2">
            <span>Marketplace Flash Deals</span>
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
          </h2>
          <p className="text-xs text-zinc-400 font-light max-w-md">
            Exclusive pricing across top electronics, audio gear, and luxury essentials. Resets daily.
          </p>
        </div>

        {/* Live Countdown Clock */}
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-zinc-800 shrink-0">
          <Clock className="w-4 h-4 text-[#DFBA73]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mr-2">
            Ends In:
          </span>
          <div className="flex items-center gap-1.5 font-mono text-base font-bold">
            <div className="bg-zinc-800 px-2.5 py-1 rounded-lg text-white border border-zinc-700">
              {padZero(timeLeft.hours)}
              <span className="text-[9px] block text-zinc-400 font-sans font-normal uppercase">HRS</span>
            </div>
            <span className="text-[#DFBA73]">:</span>
            <div className="bg-zinc-800 px-2.5 py-1 rounded-lg text-white border border-zinc-700">
              {padZero(timeLeft.minutes)}
              <span className="text-[9px] block text-zinc-400 font-sans font-normal uppercase">MIN</span>
            </div>
            <span className="text-[#DFBA73]">:</span>
            <div className="bg-zinc-800 px-2.5 py-1 rounded-lg text-[#DFBA73] border border-zinc-700">
              {padZero(timeLeft.seconds)}
              <span className="text-[9px] block text-zinc-400 font-sans font-normal uppercase">SEC</span>
            </div>
          </div>
        </div>

      </div>

      {/* Flash Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {flashProducts.map((prod) => (
          <div key={prod.id} className="relative flex flex-col">
            <ProductCard
              product={prod}
              onOpenDetail={onOpenDetail}
            />
            {/* Sold Claimed Progress Indicator */}
            {prod.flashSoldPercent && (
              <div className="mt-2.5 px-3 py-2 bg-white rounded-xl border border-[#EFECE6] text-[11px]">
                <div className="flex justify-between items-center text-zinc-600 mb-1">
                  <span>Sold: <strong>{prod.flashSoldPercent}%</strong></span>
                  <span className="text-[#B89047] font-semibold">Almost Sold Out</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#DFBA73] to-[#B89047] rounded-full"
                    style={{ width: `${prod.flashSoldPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => onNavigate('shop')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B89047] hover:text-[#917028] transition-colors cursor-pointer"
        >
          <span>View All 50+ Marketplace Promotions</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
