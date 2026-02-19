import React from 'react';
import { ArrowRight } from 'lucide-react';

import { Welcome } from './Welcome';
import { Step1ProjectData } from './Step1ProjectData';
import { Step2Location } from './Step2Location';
import { Step3Measurements } from './Step3Measurements';
import { Step4Summary } from './Step4Summary';
import { WizardProgress } from './WizardProgress';
import { WizardHeader } from './WizardHeader';
import { WizardSidebar } from './WizardSidebar';

import { useWizard } from '../hooks/useWizard';
import { PRODUCT_TYPES } from '@shared/constants';

export default function WizardPage() {
    const {
        step,
        setStep,
        formData,
        setFormData,
        currentLocation,
        setCurrentLocation,
        selectedType,
        setSelectedType,
        customDescription,
        setCustomDescription,
        measurements,
        setMeasurements,
        currentMeasure,
        setCurrentMeasure,
        totalUnits,
        progressPercent,
        handleNext,
        handleBack,
        handleAddMore,
        handleClearAll,
        saveToBackend,
        loadProject,
        isSaving,
        lastSaved,
        canSave,
        savedProjectId
    } = useWizard();

    return (
        <div className="min-h-screen bg-brand-50 flex items-center justify-center p-1 md:p-6 font-sans">
            <div className="bg-white w-full max-w-6xl h-auto min-h-[100dvh] md:min-h-[580px] md:h-[650px] rounded-none md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative transition-all duration-500 transform-gpu isolate ring-0 md:ring-1 ring-black/5">

                {step > 0 && <WizardProgress progress={progressPercent} />}

                {step === 0 ? (
                    <Welcome
                        onStart={() => setStep(1)}
                        hasMeasurements={measurements.length > 0}
                        onViewList={() => setStep(4)}
                        onLoadProject={loadProject}
                    />
                ) : (
                    <>
                        {/* Left Side: Form */}
                        <div className="w-full md:w-[65%] p-3 md:p-8 flex flex-col relative z-10 bg-white/80 backdrop-blur-sm order-1 md:order-1 animate-fadeIn">
                            <WizardHeader
                                step={step}
                                progressPercent={progressPercent}
                                handleBack={handleBack}
                                onGoToWelcome={() => setStep(0)}
                                onSave={saveToBackend}
                                isSaving={isSaving}
                                lastSaved={lastSaved}
                                canSave={canSave}
                            />

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-2 md:pb-0">
                                {step === 1 && (
                                    <Step1ProjectData
                                        formData={formData}
                                        setFormData={setFormData}
                                    />
                                )}
                                {step === 2 && (
                                    <Step2Location
                                        productTypes={PRODUCT_TYPES}
                                        selectedType={selectedType}
                                        setSelectedType={setSelectedType}
                                        customDescription={customDescription}
                                        setCustomDescription={setCustomDescription}
                                        currentLocation={currentLocation}
                                        setCurrentLocation={setCurrentLocation}
                                    />
                                )}
                                {step === 3 && (
                                    <Step3Measurements
                                        measurements={measurements}
                                        setMeasurements={setMeasurements}
                                        currentMeasure={currentMeasure}
                                        setCurrentMeasure={setCurrentMeasure}
                                        selectedType={selectedType}
                                        currentLocation={currentLocation}
                                        onAddMore={handleAddMore}
                                        onFinish={handleNext}
                                        projectId={savedProjectId}
                                    />
                                )}
                                {step === 4 && (
                                    <Step4Summary
                                        formData={formData}
                                        measurements={measurements}
                                        totalUnits={totalUnits}
                                        projectId={savedProjectId}
                                        onSave={saveToBackend}
                                        onBackToStart={() => setStep(0)}
                                    />
                                )}
                            </div>

                            {/* Botón Continuar en paso 1 y 2 */}
                            {(step === 1 || step === 2) && (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={handleNext}
                                        disabled={
                                            (step === 2 && !selectedType) ||
                                            (step === 2 && selectedType?.id === 'otro' && !customDescription)
                                        }
                                        className="w-full md:w-auto bg-brand-900 text-white px-8 py-3 rounded-xl font-medium flex items-center justify-center md:justify-start gap-2 hover:bg-brand-800 transition-all disabled:opacity-50 disabled:translate-y-0 hover:-translate-y-0.5 active:scale-95"
                                    >
                                        Continuar <ArrowRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right Side: Sidebar */}
                        <WizardSidebar
                            step={step}
                            currentLocation={currentLocation}
                            selectedType={selectedType}
                            handleClearAll={handleClearAll}
                            onGoToWelcome={() => setStep(0)}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
