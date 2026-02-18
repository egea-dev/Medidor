import { ImageRecord } from './image';

export interface ProductType {
    id: string;
    label: string;
    description: string;
    icon?: any;
}

export interface Measurement {
    id: string;          // UUID (antes era number)
    width: number;
    height: number;
    depth?: number;
    observations?: string;
    floor: string;
    roomNumber: string;
    room: string;
    type: ProductType | null;
    quantity: number;
    projectId?: string;
    images?: ImageRecord[];
}

export interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    jobType: string;
    date: string;
    railType: string;
    observations: string;
}

export interface Project extends FormData {
    id: string;          // UUID
    userId: string;
    status: 'draft' | 'in_progress' | 'completed';
    measurements: Measurement[];
    images?: ImageRecord[]; // Añadido para corregir error de tipos
    createdAt: string;
    updatedAt: string;
}
