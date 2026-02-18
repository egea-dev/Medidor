import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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

        // 1. Crear usuario
        const result: any = await query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );

        // Obtener el ID generado por el trigger/default UUID (en MySQL 8 con UUID() default)
        // Pero INSERT INTO no devuelve el UUID generado fácilmente con mysql2. 
        // Mejor hacer el UUID en el backend para tener control total.

        // Re-haciendo lógica con UUID manual para evitar problemas de ID
        /* 
        const userId = uuidv4();
        await query('INSERT INTO users (id, email, password) VALUES (?, ?, ?)', ...);
        */

        res.status(201).json({ message: 'Usuario creado correctamente' });
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

        const users: any = await query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user || user.is_active === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
        );

        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error: any) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Error en el login', error: error.message });
    }
});

// GET ME
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const users: any = await query(
            `SELECT u.id, u.email, u.role, up.full_name, up.avatar_url 
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
