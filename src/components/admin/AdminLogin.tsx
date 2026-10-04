import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ViewMode } from '../../types';
import { ADMIN_EMAIL } from '../../config/admin';

interface AdminLoginProps {
  onNavigate: (view: ViewMode) => void;
}

const STORAGE_ATTEMPTS_KEY = 'zh_admin_failed_attempts';
const STORAGE_LOCKOUT_KEY = 'zh_admin_lockout_until';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const AdminLogin: React.FC<AdminLoginProps> = ({ onNavigate }) => {
  const { 
    user, 
    isAdmin, 
    loginMerchant, 
    logout 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      return Number(sessionStorage.getItem(STORAGE_ATTEMPTS_KEY)) || 0;
    } catch {
      return 0;
    }
  });

  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Check lockout on mount and tick countdown
  useEffect(() => {
    const checkLockout = () => {
      try {
        const lockoutUntil = Number(sessionStorage.getItem(STORAGE_LOCKOUT_KEY)) || 0;
        const now = Date.now();
        if (lockoutUntil > now) {
          setLockoutRemaining(Math.ceil((lockoutUntil - now) / 1000));
        } else {
          setLockoutRemaining(0);
        }
      } catch {
        setLockoutRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFailedAttempt = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    try {
      sessionStorage.setItem(STORAGE_ATTEMPTS_KEY, String(nextAttempts));
    } catch (e) {
      console.warn(e);
    }

    if (nextAttempts >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_DURATION_MS;
      try {
        sessionStorage.setItem(STORAGE_LOCKOUT_KEY, String(until));
      } catch (e) {
        console.warn(e);
      }
      setLockoutRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
      setError('Too many failed attempts (5/5). Access locked for 5 minutes.');
    } else {
      const remaining = MAX_ATTEMPTS - nextAttempts;
      setError(`Incorrect email or password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
    }
  };

  const handleClearLockout = () => {
    setFailedAttempts(0);
    setLockoutRemaining(0);
    try {
      sessionStorage.removeItem(STORAGE_ATTEMPTS_KEY);
      sessionStorage.removeItem(STORAGE_LOCKOUT_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your merchant email and password.');
      return;
    }

    setLoading(true);

    try {
      await loginMerchant(email, password);
      handleClearLockout();
      onNavigate('admin-dashboard');
    } catch (err: any) {
      console.error('Merchant login failed:', err);
      handleFailedAttempt();
    } finally {
      setLoading(false);
    }
  };

  // View state: Merchant already verified and signed in
  if (isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FAF5EB] border border-[#DFBA73]/50 flex items-center justify-center mx-auto mb-4 text-[#B89047]">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-normal text-zinc-900 mb-2">
          Merchant Session Active
        </h2>
        <p className="text-xs text-zinc-500 mb-6">
          Authenticated as <strong>{user?.email || ADMIN_EMAIL}</strong>.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onNavigate('admin-dashboard')}
            className="w-full py-3.5 px-4 bg-[#1A1A18] text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <span>Enter Merchant Panel</span>
            <ArrowRight className="w-4 h-4 text-[#DFBA73]" />
          </button>
          <button
            onClick={logout}
            className="text-xs text-zinc-500 hover:text-zinc-800 underline py-1 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const formatLockoutTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-[#EFECE6] p-8 shadow-sm space-y-6">
        
        {/* Brand Icon Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF5EB] border border-[#DFBA73]/40 flex items-center justify-center mx-auto text-[#B89047]">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#B89047]">
            Authorized Merchant Access
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-900">
            Zarorat Hub Admin
          </h1>
          <p className="text-xs text-zinc-500">
            Enter your merchant credentials to access the administrative control center.
          </p>
        </div>

        {/* Lockout Warning */}
        {lockoutRemaining > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1 text-center">
            <span className="font-semibold block">Access Temporarily Locked</span>
            <p>Too many failed attempts. Please wait <strong>{formatLockoutTimer(lockoutRemaining)}</strong> before trying again.</p>
          </div>
        )}

        {/* Error message */}
        {error && lockoutRemaining === 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
              Merchant Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mralexander461@gmail.com"
              required
              disabled={loading || lockoutRemaining > 0}
              className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#B89047] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
              Merchant Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={loading || lockoutRemaining > 0}
                className="w-full px-3.5 py-2.5 pr-10 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#B89047] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || lockoutRemaining > 0}
            className="w-full py-3.5 px-4 bg-[#1A1A18] hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Merchant Panel</span>
                <ArrowRight className="w-4 h-4 text-[#DFBA73]" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#F2EFE9] text-center">
          <button
            onClick={() => onNavigate('home')}
            className="text-xs text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
          >
            ← Return to Customer Storefront
          </button>
        </div>

      </div>
    </div>
  );
};
