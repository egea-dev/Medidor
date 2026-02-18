import { ProductType } from '../types';

export const MINIMUM_UNITS = 1;

export const PRODUCT_TYPES: ProductType[] = [
    {
        id: 'cortinas',
        label: 'Cortinas',
        description: 'Confección a medida de cortinas, visillos o estores.',
    },
    {
        id: 'ventanas',
        label: 'Ventanas',
        description: 'Renovación de carpintería de aluminio o PVC.',
    },
    {
        id: 'puertas',
        label: 'Puertas',
        description: 'Puertas de paso, entrada o correderas.',
    },
    {
        id: 'armarios',
        label: 'Armarios',
        description: 'Armarios empotrados, vestidores o frentes.',
    },
    {
        id: 'otro',
        label: 'Otro',
        description: 'Describe tu necesidad específica.',
    },
];

export const PROJECT_STATUS = {
    DRAFT: 'draft',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
} as const;
