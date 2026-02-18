import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { compressImage } from '../utils/compressImage';
import type { ImageRecord } from '@shared/types';

export function useImages(projectId: string) {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchImages = useCallback(async () => {
    try {
      const projectData = await api.get(`/projects/${projectId}`);
      setImages(projectData.images || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  }, [projectId]);

  const upload = async (files: File[], measurementId?: string) => {
    setUploading(true);
    try {
      for (const file of files) {
        const compressed = await compressImage(file);

        const formData = new FormData();
        formData.append('image', compressed);
        formData.append('projectId', projectId);
        if (measurementId) formData.append('measurementId', measurementId);

        const result = await api.upload('/images/upload', formData);

        // El backend devuelve { id, url }
        console.log('Imagen subida:', result);
      }
      await fetchImages();
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error al subir imágenes');
    } finally {
      setUploading(false);
    }
  };

  const remove = async (imageId: string) => {
    try {
      // En el backend actual no hemos creado DELETE para imágenes aún, 
      // pero lo añadimos para consistencia. Por ahora limpiamos el estado.
      // await api.delete(`/images/${imageId}`);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  return { images, uploading, fetchImages, upload, remove };
}
