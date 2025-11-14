# 🔒 Correção de Segurança: Biblioteca

## 📋 Problema Identificado

As políticas RLS (Row Level Security) da tabela `library_items` estão configuradas com `USING (true)`, permitindo acesso irrestrito a qualquer usuário autenticado, independente do plano.

### Vulnerabilidade:
- ✅ **Frontend protegido**: Controle de acesso funciona na interface
- ✅ **API protegida**: Validações implementadas em `api.ts`
- ❌ **Banco de dados vulnerável**: Acesso direto via Supabase API não é bloqueado

### Impacto:
Um usuário com conhecimento técnico poderia:
1. Usar a chave `anon` do Supabase
2. Fazer chamadas diretas à API do Supabase
3. Acessar/modificar dados da biblioteca sem restrições

---

## ✅ Solução Implementada

### Políticas RLS Restritivas

| Operação | Quem Pode Executar | Regra |
|----------|-------------------|-------|
| **SELECT** (Visualizar) | Pro, Premium, Admin | `user_can_access_library()` |
| **INSERT** (Adicionar) | Premium, Admin | `user_can_add_library_items()` |
| **UPDATE** (Editar) | Admin ou Criador | `user_can_modify_library_item()` |
| **DELETE** (Excluir) | Admin ou Criador | `user_can_modify_library_item()` |

---

## 🚀 Como Aplicar a Correção

### Passo 1: Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: **Vigil**
3. Navegue até: **SQL Editor** (menu lateral)

### Passo 2: Executar o SQL

1. Clique em **New Query**
2. Copie todo o conteúdo do arquivo: `supabase/fix-library-rls.sql`
3. Cole no editor SQL
4. Clique em **Run** (ou pressione `Ctrl+Enter`)

### Passo 3: Verificar Resultado

Após a execução, você verá uma tabela com 4 políticas:

```
┌─────────────────────────────────────┬──────────┐
│ policyname                          │ operacao │
├─────────────────────────────────────┼──────────┤
│ library_items_delete_restricted     │ DELETE   │
│ library_items_insert_restricted     │ INSERT   │
│ library_items_select_restricted     │ SELECT   │
│ library_items_update_restricted     │ UPDATE   │
└─────────────────────────────────────┴──────────┘
```

✅ Se você vê essas 4 políticas, a correção foi aplicada com sucesso!

---

## 🧪 Como Testar

### Teste 1: Usuário Free não pode acessar

```javascript
// No console do navegador (como usuário Free):
const { data, error } = await supabase
  .from('library_items')
  .select('*');

// Resultado esperado: data = [] (vazio)
```

### Teste 2: Usuário Pro pode visualizar

```javascript
// No console do navegador (como usuário Pro):
const { data, error } = await supabase
  .from('library_items')
  .select('*');

// Resultado esperado: data = [array com itens]
```

### Teste 3: Usuário Pro não pode adicionar

```javascript
// No console do navegador (como usuário Pro):
const { data, error } = await supabase
  .from('library_items')
  .insert({ title: 'Teste', author: 'Teste', type: 'document' });

// Resultado esperado: error (permissão negada)
```

### Teste 4: Usuário Premium pode adicionar

```javascript
// No console do navegador (como usuário Premium):
const { data, error } = await supabase
  .from('library_items')
  .insert({ 
    title: 'Teste', 
    author: 'Teste', 
    type: 'document',
    created_by: '<seu_user_id>'
  });

// Resultado esperado: data = objeto criado
```

---

## 📊 Matriz de Permissões

| Plano | Visualizar | Adicionar | Editar Próprios | Editar Outros | Deletar Próprios | Deletar Outros |
|-------|------------|-----------|-----------------|---------------|------------------|----------------|
| **Free** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Basic** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Pro** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Premium** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🔍 Detalhes Técnicos

### Funções Criadas

#### 1. `user_can_access_library()`
- **Propósito**: Verifica se usuário pode visualizar a biblioteca
- **Retorna**: `true` se Pro, Premium ou Admin
- **Uso**: Política SELECT

#### 2. `user_can_add_library_items()`
- **Propósito**: Verifica se usuário pode adicionar itens
- **Retorna**: `true` se Premium ou Admin
- **Uso**: Política INSERT

#### 3. `user_can_modify_library_item(item_creator_id)`
- **Propósito**: Verifica se usuário pode modificar um item específico
- **Parâmetro**: UUID do criador do item
- **Retorna**: `true` se Admin ou criador do item
- **Uso**: Políticas UPDATE e DELETE

### Segurança das Funções

- **`SECURITY DEFINER`**: Funções executam com privilégios do criador (necessário para acessar `auth.uid()`)
- **`STABLE`**: Indica que a função não modifica dados e retorna o mesmo resultado para os mesmos parâmetros na mesma query

---

## ⚠️ Importante

### Backup Automático
O Supabase mantém backups automáticos. Se algo der errado, você pode restaurar.

### Reversão
Se precisar reverter as mudanças, execute:

```sql
-- Remover políticas restritivas
DROP POLICY IF EXISTS "library_items_select_restricted" ON public.library_items;
DROP POLICY IF EXISTS "library_items_insert_restricted" ON public.library_items;
DROP POLICY IF EXISTS "library_items_update_restricted" ON public.library_items;
DROP POLICY IF EXISTS "library_items_delete_restricted" ON public.library_items;

-- Recriar políticas permissivas (NÃO RECOMENDADO)
CREATE POLICY "library_items_select" ON public.library_items FOR SELECT USING (true);
CREATE POLICY "library_items_insert" ON public.library_items FOR INSERT WITH CHECK (true);
CREATE POLICY "library_items_update" ON public.library_items FOR UPDATE USING (true);
CREATE POLICY "library_items_delete" ON public.library_items FOR DELETE USING (true);
```

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique se a tabela `profiles` tem as colunas `plan` e `role`
2. Verifique se há usuários com planos Pro/Premium para testar
3. Consulte os logs do Supabase em: Dashboard > Logs

---

## ✅ Checklist de Aplicação

- [ ] Backup do banco de dados realizado
- [ ] SQL executado no Supabase Dashboard
- [ ] 4 políticas criadas com sucesso
- [ ] Teste com usuário Free (sem acesso)
- [ ] Teste com usuário Pro (visualização apenas)
- [ ] Teste com usuário Premium (visualização + adição)
- [ ] Teste com Admin (acesso completo)
- [ ] Documentação atualizada no PRD

---

**Status**: ✅ Pronto para aplicação  
**Arquivo SQL**: `supabase/fix-library-rls.sql`  
**Data**: 14/11/2025

