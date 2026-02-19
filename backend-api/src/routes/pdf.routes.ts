import { Router } from 'express';
import { query } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { storageService } from '../services/storageService';
import { B_DOCS } from '../config/minio';
import { sendEmailWithAttachment } from '../services/emailService';

const router = Router();

// Función auxiliar para convertir URL de imagen a base64
async function getImageBase64(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        const b = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        return `data:${contentType};base64,${b.toString('base64')}`;
    } catch (e) {
        console.error("Error convirtiendo imagen a base64:", e);
        return null;
    }
}

// Generar y enviar PDF por email
router.post('/:id/send-email', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { emailTo } = req.body;

        // 1. Obtener datos completos del proyecto
        const projects: any = await query(`
            SELECT p.*, up.full_name as user_name 
            FROM projects p
            LEFT JOIN user_profiles up ON p.user_id = up.id
            WHERE p.id = ?`, [id]);

        const project = projects[0];
        if (!project) return res.status(404).json({ message: 'Proyecto no encontrado' });

        const measurements: any = await query('SELECT * FROM measurements WHERE project_id = ? ORDER BY floor, room_number', [id]);
        const images: any = await query('SELECT * FROM images WHERE project_id = ?', [id]);

        // 2. Configurar jsPDF
        // @ts-ignore - jsPDF types issue with autotable
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Cabecera Premium
        doc.setFillColor(15, 23, 42); // Slate 900
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("INFORME DE MEDICIÓN", 14, 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Proyecto: ${project.location || 'N/A'}`, 14, 33);
        doc.text(`Fecha: ${new Date(project.created_at || Date.now()).toLocaleDateString()}`, pageWidth - 50, 33);

        // Info Cliente / Medidor
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Información del Proyecto", 14, 55);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Cliente: ${project.first_name} ${project.last_name}`, 14, 62);
        doc.text(`Medidor: ${project.user_name || 'N/A'}`, 14, 68);
        doc.text(`Tipo de Trabajo: ${project.job_type || 'N/A'}`, 14, 74);

        // Tabla de Mediciones
        const tableData = measurements.map((m: any) => [
            m.floor,
            m.room_number || '-',
            m.room,
            m.product_label || '-',
            `${m.width}x${m.height} ${m.depth ? 'x' + m.depth : ''} cm`,
            m.quantity
        ]);

        (doc as any).autoTable({
            startY: 85,
            head: [['Planta', 'Nº', 'Estancia', 'Producto', 'Medidas', 'Cant.']],
            body: tableData,
            headStyles: { fillStyle: 'F', fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 14, right: 14 },
        });

        // 3. Galería de Imágenes (Si existen)
        if (images.length > 0) {
            doc.addPage();
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Galería Fotográfica", 14, 20);

            let yPos = 30;
            const imgWidth = 85;
            const imgHeight = 65;
            const margin = 10;

            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                const base64 = await getImageBase64(img.public_url);
                if (base64) {
                    const xPos = (i % 2 === 0) ? 14 : 14 + imgWidth + margin;

                    // Si nos pasamos del alto de página, añadimos página
                    if (yPos + imgHeight > 260) {
                        doc.addPage();
                        yPos = 20;
                    }

                    try {
                        doc.addImage(base64, 'JPEG', xPos, yPos, imgWidth, imgHeight);
                        doc.setFontSize(8);
                        doc.setTextColor(100, 100, 100);
                        doc.text(img.original_name || `Foto ${i + 1}`, xPos, yPos + imgHeight + 5);
                    } catch (err) {
                        console.error("Error añadiendo imagen al PDF:", err);
                    }

                    if (i % 2 !== 0 || i === images.length - 1) {
                        yPos += imgHeight + 20;
                    }
                }
            }
        }

        // 4. Generar Buffer final
        const pdfArrayBuffer = doc.output('arraybuffer');
        const pdfBuffer = Buffer.from(pdfArrayBuffer);
        const fileName = `Mediciones_${project.location?.replace(/\s/g, '_') || 'Export'}_${Date.now()}.pdf`;
        const filePath = `${project.id}/reports/${fileName}`;

        // 5. Subir a MinIO
        const publicUrl = await storageService.uploadFile(B_DOCS, filePath, pdfBuffer, pdfBuffer.length, 'application/pdf');

        // 6. Actualizar URL en DB
        await query('UPDATE projects SET last_report_url = ? WHERE id = ?', [publicUrl, id]);

        // 7. Enviar Email
        if (emailTo) {
            await sendEmailWithAttachment(
                emailTo,
                `Informe de Mediciones - ${project.location}`,
                `Hola,\n\nAdjuntamos el informe de mediciones del proyecto "${project.location}".\n\nSaludos,\nEquipo Cortinas Express`,
                fileName,
                pdfBuffer
            );
        }

        res.json({ message: 'PDF generado con éxito', url: publicUrl });
    } catch (error: any) {
        console.error("Error en generación de PDF:", error);
        res.status(500).json({ message: 'Error generando/enviando PDF', error: error.message });
    }
});

export default router;
