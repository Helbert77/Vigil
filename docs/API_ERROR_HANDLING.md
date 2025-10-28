# Documentação de Tratamento de Erros da API

## Visão Geral

Este documento descreve o sistema de tratamento de erros implementado para as chamadas à API do Supabase, incluindo logs detalhados, códigos de erro e estratégias de recuperação.

## Códigos de Erro Comuns

### PGRST205 - Tabela Não Encontrada
- **Descrição**: A tabela especificada não existe no banco de dados
- **Exemplo**: `Could not find the table 'public.account_deletion_requests' in the schema cache`
- **Solução**: Executar migração para criar a tabela

### PGRST116 - Coluna Não Encontrada
- **Descrição**: A coluna especificada não existe na tabela
- **Exemplo**: Consulta com `status` em tabela que não possui essa coluna
- **Solução**: Usar consultas alternativas ou adicionar a coluna

### 42703 - Erro de Coluna PostgreSQL
- **Descrição**: Erro específico do PostgreSQL para coluna inexistente
- **Exemplo**: `column comments.status does not exist`
- **Solução**: Verificar estrutura da tabela e ajustar consulta

## Funções de Tratamento de Erros

### `handleApiError(error, context, metadata)`

Função utilitária para tratamento padronizado de erros.

**Parâmetros:**
- `error`: Objeto de erro capturado
- `context`: String identificando onde o erro ocorreu
- `metadata`: Objeto com informações adicionais para debug

**Comportamento:**
- Categoriza o tipo de erro
- Registra logs apropriados (debug, warn, error)
- Inclui metadados para facilitar depuração

### `isMissingResourceError(error)`

Verifica se um erro está relacionado à ausência de tabela ou coluna.

**Retorna:** `boolean`

**Códigos verificados:**
- `PGRST205`: Tabela não encontrada
- `PGRST116`: Coluna não encontrada
- `42703`: Erro de coluna PostgreSQL

## Endpoints Implementados

### Account Deletion Requests

#### `getAccountDeletionStatus()`
- **Função**: Busca status de exclusão da conta
- **Tratamento de Erro**: Retorna `null` se tabela não existir
- **Logs**: Debug para sucesso, warn para tabela ausente

#### `scheduleAccountDeletion(gracePeriodDays, reason)`
- **Função**: Agenda exclusão da conta
- **Tratamento de Erro**: Sugere executar migração se tabela não existir
- **Logs**: Debug para agendamento, warn para problemas

#### `cancelAccountDeletion()`
- **Função**: Cancela exclusão agendada
- **Tratamento de Erro**: Mensagem amigável se funcionalidade indisponível
- **Logs**: Debug para cancelamento bem-sucedido

### Pending Operations

#### `getPendingOperations()` (Legado)
- **Status**: Mantido para compatibilidade
- **Problema**: Depende de coluna `status` que pode não existir

#### `getPendingOperationsSafe()` (Recomendado)
- **Função**: Busca atividades recentes (últimas 24h)
- **Vantagem**: Não depende de coluna `status`
- **Tratamento**: Retorna array vazio em caso de erro

## Estratégias de Recuperação

### Para Tabela `account_deletion_requests` Ausente

1. **Detecção**: Erro PGRST205 ao consultar a tabela
2. **Ação**: Executar script de migração
3. **Script**: `scripts/apply-migration.js`
4. **Requisito**: Chave de serviço do Supabase (`SUPABASE_SERVICE_KEY`)

### Para Coluna `status` Ausente

1. **Detecção**: Erro 42703 ou PGRST116
2. **Ação**: Usar consultas alternativas baseadas em timestamp
3. **Implementação**: Função `getPendingOperationsSafe()`

## Scripts de Teste e Migração

### `scripts/test-api-calls.js`
- **Função**: Testa existência de tabelas e colunas
- **Uso**: `node scripts/test-api-calls.js`
- **Saída**: Relatório detalhado do estado das tabelas

### `scripts/apply-migration.js`
- **Função**: Aplica migração da tabela `account_deletion_requests`
- **Requisito**: Variável `SUPABASE_SERVICE_KEY`
- **Uso**: `node scripts/apply-migration.js`

## Logs e Depuração

### Níveis de Log

- **`console.debug`**: Operações bem-sucedidas, informações detalhadas
- **`console.warn`**: Problemas não críticos, recursos ausentes
- **`console.error`**: Erros críticos que impedem funcionamento

### Metadados Incluídos

- `user_id`: ID do usuário quando aplicável
- `table_name`: Nome da tabela sendo consultada
- `error_code`: Código específico do erro
- `suggestion`: Sugestão de correção quando disponível

## Exemplos de Uso

### Tratamento Básico
```javascript
try {
  const result = await supabase.from('table').select('*');
  if (result.error && isMissingResourceError(result.error)) {
    handleApiError(result.error, 'functionName', { suggestion: 'Run migration' });
    return { error: new Error('Funcionalidade indisponível') };
  }
} catch (error) {
  handleApiError(error, 'functionName');
  return { error };
}
```

### Consulta Segura
```javascript
// Em vez de depender de coluna 'status'
const { data } = await supabase
  .from('comments')
  .select('id, created_at')
  .eq('user_id', userId)
  .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
```

## Próximos Passos

1. **Aplicar Migração**: Executar `apply-migration.js` com chave de serviço
2. **Monitorar Logs**: Verificar console para novos tipos de erro
3. **Expandir Testes**: Adicionar mais cenários ao script de teste
4. **Documentar Novos Endpoints**: Atualizar documentação conforme necessário

## Contato e Suporte

Para problemas relacionados ao tratamento de erros:
1. Verificar logs no console do navegador
2. Executar script de teste para diagnóstico
3. Consultar esta documentação para soluções conhecidas