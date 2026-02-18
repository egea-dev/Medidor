import React, { useRef, useState } from 'react';
import { Camera, X, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '@/features/images/utils/compressImage';

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  loading?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onUpload, 
  maxFiles = 5,
  loading = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<{file: File, url: string}[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFiles = async (files: FileList | null) => {
    if (!files) return;
    
    const newFiles: {file: File, url: string}[] = [];
    const filesToUpload: File[] = [];

    // Limitamos la cantidad total de archivos
    const remainingSlots = maxFiles - previews.length;
    const fileArray = Array.from(files).slice(0, remainingSlots);

    for (const file of fileArray) {
      if (file.type.startsWith('image/')) {
        try {
            // Comprimimos antes de previsualizar para simular el proceso real
            const compressed = await compressImage(file);
            const url = URL.createObjectURL(compressed);
            newFiles.push({ file: compressed, url });
            filesToUpload.push(compressed);
        } catch (err) {
            console.error("Error al procesar imagen", err);
        }
      }
    }

    setPreviews(prev => [...prev, ...newFiles]);
    if (filesToUpload.length > 0) {
        onUpload(filesToUpload);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
     setPreviews(prev => prev.filter((_, i) => i !== index));
     // NOTA: Aquí solo quitamos la previsualización local. 
     // La lógica de borrado real dependerá de cómo el padre maneje el estado de subida.
     // Para este componente simple, asumimos que 'onUpload' ya disparó la subida.
  };

  return (
    <div className="w-full space-y-4">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors
          ${dragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-gray-50 hover:bg-white'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            disabled={loading || previews.length >= maxFiles}
        />
        
        <div className="bg-white p-3 rounded-full shadow-sm mb-3">
            <Camera className="text-brand-500" size={24} />
        </div>
        
        <p className="text-sm font-bold text-gray-700">
            {loading ? 'Procesando...' : 'Toca para hacer foto o subir'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
            Máximo {maxFiles} fotos. JPG, PNG.
        </p>
      </div>

      {/* Previews Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 animate-fadeIn">
            {previews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={preview.url} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                    >
                        <X size={12} />
                    </button>
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                            <UploadCloud className="animate-bounce text-brand-600" size={20} />
                        </div>
                    )}
                </div>
            ))}
        </div>
      )}
    </div>
  );
};
