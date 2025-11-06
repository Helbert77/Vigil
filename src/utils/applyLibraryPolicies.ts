// Script para aplicar as políticas de UPDATE e DELETE na tabela library_items
// Este script deve ser executado uma única vez

import { supabase } from '@/integrations/supabase/client';
import { logger } from './Logger';

export const applyLibraryPolicies = async (): Promise<boolean> => {
  const storageKey = 'library_policies_applied';
  
  // Verifica se já foi aplicado
  if (localStorage.getItem(storageKey) === 'true') {
    return true;
  }

  try {
    logger.info('Aplicando políticas de UPDATE e DELETE...', {}, 'library', 'applyLibraryPolicies');

    // Tenta executar o SQL diretamente
    const sql = `
      do $$
      begin
        -- Criar política de UPDATE se não existir
        if not exists (
          select 1 from pg_policies 
          where schemaname = 'public' 
            and tablename = 'library_items' 
            and policyname = 'library_items_update'
        ) then
          execute 'create policy "library_items_update" on public.library_items for update using (true)';
        end if;

        -- Criar política de DELETE se não existir
        if not exists (
          select 1 from pg_policies 
          where schemaname = 'public' 
            and tablename = 'library_items' 
            and policyname = 'library_items_delete'
        ) then
          execute 'create policy "library_items_delete" on public.library_items for delete using (true)';
        end if;
      end $$;
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      logger.error('Erro ao aplicar políticas (esperado se não houver função exec_sql)', error, 'library', 'applyLibraryPolicies');
      // Marca como aplicado mesmo com erro para não tentar novamente
      localStorage.setItem(storageKey, 'true');
      return false;
    }

    logger.info('Políticas aplicadas com sucesso!', {}, 'library', 'applyLibraryPolicies');
    localStorage.setItem(storageKey, 'true');
    return true;
  } catch (err) {
    logger.error('Erro ao aplicar políticas', err, 'library', 'applyLibraryPolicies');
    localStorage.setItem(storageKey, 'true');
    return false;
  }
};

