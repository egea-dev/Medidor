import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { minioClient, B_IMAGES } from '../config/minio';
import { query } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload image for a project/measurement
router.post('/upload', authenticateToken, upload.single('image'), async (req: AuthRequest, res) => {
    try {
        const { projectId, measurementId } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        if (!projectId) return res.status(400).json({ message: 'ID de proyecto requerido' });

        const imageId = uuidv4();
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}_${uuidv4().substring(0, 8)}.${fileExt}`;
        const filePath = `${projectId}/${measurementId || 'general'}/${fileName}`;

        // 1. Subir a MinIO
        await minioClient.putObject(B_IMAGES, filePath, file.buffer, file.size, {
            'Content-Type': file.mimetype
        });

        // 2. Obtener URL (En MinIO auto-hosteado suele ser endpoint + bucket + path)
        const publicUrl = `${process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${B_IMAGES}/${filePath}`;

        // 3. Guardar en DB
        await query(
            `INSERT INTO images (id, project_id, measurement_id, storage_path, public_url, original_name, mime_type, size_bytes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [imageId, projectId, measurementId || null, filePath, publicUrl, file.originalname, file.mimetype, file.size]
        );

        res.json({ id: imageId, url: publicUrl });
    } catch (error: any) {
        res.status(500).json({ message: 'Error subiendo imagen', error: error.message });
    }
});

export default router;
