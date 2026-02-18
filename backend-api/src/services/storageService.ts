import { minioClient, B_IMAGES, B_DOCS } from '../config/minio';

export const storageService = {
    /**
     * Sube un buffer a un bucket de MinIO y devuelve la URL pre-firmada (o pública si está configurado)
     */
    async uploadFile(bucket: string, path: string, buffer: Buffer, size: number, contentType: string) {
        await minioClient.putObject(bucket, path, buffer, size, {
            'Content-Type': contentType
        });

        // Generamos una URL pre-firmada que dura 7 días (máximo en MinIO si el bucket es privado)
        // O si el bucket es público, simplemente devolvemos la URL directa.
        // Como el usuario tiene problemas con el modo público, usaremos presignedUrl por seguridad.
        return await minioClient.presignedGetObject(bucket, path, 24 * 60 * 60 * 7);
    },

    async getFileUrl(bucket: string, path: string) {
        return await minioClient.presignedGetObject(bucket, path, 24 * 60 * 60 * 7);
    },

    async deleteFile(bucket: string, path: string) {
        await minioClient.removeObject(bucket, path);
    }
};
