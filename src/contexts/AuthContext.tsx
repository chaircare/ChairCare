import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { User as FirebaseUser } from 'firebase/auth';
import { signInUser, signOutUser, onAuthStateChange, getUserProfile } from 'lib/firebase-auth';
import { User } from 'types/chair-care';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      if (!mounted) return;
      
      try {
        if (firebaseUser) {
          const userProfile = await getUserProfile(firebaseUser.uid);
          if (userProfile && userProfile.status === 'approved') {
            if (mounted) {
              setUser({
                id: userProfile.id,
                email: userProfile.email,
                name: userProfile.name,
                role: userProfile.role,
                companyName: userProfile.companyName,
                createdAt: userProfile.createdAt?.toDate ? userProfile.createdAt.toDate() : new Date(),
                updatedAt: userProfile.updatedAt?.toDate ? userProfile.updatedAt.toDate() : new Date()
              });
            }
          } else {
            if (mounted) {
              setUser(null);
            }
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error getting user profile:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const userProfile = await signInUser(email, password);
      if (userProfile) {
        setUser({
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          companyName: userProfile.companyName,
          createdAt: userProfile.createdAt?.toDate ? userProfile.createdAt.toDate() : new Date(),
          updatedAt: userProfile.updatedAt?.toDate ? userProfile.updatedAt.toDate() : new Date()
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOutUser();
      setUser(null);
      
      // Only redirect if we're not already on the login page
      if (router.pathname !== '/login') {
        await router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      
      // Force redirect on error
      if (router.pathname !== '/login') {
        await router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading: loading || !isInitialized,
    login,
    logout,
    isAuthenticated: !!user && isInitialized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};