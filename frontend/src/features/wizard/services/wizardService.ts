import { api } from '@/lib/api';
import type { FormData as ProjectFormData, Measurement } from '@shared/types';

export const wizardService = {
    /**
     * Guarda el proyecto completo (datos + medidas) en una sola transacción.
     */
    /**
     * Guarda el proyecto completo (datos + medidas) en una sola transacción.
     */
    async saveProject(formData: ProjectFormData, measurements: Measurement[], projectId?: string | null) {
        // 1. Guardar Proyecto y Medidas (Ahora soporta UPDATE si hay projectId)
        const response = await api.post('/projects/save-complete', {
            id: projectId, // Enviamos el ID si existe para que el backend haga UPDATE
            formData,
            measurements
        });

        return response.projectId;
    },

    /**
     * Sube una imagen asociada a un proyecto y opcionalmente a una medición.
     */
    async uploadImage(file: File, projectId: string, measurementId?: string) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('projectId', projectId);
        if (measurementId) {
            formData.append('measurementId', measurementId);
        }

        return api.upload('/images/upload', formData);
    },

    /**
     * Obtiene los proyectos recientes del usuario.
     */
    async getRecentProjects(limit = 5) {
        const projects: any = await api.get('/projects');
        return projects.slice(0, limit);
    },

    /**
     * Obtiene los detalles de un proyecto específico.
     */
    async getProject(projectId: string) {
        return api.get(`/projects/${projectId}`);
    }
};
