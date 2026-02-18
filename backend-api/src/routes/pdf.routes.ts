import { Router } from 'express';
import { query } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { storageService } from '../services/storageService';
import { B_DOCS } from '../config/minio';
import { sendEmailWithAttachment } from '../services/emailService';

const router = Router();

// Generar y enviar PDF por email
router.post('/:id/send-email', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { emailTo } = req.body;

        // 1. Obtener datos del proyecto
        const projects: any = await query('SELECT * FROM projects WHERE id = ?', [id]);
        const project = projects[0];
        if (!project) return res.status(404).json({ message: 'Proyecto no encontrado' });

        const measurements: any = await query('SELECT * FROM measurements WHERE project_id = ?', [id]);

        // 2. Generar PDF (Lógica simplificada en Backend)
        const doc = new jsPDF() as any;
        doc.setFontSize(20);
        doc.text(`Mediciones: ${project.location}`, 14, 22);

        const tableData = measurements.map((m: any) => [
            m.floor, m.room, `${m.width}x${m.height}`, m.quantity, m.product_label
        ]);

        doc.autoTable({
            startY: 30,
            head: [['Planta', 'Estancia', 'Medidas', 'Cant.', 'Producto']],
            body: tableData,
        });

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        const fileName = `Mediciones_${project.location.replace(/\s/g, '_')}_${Date.now()}.pdf`;
        const filePath = `${project.id}/${fileName}`;

        // 3. Subir a MinIO
        const publicUrl = await storageService.uploadFile(B_DOCS, filePath, pdfBuffer, pdfBuffer.length, 'application/pdf');

        // 4. Actualizar URL en DB
        await query('UPDATE projects SET last_report_url = ? WHERE id = ?', [publicUrl, id]);

        // 5. Enviar Email si se proporciona dirección
        if (emailTo) {
            await sendEmailWithAttachment(
                emailTo,
                `Mediciones de ${project.location}`,
                `Hola, adjuntamos las mediciones del proyecto ${project.location}.`,
                fileName,
                pdfBuffer
            );
        }

        res.json({ message: 'PDF generado y enviado', url: publicUrl });
    } catch (error: any) {
        res.status(500).json({ message: 'Error generando/enviando PDF', error: error.message });
    }
});

export default router;
