import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { authenticateToken, AuthRequest, isAdmin } from '../middleware/auth';
import { minioClient, B_IMAGES } from '../config/minio';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

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
        const users = await query(`
            SELECT u.id, u.email, up.role, u.created_at, up.is_active, up.full_name, up.avatar_url 
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.id
            ORDER BY u.created_at DESC
        `);
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

        // Generar UUID manual para asegurar consistencia entre tablas
        const userId = uuidv4();

        // 1. Insertar en users
        await query(
            'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
            [userId, email, hashedPassword]
        );

        // 2. Crear perfil
        await query(
            'INSERT INTO user_profiles (id, full_name, role, is_active) VALUES (?, ?, ?, 1)',
            [userId, full_name || null, role || 'user']
        );

        res.status(201).json({ message: 'Usuario creado correctamente', id: userId });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'El email ya existe' });
        }
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creando usuario', error: error.message });
    }
});

// Cambiar rol de usuario
router.put('/users/:id/role', authenticateToken, isAdmin, async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        await query('UPDATE user_profiles SET role = ? WHERE id = ?', [role, id]);
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
        await query('UPDATE user_profiles SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
        res.json({ message: 'Estado de usuario actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error actualizando estado del usuario' });
    }
});

// Listar todos los proyectos (vista admin)
router.get('/projects', authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const projects = await query(`
            SELECT p.*, up.full_name as user_full_name, u.email as user_email
            FROM projects p 
            LEFT JOIN users u ON p.user_id = u.id 
            LEFT JOIN user_profiles up ON p.user_id = up.id
            ORDER BY p.created_at DESC
        `);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo todos los proyectos' });
    }
});

// Subir avatar para un usuario específico (Solo Admin)
router.post('/users/:id/avatar', authenticateToken, isAdmin, upload.single('avatar'), async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }

        const fileExt = file.originalname.split('.').pop();
        const fileName = `avatar_${id}_${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // 1. Subir a MinIO
        await minioClient.putObject(B_IMAGES, filePath, file.buffer, file.size, {
            'Content-Type': file.mimetype
        });

        const publicUrl = `${process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${B_IMAGES}/${filePath}`;

        // 2. Actualizar en DB
        await query('UPDATE user_profiles SET avatar_url = ? WHERE id = ?', [publicUrl, id]);

        res.json({ message: 'Avatar de usuario actualizado', url: publicUrl });
    } catch (error: any) {
        console.error('Error uploading user avatar:', error);
        res.status(500).json({ message: 'Error subiendo avatar de usuario', error: error.message });
    }
});

/** PROYECTOS (Admin) **/

// Obtener detalle de un proyecto específico (Vista Admin - sin filtro de user_id)
router.get('/projects/:id', authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const projects: any = await query(`
            SELECT p.*, up.full_name as user_full_name, u.email as user_email
            FROM projects p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN user_profiles up ON p.user_id = up.id
            WHERE p.id = ?
        `, [id]);

        const project = projects[0];
        if (!project) return res.status(404).json({ message: 'Proyecto no encontrado' });

        const measurements: any = await query('SELECT * FROM measurements WHERE project_id = ?', [id]);
        const images: any = await query('SELECT * FROM images WHERE project_id = ?', [id]);

        res.json({ ...project, measurements, images });
    } catch (error: any) {
        res.status(500).json({ message: 'Error obteniendo detalle admin', error: error.message });
    }
});

// Editar proyecto (Admin)
router.put('/projects/:id', authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, location, first_name, last_name, email, phone } = req.body;

        await query(`
            UPDATE projects 
            SET status = ?, location = ?, first_name = ?, last_name = ?, email = ?, phone = ?
            WHERE id = ?
        `, [status, location, first_name, last_name, email, phone, id]);

        res.json({ message: 'Proyecto actualizado por admin' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error actualizando proyecto admin' });
    }
});

// Eliminar proyecto (Admin - permite borrar proyectos de otros)
router.delete('/projects/:id', authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        // La tabla measurements e images tienen ON DELETE CASCADE
        await query('DELETE FROM projects WHERE id = ?', [id]);
        res.json({ message: 'Proyecto eliminado por administrador' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error eliminando proyecto admin' });
    }
});

/** USUARIOS (Admin - Edición/Borrado) **/

// Actualizar datos básicos de usuario
router.put('/users/:id', authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { full_name, phone, company, email } = req.body;

        await query('UPDATE user_profiles SET full_name = ?, phone = ?, company = ? WHERE id = ?', [full_name, phone, company, id]);
        if (email) {
            await query('UPDATE users SET email = ? WHERE id = ?', [email, id]);
        }

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error actualizando usuario' });
    }
});

// Eliminar usuario completo
router.delete('/users/:id', authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (id === req.userId) return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });

        await query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Usuario y todos sus datos eliminados' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error eliminando usuario' });
    }
});

/** IMÁGENES (Admin) **/

// Listar todas las imágenes (opcional filtrado por proyecto)
router.get('/images', authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const projectId = req.query.projectId;
        let sql = 'SELECT * FROM images';
        let params = [];

        if (projectId) {
            sql += ' WHERE project_id = ?';
            params.push(projectId);
        }

        sql += ' ORDER BY created_at DESC';
        const images = await query(sql, params);
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: 'Error listando imágenes' });
    }
});

// Eliminar imagen específica
router.delete('/images/:id', authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        // 1. Obtener path para borrar de MinIO
        const images: any = await query('SELECT storage_path FROM images WHERE id = ?', [id]);
        if (images.length > 0) {
            // Se debería llamar a storageService.deleteFile aquí, pero para evitar circulares o deps extras:
            await minioClient.removeObject(B_IMAGES, images[0].storage_path);
        }

        // 2. Borrar de DB
        await query('DELETE FROM images WHERE id = ?', [id]);
        res.json({ message: 'Imagen eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error eliminando imagen admin' });
    }
});

export default router;
