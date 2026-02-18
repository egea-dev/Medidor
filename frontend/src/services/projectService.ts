import { api } from '@/lib/api';
import { Project } from '@shared/types';

export const projectService = {
    /**
     * Obtiene todos los proyectos con sus medidas.
     */
    async getAll() {
        return api.get('/projects');
    },

    /**
     * Obtiene un proyecto específico por ID, incluyendo medidas e imágenes.
     */
    async getById(id: string) {
        return api.get(`/projects/${id}`);
    },

    /**
     * Borra un proyecto.
     */
    async delete(id: string) {
        return api.delete(`/projects/${id}`);
    },

    /**
     * Crea un proyecto vacío (draft).
     * Nota: En el nuevo backend usamos save-complete para el wizard, 
     * pero mantenemos este por compatibilidad si se usa fuera del wizard.
     */
    async create(formData: any, userId: string) {
        return api.post('/projects', { ...formData, userId });
    },

    /**
     * Actualiza el estado de un proyecto.
     */
    async updateStatus(projectId: string, status: string) {
        return api.put(`/projects/${projectId}`, { status });
    }
};
