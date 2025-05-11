
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    // This is a placeholder. In a real app, we'd check with Supabase here
    // const { data: { user } } = await supabase.auth.getUser()
    
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      
      // Placeholder for Supabase signup
      // const { data, error } = await supabase.auth.signUp({ email, password })
      // if (error) throw error
      
      // For demo purposes, we'll simulate successful signup
      const newUser = {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        email,
        name: name || email.split('@')[0]
      };
      
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      
      // Comment for connecting to Supabase
      // Placeholder: Connect to Supabase Auth: auth.signUp()
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Placeholder for Supabase signin
      // const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      // if (error) throw error
      
      // For demo purposes, we'll simulate successful login
      const mockUser = {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        email,
        name: email.split('@')[0]
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      // Comment for connecting to Supabase
      // Placeholder: Connect to Supabase Auth: auth.signInWithPassword()
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Placeholder for Supabase signout
      // await supabase.auth.signOut()
      
      localStorage.removeItem('user');
      setUser(null);
      
      // Comment for connecting to Supabase
      // Placeholder: Connect to Supabase Auth: auth.signOut()
      
      navigate('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
