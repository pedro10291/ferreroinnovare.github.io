import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { ImageUpload } from '../../components/admin/ImageUpload';
import { ImagePlus, AlertCircle } from 'lucide-react';

interface GalleryImage {
  id: string;
  image_url: string;
  created_at: string;
}

export const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const MAX_IMAGES = 20;

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Ignorar o erro silenciosamente se a tabela não existir, pois ainda não rodamos a migration no DB
        if (error.message.includes('relation "public.gallery" does not exist')) {
          setImages([]);
        } else {
          throw error;
        }
      } else {
        setImages(data || []);
      }
    } catch (err: any) {
      console.error('Erro ao buscar galeria:', err);
      setError('Não foi possível carregar as fotos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUploaded = async (url: string) => {
    try {
      if (images.length >= MAX_IMAGES) {
        alert('Limite de 20 fotos atingido.');
        return;
      }
      
      const { data, error } = await supabase
        .from('gallery')
        .insert([{ image_url: url }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        await fetchImages();
      }
    } catch (err: any) {
      console.error('Erro ao salvar foto:', err);
      alert('A foto foi enviada, mas houve um erro ao salvá-la no banco de dados.');
    }
  };

  const handleImageRemoved = async (id: string, url: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta foto?')) return;

    try {
      // 1. Remover da tabela gallery
      const { error: dbError } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // 2. Atualizar estado
      setImages(images.filter(img => img.id !== id));

      // 3. Remover do storage (assíncrono em background pra não travar a UI)
      import('../../services/storageService').then(({ storageService }) => {
        storageService.deleteImage(url).catch(console.error);
      });
      
    } catch (err: any) {
      console.error('Erro ao remover foto:', err);
      alert('Erro ao remover foto.');
    }
  };

  const isLimitReached = images.length >= MAX_IMAGES;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-clinic-dark">Galeria</h1>
          <p className="text-gray-500 mt-1">As fotos adicionadas aqui aparecem na galeria pública do site.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${isLimitReached ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
            {images.length} de {MAX_IMAGES} fotos
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-clinic-gold border-t-transparent"></div>
          <p className="text-gray-500 text-sm">Carregando galeria...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Uploader section (only visible if not at limit) */}
          {!isLimitReached && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-md">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <ImagePlus className="w-4 h-4" /> Adicionar nova foto
              </h3>
              <ImageUpload 
                folder="gallery" 
                onImageUploaded={handleImageUploaded} 
                onImageRemoved={() => {}} 
              />
            </div>
          )}

          {isLimitReached && (
            <div className="bg-orange-50 border border-orange-100 text-orange-800 px-4 py-3 rounded-lg text-sm font-medium">
              Limite de {MAX_IMAGES} fotos atingido. Para adicionar novas fotos, remova alguma existente.
            </div>
          )}

          {/* Grid de Imagens Dinâmico */}
          {images.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
              <ImagePlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Você ainda não adicionou nenhuma foto.</p>
              <p className="text-sm text-gray-400 mt-1">Use a área acima para enviar a primeira.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((img) => (
                <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img 
                    src={img.image_url} 
                    alt="Foto da Galeria" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <button 
                      onClick={() => handleImageRemoved(img.id, img.image_url)}
                      className="bg-white/90 hover:bg-red-500 text-gray-700 hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                      Excluir foto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Gallery;
