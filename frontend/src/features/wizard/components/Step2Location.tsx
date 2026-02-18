import React from 'react';
import { Layers, BedDouble, PencilLine, Hash, Blinds, AppWindow, DoorOpen, Package, MessageSquarePlus } from 'lucide-react';
import { ProductType } from '@shared/types';

interface Step2Props {
    productTypes: ProductType[];
    selectedType: ProductType | null;
    setSelectedType: React.Dispatch<React.SetStateAction<ProductType | null>>;
    customDescription: string;
    setCustomDescription: React.Dispatch<React.SetStateAction<string>>;
    currentLocation: { floor: string; roomNumber: string; room: string };
    setCurrentLocation: React.Dispatch<React.SetStateAction<{ floor: string; roomNumber: string; room: string }>>;
}

const ICON_MAP: Record<string, any> = {
    cortinas: Blinds,
    ventanas: AppWindow,
    puertas: DoorOpen,
    armarios: Package,
    otro: MessageSquarePlus,
};

export const Step2Location: React.FC<Step2Props> = ({
    productTypes,
    selectedType,
    setSelectedType,
    customDescription,
    setCustomDescription,
    currentLocation,
    setCurrentLocation
}) => {
    return (
        <div className="flex flex-col h-full animate-fadeIn">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                Ubicación y Elemento
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-6">
                Define dónde estás trabajando y qué vas a medir.
            </p>

            <div className="flex-1 space-y-6">

                {/* Sección de Ubicación */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                            <Layers size={12} /> Nº Planta
                        </label>
                        <input
                            type="text"
                            value={currentLocation.floor}
                            onChange={(e) => setCurrentLocation(prev => ({ ...prev, floor: e.target.value }))}
                            className="w-full p-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-brand-500 bg-white text-gray-900 placeholder-gray-400"
                            placeholder="Ej: Planta 1"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                            <Hash size={12} /> Nº Habitación
                        </label>
                        <input
                            type="text"
                            value={currentLocation.roomNumber}
                            onChange={(e) => setCurrentLocation(prev => ({ ...prev, roomNumber: e.target.value }))}
                            className="w-full p-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-brand-500 bg-white text-gray-900 placeholder-gray-400"
                            placeholder="Ej: 101"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                            <BedDouble size={12} /> Estancia / Tipo
                        </label>
                        <input
                            type="text"
                            value={currentLocation.room}
                            onChange={(e) => setCurrentLocation(prev => ({ ...prev, room: e.target.value }))}
                            className="w-full p-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-brand-500 bg-white text-gray-900 placeholder-gray-400"
                            placeholder="Ej: Dormitorio"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-100 my-2"></div>

                {/* Grid de Opciones */}
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Selecciona Elemento</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {productTypes.map((type) => {
                        const Icon = ICON_MAP[type.id];
                        const isSelected = selectedType?.id === type.id;

                        return (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type)}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all group active:scale-[0.98] h-32 md:h-36 ${isSelected
                                        ? 'border-brand-500 bg-brand-50 shadow-md'
                                        : 'border-gray-200 hover:border-brand-200 bg-white hover:shadow-sm'
                                    }`}
                            >
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-200 text-brand-700' : 'bg-gray-100 text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-600'
                                    }`}>
                                    {Icon && <Icon size={24} strokeWidth={1.5} />}
                                </div>
                                <span className={`font-bold text-sm md:text-base ${isSelected ? 'text-brand-900' : 'text-gray-700'}`}>
                                    {type.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Sección Campo Libre "Otro" */}
                {selectedType?.id === 'otro' && (
                    <div className="bg-white p-4 rounded-xl border border-brand-200 shadow-sm animate-fadeIn mt-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                            <PencilLine size={14} /> Descripción detallada
                        </label>
                        <textarea
                            value={customDescription}
                            onChange={(e) => setCustomDescription(e.target.value)}
                            placeholder="Describe el elemento..."
                            className="w-full p-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-brand-500 min-h-[80px] resize-none text-gray-900 bg-white placeholder-gray-400"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
