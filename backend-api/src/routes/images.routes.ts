import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { B_IMAGES, minioClient } from '../config/minio';
import { query } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { storageService } from '../services/storageService';

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

        // 1. Subir a MinIO usando el servicio centralizado
        const publicUrl = await storageService.uploadFile(
            B_IMAGES,
            filePath,
            file.buffer,
            file.size,
            file.mimetype
        );

        // 2. Guardar en DB
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

// List images by project
router.get('/:projectId', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { projectId } = req.params;
        // Solo puede ver sus propios proyectos (o admin via admin routes)
        const images = await query(
            'SELECT * FROM images WHERE project_id = ? ORDER BY created_at DESC',
            [projectId]
        );
        res.json(images);
    } catch (error: any) {
        res.status(500).json({ message: 'Error listando imágenes del proyecto' });
    }
});

// Delete image
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        // 1. Verificar propiedad (opcional, pero recomendado)
        const images: any = await query('SELECT storage_path, project_id FROM images WHERE id = ?', [id]);
        if (images.length === 0) return res.status(404).json({ message: 'Imagen no encontrada' });

        // 2. Borrar de MinIO
        await minioClient.removeObject(B_IMAGES, images[0].storage_path);

        // 3. Borrar de DB
        await query('DELETE FROM images WHERE id = ?', [id]);

        res.json({ message: 'Imagen eliminada correctamente' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error eliminando imagen' });
    }
});

export default router;
