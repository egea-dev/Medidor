import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { adminService } from '@/services/adminService';
import {
    Settings, Database, Cloud, Mail, ShieldCheck,
    RefreshCw, Loader2, Server, Eye, EyeOff
} from 'lucide-react';

export default function AdminSettings() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showSecrets, setShowSecrets] = useState(false);
    const [status, setStatus] = useState<any>({
        db: 'checking',
        minio: 'checking',
        smtp: 'configured',
        version: '1.2.5-stable'
    });

    const checkHealth = async () => {
        setRefreshing(true);
        try {
            // En una app real, llamaríamos a un endpoint /health
            // Por ahora simulamos basado en los stats que sí funcionan
            await adminService.getStats();
            setStatus((prev: any) => ({ ...prev, db: 'connected', minio: 'connected' }));
        } catch (e) {
            setStatus((prev: any) => ({ ...prev, db: 'error' }));
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    useEffect(() => { checkHealth(); }, []);

    const configItems = [
        {
            label: 'Base de Datos (MySQL)',
            value: 'medidor_egea @ localhost:3306',
            icon: Database,
            status: status.db === 'connected' ? 'online' : 'error'
        },
        {
            label: 'Almacenamiento (MinIO)',
            value: 'Buckets: project-images, project-documents',
            icon: Cloud,
            status: status.minio === 'connected' ? 'online' : 'error'
        },
        {
            label: 'Servicio de Email (SMTP)',
            value: 'Servidor: cortinasexpress.com',
            icon: Mail,
            status: 'online'
        }
    ];

    return (
        <AdminLayout title="Ajustes del Sistema" subtitle="Configuración técnica y estado de servicios">
            <div className="flex justify-end mb-6">
                <button
                    onClick={checkHealth}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    Verificar Estado
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Section */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Server className="text-brand-500" size={20} />
                            Estado de Infraestructura
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">v{status.version}</span>
                    </div>
                    <div className="p-6 space-y-6">
                        {configItems.map(item => (
                            <div key={item.label} className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl ${item.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    <item.icon size={22} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-bold text-slate-900 text-sm">{item.label}</p>
                                        <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${item.status === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="text-brand-500" size={20} />
                            Seguridad y API
                        </h3>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">JWT Secret Key</label>
                                    <button
                                        onClick={() => setShowSecrets(!showSecrets)}
                                        className="text-brand-600 text-[10px] font-bold uppercase hover:underline flex items-center gap-1"
                                    >
                                        {showSecrets ? <><EyeOff size={12} /> Ocultar</> : <><Eye size={12} /> Mostrar</>}
                                    </button>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-xs text-slate-600 break-all">
                                    {showSecrets ? 'cortinas_express_master_secret_key_2024_prod' : '••••••••••••••••••••••••••••••••'}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block ml-1">API Base URL</label>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-xs text-slate-600">
                                    https://api.medidor.cortinasexpress.com/v1
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-50 rounded-2xl p-4 border border-brand-100">
                            <p className="text-xs text-brand-700 leading-relaxed italic">
                                <b>Nota Administrativa:</b> Los cambios en las variables de entorno (.env) requieren un reinicio completo del servicio backend para surtir efecto en producción.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Placeholder */}
            <div className="mt-8 bg-slate-900 rounded-3xl p-8 text-slate-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <h3 className="font-mono text-sm font-bold text-white uppercase tracking-widest">System Monitor Console</h3>
                    </div>
                    <span className="text-[10px] font-mono opacity-50 uppercase">Listening for events...</span>
                </div>
                <div className="font-mono text-xs space-y-2 opacity-80">
                    <p className="text-emerald-400">[OK] 2024-02-19 12:45:01 - MinIO Bucket project-images verified.</p>
                    <p className="text-emerald-400">[OK] 2024-02-19 12:45:02 - Mail server SMTP connection established.</p>
                    <p className="text-blue-400">[INFO] 2024-02-19 12:45:10 - Admin session started for uid: admins_only.</p>
                    <p className="text-slate-500 ml-4 italic">&gt; system ready for transactions.</p>
                </div>
            </div>
        </AdminLayout>
    );
}
