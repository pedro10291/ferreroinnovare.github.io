import React, { useRef, useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Button } from '../ui/Button';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
  folder: 'gallery' | 'procedures';
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  folder,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Apenas arquivos de imagem são permitidos.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const url = await storageService.uploadImage(file, folder);
      onImageUploaded(url);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar imagem.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (currentImageUrl) {
      // Opcional: deletar do storage, ou apenas desvincular
      // await storageService.deleteImage(currentImageUrl);
      onImageRemoved();
    }
  };

  if (currentImageUrl) {
    return (
      <div className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50 flex items-center justify-center">
        <img 
          src={currentImageUrl} 
          alt="Upload preview" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {!disabled && (
            <>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Trocar
              </Button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                title="Remover foto"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        
        {/* Hidden Input for 'Trocar' */}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/jpeg, image/png, image/webp"
          onChange={handleFileChange}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={`
          w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : 'cursor-pointer hover:bg-gray-50 border-gray-300 hover:border-clinic-gold'}
        `}
      >
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-clinic-gold animate-spin mb-3" />
        ) : (
          <UploadCloud className="w-8 h-8 text-gray-400 mb-3" />
        )}
        
        <p className="text-sm font-medium text-gray-700">
          {isUploading ? 'Enviando foto...' : 'Clique para selecionar uma foto'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PNG, JPG ou WEBP (máx. 5MB)
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
      )}

      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/jpeg, image/png, image/webp"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
    </div>
  );
};
