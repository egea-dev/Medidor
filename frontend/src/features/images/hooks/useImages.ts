import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadImage, deleteImage, getSignedUrl } from '@/lib/storage';
import { compressImage } from '../utils/compressImage';
import type { ImageRecord } from '@shared/types';

export function useImages(projectId: string) {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchImages = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('images')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (data) {
      const withUrls = await Promise.all(
        data.map(async (img: any) => ({
          ...img,
          url: await getSignedUrl(img.storage_path),
        }))
      );
      setImages(withUrls);
    }
  }, [projectId]);

  const upload = async (files: File[], userId: string, measurementId?: string) => {
    setUploading(true);
    try {
      for (const file of files) {
        const compressed = await compressImage(file);
        const { path, error: uploadError } = await uploadImage(
          compressed, userId, projectId, measurementId
        );
        if (uploadError) throw uploadError;

        if (supabase) {
          await supabase.from('images').insert({
            project_id: projectId,
            measurement_id: measurementId || null,
            storage_path: path,
            original_name: file.name,
            mime_type: 'image/jpeg',
            size_bytes: compressed.size,
          });
        }
      }
      await fetchImages();
    } finally {
      setUploading(false);
    }
  };

  const remove = async (imageId: string, storagePath: string) => {
    await deleteImage(storagePath);
    if (supabase) {
      await supabase.from('images').delete().eq('id', imageId);
    }
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  return { images, uploading, fetchImages, upload, remove };
}
