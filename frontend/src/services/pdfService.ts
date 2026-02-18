import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormData, Measurement } from '@shared/types';
import { supabase } from '@/lib/supabase';

export const pdfService = {
    /**
     * Genera un informe en PDF para un proyecto.
     * Si se proporciona projectId y el cliente de Supabase está activo, intenta guardar el PDF.
     */
    async generateProjectReport(formData: Partial<FormData>, measurements: Measurement[], fileName?: string, projectId?: string) {
        try {
            const doc = new jsPDF();

            // Título
            doc.setFontSize(20);
            doc.text("Medidor de Hoteles Egea DEV", 14, 22);

            // Datos del Cliente y Proyecto
            doc.setFontSize(12);
            doc.text(`Proyecto: ${formData.location || 'N/A'}`, 14, 32);
            doc.text(`Responsable: ${formData.firstName || ''} ${formData.lastName || ''}`, 14, 38);
            doc.text(`Fecha: ${formData.date || new Date().toLocaleDateString()}`, 14, 44);

            // Datos extra
            let startY = 50;
            if (formData.railType) {
                doc.text(`Tipo de Riel: ${formData.railType}`, 14, startY);
                startY += 6;
            }
            if (formData.observations) {
                doc.setFontSize(10);
                doc.setTextColor(100);
                const splitObs = doc.splitTextToSize(`Observaciones Generales: ${formData.observations}`, 180);
                doc.text(splitObs, 14, startY);
                doc.setTextColor(0);
                doc.setFontSize(12);
                startY += (splitObs.length * 5) + 4;
            }

            // Tabla de Medidas
            const tableBody = measurements.map((m, i) => {
                let typeCell = m.type?.label || 'Otro';
                if (m.observations) {
                    typeCell += `\n(Nota: ${m.observations})`;
                }

                const dims = m.depth
                    ? `${m.width} x ${m.height} x ${m.depth} cm`
                    : `${m.width} x ${m.height} cm`;

                return [
                    i + 1,
                    m.floor,
                    m.roomNumber,
                    m.room,
                    typeCell,
                    m.width === 0 && m.height === 0 ? "Sin medidas" : dims
                ];
            });

            autoTable(doc, {
                head: [['#', 'Planta', 'Nº Hab', 'Estancia', 'Elemento / Notas', 'Medidas']],
                body: tableBody,
                startY: startY + 5,
                theme: 'grid',
                headStyles: { fillColor: [128, 55, 70], textColor: 255 },
                styles: { fontSize: 10, cellPadding: 3, valign: 'middle' },
                columnStyles: {
                    4: { cellWidth: 60 }
                }
            });

            const name = fileName || `Mediciones_${formData.location || 'Proyecto'}_${Date.now()}.pdf`;

            // === PROCESO DE GUARDADO EN NUBE (Si hay projectId) ===
            const client = supabase;
            if (projectId && client) {
                try {
                    console.log("Iniciando guardado de PDF en la nube...");

                    const pdfBlob = doc.output('blob');
                    const filePath = `${projectId}/${name}`;

                    // 1. Subir al Bucket
                    const { error: uploadError } = await client.storage
                        .from('project-documents')
                        .upload(filePath, pdfBlob, {
                            upsert: true,
                            contentType: 'application/pdf'
                        });

                    if (uploadError) {
                        console.error("Error subiendo PDF al Storage:", uploadError);
                    } else {
                        // 2. Obtener URL Pública
                        const { data: { publicUrl } } = client.storage
                            .from('project-documents')
                            .getPublicUrl(filePath);

                        console.log("PDF subido. URL:", publicUrl);

                        // 3. Guardar URL en la tabla projects
                        const { error: dbError } = await client
                            .from('projects')
                            .update({ last_report_url: publicUrl })
                            .eq('id', projectId);

                        if (dbError) {
                            console.error("Error actualizando DB:", dbError);
                        }
                    }
                } catch (err) {
                    console.error("Excepción al guardar PDF:", err);
                }
            }

            // ======================================================

            // Finalmente, descargar el archivo localmente para el usuario
            doc.save(name);
            return true;
        } catch (error) {
            console.error("Error generando PDF", error);
            throw error;
        }
    }
};
