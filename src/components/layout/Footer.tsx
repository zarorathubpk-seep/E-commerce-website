import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  Mail, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { ViewMode } from '../../types';

interface FooterProps {
  onNavigate: (view: ViewMode, param?: string) => void;
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectCategory }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const handleCategoryClick = (cat: string) => {
    onSelectCategory(cat);
    onNavigate('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1A1A18] text-[#EFECE6] pt-16 pb-12 border-t border-zinc-800">
      {/* Trust & Guarantee Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 border-b border-zinc-800/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[#DFBA73] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide text-white uppercase mb-1">
                Complimentary Delivery
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Enjoy free white-glove shipping on all domestic orders exceeding $100.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[#DFBA73] shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide text-white uppercase mb-1">
                30-Day Easy Returns
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Experience our curated homeware in your space with zero-hassle returns.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[#DFBA73] shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide text-white uppercase mb-1">
                Artisanal Integrity
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Forged from heirloom Damascus steel, full-grain leathers, and pure solid brass.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[#DFBA73] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide text-white uppercase mb-1">
                Secure Encrypted Orders
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                256-bit SSL encrypted checkout ensuring complete data privacy and protection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-normal tracking-[0.16em] text-white uppercase">
                Zarorat Hub
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#DFBA73] font-semibold border-b border-[#DFBA73] pb-0.5">
                MARKETPLACE
              </span>
            </div>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              Your comprehensive marketplace for premium tech, mobile essentials, fashion, culinary tools, home comforts, and daily necessities.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <span className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block mb-2">
                Join Zarorat Hub Gazette
              </span>
              <p className="text-xs text-zinc-400 mb-3">
                Receive private collection launches, exclusive flash deals, and 10% off your initial acquisition.
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-[#DFBA73] bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-[#DFBA73]" />
                  <span>Welcome to Zarorat Hub. Check your inbox for code ZARORAT10.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#DFBA73]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#DFBA73] text-[#1A1A18] font-semibold text-xs rounded-xl hover:bg-[#cda45c] transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Shop Departments */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-[#DFBA73] mb-4">
              Collections
            </h5>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li>
                <button 
                  onClick={() => handleCategoryClick('kitchen')} 
                  className="hover:text-white transition-colors"
                >
                  Kitchen & Culinary
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryClick('home-living')} 
                  className="hover:text-white transition-colors"
                >
                  Home & Living
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryClick('grocery')} 
                  className="hover:text-white transition-colors"
                >
                  Gourmet Pantry
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryClick('accessories')} 
                  className="hover:text-white transition-colors"
                >
                  Lifestyle Accessories
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectCategory(''); onNavigate('shop'); }} 
                  className="hover:text-white transition-colors"
                >
                  All Products
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-[#DFBA73] mb-4">
              Client Service
            </h5>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li>
                <button 
                  onClick={() => onNavigate('my-orders')} 
                  className="hover:text-white transition-colors"
                >
                  Order Status & Tracking
                </button>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Complimentary Shipping
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Returns & Exchanges
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Knife Sharpening & Care
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Lifetime Guarantee
                </span>
              </li>
            </ul>
          </div>

          {/* Maison & Admin */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-[#DFBA73] mb-4">
              The Maison
            </h5>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Our Philosophy
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Sustainable Sourcing
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Terms of Commerce
                </span>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => onNavigate('admin-login')}
                  className="text-xs text-[#DFBA73] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Administrative Access</span>
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <div>
          © {new Date().getFullYear()} Zarorat Hub Inc. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <span>Curated in Paris & New York</span>
          <span>•</span>
          <span>Worldwide Fulfillment</span>
          <span>•</span>
          <span className="text-[#DFBA73]">Gold Standard Living</span>
        </div>
      </div>
    </footer>
  );
};
