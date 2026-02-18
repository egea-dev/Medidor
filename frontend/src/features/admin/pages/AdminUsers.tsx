import React, { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { adminService } from '@/services/adminService';
import {
    Search, Loader2, Shield, ShieldAlert, User,
    CheckCircle, XCircle, ChevronDown, RefreshCw
} from 'lucide-react';

type UserRole = 'admin' | 'user';

interface UserProfile {
    id: string;
    full_name: string | null;
    email: string | null;
    role: UserRole;
    is_active: boolean;
    created_at: string;
    company?: string;
    phone?: string;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadUsers = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const data = await adminService.getAllUsers();
            setUsers(data as UserProfile[]);
        } catch (e) {
            console.error('Error loading users:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    const handleRoleChange = async (userId: string, currentRole: UserRole) => {
        const newRole: UserRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`¿Cambiar rol a "${newRole === 'admin' ? 'Administrador' : 'Usuario'}"?`)) return;
        setActionLoading(userId + '_role');
        try {
            await adminService.updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (e) {
            alert('Error al cambiar rol');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleActive = async (userId: string, isActive: boolean) => {
        if (!window.confirm(`¿${isActive ? 'Desactivar' : 'Activar'} este usuario?`)) return;
        setActionLoading(userId + '_status');
        try {
            await adminService.toggleUserActive(userId, !isActive);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !isActive } : u));
        } catch (e) {
            alert('Error al cambiar estado');
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = useMemo(() => users.filter(u => {
        const matchSearch = !searchTerm ||
            u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = filterRole === 'all' || u.role === filterRole;
        const matchStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && u.is_active) ||
            (filterStatus === 'inactive' && !u.is_active);
        return matchSearch && matchRole && matchStatus;
    }), [users, searchTerm, filterRole, filterStatus]);

    const admins = users.filter(u => u.role === 'admin').length;
    const actives = users.filter(u => u.is_active).length;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'user' as UserRole
    });

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminService.createUser(formData);
            setShowCreateModal(false);
            setFormData({ email: '', password: '', full_name: '', role: 'user' });
            loadUsers();
        } catch (e: any) {
            alert(e.message || 'Error al crear usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="Gestión de Usuarios" subtitle={`${users.length} usuarios registrados`}>
            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-wrap gap-3">
                    {[
                        { label: 'Total', value: users.length, cls: 'bg-slate-100 text-slate-700' },
                        { label: 'Admins', value: admins, cls: 'bg-violet-100 text-violet-700' },
                        { label: 'Activos', value: actives, cls: 'bg-emerald-100 text-emerald-700' },
                        { label: 'Inactivos', value: users.length - actives, cls: 'bg-red-100 text-red-700' },
                    ].map(chip => (
                        <div key={chip.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${chip.cls}`}>
                            <span>{chip.value}</span>
                            <span className="font-normal opacity-70">{chip.label}</span>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-700 transition-all shadow-sm"
                >
                    <User size={18} />
                    Nuevo Usuario
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                    <Search size={16} className="text-slate-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <select
                            value={filterRole}
                            onChange={e => setFilterRole(e.target.value as any)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-8 text-sm text-slate-700 outline-none cursor-pointer"
                        >
                            <option value="all">Todos los roles</option>
                            <option value="admin">Administrador</option>
                            <option value="user">Usuario</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value as any)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-8 text-sm text-slate-700 outline-none cursor-pointer"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="active">Activos</option>
                            <option value="inactive">Inactivos</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                        onClick={() => loadUsers(true)}
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
                            <User size={24} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No se encontraron usuarios</p>
                        <p className="text-slate-400 text-sm mt-1">Prueba con otros filtros</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile View: Cards */}
                        <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                            {filtered.map(u => (
                                <div key={u.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg flex-shrink-0">
                                            {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-slate-900 truncate">{u.full_name || 'Sin nombre'}</p>
                                            <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${u.role === 'admin'
                                            ? 'bg-violet-50 text-violet-700 border-violet-100'
                                            : 'bg-white text-slate-600 border-slate-200'
                                            }`}>
                                            {u.role === 'admin' ? <ShieldAlert size={10} /> : <User size={10} />}
                                            {u.role === 'admin' ? 'ADMIN' : 'USUARIO'}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border ${u.is_active
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-red-50 text-red-600 border-red-100'
                                            }`}>
                                            {u.is_active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                            {u.is_active ? 'ACTIVO' : 'INACTIVO'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                                        <button
                                            onClick={() => handleRoleChange(u.id, u.role)}
                                            disabled={actionLoading === u.id + '_role'}
                                            className="flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold rounded-xl border transition-all text-violet-600 border-violet-200 bg-white hover:bg-violet-50"
                                        >
                                            {actionLoading === u.id + '_role' ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                                            Rol
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(u.id, u.is_active)}
                                            disabled={actionLoading === u.id + '_status'}
                                            className={`flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold rounded-xl border transition-all bg-white ${u.is_active
                                                ? 'text-red-600 border-red-200 hover:bg-red-50'
                                                : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                                                }`}
                                        >
                                            {actionLoading === u.id + '_status' ? <Loader2 size={12} className="animate-spin" /> : u.is_active ? <XCircle size={12} /> : <CheckCircle size={12} />}
                                            {u.is_active ? 'Baja' : 'Alta'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View: Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                                        <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                                        <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                        <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Registro</th>
                                        <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filtered.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                                                        {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{u.full_name || <span className="text-slate-400 italic">Sin nombre</span>}</p>
                                                        <p className="text-xs text-slate-400">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${u.role === 'admin'
                                                    ? 'bg-violet-50 text-violet-700 border-violet-100'
                                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                                    }`}>
                                                    {u.role === 'admin' ? <ShieldAlert size={11} /> : <User size={11} />}
                                                    {u.role === 'admin' ? 'Administrador' : 'Usuario'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.is_active ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                                                        <CheckCircle size={11} /> Activo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full">
                                                        <XCircle size={11} /> Inactivo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-xs">
                                                {new Date(u.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleRoleChange(u.id, u.role)}
                                                        disabled={actionLoading === u.id + '_role'}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all hover:shadow-sm disabled:opacity-50
                                                            text-violet-600 border-violet-200 bg-violet-50 hover:bg-violet-100"
                                                        title="Cambiar rol"
                                                    >
                                                        {actionLoading === u.id + '_role' ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                                                        {u.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(u.id, u.is_active)}
                                                        disabled={actionLoading === u.id + '_status'}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all hover:shadow-sm disabled:opacity-50 ${u.is_active
                                                            ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100'
                                                            : 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                                                            }`}
                                                        title={u.is_active ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {actionLoading === u.id + '_status' ? <Loader2 size={12} className="animate-spin" /> : u.is_active ? <XCircle size={12} /> : <CheckCircle size={12} />}
                                                        {u.is_active ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
                                Mostrando {filtered.length} de {users.length} usuarios
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <User className="text-brand-500" size={20} />
                                Nuevo Usuario
                            </h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                                    placeholder="email@ejemplo.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Contraseña</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Rol</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 transition-all font-medium"
                                >
                                    <option value="user">Usuario (Medidor)</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-brand-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-brand-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
