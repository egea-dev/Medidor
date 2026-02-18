import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    Building,
    Camera,
    ArrowLeft,
    Save,
    Loader2,
    CheckCircle,
    Settings,
    ShieldCheck
} from 'lucide-react';
import { profileService } from '@/services/profileService';
import { useAuth } from '@/features/auth/AuthProvider';

export default function UserProfile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await profileService.getProfile();
            setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
            setMessage({ type: 'error', text: 'No se pudo cargar el perfil' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await profileService.updateProfile({
                full_name: profile.full_name,
                phone: profile.phone,
                company: profile.company
            });
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
            // Reset message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            const result = await profileService.uploadAvatar(file);
            setProfile({ ...profile, avatar_url: result.url });
            setMessage({ type: 'success', text: 'Foto actualizada' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al subir la imagen' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-500" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            {/* Header móvil */}
            <div className="md:hidden bg-white px-4 py-4 flex items-center justify-between border-b sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <h1 className="font-bold text-slate-900">Mi Perfil</h1>
                <div className="w-10"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 md:py-12">
                {/* Desktop Header */}
                <div className="hidden md:flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Perfil de Usuario</h1>
                        <p className="text-slate-500 text-sm">Gestiona tus datos personales y preferencias</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Avatar y Acciones Rápidas */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
                            <div className="relative inline-block mb-4">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-4xl font-bold text-slate-400 uppercase">
                                            {(profile?.full_name || profile?.email || 'U').charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-2.5 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-transform active:scale-95"
                                >
                                    <Camera size={18} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                // En móvil, capture="user" o sin capture pero accept image/* suele ofrecer cámara
                                />
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 truncate">{profile?.full_name || 'Sin nombre'}</h2>
                            <div className="flex items-center justify-center gap-1.5 mt-1 text-sm font-medium">
                                {user?.role === 'admin' ? (
                                    <span className="bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold">
                                        <ShieldCheck size={12} /> Administrador
                                    </span>
                                ) : (
                                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-bold">
                                        Medidor Oficial
                                    </span>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 space-y-2">
                                {user?.role === 'admin' && (
                                    <button
                                        onClick={() => navigate('/admin')}
                                        className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                                    >
                                        <Settings size={18} /> Ir al Panel Admin
                                    </button>
                                )}
                                <button
                                    onClick={signOut}
                                    className="w-full py-3 px-4 bg-white text-rose-600 border border-rose-100 rounded-xl text-sm font-bold hover:bg-rose-50 transition-colors"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Formulario de Datos */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50">
                                <h3 className="font-bold text-slate-900">Datos Personales</h3>
                            </div>

                            <form onSubmit={handleUpdate} className="p-8 space-y-6">
                                {message && (
                                    <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                        }`}>
                                        {message.type === 'success' ? <CheckCircle size={20} /> : <div className="font-bold">⚠️</div>}
                                        <p className="text-sm font-medium">{message.text}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-400 uppercase ml-1">Nombre Completo</label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                required
                                                value={profile?.full_name || ''}
                                                onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-11 py-3 text-sm font-medium outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm"
                                                placeholder="Ej: Juan Pérez"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-400 uppercase ml-1">Email (No editable)</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="email"
                                                disabled
                                                value={profile?.email || ''}
                                                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-11 py-3 text-sm font-medium text-slate-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-400 uppercase ml-1">Teléfono</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="tel"
                                                value={profile?.phone || ''}
                                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-11 py-3 text-sm font-medium outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm"
                                                placeholder="Ej: +34 600 000 000"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-400 uppercase ml-1">Empresa / Delegación</label>
                                        <div className="relative">
                                            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                value={profile?.company || ''}
                                                onChange={e => setProfile({ ...profile, company: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-11 py-3 text-sm font-medium outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm"
                                                placeholder="Cortinas Express Central"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full sm:w-auto bg-brand-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 disabled:opacity-50 active:scale-95"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
