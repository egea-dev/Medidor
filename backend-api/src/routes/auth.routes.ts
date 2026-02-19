import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y password requeridos' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        // 1. Crear usuario
        await query(
            'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
            [userId, email, hashedPassword]
        );

        // 2. Crear perfil inicial
        await query(
            'INSERT INTO user_profiles (id, full_name, role, is_active) VALUES (?, ?, "user", 1)',
            [userId, fullName || null]
        );

        res.status(201).json({ message: 'Usuario creado correctamente', id: userId });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }
        res.status(500).json({ message: 'Error en el registro', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const users: any = await query(`
            SELECT u.id, u.email, u.password, up.role, up.is_active 
            FROM users u 
            LEFT JOIN user_profiles up ON u.id = up.id 
            WHERE u.email = ?
        `, [email]);

        const user = users[0];

        if (!user || user.is_active === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas o cuenta desactivada' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const role = user.role || 'user';

        const token = jwt.sign(
            { id: user.id, role: role },
            JWT_SECRET,
            { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
        );

        res.json({ token, user: { id: user.id, email: user.email, role: role } });
    } catch (error: any) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Error en el login', error: error.message });
    }
});

// GET ME
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const users: any = await query(
            `SELECT u.id, u.email, up.role, up.full_name, up.avatar_url, up.is_active
             FROM users u 
             LEFT JOIN user_profiles up ON u.id = up.id 
             WHERE u.id = ?`,
            [req.userId]
        );
        const user = users[0];

        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo perfil' });
    }
});

export default router;
