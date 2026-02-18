import React from 'react';
import { ArrowRight, FolderKanban, LayoutDashboard, Ruler, FileText, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';

interface WelcomeProps {
    onStart: () => void;
    onViewList?: () => void;
    hasMeasurements?: boolean;
}

export const Welcome: React.FC<WelcomeProps> = ({ onStart, onViewList, hasMeasurements }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="w-full h-full flex flex-col md:flex-row animate-fadeIn relative overflow-hidden bg-white">

            {/* === LADO IZQUIERDO: Branding (Solo Desktop) === */}
            <div className="hidden md:flex flex-col justify-between w-[55%] bg-brand-900 p-10 relative overflow-hidden">
                {/* Decoración de fondo */}
                <div className="absolute top-[-20%] right-[-20%] w-[70%] h-[70%] bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-700/30 rounded-full blur-3xl pointer-events-none" />

                {/* Logo / Marca */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Ruler size={16} className="text-white" />
                        </div>
                        <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Egea Textil</span>
                    </div>
                </div>

                {/* Título Principal */}
                <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <h1 className="text-5xl xl:text-6xl font-black text-white leading-tight tracking-tight mb-4">
                        Medidor<br />
                        <span className="text-brand-300">Egea</span>
                    </h1>
                    <p className="text-brand-200 text-lg leading-relaxed max-w-xs">
                        Registro profesional de medidas y planificación de reformas textiles.
                    </p>

                    {/* Features */}
                    <div className="mt-8 flex flex-col gap-3">
                        {[
                            { icon: Ruler, label: 'Medidas precisas por estancia' },
                            { icon: FileText, label: 'Exportación a PDF instantánea' },
                            { icon: Shield, label: 'Datos seguros en la nube' },
                        ].map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-3 text-brand-200 text-sm">
                                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Icon size={14} className="text-brand-300" />
                                </div>
                                {label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer del panel izquierdo */}
                <div className="relative z-10 flex gap-6 text-xs text-brand-400 font-medium uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Uso Interno
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                        v2.0
                    </div>
                </div>
            </div>

            {/* === LADO DERECHO: Acciones === */}
            <div className="flex-1 flex flex-col items-center justify-evenly md:justify-center gap-6 md:gap-8 p-8 md:p-10 relative">
                {/* Decoración móvil */}
                <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-brand-50 rounded-full blur-3xl opacity-60 pointer-events-none md:hidden" />

                {/* Título solo en móvil */}
                <div className="md:hidden text-center relative z-10">
                    <h1 className="text-3xl font-black text-gray-900 leading-tight">
                        Medidor <span className="text-brand-500">Egea</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Registro de medidas y planificación de reformas textiles.</p>
                </div>

                {/* Avatar y saludo */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="relative mb-3">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gray-200">
                            <img
                                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60"
                                alt="Perfil Trabajador"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 border-2 border-white rounded-full" />
                    </div>
                    {user && (
                        <>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Acceso Profesional</p>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Hola, {user.name.split(' ')[0]} 👋</h2>
                        </>
                    )}
                </div>

                {/* Botones de acción */}
                <div className="relative z-10 flex flex-col w-full max-w-xs gap-3">
                    <button
                        onClick={onStart}
                        className="group bg-brand-900 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {hasMeasurements ? 'Añadir Medida' : 'Nuevo Proyecto'}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => navigate('/projects')}
                        className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <FolderKanban size={18} /> Mis Proyectos
                    </button>

                    {user && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="bg-brand-50 border-2 border-brand-200 text-brand-700 px-8 py-3 rounded-2xl font-bold text-sm hover:bg-brand-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <LayoutDashboard size={18} /> Panel Admin
                        </button>
                    )}

                    {onViewList && hasMeasurements && (
                        <button
                            onClick={onViewList}
                            className="text-brand-600 text-sm font-medium hover:underline py-1"
                        >
                            Ver medidas actuales →
                        </button>
                    )}
                </div>

                {/* Logo solo en móvil */}
                <div className="md:hidden relative z-10 opacity-40 grayscale hover:grayscale-0 transition-all">
                    <img
                        src="https://egea-main-control.vercel.app/logo-placeholder.png"
                        alt="Egea Textil"
                        className="h-8 object-contain"
                    />
                </div>
            </div>
        </div>
    );
};
