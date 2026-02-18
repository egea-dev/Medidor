import React, { useState } from 'react';
import { X, ZoomIn, Trash2 } from 'lucide-react';
import { ImageRecord } from '@shared/types';

interface ImageGalleryProps {
  images: ImageRecord[];
  onDelete?: (id: string) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onDelete }) => {
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {images.map((img) => (
          <div 
            key={img.id} 
            className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 cursor-pointer"
            onClick={() => setSelectedImage(img)}
          >
            <img 
              src={img.url || ''} 
              alt="Project Image" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="text-white drop-shadow-md" size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
            <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            >
                <X size={32} />
            </button>
            
            <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
                <img 
                    src={selectedImage.url || ''} 
                    alt="Full View" 
                    className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                />
                
                <div className="w-full flex justify-between items-center mt-4 px-4">
                    <span className="text-gray-400 text-sm">
                        {new Date(selectedImage.createdAt).toLocaleDateString()}
                    </span>
                    
                    {onDelete && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if(window.confirm('¿Eliminar esta imagen permanentemente?')) {
                                    onDelete(selectedImage.id);
                                    setSelectedImage(null);
                                }
                            }}
                            className="bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <Trash2 size={16} /> Eliminar
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </>
  );
};
