import { Router } from 'express';
import { query } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET all projects for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const projects: any = await query(
            'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
            [req.userId]
        );
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ message: 'Error obteniendo proyectos', error: error.message });
    }
});

// GET single project with measurements and images
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        const projects: any = await query('SELECT * FROM projects WHERE id = ? AND user_id = ?', [id, req.userId]);
        const project = projects[0];

        if (!project) return res.status(404).json({ message: 'Proyecto no encontrado' });

        const measurements: any = await query('SELECT * FROM measurements WHERE project_id = ?', [id]);
        const images: any = await query('SELECT * FROM images WHERE project_id = ?', [id]);

        res.json({ ...project, measurements, images });
    } catch (error: any) {
        res.status(500).json({ message: 'Error obteniendo detalle del proyecto', error: error.message });
    }
});

// CREATE / SAVE / UPDATE Project (Wizard)
router.post('/save-complete', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { formData, measurements, id: providedId } = req.body;
        const isUpdate = !!providedId;
        const projectId = providedId || uuidv4();

        if (isUpdate) {
            // Update existing project
            await query(
                `UPDATE projects SET 
                first_name = ?, last_name = ?, email = ?, phone = ?, 
                location = ?, job_type = ?, date = ?, rail_type = ?, 
                observations = ? 
                WHERE id = ? AND user_id = ?`,
                [
                    formData.firstName || 'Sin nombre',
                    formData.lastName || '',
                    formData.email || null,
                    formData.phone || null,
                    formData.location || 'N/A',
                    formData.jobType || null,
                    formData.date || null,
                    formData.railType || null,
                    formData.observations || null,
                    projectId,
                    req.userId
                ]
            );
        } else {
            // Insert new project
            await query(
                `INSERT INTO projects 
                (id, user_id, first_name, last_name, email, phone, location, job_type, date, rail_type, observations, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    projectId,
                    req.userId || null,
                    formData.firstName || 'Sin nombre',
                    formData.lastName || '',
                    formData.email || null,
                    formData.phone || null,
                    formData.location || 'N/A',
                    formData.jobType || null,
                    formData.date || null,
                    formData.railType || null,
                    formData.observations || null,
                    'in_progress'
                ]
            );
        }

        // 2. Sync Measurements
        // For simplicity in the wizard, we delete old measurements and insert new ones
        // EXCEPT if we want to keep images associated with them.
        // A better way is to keep IDs if provided.

        // If it's an update, we should be careful not to break image FKs.
        // Let's get existing measurement IDs to see what to keep.

        if (measurements && measurements.length > 0) {
            // Option A: Delete and recreate (but this breaks image FKs if measurements have images)
            // Option B: Smart sync. Let's try to keep IDs if they exist in the incoming array.

            // Delete measurements NOT in the new list (if list has IDs)
            const incomingIds = measurements.map((m: any) => m.id).filter(Boolean);
            if (isUpdate) {
                if (incomingIds.length > 0) {
                    await query('DELETE FROM measurements WHERE project_id = ? AND id NOT IN (?)', [projectId, incomingIds]);
                } else {
                    await query('DELETE FROM measurements WHERE project_id = ?', [projectId]);
                }
            }

            for (const m of measurements) {
                const mId = m.id || uuidv4();

                // Use REPLACE INTO or similar? Standard SQL: INSERT ... ON DUPLICATE KEY UPDATE
                await query(
                    `INSERT INTO measurements 
                    (id, project_id, floor, room_number, room, product_type, product_label, width, height, depth, quantity, observations) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                    floor = VALUES(floor), room_number = VALUES(room_number), room = VALUES(room), 
                    product_type = VALUES(product_type), product_label = VALUES(product_label), 
                    width = VALUES(width), height = VALUES(height), depth = VALUES(depth), 
                    quantity = VALUES(quantity), observations = VALUES(observations)`,
                    [
                        mId,
                        projectId,
                        m.floor || 'N/A',
                        m.roomNumber || '-',
                        m.room || 'N/A',
                        m.type?.id || 'otro',
                        m.type?.label || 'Otro',
                        m.width || 0,
                        m.height || 0,
                        (m.depth !== undefined && m.depth !== null) ? m.depth : null,
                        m.quantity || 1,
                        m.observations || null
                    ]
                );
            }
        } else if (isUpdate) {
            // If no measurements sent, but it's an update, maybe clear them?
            // Depends on if we send the full list every time. The wizard DOES send the full list.
            await query('DELETE FROM measurements WHERE project_id = ?', [projectId]);
        }

        res.status(isUpdate ? 200 : 201).json({
            message: isUpdate ? 'Proyecto actualizado' : 'Proyecto guardado correctamente',
            projectId
        });
    } catch (error: any) {
        console.error('CRITICAL ERROR in save-complete:', error);
        res.status(500).json({
            message: 'Error guardando proyecto completo',
            error: error.message
        });
    }
});

// DELETE
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        await query('DELETE FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
        res.json({ message: 'Proyecto eliminado' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error eliminando proyecto' });
    }
});

export default router;
