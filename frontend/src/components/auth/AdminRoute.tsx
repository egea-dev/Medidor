import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';

const Loading = () => (
    <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-brand-500 font-bold text-lg">Cargando panel...</div>
    </div>
);

// AdminRoute: permite el acceso a cualquier usuario autenticado.
// La seguridad real se gestiona en el backend con RLS de Supabase.
// Si quieres restringir solo a admins, cambia la condición a: user.role !== 'admin'
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <Loading />;
    if (!user) return <Navigate to="/login" replace />;

    return <>{children}</>;
};
