import { Router, Response } from 'express';
import { query } from '../config/database';
import { authenticateToken, AuthRequest, isAdmin } from '../middleware/auth';

const router = Router();

// Obtener estadísticas globales (Solo Admin)
router.get('/stats', authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const [users]: any = await query('SELECT COUNT(*) as count FROM users');
        const [projects]: any = await query('SELECT COUNT(*) as count FROM projects');
        const [measurements]: any = await query('SELECT COUNT(*) as count FROM measurements');

        res.json({
            users: users.count,
            projects: projects.count,
            measurements: measurements.count
        });
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo estadísticas' });
    }
});

// Listar todos los usuarios
router.get('/users', authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const users = await query('SELECT id, email, role, created_at, is_active FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo usuarios' });
    }
});

// Cambiar rol de usuario
router.put('/users/:id/role', authenticateToken, isAdmin, async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        await query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: 'Rol actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error actualizando rol' });
    }
});

// Activar/Desactivar usuario
router.put('/users/:id/active', authenticateToken, isAdmin, async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        await query('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
        res.json({ message: 'Estado de usuario actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error actualizando estado del usuario' });
    }
});

// Listar todos los proyectos (vista admin)
router.get('/projects', authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const projects = await query(`
            SELECT p.*, u.email as user_email 
            FROM projects p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        `);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo todos los proyectos' });
    }
});

export default router;
