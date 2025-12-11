# 🔧 DEBUG - Sistema de Moderação da Timeline

## 🚨 PROBLEMA IDENTIFICADO
O evento é enviado para moderação (toast aparece), mas não aparece na página de moderação.

## 📋 CHECKLIST DE DIAGNÓSTICO

### ✅ 1. Verificar se a tabela foi criada no Supabase

**Execute no SQL Editor do Supabase:**

```sql
-- Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'timeline_moderation_queue';
```

**Resultado esperado:** Deve retornar uma linha com `timeline_moderation_queue`

### ✅ 2. Se a tabela NÃO existir, execute o SQL completo

**Copie e execute todo o conteúdo do arquivo:**
`supabase/sql/create_timeline_moderation_system.sql`

### ✅ 3. Verificar se há dados na tabela

```sql
-- Ver todos os registros na fila
SELECT * FROM public.timeline_moderation_queue;
```

### ✅ 4. Verificar permissões RLS

```sql
-- Verificar policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'timeline_moderation_queue';
```

### ✅ 5. Testar inserção manual

```sql
-- Testar inserção direta (substitua USER_ID pelo seu ID)
INSERT INTO public.timeline_moderation_queue (
  title, year, category, description, author_id, status
) VALUES (
  'Teste Manual', 2024, 'politics', 'Teste de inserção', 'SEU_USER_ID_AQUI', 'pending'
);
```

## 🔍 LOGS DE DEBUG ADICIONADOS

Agora o sistema tem logs detalhados. Abra o **Console do navegador (F12)** e:

1. Tente criar um evento como usuário comum
2. Observe os logs que começam com:
   - 🔄 Submetendo evento para moderação
   - 👤 Usuário autenticado
   - 📝 Dados para inserção
   - 📊 Resultado da inserção

3. Vá para a página de Moderação e observe:
   - 🔍 Buscando fila de moderação da timeline
   - 📊 Resultado da busca da fila

## 🎯 POSSÍVEIS CAUSAS E SOLUÇÕES

### ❌ Causa 1: Tabela não existe
**Solução:** Execute o SQL completo do arquivo `create_timeline_moderation_system.sql`

### ❌ Causa 2: Erro de permissão RLS
**Solução:** Verifique se as policies foram criadas corretamente

### ❌ Causa 3: Usuário não tem role correto
**Solução:** Verifique se o usuário logado tem role 'admin' ou 'moderator' para ver a fila

### ❌ Causa 4: Erro na inserção
**Solução:** Verifique os logs do console para ver o erro específico

## 🚀 APÓS RESOLVER

1. Remova os logs de debug (opcional)
2. Teste o fluxo completo:
   - Usuário comum cria evento
   - Moderador vê na fila
   - Moderador aprova/rejeita
   - Autor recebe notificação

## 📞 PRÓXIMOS PASSOS

1. **Execute o SQL primeiro** se ainda não fez
2. **Abra o Console (F12)** e teste
3. **Compartilhe os logs** se ainda houver problemas
