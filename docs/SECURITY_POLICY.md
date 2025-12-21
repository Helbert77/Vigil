# 🔒 POLÍTICA DE SEGURANÇA - SUPABASE

## 📌 Resumo Executivo

Este documento estabelece as regras de segurança para interações do agente AI com o Supabase do projeto Vigil.

---

## ⛔ OPERAÇÕES PROIBIDAS (Sem Autorização)

### Banco de Dados
- ❌ Executar SQL de escrita (INSERT, UPDATE, DELETE)
- ❌ Criar/modificar/deletar tabelas, colunas, índices
- ❌ Criar/modificar/deletar triggers, functions, procedures
- ❌ Modificar constraints ou políticas RLS
- ❌ Aplicar migrações

### Edge Functions
- ❌ Deploy de novas functions
- ❌ Modificar functions existentes
- ❌ Deletar functions

### Gerenciamento
- ❌ Criar/pausar/deletar projetos
- ❌ Criar/deletar/merge branches
- ❌ Modificar configurações do projeto

---

## ✅ OPERAÇÕES PERMITIDAS (Sem Autorização)

### Leitura e Análise
- ✅ Listar projetos, tabelas, functions, branches
- ✅ Ver logs (edge-function, postgres, auth, storage, realtime)
- ✅ Ver advisors de segurança e performance
- ✅ Executar queries SELECT (somente leitura)
- ✅ Gerar tipos TypeScript
- ✅ Ver estrutura do banco (information_schema)

---

## 🔐 PROTOCOLO DE AUTORIZAÇÃO

Quando uma operação restrita for necessária, o agente DEVE:

1. **PARAR** antes de executar
2. **EXPLICAR** o que será feito e por quê
3. **MOSTRAR** o código completo
4. **AGUARDAR** autorização explícita
5. **CONFIRMAR** antes de executar

### Formato de Autorização

O usuário deve responder com uma das seguintes frases para autorizar:

- ✅ "SIM, AUTORIZO"
- ✅ "AUTORIZADO"
- ✅ "PODE EXECUTAR"
- ✅ "EXECUTE"
- ✅ "PROSSIGA"

Qualquer outra resposta será considerada como **NÃO AUTORIZADO**.

---

## 📊 Exemplo de Solicitação

```
🔒 AUTORIZAÇÃO NECESSÁRIA

Operação: Criar índice para melhorar performance
Ferramenta: mcp_supabase_execute_sql
Impacto: Melhora velocidade de queries em 80%
Riscos: Lock temporário de 2-5 segundos na tabela

Código a ser executado:
```sql
CREATE INDEX idx_notifications_recipient 
ON notifications (recipient_id, created_at DESC);
```

❓ Deseja autorizar esta operação?
```

---

## 🚨 Em Caso de Emergência

Se o agente executar algo sem autorização:

1. **PARE** imediatamente qualquer operação em andamento
2. **DOCUMENTE** o que foi executado
3. **AVALIE** o impacto
4. **REVERTA** se possível
5. **INFORME** o usuário com detalhes completos

---

## 📝 Notas Importantes

- Esta política se aplica **APENAS** ao Supabase
- Operações no código local (TypeScript, React, etc.) não requerem autorização
- Análises e investigações são sempre bem-vindas
- Em caso de dúvida, sempre pergunte

---

## 🎯 Regra de Ouro

> **"Ler é permitido. Escrever requer autorização."**

---

**Projeto:** Vigil (oprqgllsqtfdyjgvgovo)  
**Data:** 14 de Dezembro de 2025  
**Versão:** 1.0


