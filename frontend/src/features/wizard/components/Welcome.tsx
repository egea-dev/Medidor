import React from 'react';
import { ArrowRight, FolderKanban, LayoutDashboard, Ruler, FileText, Shield, Calendar, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { wizardService } from '../services/wizardService';

interface WelcomeProps {
    onStart: () => void;
    onViewList?: () => void;
    onLoadProject?: (projectId: string) => void;
    hasMeasurements?: boolean;
}

export const Welcome: React.FC<WelcomeProps> = ({ onStart, onViewList, onLoadProject, hasMeasurements }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [recentProjects, setRecentProjects] = React.useState<any[]>([]);
    const [isLoadingRecent, setIsLoadingRecent] = React.useState(false);

    React.useEffect(() => {
        const fetchRecent = async () => {
            if (!user) return;
            setIsLoadingRecent(true);
            try {
                const projects = await wizardService.getRecentProjects(5);
                setRecentProjects(projects);
            } catch (err) {
                console.error("Error fetching recent projects:", err);
            } finally {
                setIsLoadingRecent(false);
            }
        };
        fetchRecent();
    }, [user]);

    return (
        <div className="w-full h-full flex flex-col md:flex-row animate-fadeIn relative overflow-hidden bg-white">

            {/* === LADO IZQUIERDO: Branding (Solo Desktop) === */}
            <div className="hidden md:flex flex-col justify-between w-[45%] bg-brand-900 p-10 relative overflow-hidden">
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
            <div className="flex-1 flex flex-col items-center justify-start gap-6 md:gap-8 p-6 md:p-10 relative overflow-y-auto">
                {/* Decoración móvil */}
                <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-brand-50 rounded-full blur-3xl opacity-60 pointer-events-none md:hidden" />

                {/* Título solo en móvil */}
                <div className="md:hidden text-center relative z-10 mt-4">
                    <h1 className="text-3xl font-black text-gray-900 leading-tight">
                        Medidor <span className="text-brand-500">Egea</span>
                    </h1>
                </div>

                {/* Avatar y saludo */}
                <div className="relative z-10 flex flex-col items-center text-center mt-4">
                    <div className="relative mb-3">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gray-200">
                            <img
                                src={user?.avatar_url || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60"}
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

                {/* Botones de acción principales */}
                <div className="relative z-10 flex flex-col w-full max-w-sm gap-3">
                    <button
                        onClick={onStart}
                        className="group bg-brand-900 text-white px-8 py-5 rounded-3xl font-bold text-lg shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        {hasMeasurements ? <><RotateCcw size={20} /> Continuar Medición</> : <><Ruler size={20} /> Nueva Medición</>}
                        {!hasMeasurements && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => navigate('/projects')}
                            className="bg-white border-2 border-gray-100 text-gray-700 px-4 py-4 rounded-2xl font-bold text-sm hover:border-brand-200 transition-all flex flex-col items-center justify-center gap-2 shadow-sm"
                        >
                            <FolderKanban size={20} className="text-brand-500" /> Mis Proyectos
                        </button>

                        <button
                            onClick={() => navigate('/profile')}
                            className="bg-white border-2 border-gray-100 text-gray-700 px-4 py-4 rounded-2xl font-bold text-sm hover:border-brand-200 transition-all flex flex-col items-center justify-center gap-2 shadow-sm"
                        >
                            <Shield size={20} className="text-brand-500" /> Mi Perfil
                        </button>
                    </div>
                </div>

                {/* Sección: Proyectos Recientes */}
                <div className="relative z-10 w-full max-w-sm mt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Proyectos Recientes</h3>
                        <button onClick={() => navigate('/projects')} className="text-xs font-bold text-brand-600 hover:underline">Ver todos</button>
                    </div>

                    <div className="space-y-2">
                        {isLoadingRecent ? (
                            <div className="flex justify-center p-4">
                                <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : recentProjects.length > 0 ? (
                            recentProjects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => onLoadProject?.(project.id)}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 rounded-2xl transition-all group"
                                >
                                    <div className="flex flex-col items-start overflow-hidden">
                                        <span className="text-sm font-bold text-gray-900 truncate w-full text-left">
                                            {project.location}
                                        </span>
                                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                            <Calendar size={10} /> {new Date(project.date).toLocaleDateString()} • {project.first_name}
                                        </span>
                                    </div>
                                    <ArrowRight size={14} className="text-gray-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-xs text-gray-400">No hay proyectos recientes</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer simple */}
                <div className="relative z-10 text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-auto pb-4">
                    Egea Textil Professional • 2024
                </div>
            </div>
        </div>
    );
};
