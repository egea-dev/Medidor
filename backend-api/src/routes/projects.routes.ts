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

// CREATE / Save Project (Wizard)
router.post('/save-complete', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { formData, measurements } = req.body;
        const projectId = uuidv4();

        // 1. Insert Project
        await query(
            `INSERT INTO projects 
            (id, user_id, first_name, last_name, email, phone, location, job_type, date, rail_type, observations, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                projectId, req.userId, formData.firstName, formData.lastName,
                formData.email, formData.phone, formData.location, formData.jobType,
                formData.date, formData.railType, formData.observations, 'in_progress'
            ]
        );

        // 2. Insert Measurements
        if (measurements && measurements.length > 0) {
            for (const m of measurements) {
                const mId = uuidv4();
                await query(
                    `INSERT INTO measurements 
                    (id, project_id, floor, room_number, room, product_type, product_label, width, height, depth, quantity, observations) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        mId, projectId, m.floor, m.roomNumber, m.room,
                        m.type?.id || 'otro', m.type?.label || 'Otro',
                        m.width, m.height, m.depth || null, m.quantity, m.observations
                    ]
                );
            }
        }

        res.status(201).json({ message: 'Proyecto guardado correctamente', projectId });
    } catch (error: any) {
        res.status(500).json({ message: 'Error guardando proyecto completo', error: error.message });
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
