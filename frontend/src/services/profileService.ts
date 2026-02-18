import { api } from '@/lib/api';

export const profileService = {
    /**
     * Obtiene datos del perfil propio
     */
    async getProfile() {
        return api.get('/profile/me');
    },

    /**
     * Actualiza datos del perfil (nombre, teléfono, empresa)
     */
    async updateProfile(data: { full_name: string; phone: string; company?: string }) {
        return api.put('/profile/me', data);
    },

    /**
     * Sube foto de perfil
     */
    async uploadAvatar(file: File) {
        const formData = new FormData();
        formData.append('avatar', file);
        return api.upload('/profile/me/avatar', formData);
    }
};
