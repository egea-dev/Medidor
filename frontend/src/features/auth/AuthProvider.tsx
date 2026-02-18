import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

// Tipo de usuario coincidente con el nuevo backend
export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar_url?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Intentar validar/refrescar contra el backend
          const userData = await api.get('/auth/me');
          const fullUser = {
            ...userData,
            name: userData.full_name || userData.email.split('@')[0],
          };
          setUser(fullUser);
          localStorage.setItem('user', JSON.stringify(fullUser));
        } catch (error) {
          console.error('Error validando sesión:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.post('/auth/login', { email, password });
      const { token, user: userData } = data;

      const appUser: AppUser = {
        id: userData.id,
        email: userData.email,
        name: userData.full_name || userData.email.split('@')[0],
        role: userData.role || 'user',
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(appUser));
      setUser(appUser);

      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || 'Error al iniciar sesión') };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      await api.post('/auth/register', { email, password, fullName });
      // Tras registrarse, no hacemos login automático aquí (o sí, según el backend)
      // Por ahora, el backend devuelve 201 Created.
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || 'Error al registrarse') };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
