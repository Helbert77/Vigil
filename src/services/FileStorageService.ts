import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/src/utils/Logger';

class FileStorageService {
  async uploadFile(file: File, bucket: string = 'library-media'): Promise<string> {
    try {
      const fileName = `${Date.now()}_${file.name}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) {
        logger.error('Erro no upload para o Supabase', error, 'storage', 'FileStorageService');
        throw new Error('Falha no upload do arquivo.');
      }

      if (!data) {
        throw new Error('Nenhum dado retornado após o upload.');
      }

      // Construir a URL pública manualmente
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      const publicUrl = publicUrlData.publicUrl;
      
      logger.info(`Arquivo enviado com sucesso: ${publicUrl}`, undefined, 'storage', 'FileStorageService');

      return publicUrl;
    } catch (error) {
      logger.error('Erro inesperado durante o upload', error, 'storage', 'FileStorageService');
      throw error;
    }
  }
}

export const fileStorageService = new FileStorageService();