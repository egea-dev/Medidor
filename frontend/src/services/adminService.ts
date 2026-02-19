import { api } from '@/lib/api';

export const adminService = {
    /**
     * Obtiene lista de todos los usuarios (Solo Admin)
     */
    async getUsers() {
        return api.get('/admin/users');
    },

    /**
     * Alias de getUsers para compatibilidad
     */
    async getAllUsers() {
        return this.getUsers();
    },

    /**
     * Obtiene estadísticas globales (Solo Admin)
     */
    async getStats() {
        return api.get('/admin/stats');
    },

    /**
     * Obtiene lista de todos los proyectos (Solo Admin)
     */
    async getAllProjects() {
        return api.get('/admin/projects');
    },

    /**
     * Cambia el rol de un usuario
     */
    async updateUserRole(id: string, role: string) {
        return api.put(`/admin/users/${id}/role`, { role });
    },

    /**
     * Activa/Desactiva un usuario
     */
    async toggleUserActive(id: string, is_active: boolean) {
        return api.put(`/admin/users/${id}/active`, { is_active });
    },

    /**
     * Crea un nuevo usuario (Solo Admin)
     */
    async createUser(userData: any) {
        return api.post('/admin/users', userData);
    },

    /**
     * Sube un avatar para un usuario específico (Solo Admin)
     */
    async uploadUserAvatar(userId: string, file: File) {
        const formData = new FormData();
        formData.append('avatar', file);
        return api.upload(`/admin/users/${userId}/avatar`, formData);
    },

    // PROYECTOS (Admin)
    async deleteProject(id: string) {
        return api.delete(`/admin/projects/${id}`);
    },

    async getProject(id: string) {
        return api.get(`/admin/projects/${id}`);
    },

    async updateProject(id: string, data: any) {
        return api.put(`/admin/projects/${id}`, data);
    },

    // IMÁGENES (Admin)
    async getProjectImages(projectId: string) {
        return api.get(`/admin/images?projectId=${projectId}`);
    },

    async deleteImage(id: string) {
        return api.delete(`/admin/images/${id}`);
    }
};
