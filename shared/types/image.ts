export interface ImageRecord {
    id: string;
    projectId: string;
    measurementId?: string | null;
    storagePath: string;
    originalName?: string;
    caption?: string;
    mimeType: string;
    sizeBytes?: number;
    url?: string;        // URL firmada (calculada en runtime)
    createdAt: string;
}
