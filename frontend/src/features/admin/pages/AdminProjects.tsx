import React, { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { adminService } from '@/services/adminService';
import {
    Search, Loader2, FolderKanban, MapPin, User,
    Trash2, ChevronDown, RefreshCw, Eye, Calendar, Ruler
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface Project {
    id: string;
    location: string | null;
    client_name: string | null;
    client_phone: string | null;
    status: string | null;
    created_at: string;
    measurements: any[];
    user_profiles: { full_name: string | null; email: string | null } | null;
}

const statusConfig: Record<string, { label: string; cls: string }> = {
    completed: { label: 'Completado', cls: 'bg-green-100 text-green-700 border-green-200' },
    in_progress: { label: 'En Progreso', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    draft: { label: 'Borrador', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
};

export default function AdminProjects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadProjects = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const data = await adminService.getAllProjects();
            setProjects(data as Project[]);
        } catch (e) {
            console.error('Error loading projects:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadProjects(); }, []);

    const handleDelete = async (projectId: string, location: string | null) => {
        if (!window.confirm(`¿Eliminar el proyecto "${location || 'Sin nombre'}"? Esta acción no se puede deshacer.`)) return;
        setDeletingId(projectId);
        try {
            if (!supabase) throw new Error('Supabase no configurado');
            const { error } = await supabase.from('projects').delete().eq('id', projectId);
            if (error) throw error;
            setProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (e) {
            alert('Error al eliminar el proyecto');
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = useMemo(() => projects.filter(p => {
        const matchSearch = !searchTerm ||
            p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.user_profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchSearch && matchStatus;
    }), [projects, searchTerm, filterStatus]);

    const totalMeasurements = projects.reduce((acc, p) => acc + (p.measurements?.length || 0), 0);

    return (
        <AdminLayout title="Gestión de Proyectos" subtitle={`${projects.length} proyectos en total`}>
            {/* Summary chips */}
            <div className="flex flex-wrap gap-3 mb-6">
                {[
                    { label: 'Total', value: projects.length, cls: 'bg-slate-100 text-slate-700' },
                    { label: 'Completados', value: projects.filter(p => p.status === 'completed').length, cls: 'bg-green-100 text-green-700' },
                    { label: 'En Progreso', value: projects.filter(p => p.status === 'in_progress').length, cls: 'bg-blue-100 text-blue-700' },
                    { label: 'Borradores', value: projects.filter(p => !p.status || p.status === 'draft').length, cls: 'bg-amber-100 text-amber-700' },
                    { label: 'Medidas', value: totalMeasurements, cls: 'bg-violet-100 text-violet-700' },
                ].map(chip => (
                    <div key={chip.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${chip.cls}`}>
                        <span>{chip.value}</span>
                        <span className="font-normal opacity-70">{chip.label}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                    <Search size={16} className="text-slate-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Buscar por ubicación, cliente o usuario..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-8 text-sm text-slate-700 outline-none cursor-pointer"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="completed">Completado</option>
                            <option value="in_progress">En Progreso</option>
                            <option value="draft">Borrador</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                        onClick={() => loadProjects(true)}
                        disabled={refreshing}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                        title="Actualizar"
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="animate-spin text-brand-500" size={36} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FolderKanban size={24} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No se encontraron proyectos</p>
                        <p className="text-slate-400 text-sm mt-1">Prueba con otros filtros</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Proyecto</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Usuario</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                    <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Medidas</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Fecha</th>
                                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(p => {
                                    const s = statusConfig[p.status || ''] || statusConfig['draft'];
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                                                        <MapPin size={18} className="text-brand-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 truncate max-w-[180px]">{p.location || <span className="text-slate-400 italic">Sin ubicación</span>}</p>
                                                        {p.client_name && <p className="text-xs text-slate-400 truncate">{p.client_name}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden sm:table-cell">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs flex-shrink-0">
                                                        {(p.user_profiles?.full_name || p.user_profiles?.email || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-700 font-medium text-xs">{p.user_profiles?.full_name || 'Sin nombre'}</p>
                                                        <p className="text-slate-400 text-xs">{p.user_profiles?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>
                                                    {s.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center hidden md:table-cell">
                                                <div className="flex items-center justify-center gap-1 text-slate-600">
                                                    <Ruler size={13} className="text-slate-400" />
                                                    <span className="font-semibold">{p.measurements?.length || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                                                    <Calendar size={12} />
                                                    {new Date(p.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/projects/${p.id}`)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all"
                                                        title="Ver proyecto"
                                                    >
                                                        <Eye size={12} /> Ver
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(p.id, p.location)}
                                                        disabled={deletingId === p.id}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border text-red-600 border-red-200 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-50"
                                                        title="Eliminar proyecto"
                                                    >
                                                        {deletingId === p.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
                            Mostrando {filtered.length} de {projects.length} proyectos
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
