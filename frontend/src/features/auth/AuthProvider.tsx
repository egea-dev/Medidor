import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Tipo de usuario extendido con rol
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

// Usuario demo para desarrollo sin conexión a Supabase
const DEMO_USER: AppUser = {
  id: 'demo-user-001',
  email: 'demo@egea.es',
  name: 'Demo Egea',
  role: 'admin', // En demo somos admin por defecto
};
const DEMO_PASSWORD = '123456';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si no hay cliente de Supabase, usar modo demo desde localStorage
    if (!supabase) {
      const saved = localStorage.getItem('egea_auth_user');
      if (saved) {
        try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
      }
      setLoading(false);
      return;
    }

    // Configuración real con Supabase
    const initAuth = async () => {
      if (!supabase) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user.email!);
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id, session.user.email!);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    if (!supabase) return;

    try {
      // Intentar obtener el perfil
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (profile) {
        setUser({
          id: userId,
          email,
          name: profile.full_name || email.split('@')[0],
          role: profile.role || 'user',
          avatar_url: profile.avatar_url,
        });
      } else {
        // Si no existe perfil (ej: trigger falló o usuario antiguo), usar datos básicos
        setUser({
          id: userId,
          email,
          name: email.split('@')[0],
          role: 'user', // Rol por defecto
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback a usuario básico en caso de error
      setUser({
        id: userId,
        email,
        name: email.split('@')[0],
        role: 'user',
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      // Fallback modo demo
      if (email === DEMO_USER.email && password === DEMO_PASSWORD) {
        setUser(DEMO_USER);
        localStorage.setItem('egea_auth_user', JSON.stringify(DEMO_USER));
        return { error: null };
      }
      return { error: new Error('Modo Demo: Usa demo@egea.es / 123456') };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) {
      return { error: new Error('Registro deshabilitado en modo demo.') };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    return { error };
  };

  const signOut = async () => {
    if (!supabase) {
      setUser(null);
      localStorage.removeItem('egea_auth_user');
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
