import { supabase } from '@/lib/supabase';

export const adminService = {
    // Obtiene todos los perfiles de usuario (solo admin puede llamar esto)
    async getAllUsers() {
        if (!supabase) return [];

        // Obtener perfiles ordenados por fecha de creación
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Cambia el rol de un usuario
    async updateUserRole(userId: string, role: 'admin' | 'user') {
        if (!supabase) throw new Error('Supabase no configurado');

        // Actualizar el rol en la tabla user_profiles
        const { error } = await supabase
            .from('user_profiles')
            .update({ role })
            .eq('id', userId);

        if (error) throw error;
    },

    // Activa o desactiva un usuario
    async toggleUserActive(userId: string, isActive: boolean) {
        if (!supabase) throw new Error('Supabase no configurado');

        const { error } = await supabase
            .from('user_profiles')
            .update({ is_active: isActive })
            .eq('id', userId);

        if (error) throw error;
    },

    // Obtiene TODOS los proyectos (sin filtro de usuario)
    async getAllProjects() {
        if (!supabase) return [];

        // Obtener proyectos con detalles de medidas y perfil del usuario
        const { data, error } = await supabase
            .from('projects')
            .select('*, measurements(*), user_profiles(full_name, email)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Estadísticas globales para el dashboard
    async getStats() {
        if (!supabase) return { users: 0, projects: 0, measurements: 0 };

        // Ejecutar consultas en paralelo para mayor eficiencia
        const [usersRes, projectsRes, measurementsRes] = await Promise.all([
            supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
            supabase.from('projects').select('id', { count: 'exact', head: true }),
            supabase.from('measurements').select('id', { count: 'exact', head: true }),
        ]);

        return {
            users: usersRes.count || 0,
            projects: projectsRes.count || 0,
            measurements: measurementsRes.count || 0,
        };
    },
};
