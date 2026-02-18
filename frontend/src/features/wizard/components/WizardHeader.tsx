import React from 'react';
import { ArrowLeft, Save, Check, Loader2, Home } from 'lucide-react';

interface WizardHeaderProps {
    step: number;
    progressPercent: number;
    handleBack: () => void;
    onGoToWelcome: () => void;
    onSave: () => void;
    isSaving: boolean;
    lastSaved: Date | null;
    canSave: boolean;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
    step,
    progressPercent,
    handleBack,
    onGoToWelcome,
    onSave,
    isSaving,
    lastSaved,
    canSave
}) => {
    return (
        <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-5">
                <button
                    onClick={onGoToWelcome}
                    className="shrink-0 transition-opacity hover:opacity-80 focus:outline-none"
                    title="Volver a la Bienvenida"
                >
                    <img
                        src="https://egea-main-control.vercel.app/logo-placeholder.png"
                        alt="EGEA Logo"
                        className="h-8 md:h-10 w-auto object-contain"
                    />
                </button>
                <div className="flex items-center gap-1 border-l border-gray-100 pl-3">
                    <button
                        onClick={onGoToWelcome}
                        className="text-gray-400 hover:text-brand-600 p-2 transition-colors"
                        title="Inicio"
                    >
                        <Home size={18} />
                    </button>
                    <button
                        onClick={handleBack}
                        className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-medium transition-colors p-2"
                    >
                        <ArrowLeft size={16} /> Volver
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button
                    onClick={onSave}
                    disabled={!canSave || isSaving}
                    title={lastSaved ? `Último guardado: ${lastSaved.toLocaleTimeString()}` : 'Guardar en base de datos'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm
                        ${isSaving
                            ? 'bg-gray-50 text-gray-400 border-gray-100'
                            : lastSaved
                                ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
                                : canSave
                                    ? 'bg-brand-50 text-brand-700 border-brand-100 hover:bg-brand-100 active:scale-95'
                                    : 'bg-gray-50 text-gray-300 border-gray-100 opacity-50 cursor-not-allowed'
                        }`}
                >
                    {isSaving ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : lastSaved ? (
                        <Check size={14} />
                    ) : (
                        <Save size={14} />
                    )}
                    <span className="hidden sm:inline">
                        {isSaving ? 'Guardando...' : lastSaved ? 'Guardado' : 'Guardar'}
                    </span>
                </button>

                <div className="flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100 shadow-sm">
                    <span className="text-xs font-bold text-brand-700">{progressPercent}%</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                </div>
            </div>
        </div>
    );
};
