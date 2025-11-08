# 🎯 Documentação de Funcionalidades

Esta pasta contém documentação detalhada das principais funcionalidades implementadas no sistema Vigil.

## 📋 Índice de Funcionalidades

### [FUNCIONALIDADES_MODERACAO.md](FUNCIONALIDADES_MODERACAO.md)
**Funcionalidade**: Sistema de Moderação e Denúncias  
**Status**: ✅ Ativo  
**Descrição**: Sistema completo para moderação de conteúdo e gestão de denúncias.

**Componentes principais**:
- 🔴 **Botão "Apagar Post"** (dois tipos)
  - Para autor do post (todos os usuários veem seus próprios posts)
  - Para admins/moderadores (apenas em posts de outros usuários)
- 🚩 **Botão "Denunciar Post"** (todos os usuários)
  - Modal com seleção de motivo
  - Notas opcionais
  - Envio para fila de moderação

**API e Lógica**:
- `createReport` em `src/services/api.ts`
- Cálculo automático de `severity_score`:
  - Spam: 60
  - Assédio: 85
  - Discurso de ódio: 95
  - Violência: 90
  - Conteúdo sexual: 90
  - Desinformação: 70
  - Inapropriado: 65
- Inserção automática em `moderation_queue`

**Fluxo completo**:
```
Usuário → Denunciar → Modal → Selecionar motivo → Submeter
    ↓
API createReport
    ↓
INSERT em 'reports'
    ↓
Calcular severity_score
    ↓
Determinar violation_types
    ↓
INSERT em 'moderation_queue'
    ↓
Moderador visualiza na fila ordenada por severidade
```

**Estrutura de dados**:
- Tabela `reports`: armazena denúncias
- Tabela `moderation_queue`: fila de moderação com prioridade

**Permissões**:
| Ação | Autor | Usuário | Admin/Mod |
|------|-------|---------|-----------|
| Apagar próprio post | ✅ | ✅ | ✅ |
| Apagar post de outro | ❌ | ❌ | ✅ |
| Denunciar post | ✅ | ✅ | ✅ |

**Arquivos principais**:
- `components/post/PostActionsMenu.tsx` - UI dos botões
- `src/services/api.ts` - Lógica de criação de denúncia
- `components/post/ReportModal.tsx` - Modal de denúncia

---

### [KEEP_LOGGED_IN_FEATURE.md](KEEP_LOGGED_IN_FEATURE.md)
**Funcionalidade**: Mantenha-me Conectado  
**Status**: ✅ Ativo  
**Descrição**: Permite ao usuário escolher entre sessão persistente ou com timeout de inatividade.

**Comportamento**:

#### ✅ Checkbox MARCADO (padrão):
- Sessão permanece ativa indefinidamente
- `localStorage.setItem('keepLoggedIn', 'true')`
- `localStorage.setItem('sessionExpiry', 'never')`
- Sem monitoramento de inatividade
- Usuário permanece logado até logout manual

#### ⏱️ Checkbox DESMARCADO:
- Sessão expira após **30 minutos** de inatividade
- `localStorage.setItem('keepLoggedIn', 'false')`
- `localStorage.setItem('sessionExpiry', timestamp)`
- Monitoramento ativo de atividade do usuário
- Logout automático após timeout

**Eventos monitorados** (para reset do timer):
- `mousedown`
- `mousemove`
- `keypress`
- `scroll`
- `touchstart`
- `click`

**Implementação técnica**:

1. **Login.tsx**
   - Checkbox na interface de login
   - Configuração inicial das preferências
   - Armazenamento no localStorage

2. **SessionContext.tsx**
   - Sistema de monitoramento de inatividade
   - Verificação de expiração na inicialização
   - Timer de 30 minutos
   - Event listeners para atividade

3. **api.ts**
   - Função `logout` limpa configurações
   - Remove `keepLoggedIn` e `sessionExpiry`

**Configurações**:
```typescript
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos
const CHECK_INTERVAL = 1000; // Verifica a cada segundo
```

**Arquivos principais**:
- `pages/Login.tsx` - UI do checkbox
- `contexts/SessionContext.tsx` - Lógica de timeout
- `src/services/api.ts` - Cleanup no logout

---

## 🆕 Como Adicionar Nova Documentação de Funcionalidade

### Template:
```markdown
# Nome da Funcionalidade

**Status**: ✅ Ativo / 🚧 Em desenvolvimento / ⚠️ Deprecated

## Visão Geral
[Descrição breve e objetiva]

## Como Funciona
[Explicação detalhada do comportamento]

## Implementação Técnica

### Arquivos Principais
- `caminho/arquivo1.tsx` - Descrição
- `caminho/arquivo2.ts` - Descrição

### Lógica de Negócio
[Explicação da lógica]

### API e Dados
[Estrutura de dados, endpoints, etc]

## Uso

### Para Usuários:
[Como usar a funcionalidade]

### Para Desenvolvedores:
[Como integrar ou modificar]

## Exemplos de Código
```typescript
// exemplo prático
```

## Testes
[Como testar a funcionalidade]

## Limitações e Considerações
[Pontos de atenção]

## Histórico
- [Data] - Implementação inicial
- [Data] - Melhorias aplicadas
```

---

## 🔗 Links Relacionados

- [Relatórios de Correções](../reports/)
- [Documentação Arquivada](../archived/)
- [Documentação Principal](../README.md)
- [README do Projeto](../../README.md)

---

## 📝 Convenções

### Status das Funcionalidades:
- ✅ **Ativo**: Funcionalidade implementada e em uso
- 🚧 **Em desenvolvimento**: Sendo implementada
- ⚠️ **Deprecated**: Em processo de remoção
- 🔄 **Em refatoração**: Sendo melhorada
- 🐛 **Com bugs conhecidos**: Funciona mas tem problemas

### Prioridade da Documentação:
1. **Alta**: Funcionalidades core que todos devem conhecer
2. **Média**: Funcionalidades secundárias importantes
3. **Baixa**: Funcionalidades específicas ou raramente usadas

---

## 🎯 Funcionalidades Documentadas

| Funcionalidade | Status | Prioridade | Arquivo |
|----------------|--------|------------|---------|
| Sistema de Moderação | ✅ Ativo | Alta | [FUNCIONALIDADES_MODERACAO.md](FUNCIONALIDADES_MODERACAO.md) |
| Mantenha-me Conectado | ✅ Ativo | Média | [KEEP_LOGGED_IN_FEATURE.md](KEEP_LOGGED_IN_FEATURE.md) |

---

## 📊 Estatísticas

- **Total de funcionalidades documentadas**: 2
- **Funcionalidades ativas**: 2
- **Última atualização**: Data da reorganização da documentação

