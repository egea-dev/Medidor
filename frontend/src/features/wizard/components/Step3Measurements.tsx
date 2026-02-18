import React from 'react';
import { Ruler, Plus, Save, Box, MessageSquare } from 'lucide-react';
import { ProductType, Measurement } from '@shared/types';
import { ImageUploader } from '@/components/ui/ImageUploader';

interface Step3Props {
    measurements: Measurement[];
    setMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
    currentMeasure: { width: string; height: string; depth: string; observations: string; images?: File[] };
    setCurrentMeasure: React.Dispatch<React.SetStateAction<{ width: string; height: string; depth: string; observations: string; images?: File[] }>>;
    selectedType: ProductType | null;
    currentLocation: { floor: string; roomNumber: string; room: string };
    onAddMore: () => void;
    onFinish: () => void;
}

export const Step3Measurements: React.FC<Step3Props> = ({
    measurements,
    setMeasurements,
    currentMeasure,
    setCurrentMeasure,
    selectedType,
    currentLocation,
    onAddMore,
    onFinish
}) => {

    // Lógica para mostrar profundidad: TODO MENOS CORTINAS
    const showDepth = selectedType?.id !== 'cortinas';

    const handleSave = (action: 'addMore' | 'finish') => {
        // Permitimos guardar 0 si está vacío
        const w = parseFloat(currentMeasure.width) || 0;
        const h = parseFloat(currentMeasure.height) || 0;
        const d = parseFloat(currentMeasure.depth) || 0;

        setMeasurements([...measurements, {
            id: (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
            width: w,
            height: h,
            depth: showDepth ? d : undefined,
            observations: currentMeasure.observations || undefined,
            floor: currentLocation.floor || 'N/A',
            roomNumber: currentLocation.roomNumber || '-',
            room: currentLocation.room || 'N/A',
            type: selectedType,
            quantity: 1
        }]);

        // Reset inputs
        setCurrentMeasure({ width: '', height: '', depth: '', observations: '' });

        // Ejecutar acción de navegación
        if (action === 'addMore') {
            onAddMore();
        } else {
            onFinish();
        }
    };

    const inputClass = "w-full p-3 pl-10 text-base border border-gray-200 rounded-lg outline-none bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 transition-colors duration-200";

    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                Registro de Medidas
            </h2>

            <div className="flex flex-wrap gap-2 mb-2">
                {currentLocation.floor && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">P: {currentLocation.floor}</span>
                )}
                {currentLocation.roomNumber && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">Hab: {currentLocation.roomNumber}</span>
                )}
                {currentLocation.room && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">{currentLocation.room}</span>
                )}
                {selectedType && (
                    <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold">{selectedType.label}</span>
                )}
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 relative overflow-hidden">
                <p className="text-sm text-gray-500 mb-2">Dimensiones (opcionales) y notas.</p>

                {/* Dimensiones */}
                <div className={`grid grid-cols-1 ${showDepth ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 items-start`}>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ancho (cm)</label>
                        <div className="relative">
                            <input
                                type="number"
                                inputMode="decimal"
                                pattern="[0-9]*"
                                value={currentMeasure.width}
                                onChange={(e) => setCurrentMeasure(prev => ({ ...prev, width: e.target.value }))}
                                className={inputClass}
                                placeholder="0"
                            />
                            <Ruler className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alto (cm)</label>
                        <div className="relative">
                            <input
                                type="number"
                                inputMode="decimal"
                                pattern="[0-9]*"
                                value={currentMeasure.height}
                                onChange={(e) => setCurrentMeasure(prev => ({ ...prev, height: e.target.value }))}
                                className={inputClass}
                                placeholder="0"
                            />
                            <Ruler className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    {showDepth && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fondo (cm)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    pattern="[0-9]*"
                                    value={currentMeasure.depth}
                                    onChange={(e) => setCurrentMeasure(prev => ({ ...prev, depth: e.target.value }))}
                                    className={inputClass}
                                    placeholder="0"
                                />
                                <Box className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Campo Observaciones Específicas */}
                <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observaciones (Opcional)</label>
                    <div className="relative">
                        <textarea
                            value={currentMeasure.observations}
                            onChange={(e) => setCurrentMeasure(prev => ({ ...prev, observations: e.target.value }))}
                            className={`${inputClass} pl-10 min-h-[80px] resize-none`}
                            placeholder="Ej: Tiene cajón de persiana, acceso difícil, etc."
                        />
                        <MessageSquare className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    </div>
                </div>
            </div>

            {/* Galería de imágenes y Captura */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                    <Box size={14} /> Fotos del elemento
                </h3>
                <ImageUploader
                    onUpload={(files) => setCurrentMeasure(prev => ({ ...prev, images: [...(prev.images || []), ...files] }))}
                    maxFiles={5}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <button
                    onClick={() => handleSave('addMore')}
                    className="w-full py-4 bg-white border-2 border-brand-900 text-brand-900 rounded-xl font-bold hover:bg-brand-50 transition-colors flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus size={20} /> Guardar y Añadir Otro
                </button>

                <button
                    onClick={() => handleSave('finish')}
                    className="w-full py-4 bg-brand-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                >
                    <Save size={20} /> Guardar y Finalizar
                </button>
            </div>

            <div className="text-center">
                <p className="text-xs text-gray-400">
                    "Añadir Otro" guarda la medida y te permite añadir más elementos en la misma ubicación.<br />
                    Se puede guardar sin medidas numéricas si solo deseas dejar una observación.
                </p>
            </div>
        </div>
    );
};
