import * as Minio from 'minio';
import dotenv from 'dotenv';

dotenv.config();

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
    secretKey: process.env.MINIO_SECRET_KEY || 'AdminPass1234!'
});

export const B_IMAGES = process.env.MINIO_BUCKET_IMAGES || 'project-images';
export const B_DOCS = process.env.MINIO_BUCKET_DOCS || 'project-documents';
