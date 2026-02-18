import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Settings,
    LogOut,
    X
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
    const { signOut } = useAuth();

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/admin/users', icon: Users, label: 'Usuarios', end: false },
        { path: '/admin/projects', icon: FolderKanban, label: 'Proyectos', end: false },
        { path: '/admin/settings', icon: Settings, label: 'Configuración', end: false },
    ];

    return (
        <>
            {/* Overlay móvil */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xl tracking-tight">
                                Backoffice <span className="text-brand-500">Egea</span>
                            </span>
                        </div>
                        <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                onClick={() => onClose()} // Cerrar en móvil al navegar
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                                    ${isActive
                                        ? 'bg-brand-600 text-white shadow-md'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }
                                `}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer / Logout */}
                    <div className="p-4 border-t border-gray-800">
                        <button
                            onClick={signOut}
                            className="flex items-center gap-3 px-3 py-3 w-full text-left text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};
