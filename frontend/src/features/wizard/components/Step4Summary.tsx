import React, { useState } from 'react';
import { Download, LayoutList, RotateCcw, MessageSquare, ArrowUpDown, Calendar, MapPin, Briefcase } from 'lucide-react';
import { FormData, Measurement } from '@shared/types';
import { pdfService } from '@/services/pdfService';

interface Step4Props {
    formData: FormData;
    measurements: Measurement[];
    totalUnits: number;
    projectId?: string | null;
    onSave?: () => Promise<void>;
    onBackToStart?: () => void;
}

type SortOption = 'date' | 'location' | 'type';

export const Step4Summary: React.FC<Step4Props> = ({
    formData,
    measurements,
    totalUnits,
    projectId,
    onSave,
    onBackToStart
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('date');

    const getSortedMeasurements = () => {
        const sorted = [...measurements];
        if (sortBy === 'location') {
            // Sort by Floor then Room
            return sorted.sort((a, b) => {
                const floorCompare = a.floor.localeCompare(b.floor, undefined, { numeric: true, sensitivity: 'base' });
                if (floorCompare !== 0) return floorCompare;
                return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true, sensitivity: 'base' });
            });
        }
        if (sortBy === 'type') {
            return sorted.sort((a, b) => (a.type?.label || '').localeCompare(b.type?.label || ''));
        }
        // Default 'date' relies on creation order which matches array order for now
        return sorted;
    };

    const sortedMeasurements = getSortedMeasurements();

    const formatDimensions = (m: Measurement) => {
        let dimText = "";
        if (m.depth) {
            dimText = `${m.width} x ${m.height} x ${m.depth} cm`;
        } else {
            dimText = `${m.width} x ${m.height} cm`;
        }

        if (m.width === 0 && m.height === 0) {
            dimText = "Sin medidas";
        }
        return dimText;
    };

    const handleSaveTask = async () => {
        setIsGenerating(true);
        try {
            let pid = projectId;
            if (!pid && onSave) {
                console.log("Proyecto no guardado. Guardando antes de generar PDF...");
                await onSave();
                // El padre debería actualizar projectId, pero si no, intentamos obtenerlo del localStorage
                pid = localStorage.getItem('egea_saved_projectId');
            }

            if (!pid) {
                throw new Error("No se pudo obtener el ID del proyecto para generar el reporte.");
            }

            await pdfService.generateProjectReport(pid);
        } catch (error: any) {
            alert("Error al generar el PDF: " + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn h-full flex flex-col">
            <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <LayoutList className="text-brand-500" /> Resumen de Tarea
                </h2>

                {/* Datos Proyecto */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between">
                        <h3 className="font-bold text-gray-800">Datos del Proyecto</h3>
                        <span className="text-sm text-gray-500">{formData.date}</span>
                    </div>
                    <div className="p-4 text-sm grid grid-cols-1 md:grid-cols-2 gap-y-2 text-gray-900">
                        <p><span className="font-bold text-gray-600">Ubicación:</span> {formData.location}</p>
                        <p><span className="font-bold text-gray-600">Trabajo:</span> {formData.jobType}</p>
                        <p><span className="font-bold text-gray-600">Responsable:</span> {formData.firstName} {formData.lastName}</p>
                        {formData.railType && (
                            <p><span className="font-bold text-gray-600">Riel:</span> {formData.railType}</p>
                        )}
                        {formData.observations && (
                            <div className="col-span-1 md:col-span-2 mt-2 pt-2 border-t border-gray-100">
                                <p className="font-bold text-gray-600 mb-1">Observaciones Generales:</p>
                                <p className="text-gray-500 italic">{formData.observations}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sorting Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ArrowUpDown size={16} /> <span className="font-bold">Organizar listado por:</span>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
                        <button
                            onClick={() => setSortBy('date')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${sortBy === 'date' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Calendar size={12} /> Fecha (Orden)
                        </button>
                        <button
                            onClick={() => setSortBy('location')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${sortBy === 'location' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <MapPin size={12} /> Ubicación
                        </button>
                        <button
                            onClick={() => setSortBy('type')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${sortBy === 'type' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Briefcase size={12} /> Trabajo (Tipo)
                        </button>
                    </div>
                </div>

                {/* Tabla Visual */}
                {sortedMeasurements.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Medidas Registradas</h3>
                            <span className="bg-brand-100 text-brand-800 px-3 py-1 rounded-full text-xs font-bold">
                                Total: {totalUnits} uds
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 font-bold">Planta</th>
                                        <th className="px-4 py-3 font-bold">Nº Hab</th>
                                        <th className="px-4 py-3 font-bold">Estancia</th>
                                        <th className="px-4 py-3 font-bold">Elemento</th>
                                        <th className="px-4 py-3 text-right font-bold">Medidas (cm)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-800">
                                    {sortedMeasurements.map((m) => (
                                        <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium align-top">{m.floor}</td>
                                            <td className="px-4 py-3 font-bold align-top">{m.roomNumber}</td>
                                            <td className="px-4 py-3 align-top">{m.room}</td>
                                            <td className="px-4 py-3 text-gray-600 align-top">
                                                <div className="font-medium">{m.type?.label}</div>
                                                {m.observations && (
                                                    <div className="text-xs text-brand-600 mt-1 flex gap-1 items-start">
                                                        <MessageSquare size={10} className="mt-0.5 shrink-0" /> {m.observations}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-bold text-black align-top">
                                                {formatDimensions(m)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 bg-yellow-50 text-yellow-900 border border-yellow-100 rounded-xl text-sm font-medium text-center">
                        No hay medidas registradas en esta sesión.
                    </div>
                )}
            </div>

            <div className="w-full pb-8 md:pb-0 space-y-3">
                <button
                    onClick={handleSaveTask}
                    disabled={isGenerating || sortedMeasurements.length === 0}
                    className={`w-full px-6 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 transform 
            ${isGenerating || sortedMeasurements.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                            : 'bg-brand-900 text-white hover:shadow-xl hover:bg-black'}`}
                >
                    {isGenerating
                        ? 'Generando PDF...'
                        : <><Download size={20} /> Descargar Informe (PDF)</>
                    }
                </button>

                {onBackToStart && (
                    <button
                        onClick={onBackToStart}
                        className="w-full py-3 text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        <RotateCcw size={16} /> Volver al Inicio
                    </button>
                )}
            </div>
        </div>
    );
};
