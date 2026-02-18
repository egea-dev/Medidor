import { api } from '@/lib/api';

export const adminService = {
    /**
     * Obtiene lista de todos los usuarios (Solo Admin)
     */
    async getUsers() {
        const response = await api.get('/admin/users');
        return response.json();
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
        const response = await api.get('/admin/stats');
        return response.json();
    },

    /**
     * Obtiene lista de todos los proyectos (Solo Admin)
     */
    async getAllProjects() {
        const response = await api.get('/admin/projects');
        return response.json();
    },

    /**
     * Cambia el rol de un usuario
     */
    async updateUserRole(id: string, role: string) {
        const response = await api.put(`/admin/users/${id}/role`, { role });
        return response.json();
    },

    /**
     * Activa/Desactiva un usuario
     */
    async toggleUserActive(id: string, is_active: boolean) {
        const response = await api.put(`/admin/users/${id}/active`, { is_active });
        return response.json();
    }
};
