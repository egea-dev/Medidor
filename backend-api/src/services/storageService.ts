import { minioClient, B_IMAGES, B_DOCS } from '../config/minio';

export const storageService = {
    /**
     * Sube un buffer a un bucket de MinIO y devuelve la URL pre-firmada (o pública si está configurado)
     */
    async uploadFile(bucket: string, path: string, buffer: Buffer, size: number, contentType: string) {
        await minioClient.putObject(bucket, path, buffer, size, {
            'Content-Type': contentType
        });

        return this.getPublicUrl(bucket, path);
    },

    getPublicUrl(bucket: string, path: string) {
        const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
        const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
        const port = process.env.MINIO_PORT || '9000';

        // En MinIO estándar la URL es: protocol://endpoint:port/bucket/path
        return `${protocol}://${endpoint}:${port}/${bucket}/${path}`;
    },

    async getFileUrl(bucket: string, path: string) {
        // Mantenemos este por compatibilidad, pero ahora devuelve la pública
        return this.getPublicUrl(bucket, path);
    },

    async deleteFile(bucket: string, path: string) {
        await minioClient.removeObject(bucket, path);
    }
};
