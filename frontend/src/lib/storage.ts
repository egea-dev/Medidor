import { supabase } from './supabase';

const BUCKET = 'project-images';

export async function uploadImage(
  file: File,
  userId: string,
  projectId: string,
  measurementId?: string
): Promise<{ path: string; error: Error | null }> {
  if (!supabase) return { path: '', error: new Error('Supabase no configurado') };

  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${userId}/${projectId}/${measurementId || 'general'}/${fileName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  return { path, error };
}

export async function getImageUrl(path: string): Promise<string> {
  if (!supabase) return '';
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  if (!supabase) return '';
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  return data?.signedUrl || '';
}

export async function deleteImage(path: string): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error('Supabase no configurado') };
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return { error };
}
