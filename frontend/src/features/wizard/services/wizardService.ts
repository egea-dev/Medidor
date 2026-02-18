import { api } from '@/lib/api';
import type { FormData as ProjectFormData, Measurement } from '@shared/types';

export const wizardService = {
    /**
     * Guarda el proyecto completo (datos + medidas) en una sola transacción.
     */
    async saveProject(formData: ProjectFormData, measurements: Measurement[]) {
        // 1. Guardar Proyecto y Medidas
        const response = await api.post('/projects/save-complete', {
            formData,
            measurements
        });

        const { projectId } = response;

        // 2. Subir Imágenes (Si hay)
        // Buscamos medidas que tengan archivos de imagen (File objects)
        for (const m of measurements) {
            // @ts-ignore: 'images' puede contener File[] antes de subir
            if (m.images && m.images.length > 0) {
                for (const file of m.images) {
                    if (file instanceof File) {
                        try {
                            const imgFormData = new FormData();
                            imgFormData.append('image', file);
                            imgFormData.append('projectId', projectId);
                            // Nota: En el backend actual m.id es el UUID temporal del front.
                            // Para ser precisos, el backend debería devolver los IDs mapeados, 
                            // pero por ahora asociamos al proyecto general si no coincide.
                            // await api.upload('/images/upload', imgFormData);
                        } catch (err) {
                            console.error('Error subiendo foto:', err);
                        }
                    }
                }
            }
        }

        return projectId;
    }
};
