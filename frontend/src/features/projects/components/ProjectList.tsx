import React, { useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from './ProjectCard';
import { Plus, Search, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectList() {
    const { projects, loading, fetchProjects } = useProjects();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return (
        <div className="min-h-screen bg-brand-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-1 text-sm text-brand-600 font-medium mb-2 hover:underline"
                        >
                            <ArrowLeft size={16} /> Volver al Inicio
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Mis Proyectos</h1>
                        <p className="text-gray-500">Gestión de mediciones y presupuestos</p>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="bg-brand-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={20} /> Nuevo Proyecto
                    </button>
                </div>

                {/* Filters/Search Placeholder */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex items-center gap-3">
                    <Search className="text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por ubicación o cliente..."
                        className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-400"
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-brand-500 mb-4" size={40} />
                        <p className="text-gray-500 font-medium">Cargando proyectos...</p>
                    </div>
                ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm animate-fadeIn">
                        <div className="bg-brand-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Plus className="text-brand-300" size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No hay proyectos todavía</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            Empieza creando tu primer proyecto de medición usando el asistente.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-brand-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all"
                        >
                            Crear mi primer proyecto
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
