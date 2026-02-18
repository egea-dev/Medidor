import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../AuthProvider';
import { User, Mail, ShieldCheck, LogOut, ChevronRight, Activity, Calendar, LayoutDashboard } from 'lucide-react';


export const UserProfile: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();


    if (!user) return null;

    const stats = [
        { label: 'Proyectos', value: '12', icon: Activity, color: 'text-blue-500' },
        { label: 'Miembro desde', value: 'Feb 2024', icon: Calendar, color: 'text-brand-500' },
        { label: 'Rol', value: 'Instalador', icon: ShieldCheck, color: 'text-green-500' },
    ];

    return (
        <div className="min-h-[100dvh] bg-brand-50 p-4 md:p-8 flex flex-col items-center animate-fadeIn">
            <div className="w-full max-w-md mt-4 md:mt-10">
                {/* Header Card with "Aires" */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-6 transition-all hover:shadow-2xl">
                    <div className="h-24 bg-brand-900 relative">
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60"
                                    alt="User Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
                        <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5 mb-6">
                            <Mail size={14} /> {user.email}
                        </p>

                        {/* DEBUG INFO - REMOVE LATER */}
                        <div className="mb-4 inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-mono text-gray-500 border border-gray-200">
                            Role: {user.role || 'undefined'} | ID: {user.id?.slice(0, 8)}...
                        </div>

                        <div className="flex justify-around items-center pt-6 border-t border-gray-50">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className={`p-2 rounded-xl bg-gray-50 ${stat.color} mb-2 shadow-sm`}>
                                        <stat.icon size={18} />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{stat.label}</span>
                                    <span className="text-sm font-bold text-gray-800">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Account Settings / Actions */}
                <div className="space-y-3 mb-10">
                    {user.role === 'admin' && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-full bg-brand-900 text-white p-4 rounded-2xl shadow-lg shadow-brand-900/20 flex items-center justify-between group hover:bg-black transition-all mb-3 transform hover:-translate-y-1"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <LayoutDashboard size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold">Panel de Administración</p>
                                    <p className="text-xs text-brand-200">Gestión global del sistema</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-brand-300 group-hover:text-white transition-colors" />
                        </button>
                    )}

                    <button className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-brand-200 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-800">Mi Perfil</p>
                                <p className="text-xs text-gray-400">Edita tus datos personales</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-brand-500 transition-colors" />
                    </button>

                    <button className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-brand-200 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-800">Seguridad</p>
                                <p className="text-xs text-gray-400">Contraseña y acceso</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-brand-500 transition-colors" />
                    </button>
                </div>

                {/* Sign Out Section with real "Aire" */}
                <div className="px-4">
                    <button
                        onClick={signOut}
                        className="w-full py-4 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                    >
                        <LogOut size={20} /> Cerrar Sesión
                    </button>
                    <p className="text-center text-[10px] text-gray-300 mt-6 uppercase tracking-[0.2em] font-medium">
                        Cortinas Express v2.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
