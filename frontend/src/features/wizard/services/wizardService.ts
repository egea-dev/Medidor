import { supabase } from '@/lib/supabase';
import { FormData, Measurement } from '@shared/types';

export const wizardService = {
    /**
     * Guarda o actualiza un proyecto y sus medidas en la base de datos.
     */
    async saveProject(userId: string, formData: FormData, measurements: Measurement[], projectId: string | null) {
        if (!supabase) throw new Error('Supabase no está configurado');

        const projectData = {
            user_id: userId,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
            job_type: formData.jobType,
            date: formData.date,
            rail_type: formData.railType,
            observations: formData.observations,
            status: 'in_progress',
            updated_at: new Date().toISOString()
        };

        let currentProjectId = projectId;

        // 1. Guardar o actualizar el proyecto
        if (currentProjectId) {
            const { error: projectError } = await supabase
                .from('projects')
                .update(projectData)
                .eq('id', currentProjectId);
            if (projectError) throw projectError;
        } else {
            const { data, error: projectError } = await supabase
                .from('projects')
                .insert([projectData])
                .select()
                .single();
            if (projectError) throw projectError;
            currentProjectId = data.id;
        }

        // 2. Sincronizar medidas (Borrar e insertar nuevas)
        // 2. Sincronizar medidas (Borrar e insertar nuevas)
        // Nota: Esto borrará las medidas anteriores. Si se edita un proyecto existente,
        // lo ideal sería actualizar, pero por simplicidad en el wizard reemplazamos.
        if (measurements.length > 0) {
            // Primero borramos las anteriores de este proyecto
            const { error: deleteError } = await supabase
                .from('measurements')
                .delete()
                .eq('project_id', currentProjectId);

            if (deleteError) throw deleteError;

            const dbMeasurements = measurements.map(m => ({
                project_id: currentProjectId,
                floor: m.floor,
                room_number: m.roomNumber,
                room: m.room,
                product_type: m.type?.id || 'otro',
                product_label: m.type?.label || 'Otro',
                width: m.width,
                height: m.height,
                depth: m.depth,
                quantity: m.quantity,
                observations: m.observations
            }));

            // Insertar y devolver los datos insertados (incluyendo IDs generados)
            const { data: savedMeasurements, error: measurementsError } = await supabase
                .from('measurements')
                .insert(dbMeasurements)
                .select();

            if (measurementsError) throw measurementsError;

            // 3. Subir Imágenes (Si hay)
            if (savedMeasurements) {
                // Iteramos sobre las medidas originales para acceder a los archivos (Files)
                for (let i = 0; i < measurements.length; i++) {
                    const original = measurements[i];
                    const saved = savedMeasurements[i]; // Asumimos mismo orden de array

                    // @ts-ignore: 'images' puede no estar en la definición de Measurement en types.ts pero sí en el objeto runtime
                    if (original.images && original.images.length > 0 && saved) {
                        for (const file of original.images) {
                            if (file instanceof File) {
                                try {
                                    const fileExt = file.name.split('.').pop();
                                    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                                    const filePath = `${currentProjectId}/${saved.id}/${fileName}`;

                                    // Subir al Bucket 'project-images'
                                    const { error: uploadError } = await supabase.storage
                                        .from('project-images')
                                        .upload(filePath, file);

                                    if (uploadError) {
                                        console.error('Error subiendo imagen:', uploadError);
                                        continue;
                                    }

                                    // Guardar referencia en tabla 'images'
                                    await supabase.from('images').insert({
                                        project_id: currentProjectId,
                                        measurement_id: saved.id,
                                        storage_path: filePath,
                                        original_name: file.name,
                                        mime_type: file.type || 'image/jpeg',
                                        size_bytes: file.size
                                    });
                                } catch (imgError) {
                                    console.error('Excepción al guardar imagen:', imgError);
                                }
                            }
                        }
                    }
                }
            }
        }

        return currentProjectId;
    }
};

