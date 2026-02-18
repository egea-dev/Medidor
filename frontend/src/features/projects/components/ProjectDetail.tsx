import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '@/services/projectService';
import { Project } from '@shared/types';
import { ArrowLeft, Download, MapPin, Calendar, User, FileText, Loader2, MessageSquare } from 'lucide-react';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { pdfService } from '@/services/pdfService';

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        async function fetchProject() {
            if (!id) return;
            try {
                const data = await projectService.getById(id);
                setProject(data);
            } catch (err) {
                console.error(err);
                navigate('/projects');
            } finally {
                setLoading(false);
            }
        }
        fetchProject();
    }, [id, navigate]);

    const handleDownloadPDF = async () => {
        if (!project) return;
        setIsGenerating(true);
        try {
            await pdfService.generateProjectReport(
                project,
                project.measurements || [],
                `Proyecto_${project.location}_${Date.now()}.pdf`,
                project.id
            );

        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-50">
                <Loader2 className="animate-spin text-brand-500" size={40} />
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="min-h-screen bg-brand-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/projects')}
                    className="flex items-center gap-2 text-brand-600 font-medium mb-6 hover:underline"
                >
                    <ArrowLeft size={18} /> Volver al listado
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100">
                    <div className="bg-brand-900 p-8 text-white relative isolate overflow-hidden">
                        <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -z-10"></div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{project.location}</h1>
                                <div className="flex flex-wrap gap-4 text-brand-100 text-sm">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(project.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {project.location}</span>
                                    <span className="flex items-center gap-1"><User size={14} /> {project.firstName} {project.lastName}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isGenerating}
                                className="bg-white text-brand-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-50 transition-colors shadow-lg active:scale-95 disabled:opacity-70"
                            >
                                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                                Exportar PDF
                            </button>
                        </div>
                    </div>

                    <div className="p-8">
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="text-brand-500" size={20} /> Mediciones Registradas
                            </h2>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Ubicación</th>
                                            <th className="px-6 py-4">Elemento</th>
                                            <th className="px-6 py-4 text-right">Medidas (cm)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {(project.measurements || []).map((m: any) => (
                                            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">Planta {m.floor}, Hab {m.room_number}</div>
                                                    <div className="text-gray-500 text-xs">{m.room}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-700">{m.product_label || 'Otro'}</div>
                                                    {m.observations && (
                                                        <div className="text-xs text-brand-600 flex items-center gap-1 mt-1">
                                                            <MessageSquare size={10} /> {m.observations}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">
                                                    {m.width}x{m.height}{m.depth ? `x${m.depth}` : ''}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="text-brand-500" size={20} /> Galería de Imágenes
                            </h2>
                            {project.images && project.images.length > 0 ? (
                                <ImageGallery images={project.images} />
                            ) : (
                                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400">
                                    No hay imágenes para este proyecto
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
