import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';

const Loading = () => (
    <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-brand-500 font-bold text-lg">Cargando panel...</div>
    </div>
);

// AdminRoute: solo permite el acceso a usuarios con rol 'admin'.
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <Loading />;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />;

    return <>{children}</>;
};
