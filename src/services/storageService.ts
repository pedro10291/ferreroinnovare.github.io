import { supabase } from './supabase';

const BUCKET_NAME = 'images';

export const storageService = {
  /**
   * Faz o upload de uma imagem para o bucket público.
   * Retorna a URL pública da imagem.
   */
  async uploadImage(file: File, folder: 'gallery' | 'procedures'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  /**
   * Remove uma imagem do bucket dado a sua URL pública.
   */
  async deleteImage(publicUrl: string): Promise<void> {
    try {
      // Extrai o caminho relativo (ex: 'gallery/nome-do-arquivo.jpg') da URL completa
      const bucketPath = `${supabase.supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/`;
      if (!publicUrl.startsWith(bucketPath)) {
        console.warn('URL não pertence ao bucket atual, ignorando exclusão.');
        return;
      }
      
      const filePath = publicUrl.replace(bucketPath, '');
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
        throw error;
      }
    } catch (e) {
      console.error('Erro na exclusão da imagem do storage:', e);
      // Não lançamos o erro adiante para não quebrar fluxos caso a imagem já não exista
    }
  }
};
