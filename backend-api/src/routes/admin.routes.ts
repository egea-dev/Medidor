import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
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

// Crear nuevo usuario (Solo Admin)
router.post('/users', authenticateToken, isAdmin, async (req: any, res: Response) => {
    try {
        const { email, password, role, full_name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña requeridos' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Insertar en users
        const result: any = await query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, role || 'user']
        );

        // Obtener el ID generado (suponiendo MySQL genera UUID por default o manejamos el ID retornado)
        // Nota: Si usamos UUID() en el default de la tabla, necesitamos recuperarlo o generarlo aquí.
        // Dado que mysql2 no devuelve el ID insertado si es un UUID generado en la DB fácilmente,
        // vamos a recuperar el usuario recién creado por email.
        const [newUser]: any = await query('SELECT id FROM users WHERE email = ?', [email]);
        const userId = newUser.id;

        // 2. Crear perfil si hay nombre
        if (full_name) {
            await query(
                'INSERT INTO user_profiles (id, full_name) VALUES (?, ?)',
                [userId, full_name]
            );
        }

        res.status(201).json({ message: 'Usuario creado correctamente', id: userId });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'El email ya existe' });
        }
        res.status(500).json({ message: 'Error creando usuario' });
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
