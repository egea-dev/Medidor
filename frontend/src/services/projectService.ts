import { supabase } from '@/lib/supabase';
import { Project } from '@shared/types';

export const projectService = {
    /**
     * Obtiene todos los proyectos con sus medidas.
     */
    async getAll() {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('projects')
            .select('*, measurements(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Obtiene un proyecto específico por ID, incluyendo medidas e imágenes.
     */
    async getById(id: string) {
        if (!supabase) throw new Error('Supabase no configurado');
        const { data, error } = await supabase
            .from('projects')
            .select('*, measurements(*), images(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Project;
    },

    /**
     * Borra un proyecto.
     */
    async delete(id: string) {
        if (!supabase) throw new Error('Supabase no configurado');
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Crea un proyecto vacío (draft).
     */
    async create(formData: any, userId: string) {
        if (!supabase) throw new Error('Supabase no configurado');
        const { data, error } = await supabase
            .from('projects')
            .insert([{ ...formData, user_id: userId, status: 'draft' }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Actualiza el estado de un proyecto.
     */
    async updateStatus(projectId: string, status: string) {
        if (!supabase) throw new Error('Supabase no configurado');
        const { error } = await supabase
            .from('projects')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', projectId);

        if (error) throw error;
    }
};
