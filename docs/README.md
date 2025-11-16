# 📚 Documentação do Projeto Vigil

Este diretório contém toda a documentação técnica, relatórios e guias do projeto.

## 📁 Estrutura

```
docs/
├── reports/              # Relatórios de correções e otimizações aplicadas
├── features/             # Documentação de funcionalidades do sistema
├── archived/             # Documentação técnica arquivada (histórico)
├── API_ERROR_HANDLING.md
├── AUTH_REFRESH_FIX.md
├── LIBRARY_ERROR_HANDLING.md
├── MIGRATION_GUIDE.md
└── REFACTORING_DOCUMENTATION.md
```

---

## 📊 Relatórios (reports/)

Relatórios de correções e otimizações que já foram aplicadas ao projeto.

### [CORRECOES_DENUNCIA_LOGS.md](reports/CORRECOES_DENUNCIA_LOGS.md)
- **Assunto**: Sistema de denúncias e redução de logs
- **Data**: Implementação recente
- **Conteúdo**:
  - Correção de erro 409 (Conflict) ao enviar denúncias
  - Tratamento de denúncias duplicadas
  - Redução de logs excessivos no console
  - Otimização do Logger (`LogLevel.INFO` em dev, `LogLevel.WARN` em produção)
- **Status**: ✅ Correções aplicadas e funcionando

### [CORRECOES_VERCEL.md](reports/CORRECOES_VERCEL.md)
- **Assunto**: Correções para deploy no Vercel
- **Data**: Implementação recente
- **Conteúdo**:
  - Problemas de build com plugin `@dyad-sh/react-vite-component-tagger`
  - Correção de imports inconsistentes
  - Configuração robusta do PWA (cache até 3MB)
  - Headers de segurança
  - Otimização de chunks
- **Status**: ✅ Deploy funcionando

### [RESUMO_OTIMIZACOES.md](reports/RESUMO_OTIMIZACOES.md)
- **Assunto**: Resumo visual das otimizações do Vercel
- **Data**: Complementar ao CORRECOES_VERCEL.md
- **Conteúdo**:
  - Tabela comparativa: Antes vs Depois
  - Estatísticas de build
  - Melhorias obtidas
  - Próximos passos
- **Status**: ✅ Implementado

### [REAL_TIME_FIXES.md](reports/REAL_TIME_FIXES.md)
- **Assunto**: Correções de funcionalidades em tempo real
- **Data**: Implementação recente
- **Conteúdo**:
  - Remoção de `SessionContext.tsx` duplicado
  - Limpeza de logs excessivos
  - Otimização de notificações e mensagens
- **Status**: ✅ Funcionando

---

## 🎯 Funcionalidades (features/)

Documentação das principais funcionalidades implementadas no sistema.

### [FUNCIONALIDADES_MODERACAO.md](features/FUNCIONALIDADES_MODERACAO.md)
- **Assunto**: Sistema de moderação e denúncias
- **Conteúdo**:
  - Botão "Apagar Post" (dois tipos: autor e admin/moderador)
  - Botão "Denunciar Post" (todos os usuários)
  - API `createReport` com cálculo de severity score
  - Fluxo completo de moderação
  - Estrutura das tabelas `reports` e `moderation_queue`
- **Status**: ✅ Funcionalidade ativa e documentada

### [KEEP_LOGGED_IN_FEATURE.md](features/KEEP_LOGGED_IN_FEATURE.md)
- **Assunto**: Funcionalidade "Mantenha-me conectado"
- **Conteúdo**:
  - Checkbox no login para sessão persistente
  - Timeout de 30 minutos quando desmarcado
  - Monitoramento de atividade do usuário
  - Implementação no SessionContext
- **Status**: ✅ Funcionalidade ativa

---

## 🗄️ Arquivado (archived/)

Documentação técnica especializada que não é prioritária no dia a dia, mas serve como referência histórica.

### [PATTERNS_DOCUMENTATION.md](archived/PATTERNS_DOCUMENTATION.md)
- **Assunto**: Padrões de projeto implementados
- **Conteúdo**:
  - Factory Pattern (`ComponentFactory.ts`)
  - Observer Pattern (`Observer.ts`)
  - Lazy Loading inteligente
  - Sistema de logging estruturado
- **Motivo do arquivamento**: Documentação técnica especializada

### [CROSS_BROWSER_COMPATIBILITY.md](archived/CROSS_BROWSER_COMPATIBILITY.md)
- **Assunto**: Compatibilidade entre navegadores
- **Conteúdo**:
  - Utilitário `browserCompatibility.ts`
  - Componente `CrossBrowserButton.tsx`
  - Tratamento de eventos específicos por navegador
  - Prefixos CSS para compatibilidade
- **Motivo do arquivamento**: Implementação muito específica

### [LIBRARY_FILTER_OPTIMIZATION.md](archived/LIBRARY_FILTER_OPTIMIZATION.md)
- **Assunto**: Otimização dos filtros da Library
- **Conteúdo**:
  - Remoção de botões fixos duplicados
  - Melhoria do componente dropbox
  - Otimização da lógica de filtro
- **Motivo do arquivamento**: Otimização pontual já aplicada

### [MOBILE_OPTIMIZATION_REPORT.md](archived/MOBILE_OPTIMIZATION_REPORT.md)
- **Assunto**: Otimizações para dispositivos móveis
- **Conteúdo**:
  - Grid flexível responsivo
  - Tipografia com `clamp()`
  - Otimizações touch-friendly
  - Imagens responsivas com srcSet
- **Motivo do arquivamento**: Relatório técnico específico

---

## 📖 Documentação Principal

Arquivos de documentação geral localizados na raiz de `docs/`:

### [API_ERROR_HANDLING.md](API_ERROR_HANDLING.md)
- Tratamento de erros na API
- Estratégias de retry
- Mensagens de erro padronizadas

### [AUTH_REFRESH_FIX.md](AUTH_REFRESH_FIX.md)
- Correção de erro "Invalid Refresh Token"
- Implementação de `supabaseAuthSafe.ts`
- Funções `getSessionSafe` e `withAuthGuard`

### [LIBRARY_ERROR_HANDLING.md](LIBRARY_ERROR_HANDLING.md)
- Tratamento de erros na página Library
- Error boundaries
- Fallbacks e recuperação de erro

### [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- Guia de migração entre versões
- Mudanças breaking changes
- Passos para atualização

### [REFACTORING_DOCUMENTATION.md](REFACTORING_DOCUMENTATION.md)
- Documentação de refatorações realizadas
- Melhorias de arquitetura
- Padrões adotados

---

## 🔍 Como Usar Esta Documentação

### Para Desenvolvedores Novos:
1. Comece lendo o [README.md principal](../README.md)
2. Leia [AI_RULES.md](AI_RULES.md) para entender convenções
3. Consulte `features/` para entender funcionalidades
4. Use `reports/` para ver correções recentes

### Para Debugging:
1. Consulte `API_ERROR_HANDLING.md` para erros de API
2. Consulte `AUTH_REFRESH_FIX.md` para problemas de autenticação
3. Consulte `LIBRARY_ERROR_HANDLING.md` para erros na Library

### Para Manutenção:
1. Atualize `features/` ao adicionar novas funcionalidades
2. Crie novos relatórios em `reports/` para correções importantes
3. Mova documentação obsoleta para `archived/` se necessário

---

## 📝 Convenções de Documentação

### Estrutura de um Relatório:
```markdown
# Título do Relatório

## Resumo
[Descrição breve]

## Problemas Identificados
[Lista de problemas]

## Soluções Implementadas
[Descrição das correções]

## Resultado
[Status final e verificações]
```

### Estrutura de Documentação de Feature:
```markdown
# Nome da Funcionalidade

## Visão Geral
[Descrição geral]

## Como Funciona
[Explicação detalhada]

## Implementação Técnica
[Detalhes técnicos]

## Uso
[Exemplos e guias]
```

---

## 🆕 Atualizações Recentes

- ✅ **Reorganização completa** da documentação em pastas estruturadas
- ✅ **Criação de reports/**, **features/** e **archived/**
- ✅ **Centralização** de toda documentação em `docs/`
- ✅ **README.md** criado para guiar navegação

---

## 📚 Arquivos na Raiz do Projeto

Um arquivo importante permanece na raiz:

- [../README.md](../README.md) - README principal do projeto

## 📋 Documentação Adicional

- [AI_RULES.md](AI_RULES.md) - Regras de desenvolvimento para IA
- [STRIPE_SETUP_GUIDE.txt](STRIPE_SETUP_GUIDE.txt) - Guia de configuração do Stripe
- [COMO_TESTAR_STRIPE.txt](COMO_TESTAR_STRIPE.txt) - Como testar integração Stripe
- [GUIA_WEBHOOK_STRIPE.txt](GUIA_WEBHOOK_STRIPE.txt) - Guia de webhooks do Stripe
- [TESTSprite_SETUP.md](TESTSprite_SETUP.md) - Configuração do TestSprite
- [GUIA_RESTRICAO_COMUNIDADES.md](GUIA_RESTRICAO_COMUNIDADES.md) - Guia de restrições de comunidades
- [DEBUG_SUPORTE.md](DEBUG_SUPORTE.md) - Debug de suporte
- [GUIA_IMPLEMENTACAO_SUPORTE.md](GUIA_IMPLEMENTACAO_SUPORTE.md) - Guia de implementação de suporte

---

## 🎯 Próximos Passos

1. Manter esta documentação atualizada
2. Adicionar novos relatórios conforme necessário
3. Documentar novas funcionalidades em `features/`
4. Revisar `archived/` periodicamente para manter relevância

