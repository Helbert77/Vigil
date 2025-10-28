# Guia de Migração - Account Deletion Requests

## Problema Identificado

A tabela `account_deletion_requests` não existe no banco de dados Supabase, causando erro 404 (PGRST205) nas seguintes operações:
- Verificação de status de exclusão da conta
- Agendamento de exclusão da conta
- Cancelamento de exclusão da conta

## Solução

### Opção 1: Script Automático (Recomendado)

1. **Obter a Chave de Serviço do Supabase:**
   - Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
   - Vá para o seu projeto
   - Navegue para Settings > API
   - Copie a "service_role key" (não a anon key)

2. **Definir a Variável de Ambiente:**
   ```powershell
   # No PowerShell (Windows)
   $env:SUPABASE_SERVICE_KEY="sua_chave_de_servico_aqui"
   
   # Ou definir permanentemente
   [Environment]::SetEnvironmentVariable("SUPABASE_SERVICE_KEY", "sua_chave_aqui", "User")
   ```

3. **Executar o Script de Migração:**
   ```bash
   node scripts/apply-migration.js
   ```

### Opção 2: SQL Manual

Se preferir executar manualmente no Supabase Dashboard:

1. **Acesse o SQL Editor no Supabase Dashboard**

2. **Execute o seguinte SQL:**
   ```sql
   -- Criar a tabela account_deletion_requests
   CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     scheduled_deletion_date TIMESTAMP WITH TIME ZONE NOT NULL,
     status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'completed')),
     grace_period_days INTEGER NOT NULL DEFAULT 30,
     reason TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     cancelled_at TIMESTAMP WITH TIME ZONE,
     completed_at TIMESTAMP WITH TIME ZONE
   );

   -- Criar índices para performance
   CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_user_id 
   ON public.account_deletion_requests(user_id);
   
   CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_status 
   ON public.account_deletion_requests(status);
   
   CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_scheduled_date 
   ON public.account_deletion_requests(scheduled_deletion_date);

   -- Habilitar RLS (Row Level Security)
   ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

   -- Política para usuários verem apenas seus próprios registros
   CREATE POLICY "Users can view own deletion requests" 
   ON public.account_deletion_requests FOR SELECT 
   USING (auth.uid() = user_id);

   -- Política para usuários criarem seus próprios registros
   CREATE POLICY "Users can create own deletion requests" 
   ON public.account_deletion_requests FOR INSERT 
   WITH CHECK (auth.uid() = user_id);

   -- Política para usuários atualizarem seus próprios registros
   CREATE POLICY "Users can update own deletion requests" 
   ON public.account_deletion_requests FOR UPDATE 
   USING (auth.uid() = user_id);

   -- Função para atualizar updated_at automaticamente
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ language 'plpgsql';

   -- Trigger para atualizar updated_at
   CREATE TRIGGER update_account_deletion_requests_updated_at 
   BEFORE UPDATE ON public.account_deletion_requests 
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

## Verificação

Após aplicar a migração, execute o script de teste para verificar:

```bash
node scripts/test-api-calls.js
```

**Resultado esperado:**
- ✅ Tabela 'account_deletion_requests': Existe
- ✅ Coluna 'account_deletion_requests.user_id': Existe
- ✅ Coluna 'account_deletion_requests.status': Existe
- ✅ Consulta account_deletion_requests: Sucesso

## Estrutura da Tabela

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `user_id` | UUID | Referência ao usuário |
| `scheduled_deletion_date` | TIMESTAMP | Data agendada para exclusão |
| `status` | TEXT | Status: 'pending', 'cancelled', 'completed' |
| `grace_period_days` | INTEGER | Período de carência (padrão: 30 dias) |
| `reason` | TEXT | Motivo da exclusão (opcional) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |
| `cancelled_at` | TIMESTAMP | Data do cancelamento (se aplicável) |
| `completed_at` | TIMESTAMP | Data da conclusão (se aplicável) |

## Políticas de Segurança

- **RLS Habilitado**: Usuários só podem ver/modificar seus próprios registros
- **Autenticação Obrigatória**: Todas as operações requerem usuário logado
- **Integridade Referencial**: Exclusão em cascata quando usuário é removido

## Troubleshooting

### Erro: "SUPABASE_SERVICE_KEY não encontrada"
- Verifique se a variável de ambiente foi definida corretamente
- Use a service_role key, não a anon key

### Erro: "Permission denied"
- Verifique se a chave de serviço tem permissões adequadas
- Confirme se está usando a chave correta do projeto

### Erro: "Table already exists"
- A migração já foi aplicada com sucesso
- Execute o script de teste para confirmar

## Próximos Passos

Após aplicar a migração:
1. Teste as funcionalidades de exclusão de conta
2. Monitore os logs para novos erros
3. Considere implementar limpeza automática de registros antigos