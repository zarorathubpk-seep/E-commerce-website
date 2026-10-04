import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ADMIN_EMAIL, ADMIN_REQUIRED_PASSWORD } from '../config/admin';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isOwnerEmail: boolean;
  loading: boolean;
  loginMerchant: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  adminEmail: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_KEY = 'zh_merchant_session_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMerchantSession, setIsMerchantSession] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsMerchantSession(true);
        try { localStorage.setItem(SESSION_KEY, 'true'); } catch {}
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginMerchant = async (emailInput: string, passInput: string): Promise<boolean> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passInput.trim();

    // Verify exact merchant owner credentials
    if (cleanEmail !== ADMIN_EMAIL.toLowerCase() || cleanPass !== ADMIN_REQUIRED_PASSWORD) {
      throw new Error('Incorrect merchant email or password.');
    }

    // Try authenticating with Firebase Auth (or creating if not created yet)
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      setUser(cred.user);
    } catch (firebaseErr: any) {
      const code = firebaseErr?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
          setUser(newCred.user);
        } catch (createErr) {
          console.warn('Firebase createUser notice:', createErr);
        }
      } else {
        console.warn('Firebase signIn notice:', firebaseErr);
      }
    }

    // Set authenticated merchant session
    setIsMerchantSession(true);
    try {
      localStorage.setItem(SESSION_KEY, 'true');
    } catch (e) {
      console.warn(e);
    }
    return true;
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Signout error:', e);
    }
    setUser(null);
    setIsMerchantSession(false);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  const isOwnerEmail = Boolean(
    (user && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ||
    isMerchantSession
  );

  // Admin access is granted ONLY to the verified merchant owner
  const isAdmin = isOwnerEmail;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isOwnerEmail,
        loading,
        loginMerchant,
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
