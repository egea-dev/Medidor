import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { adminService } from '@/services/adminService';
import { Users, FolderKanban, Ruler, TrendingUp, ArrowRight, Clock, MapPin, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Stats {
    users: number;
    projects: number;
    measurements: number;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats>({ users: 0, projects: 0, measurements: 0 });
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [statsData, projectsData, usersData] = await Promise.all([
                    adminService.getStats(),
                    adminService.getAllProjects(),
                    adminService.getAllUsers(),
                ]);
                setStats(statsData);
                setRecentProjects(projectsData.slice(0, 6));
                setRecentUsers(usersData.slice(0, 5));
            } catch (e) {
                console.error('Error loading dashboard:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const kpis = [
        {
            label: 'Usuarios Registrados',
            value: stats.users,
            icon: Users,
            color: 'bg-violet-500',
            bg: 'bg-violet-50',
            text: 'text-violet-600',
            trend: '+12% este mes',
        },
        {
            label: 'Proyectos Totales',
            value: stats.projects,
            icon: FolderKanban,
            color: 'bg-blue-500',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            trend: `${stats.projects} activos`,
        },
        {
            label: 'Medidas Realizadas',
            value: stats.measurements,
            icon: Ruler,
            color: 'bg-emerald-500',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            trend: `Promedio ${stats.projects > 0 ? Math.round(stats.measurements / stats.projects) : 0}/proyecto`,
        },
    ];

    const statusLabel = (status: string) => {
        const map: Record<string, { label: string; cls: string }> = {
            completed: { label: 'Completado', cls: 'bg-green-100 text-green-700' },
            in_progress: { label: 'En Progreso', cls: 'bg-blue-100 text-blue-700' },
            draft: { label: 'Borrador', cls: 'bg-amber-100 text-amber-700' },
        };
        return map[status] || { label: status || 'Borrador', cls: 'bg-gray-100 text-gray-600' };
    };

    return (
        <AdminLayout title="Dashboard" subtitle="Resumen general del sistema">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${kpi.bg}`}>
                                <kpi.icon size={22} className={kpi.text} />
                            </div>
                            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                                <TrendingUp size={11} />
                                {kpi.trend}
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 mb-1">
                            {loading ? <span className="animate-pulse">—</span> : kpi.value}
                        </p>
                        <p className="text-sm text-slate-500 font-medium">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Últimos proyectos (2/3) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div>
                            <h2 className="font-bold text-slate-900">Últimos Proyectos</h2>
                            <p className="text-xs text-slate-400">Actividad reciente de clientes</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/projects')}
                            className="flex items-center gap-1 text-sm text-brand-600 font-semibold hover:text-brand-800 transition-colors"
                        >
                            Ver todos <ArrowRight size={15} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Cargando proyectos...</div>
                    ) : recentProjects.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">No hay proyectos aún</div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {recentProjects.map((p: any) => {
                                const s = statusLabel(p.status);
                                return (
                                    <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                                            <MapPin size={18} className="text-brand-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 text-sm truncate">{p.location || 'Sin ubicación'}</p>
                                            <p className="text-xs text-slate-400 truncate">{p.user_profiles?.full_name || p.user_profiles?.email || 'Cliente desconocido'}</p>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="text-xs text-slate-400 hidden sm:block">
                                                {new Date(p.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                                            <button
                                                onClick={() => navigate(`/projects/${p.id}`)}
                                                className="text-slate-300 hover:text-brand-500 transition-colors"
                                            >
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Últimos usuarios (1/3) */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div>
                            <h2 className="font-bold text-slate-900">Usuarios</h2>
                            <p className="text-xs text-slate-400">Últimos registrados</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="flex items-center gap-1 text-sm text-brand-600 font-semibold hover:text-brand-800 transition-colors"
                        >
                            Ver todos <ArrowRight size={15} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-6 text-center text-slate-400">Cargando...</div>
                    ) : recentUsers.length === 0 ? (
                        <div className="p-6 text-center text-slate-400">Sin usuarios</div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {recentUsers.map((u: any) => (
                                <div key={u.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                                        {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{u.full_name || 'Sin nombre'}</p>
                                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {u.role === 'admin' ? 'Admin' : 'User'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
