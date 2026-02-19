import { minioClient, B_IMAGES, B_DOCS } from '../config/minio';

async function initBuckets() {
    console.log('🚀 Iniciando configuración de buckets en MinIO...');

    const buckets = [B_IMAGES, B_DOCS];

    for (const bucket of buckets) {
        try {
            const exists = await minioClient.bucketExists(bucket);
            if (!exists) {
                console.log(`📦 Creando bucket: ${bucket}...`);
                await minioClient.makeBucket(bucket, 'us-east-1');

                // Establecer política pública para que las imágenes se puedan ver directamente
                // Esto es necesario para que las URLs públicas funcionen sin firmas temporales
                const policy = {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Action: ['s3:GetBucketLocation', 's3:ListBucket'],
                            Effect: 'Allow',
                            Principal: { AWS: ['*'] },
                            Resource: [`arn:aws:s3:::${bucket}`]
                        },
                        {
                            Action: ['s3:GetObject'],
                            Effect: 'Allow',
                            Principal: { AWS: ['*'] },
                            Resource: [`arn:aws:s3:::${bucket}/*`]
                        }
                    ]
                };

                await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
                console.log(`✅ Bucket ${bucket} creado y configurado como público.`);
            } else {
                console.log(`✔ El bucket ${bucket} ya existe.`);
            }
        } catch (error) {
            console.error(`❌ Error con el bucket ${bucket}:`, error);
        }
    }

    console.log('✨ Configuración de MinIO completada.');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    initBuckets().catch(console.error);
}

export { initBuckets };
