import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, fbSignOut } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  quickAdminLogin: () => void;
  logout: () => Promise<void>;
  adminEmail: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'aurelia_admin_override_v1';
const BOOTSTRAPPED_ADMIN_EMAIL = 'mralexander461@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQuickAdmin, setIsQuickAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const quickAdminLogin = () => {
    setIsQuickAdmin(true);
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn(e);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Signout error:', e);
    }
    setIsQuickAdmin(false);
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  const isAdmin = 
    isQuickAdmin || 
    (user !== null && (
      user.email === BOOTSTRAPPED_ADMIN_EMAIL ||
      user.email?.endsWith('@zarorathub.com') ||
      user.email === 'admin@zarorathub.com' ||
      user.email?.endsWith('@aurelialiving.com') ||
      user.email === 'admin@aurelialiving.com'
    ));

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        signInWithGoogle,
        quickAdminLogin,
        logout,
        adminEmail: BOOTSTRAPPED_ADMIN_EMAIL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
