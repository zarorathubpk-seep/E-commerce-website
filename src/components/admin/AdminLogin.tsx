import React, { useState } from 'react';
import { ShieldCheck, Lock, Sparkles, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ViewMode } from '../../types';

interface AdminLoginProps {
  onNavigate: (view: ViewMode) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onNavigate }) => {
  const { user, isAdmin, signInWithGoogle, quickAdminLogin, logout, adminEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onNavigate('admin-dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google authentication could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = () => {
    quickAdminLogin();
    onNavigate('admin-dashboard');
  };

  if (isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FAF5EB] border border-[#DFBA73]/50 flex items-center justify-center mx-auto mb-4 text-[#B89047]">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-normal text-zinc-900 mb-2">
          Administrator Verified
        </h2>
        <p className="text-xs text-zinc-500 mb-6">
          Logged in as <strong>{user?.email || adminEmail}</strong> with full administrative privileges.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onNavigate('admin-dashboard')}
            className="w-full py-3.5 px-4 bg-[#1A1A18] text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <span>Proceed to Admin Dashboard</span>
            <ArrowRight className="w-4 h-4 text-[#DFBA73]" />
          </button>
          <button
            onClick={logout}
            className="text-xs text-zinc-500 hover:text-zinc-800 underline py-1"
          >
            Sign out of Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-[#EFECE6] p-8 shadow-sm space-y-6">
        
        {/* Brand Icon Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF5EB] border border-[#DFBA73]/40 flex items-center justify-center mx-auto text-[#B89047]">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#B89047]">
            Authorized Personnel Only
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-900">
            Zarorat Hub Admin Portal
          </h1>
          <p className="text-xs text-zinc-500">
            Secure administrative control center for catalog, variants, inventory, and order fulfillment.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          {/* Quick Admin Access (Authorized Owner) */}
          <button
            onClick={handleQuickAdmin}
            className="w-full py-3.5 px-4 bg-[#1A1A18] hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-[#DFBA73]" />
            <span>Enter as Admin ({adminEmail})</span>
          </button>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 bg-white hover:bg-zinc-50 border border-[#E5E0D8] text-zinc-800 rounded-xl text-xs font-medium flex items-center justify-center gap-3 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{loading ? 'Authenticating...' : 'Sign in with Google Account'}</span>
          </button>
        </div>

        <div className="pt-4 border-t border-[#F2EFE9] text-center">
          <button
            onClick={() => onNavigate('home')}
            className="text-xs text-zinc-500 hover:text-zinc-900 underline"
          >
            ← Return to Customer Storefront
          </button>
        </div>

      </div>
    </div>
  );
};
