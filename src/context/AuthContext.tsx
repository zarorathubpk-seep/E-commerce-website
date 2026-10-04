import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ADMIN_EMAIL } from '../config/admin';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isOwnerEmail: boolean;
  emailVerified: boolean;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<User>;
  resendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<boolean>;
  logout: () => Promise<void>;
  adminEmail: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string): Promise<User> => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    setUser(cred.user);
    return cred.user;
  };

  const resendVerificationEmail = async (): Promise<void> => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const reloadUser = async (): Promise<boolean> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const updated = auth.currentUser;
      setUser({ ...updated });
      return Boolean(updated.emailVerified);
    }
    return false;
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Signout error:', e);
    }
    setUser(null);
  };

  const isOwnerEmail = Boolean(
    user && 
    user.email && 
    user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  const emailVerified = Boolean(user && user.emailVerified);

  // Admin access is granted ONLY if user is logged in, their email matches ADMIN_EMAIL exactly, and their email is verified
  const isAdmin = Boolean(isOwnerEmail && emailVerified);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isOwnerEmail,
        emailVerified,
        loading,
        signInWithEmail,
        resendVerificationEmail,
        reloadUser,
        logout,
        adminEmail: ADMIN_EMAIL,
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
