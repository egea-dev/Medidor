import { api } from '@/lib/api';

export const adminService = {
    /**
     * Obtiene lista de todos los usuarios (Solo Admin)
     */
    async getUsers() {
        return api.get('/admin/users');
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
    }
};
