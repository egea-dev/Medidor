import React from 'react';
import { MapPin, FileText, Calendar, AlignLeft } from 'lucide-react';
import { FormData } from '@shared/types';

interface Step1Props {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export const Step1ProjectData: React.FC<Step1Props> = ({ formData, setFormData }) => {
    const handleChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const inputBaseClass = "w-full p-2 md:p-2.5 text-sm border rounded-lg outline-none transition-colors duration-200 placeholder-gray-400";
    const inputDefaultClass = "bg-white border-gray-200 text-gray-900 focus:border-brand-500 focus:bg-white";

    return (
        <div className="space-y-8 md:space-y-12 animate-fadeIn pb-6">
            <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-2">
                    Información del Proyecto
                </h2>
                <p className="text-sm md:text-base text-gray-500 font-medium">
                    Completa los detalles fundamentales para iniciar el registro técnico.
                </p>
            </div>

            {/* Seccion Ubicación y Trabajo */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                    <MapPin size={14} /> Datos del Proyecto
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Ubicación</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            className={`${inputBaseClass} ${inputDefaultClass}`}
                            placeholder="Ciudad / Provincia"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Trabajo</label>
                        <input
                            type="text"
                            value={formData.jobType}
                            onChange={(e) => handleChange('jobType', e.target.value)}
                            className={`${inputBaseClass} ${inputDefaultClass}`}
                            placeholder="Hotel, Oficina, Hogar..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                            <Calendar size={10} /> Fecha
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                            className={`${inputBaseClass} ${inputDefaultClass}`}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo de Riel</label>
                        <input
                            type="text"
                            value={formData.railType}
                            onChange={(e) => handleChange('railType', e.target.value)}
                            className={`${inputBaseClass} ${inputDefaultClass}`}
                            placeholder="Manual, Motorizado, etc."
                        />
                    </div>
                </div>
            </div>

            {/* Seccion Datos Contacto */}
            <div className="space-y-4 pt-6 md:pt-10 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                    <FileText size={14} /> Datos de Contacto
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Nombre</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleChange('firstName', e.target.value)}
                            className={`${inputBaseClass} ${inputDefaultClass}`}
                            placeholder="Nombre"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Apellidos</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleChange('lastName', e.target.value)}
                            className={`${inputBaseClass} ${inputDefaultClass}`}
                            placeholder="Apellidos"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className={`${inputBaseClass} ${inputDefaultClass}`}
                            placeholder="email@empresa.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Teléfono</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className={`${inputBaseClass} ${inputDefaultClass}`}
                            placeholder="600 000 000"
                        />
                    </div>
                </div>
            </div>

            {/* Sección Observaciones */}
            <div className="space-y-4 pt-6 md:pt-10 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                    <AlignLeft size={14} /> Observaciones
                </h3>
                <textarea
                    value={formData.observations}
                    onChange={(e) => handleChange('observations', e.target.value)}
                    className={`${inputBaseClass} ${inputDefaultClass} min-h-[60px] resize-none`}
                    placeholder="Añade notas adicionales sobre el proyecto, accesos, o requerimientos especiales..."
                />
            </div>
        </div>
    );
};
