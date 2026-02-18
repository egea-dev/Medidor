import React from 'react';
import { Check } from 'lucide-react';
import { ProductType } from '@shared/types';

interface WizardSidebarProps {
    step: number;
    currentLocation: { floor: string; roomNumber: string; room: string };
    selectedType: ProductType | null;
    handleClearAll: () => void;
}

export const WizardSidebar: React.FC<WizardSidebarProps> = ({
    step,
    currentLocation,
    selectedType,
    handleClearAll
}) => {
    return (
        <div className="hidden md:flex w-full md:w-[35%] bg-white relative border-l border-gray-100 flex-col order-2 md:order-2 justify-between animate-fadeIn">
            <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-gradient-to-br from-brand-100 to-yellow-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

            {/* TOP CONTENT: Info */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 relative z-10 w-full">
                <div className="text-center w-full max-w-xs">
                    {step === 1 && (
                        <div className="hidden md:block">
                            <h3 className="font-bold text-gray-800 mb-2">Información Profesional</h3>
                            <p className="text-sm text-gray-500">Iniciando registro de tareas para nuevo proyecto.</p>
                        </div>
                    )}
                    {step === 2 && (
                        <div>
                            <div className="hidden md:block mb-6">
                                <h3 className="font-bold text-gray-800 mb-2">Ubicación y Elemento</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    {currentLocation.floor && <p>Planta: <strong>{currentLocation.floor}</strong></p>}
                                    {currentLocation.roomNumber && <p>Habitación: <strong>{currentLocation.roomNumber}</strong></p>}
                                    {currentLocation.room && <p>Estancia: <strong>{currentLocation.room}</strong></p>}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">Elemento: <span className="font-bold text-brand-500">{selectedType?.label || 'Pendiente'}</span></p>
                                </div>
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="w-full">
                            <h3 className="font-bold text-gray-800 mb-2">Registro de Medidas</h3>
                            <div className="bg-gray-50 rounded-xl p-4 mb-2 text-left shadow-sm border border-gray-100">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Ubicación Actual:</p>
                                <p className="font-medium text-gray-900">{currentLocation.floor}</p>
                                <p className="text-sm text-gray-700">Hab: {currentLocation.roomNumber}</p>
                                <p className="text-sm text-gray-700">{currentLocation.room}</p>
                                <div className="border-t border-gray-200 mt-2 pt-2">
                                    <p className="font-bold text-brand-600">{selectedType?.label}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Introduce medidas o notas. Puedes guardar incluso si está vacío (se asignará 0).
                            </p>
                        </div>
                    )}
                    {step === 4 && (
                        <div className="w-full pb-8 md:pb-0">
                            <h3 className="font-bold text-gray-800 mb-4">Tarea Completada</h3>
                            <p className="text-sm text-gray-500">Revisa los datos y guarda el PDF.</p>

                            <button
                                onClick={handleClearAll}
                                className="mt-6 text-xs text-red-400 hover:text-red-600 underline"
                            >
                                Borrar todo y reiniciar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* BOTTOM: Steps Indicators */}
            <div className="hidden md:flex justify-center pb-8 gap-4 relative z-10">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-400'
                                }`}
                        >
                            {step > s ? <Check size={14} /> : s}
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${step >= s ? 'text-brand-500' : 'text-gray-300'}`}>
                            {['Inicio', 'Ubicación', 'Medidas', 'Fin'][s - 1]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
