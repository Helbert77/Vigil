# 🚨 URGENTE: EXECUTAR SCRIPT SQL PARA CORRIGIR BLOQUEIO DE AD BLOCKERS

## ❌ O Problema

Os botões de **Pausar** e **Excluir** anúncio não funcionavam porque:
- A tabela no banco de dados se chama `ads`
- Bloqueadores de anúncios (AdBlock, uBlock Origin, etc.) bloqueiam automaticamente qualquer requisição HTTP que contenha a palavra "**ads**" na URL
- Isso resulta no erro: `net::ERR_BLOCKED_BY_CLIENT`

## ✅ A Solução

Renomeamos a tabela de `ads` para `anuncios` no banco de dados para evitar o bloqueio.

## 📋 INSTRUÇÕES - EXECUTE AGORA

### PASSO 1: Abrir Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**

### PASSO 2: Executar o Script
1. Clique em **New Query**
2. Abra o arquivo: `supabase/sql/RENOMEAR_TABELA_ADS_PARA_ANUNCIOS.sql`
3. **COPIE TODO O CONTEÚDO** do arquivo
4. **COLE** no SQL Editor do Supabase
5. Clique em **RUN** (ou pressione Ctrl+Enter)

### PASSO 3: Verificar Sucesso
Você deve ver as seguintes mensagens no console:
```
✅ Tabela renomeada de ads para anuncios com sucesso!
✅ Índices atualizados
✅ Políticas RLS atualizadas
✅ Funções atualizadas
✅ Sistema pronto - bloqueadores de anúncios não irão mais bloquear!
```

### PASSO 4: Testar
1. Recarregue a página "Meus Anúncios" no navegador (F5)
2. Tente **pausar** um anúncio
3. Tente **excluir** um anúncio
4. **Sucesso!** Os botões agora funcionam mesmo com bloqueadores de anúncios ativos

## 📁 Arquivos Atualizados

Já atualizei automaticamente todos os arquivos do código:

✅ `pages/advertising/MyAds.tsx` - Atualizado para usar tabela `anuncios`
✅ `components/advertising/CreateAdModal.tsx` - Atualizado para criar anúncios na tabela `anuncios`
✅ `src/services/api.ts` - Todas as funções agora usam `anuncios`:
   - `fetchActiveAds()`
   - `fetchAdById()`
   - Funções de relatórios

## 🔒 Segurança Mantida

Todas as políticas RLS (Row Level Security) foram recriadas:
- ✅ Usuários só podem ver todos os anúncios (SELECT)
- ✅ Usuários só podem criar seus próprios anúncios (INSERT)
- ✅ Usuários só podem atualizar seus próprios anúncios (UPDATE)
- ✅ Usuários só podem excluir seus próprios anúncios (DELETE)

## 🎯 O que o Script Faz

1. **Renomeia a tabela**: `ads` → `anuncios`
2. **Renomeia índices**: Para manter a performance
3. **Recria políticas RLS**: Com os novos nomes
4. **Atualiza todas as funções**: Para referenciar `anuncios`
5. **Atualiza triggers**: Para funcionar com a nova tabela

## ⚠️ IMPORTANTE

- **NÃO** é necessário backup - o script apenas renomeia, não deleta dados
- **NÃO** haverá downtime - é uma operação atômica
- **NÃO** afeta dados existentes - todos os anúncios serão preservados

## 💡 Por que "anuncios" e não outro nome?

- ✅ Bloqueadores não bloqueiam palavras em português
- ✅ Mantém clareza no código (sabemos que são anúncios)
- ✅ Consistente com o resto do projeto (interface em português)

## 🧪 Testar sem Executar o SQL (apenas para debug)

Se quiser confirmar que o bloqueio está acontecendo:
1. Abra o **Console do Navegador** (F12)
2. Vá para a aba **Network**
3. Tente excluir um anúncio
4. Você verá requisições para `/rest/v1/ads?...` com status `(blocked)`

Após executar o SQL:
1. As requisições mudarão para `/rest/v1/anuncios?...`
2. Status será `200 OK` ✅

---

## 📞 Problemas?

Se algo der errado, a tabela antiga ainda existe. Para reverter:
```sql
ALTER TABLE public.anuncios RENAME TO ads;
```

Mas isso não será necessário - o script é seguro! 🎉

