import { Router, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { minioClient, B_IMAGES } from '../config/minio';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /api/profile/me
 * Obtiene los datos del perfil del usuario autenticado
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const results: any = await query(
            `SELECT u.id, u.email, up.full_name, up.role, up.phone, up.company, up.avatar_url, up.is_active 
             FROM users u 
             LEFT JOIN user_profiles up ON u.id = up.id 
             WHERE u.id = ?`,
            [req.userId]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const userProfile = results[0];
        // Asegurar que el objeto tiene la estructura esperada aunque falte el perfil
        if (!userProfile.role) userProfile.role = 'user';
        if (userProfile.is_active === null) userProfile.is_active = 1;

        res.json(userProfile);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo perfil' });
    }
});

/**
 * PUT /api/profile/me
 * Actualiza los datos del perfil (nombre, teléfono, empresa)
 */
router.put('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { full_name, phone, company } = req.body;

        await query(
            'UPDATE user_profiles SET full_name = ?, phone = ?, company = ? WHERE id = ?',
            [full_name, phone, company, req.userId]
        );

        res.json({ message: 'Perfil actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error actualizando perfil' });
    }
});

/**
 * POST /api/profile/me/avatar
 * Sube una nueva foto de perfil
 */
router.post('/me/avatar', authenticateToken, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }

        const fileExt = file.originalname.split('.').pop();
        const fileName = `avatar_${req.userId}_${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // 1. Subir a MinIO
        await minioClient.putObject(B_IMAGES, filePath, file.buffer, file.size, {
            'Content-Type': file.mimetype
        });

        const publicUrl = `${process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${B_IMAGES}/${filePath}`;

        // 2. Actualizar en DB
        await query('UPDATE user_profiles SET avatar_url = ? WHERE id = ?', [publicUrl, req.userId]);

        res.json({ message: 'Avatar actualizado', url: publicUrl });
    } catch (error: any) {
        res.status(500).json({ message: 'Error subiendo avatar', error: error.message });
    }
});

export default router;
