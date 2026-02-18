import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { AdminRoute } from '@/components/auth/AdminRoute';

import { MobileNav } from '@/components/layout/MobileNav';

const WizardPage = lazy(() => import('@/features/wizard/components/WizardPage'));
const ProjectList = lazy(() => import('@/features/projects/components/ProjectList'));
const ProjectDetail = lazy(() => import('@/features/projects/components/ProjectDetail'));
const LoginForm = lazy(() => import('@/features/auth/components/LoginForm'));
const UserProfile = lazy(() => import('@/features/auth/components/UserProfile'));
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'));
const AdminUsers = lazy(() => import('@/features/admin/pages/AdminUsers'));
const AdminProjects = lazy(() => import('@/features/admin/pages/AdminProjects'));


const Loading = () => (
    <div className="min-h-[100dvh] bg-brand-50 flex items-center justify-center">
        <div className="animate-pulse text-brand-500 font-bold text-lg">Cargando...</div>
    </div>
);

/** Rutas protegidas: redirige a /login si no hay usuario */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <Loading />;
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

/** Ruta pública: si ya está logueado, redirige a / */
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <Loading />;
    if (user) return <Navigate to="/" replace />;
    return <>{children}</>;
};

function AppRoutes() {
    return (
        <>
            <Routes>
                {/* Login: solo visible si NO está logueado */}
                <Route path="/login" element={
                    <PublicOnlyRoute><LoginForm /></PublicOnlyRoute>
                } />

                {/* Rutas protegidas */}
                <Route path="/" element={
                    <ProtectedRoute><WizardPage /></ProtectedRoute>
                } />
                <Route path="/projects" element={
                    <ProtectedRoute><ProjectList /></ProtectedRoute>
                } />
                <Route path="/projects/:id" element={
                    <ProtectedRoute><ProjectDetail /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute><UserProfile /></ProtectedRoute>
                } />

                {/* Rutas de Administración */}
                <Route path="/admin" element={
                    <AdminRoute><AdminDashboard /></AdminRoute>
                } />
                <Route path="/admin/users" element={
                    <AdminRoute><AdminUsers /></AdminRoute>
                } />
                <Route path="/admin/projects" element={
                    <AdminRoute><AdminProjects /></AdminRoute>
                } />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>

            {/* MobileNav solo visible cuando hay usuario */}
            <AuthenticatedNav />
        </>
    );
}

const AuthenticatedNav: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;
    return <MobileNav />;
};

export default function App() {
    return (
        <AuthProvider>
            <Suspense fallback={<Loading />}>
                <AppRoutes />
            </Suspense>
        </AuthProvider>
    );
}
