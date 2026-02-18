import { Router } from 'express';
import { query } from '../config/database';
import { authenticateToken, AuthRequest, isAdmin } from '../middleware/auth';

const router = Router();

// Listar todos los usuarios
router.get('/users', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
    try {
        const users = await query('SELECT id, email, role, created_at, is_active FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo usuarios' });
    }
});

// Cambiar rol de usuario
router.put('/users/:id/role', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        await query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: 'Rol actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error actualizando rol' });
    }
});

// Listar todos los proyectos (vista admin)
router.get('/projects', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
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
