import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FolderKanban, Plus, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';


export const MobileNav: React.FC = () => {
    const { user } = useAuth();

    return (

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-around items-center z-50 px-2 py-1 safe-area-bottom">
            <NavLink
                to="/"
                end
                className={({ isActive }) => `flex flex-col items-center py-1 px-3 transition-all ${isActive ? 'text-brand-600' : 'text-gray-400'}`}
            >
                <Home size={18} />
                <span className="text-[9px] font-semibold mt-0.5">Inicio</span>
            </NavLink>

            <NavLink
                to="/projects"
                className={({ isActive }) => `flex flex-col items-center py-1 px-3 transition-all ${isActive ? 'text-brand-600' : 'text-gray-400'}`}
            >
                <FolderKanban size={18} />
                <span className="text-[9px] font-semibold mt-0.5">Proyectos</span>
            </NavLink>

            <NavLink
                to="/"
                className="bg-brand-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg -mt-4 active:scale-90 transition-transform"
            >
                <Plus size={22} strokeWidth={2.5} />
            </NavLink>

            {user && (
                <NavLink
                    to="/admin"
                    className={({ isActive }) => `flex flex-col items-center py-1 px-3 transition-all ${isActive ? 'text-brand-600' : 'text-gray-400'}`}
                >
                    <LayoutDashboard size={18} />
                    <span className="text-[9px] font-semibold mt-0.5">Admin</span>
                </NavLink>
            )}

            <NavLink
                to="/profile"
                className={({ isActive }) => `flex flex-col items-center py-1 px-3 transition-all ${isActive ? 'text-brand-600' : 'text-gray-400'}`}
            >
                <User size={18} />
                <span className="text-[9px] font-semibold mt-0.5">Perfil</span>
            </NavLink>
        </nav>
    );
};
