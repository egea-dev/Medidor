import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { adminService } from '@/services/adminService';
import { pdfService } from '@/services/pdfService';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileText,
    Mail,
    MapPin,
    Phone,
    Settings,
    User,
    Trash2,
    Loader2,
    Tag,
    Ruler,
    Image as ImageIcon
} from 'lucide-react';

export default function AdminProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const loadProject = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await adminService.getProject(id);
            setProject(data);
        } catch (e) {
            console.error('Error loading project detail:', e);
            alert('Error al cargar el detalle del proyecto');
            navigate('/admin/projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProject(); }, [id]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!id) return;
        setUpdating(true);
        try {
            await adminService.updateProject(id, { ...project, status: newStatus });
            setProject((prev: any) => ({ ...prev, status: newStatus }));
        } catch (e) {
            alert('Error al actualizar el estado');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!window.confirm('¿Seguro que quieres eliminar esta imagen?')) return;
        try {
            await adminService.deleteImage(imageId);
            setProject((prev: any) => ({
                ...prev,
                images: prev.images.filter((img: any) => img.id !== imageId)
            }));
        } catch (e) {
            alert('Error al eliminar la imagen');
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Detalle de Proyecto">
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-brand-500 mb-4" size={40} />
                    <p className="text-slate-500 font-medium">Cargando información del proyecto...</p>
                </div>
            </AdminLayout>
        );
    }

    if (!project) return null;

    return (
        <AdminLayout
            title={project.location || 'Detalle de Proyecto'}
            subtitle={`Creado el ${new Date(project.created_at).toLocaleDateString()}`}
        >
            <button
                onClick={() => navigate('/admin/projects')}
                className="flex items-center gap-2 text-slate-500 hover:text-brand-600 mb-6 transition-colors font-medium"
            >
                <ArrowLeft size={18} /> Volver a Proyectos
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info & Client */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Header Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">{project.location || 'Sin ubicación'}</h2>
                                        <p className="text-slate-400 flex items-center gap-2 text-sm italic">
                                            <Tag size={14} /> {project.job_type || 'Tipo de trabajo no especificado'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                                        <Calendar size={18} className="text-slate-400" />
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fecha de Visita</p>
                                            <p className="text-sm font-semibold">{project.date ? new Date(project.date).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                                        <FileText size={18} className="text-slate-400" />
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tipo de Riel</p>
                                            <p className="text-sm font-semibold">{project.rail_type || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 min-w-[200px]">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Estado del Proyecto</p>
                                <div className="flex flex-col gap-2">
                                    <button
                                        disabled={updating || project.status === 'completed'}
                                        onClick={() => handleStatusUpdate('completed')}
                                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${project.status === 'completed'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-green-200 hover:text-green-600'
                                            }`}
                                    >
                                        <CheckCircle size={18} /> {project.status === 'completed' ? 'Completado' : 'Marcar Completado'}
                                    </button>
                                    <button
                                        disabled={updating || project.status === 'in_progress'}
                                        onClick={() => handleStatusUpdate('in_progress')}
                                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${project.status === 'in_progress'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-600'
                                            }`}
                                    >
                                        <Clock size={18} /> {project.status === 'in_progress' ? 'En Progreso' : 'Mover a Progreso'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {project.observations && (
                            <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 border-l-4 border-l-brand-500">
                                <p className="text-xs font-bold text-brand-600 uppercase mb-2 tracking-widest">Observaciones Generales</p>
                                <p className="text-slate-600 text-sm leading-relaxed">{project.observations}</p>
                            </div>
                        )}
                    </div>

                    {/* Measurements Section */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Ruler size={18} className="text-brand-500" /> Mediciones ({project.measurements?.length || 0})
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {project.measurements?.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 italic">No hay mediciones registradas</div>
                            ) : (
                                project.measurements.map((m: any, idx: number) => (
                                    <div key={m.id || idx} className="p-6 hover:bg-slate-50/30 transition-colors">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-brand-600">{m.floor || 'N/A'} • {m.room || 'Estancia desconocida'}</p>
                                                <p className="font-bold text-slate-900">{m.product_label || 'Sin etiqueta'}</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="text-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 min-w-[70px]">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Ancho</p>
                                                    <p className="text-sm font-bold text-slate-700">{m.width}cm</p>
                                                </div>
                                                <div className="text-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 min-w-[70px]">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Alto</p>
                                                    <p className="text-sm font-bold text-slate-700">{m.height}cm</p>
                                                </div>
                                                <div className="text-center bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-100 min-w-[50px]">
                                                    <p className="text-[10px] text-brand-400 font-bold uppercase">Cant.</p>
                                                    <p className="text-sm font-bold text-brand-700">{m.quantity}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {m.observations && (
                                            <p className="mt-3 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg italic">"{m.observations}"</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Images Gallery */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <ImageIcon size={18} className="text-brand-500" /> Galería de Fotos ({project.images?.length || 0})
                            </h3>
                        </div>
                        <div className="p-6">
                            {project.images?.length === 0 ? (
                                <div className="text-center py-10">
                                    <ImageIcon size={40} className="text-slate-200 mx-auto mb-2" />
                                    <p className="text-slate-400 text-sm italic">No se han subido fotos para este proyecto</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {project.images.map((img: any) => (
                                        <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                                            <img
                                                src={img.public_url}
                                                alt={img.original_name}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <a href={img.public_url} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full text-slate-900 hover:bg-brand-50 hover:text-brand-600 transition-all">
                                                    <Eye size={16} />
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteImage(img.id)}
                                                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Client & User info */}
                <div className="space-y-6">
                    {/* Client Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <User size={20} className="text-brand-500" /> Información del Cliente
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                <User size={18} className="text-slate-400" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nombre</p>
                                    <p className="text-sm font-semibold text-slate-800">{project.first_name} {project.last_name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                <Mail size={18} className="text-slate-400" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email</p>
                                    <p className="text-sm font-semibold text-slate-800 break-all">{project.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                <Phone size={18} className="text-slate-400" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teléfono</p>
                                    <p className="text-sm font-semibold text-slate-800">{project.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Measured By User */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Medidor Asignado</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-lg">
                                {project.user_full_name?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold truncate">{project.user_full_name || 'Desconocido'}</p>
                                <p className="text-xs text-slate-400 truncate tracking-tight opacity-70">{project.user_email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Medidas</p>
                            <p className="text-2xl font-black text-brand-600">{project.measurements?.length || 0}</p>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Fotos</p>
                            <p className="text-2xl font-black text-brand-600">{project.images?.length || 0}</p>
                        </div>
                    </div>

                    {/* Report Actions */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-brand-500" /> Acciones de Informe
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={async () => {
                                    setUpdating(true);
                                    try {
                                        const res = await pdfService.generateProjectReport(id!);
                                        if (res.url) window.open(res.url, '_blank');
                                    } catch (e) {
                                        alert('Error al generar el PDF');
                                    } finally {
                                        setUpdating(false);
                                    }
                                }}
                                disabled={updating}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                            >
                                {updating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                Descargar Informe PDF
                            </button>

                            <button
                                onClick={async () => {
                                    const email = window.prompt('Enviar informe a:', project.email);
                                    if (!email) return;
                                    setUpdating(true);
                                    try {
                                        await pdfService.generateProjectReport(id!, email);
                                        alert('Informe enviado correctamente a ' + email);
                                    } catch (e) {
                                        alert('Error al enviar el email');
                                    } finally {
                                        setUpdating(false);
                                    }
                                }}
                                disabled={updating}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-brand-500 text-brand-600 rounded-2xl font-bold hover:bg-brand-50 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {updating ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                                Enviar por Email
                            </button>

                            {project.last_report_url && (
                                <p className="text-[10px] text-center text-slate-400">
                                    Último informe: <a href={project.last_report_url} target="_blank" rel="noreferrer" className="text-brand-500 hover:underline">Ver aquí</a>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
