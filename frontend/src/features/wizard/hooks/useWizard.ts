import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { wizardService } from '../services/wizardService';
import type { FormData as ProjectFormData, ProductType, Measurement } from '@shared/types';

export const useWizard = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(0);

    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [savedProjectId, setSavedProjectId] = useState<string | null>(() => {
        return localStorage.getItem('egea_saved_projectId');
    });

    // Inicializar formData desde LocalStorage o valores por defecto
    const [formData, setFormData] = useState<ProjectFormData>(() => {
        const saved = localStorage.getItem('egea_formData');
        return saved ? JSON.parse(saved) : {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            location: '',
            jobType: '',
            date: new Date().toISOString().split('T')[0],
            railType: '',
            observations: ''
        };
    });

    // Estado para la ubicación actual: Planta, Número Hab, Estancia
    const [currentLocation, setCurrentLocation] = useState({ floor: '', roomNumber: '', room: '' });
    const [selectedType, setSelectedType] = useState<ProductType | null>(null);
    const [customDescription, setCustomDescription] = useState('');

    // Inicializar measurements desde LocalStorage
    const [measurements, setMeasurements] = useState<Measurement[]>(() => {
        const saved = localStorage.getItem('egea_measurements');
        return saved ? JSON.parse(saved) : [];
    });

    // Añadimos 'depth' y 'observations' al estado de la medida actual
    const [currentMeasure, setCurrentMeasure] = useState({ width: '', height: '', depth: '', observations: '' });

    // Guardar en LocalStorage cuando cambien los datos
    useEffect(() => {
        localStorage.setItem('egea_formData', JSON.stringify(formData));
    }, [formData]);

    useEffect(() => {
        localStorage.setItem('egea_measurements', JSON.stringify(measurements));
    }, [measurements]);

    useEffect(() => {
        if (savedProjectId) {
            localStorage.setItem('egea_saved_projectId', savedProjectId);
        } else {
            localStorage.removeItem('egea_saved_projectId');
        }
    }, [savedProjectId]);

    const totalUnits = measurements.reduce((acc, item) => acc + item.quantity, 0);

    const calculateProgress = useCallback((currentStep: number) => {
        let progress = 0;
        if (currentStep === 0) return 0;

        // Step 1: 25%
        if (currentStep > 1) {
            progress += 25;
        } else {
            const fields = [
                formData.firstName,
                formData.lastName,
                formData.email,
                formData.phone,
                formData.location,
                formData.jobType
            ];
            const filled = fields.filter(f => f && f.trim() !== '').length;
            progress += (filled / 6) * 25;
        }
        // Step 2: 25% (Ubicación y Tipo)
        if (currentStep > 2) {
            progress += 25;
        } else if (currentStep === 2) {
            if (currentLocation.floor && currentLocation.roomNumber) progress += 10;
            if (selectedType) progress += 15;
        }
        // Step 3: 40% (Medidas)
        if (currentStep > 3) {
            progress += 40;
        } else if (currentStep === 3) {
            if (measurements.length > 0) {
                progress += 40;
            }
        }
        // Step 4: 10%
        if (currentStep === 4) return 100;
        return Math.min(100, Math.round(progress));
    }, [formData, currentLocation, selectedType, measurements]);

    const progressPercent = calculateProgress(step);

    const handleNext = () => {
        if (formData.location.trim() !== '' && formData.firstName.trim() !== '') {
            saveToBackend();
        }

        if (step === 0) {
            setStep(1);
        } else if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            if (selectedType) setStep(3);
        } else if (step === 3) {
            setStep(4);
        } else if (step < 4) {
            setStep(step + 1);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        if (step === 1) {
            setStep(0);
        } else if (step === 3) {
            setStep(2);
        } else if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleAddMore = () => {
        setSelectedType(null);
        setCustomDescription('');
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClearAll = () => {
        if (window.confirm("¿Seguro que quieres borrar todos los datos y empezar de cero?")) {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                location: '',
                jobType: '',
                date: new Date().toISOString().split('T')[0],
                railType: '',
                observations: ''
            });
            setMeasurements([]);
            setSavedProjectId(null);
            setLastSaved(null);
            localStorage.removeItem('egea_formData');
            localStorage.removeItem('egea_measurements');
            localStorage.removeItem('egea_saved_projectId');
            setStep(0);
        }
    };

    const saveToBackend = async () => {
        if (!user) {
            console.warn("Usuario no autenticado");
            return;
        }

        if (!formData.location || !formData.firstName) {
            alert("Completa al menos el nombre y la ubicación del proyecto para guardar.");
            return;
        }

        setIsSaving(true);
        try {
            const projectId = await wizardService.saveProject(
                formData,
                measurements
            );

            if (projectId && projectId !== savedProjectId) {
                setSavedProjectId(projectId);
            }

            setLastSaved(new Date());
        } catch (err: any) {
            console.error("Error al guardar:", err);
            alert("Error al guardar: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return {
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
        isSaving,
        lastSaved,
        canSave: formData.location.trim() !== '' && formData.firstName.trim() !== ''
    };
};
