import { api } from '@/lib/api';

export const pdfService = {
    /**
     * Genera el reporte del proyecto y lo envía por email.
     * En el nuevo backend, esta lógica ocurre en el servidor.
     */
    async generateProjectReport(projectId: string, emailTo?: string) {
        try {
            console.log("Iniciando generación de PDF en Backend...");

            const response = await api.post(`/pdf/${projectId}/send-email`, {
                emailTo
            });

            console.log("Respuesta PDF Backend:", response);

            // Si el backend devuelve la URL, la mostramos o la usamos para descargar
            if (response.url) {
                window.open(response.url, '_blank');
            }

            return { success: true, url: response.url };
        } catch (error: any) {
            console.error("Error en pdfService:", error);
            throw error;
        }
    }
};
