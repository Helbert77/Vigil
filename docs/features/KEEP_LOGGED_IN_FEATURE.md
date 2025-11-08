# Funcionalidade "Mantenha-me conectado"

## Visão Geral

A funcionalidade "Mantenha-me conectado" foi implementada para permitir que os usuários escolham entre duas opções de duração de sessão:

1. **Manter conectado (checkbox marcado)**: Sessão persistente sem timeout de inatividade
2. **Não manter conectado (checkbox desmarcado)**: Sessão com timeout de inatividade de 30 minutos

## Como Funciona

### Quando o checkbox está MARCADO:
- A sessão permanece ativa indefinidamente
- `localStorage.setItem('keepLoggedIn', 'true')`
- `localStorage.setItem('sessionExpiry', 'never')`
- Não há monitoramento de inatividade

### Quando o checkbox está DESMARCADO:
- A sessão expira após 30 minutos de inatividade
- `localStorage.setItem('keepLoggedIn', 'false')`
- `localStorage.setItem('sessionExpiry', timestamp)`
- Sistema de monitoramento de atividade ativo

## Implementação Técnica

### Arquivos Modificados:

1. **`pages/Login.tsx`**
   - Função `handleLogin` modificada para configurar preferências de sessão
   - Armazenamento das configurações no localStorage

2. **`contexts/SessionContext.tsx`**
   - Sistema de monitoramento de inatividade
   - Verificação de expiração na inicialização
   - Eventos de atividade monitorados: mousedown, mousemove, keypress, scroll, touchstart, click

3. **`src/services/api.ts`**
   - Função `logout` modificada para limpar configurações de sessão
   - Remoção de `keepLoggedIn` e `sessionExpiry` do localStorage

4. **`components/common/SessionStatus.tsx`** (novo)
   - Componente de demonstração para mostrar status da sessão
   - Contador em tempo real do tempo restante

### Configurações de Timeout:

- **Timeout de inatividade**: 30 minutos (1.800.000 ms)
- **Verificação**: A cada segundo quando aplicável
- **Reset automático**: A cada atividade do usuário

## Eventos Monitorados para Atividade:

- `mousedown` - Clique do mouse
- `mousemove` - Movimento do mouse
- `keypress` - Tecla pressionada
- `scroll` - Rolagem da página
- `touchstart` - Toque na tela (mobile)
- `click` - Clique em elementos

## Comportamento em Diferentes Cenários:

### Cenário 1: Login com "Manter conectado" marcado
1. Usuário faz login com checkbox marcado
2. Sessão permanece ativa indefinidamente
3. Não há timeout de inatividade
4. Sessão só termina com logout manual

### Cenário 2: Login sem "Manter conectado"
1. Usuário faz login com checkbox desmarcado
2. Timer de 30 minutos é iniciado
3. A cada atividade, o timer é resetado
4. Após 30 minutos sem atividade, logout automático

### Cenário 3: Recarregamento da página
1. Sistema verifica configurações no localStorage
2. Se sessão expirou, faz logout automático
3. Se ainda válida, continua sessão normalmente

### Cenário 4: Logout manual
1. Configurações são limpas do localStorage
2. Timers são cancelados
3. Sessão é encerrada no Supabase

## Indicador Visual

O componente `SessionStatus` mostra:
- Status do "Manter conectado" (Sim/Não)
- Tempo restante até expiração
- Atualização em tempo real

## Configuração Recomendada

A implementação segue as melhores práticas:

✅ **Segurança**: Timeout de inatividade para sessões não persistentes
✅ **UX**: Escolha clara para o usuário
✅ **Performance**: Monitoramento eficiente de atividade
✅ **Compatibilidade**: Funciona em todos os navegadores modernos
✅ **Acessibilidade**: Indicadores visuais claros

## Testes Recomendados

1. **Teste com checkbox marcado**: Verificar se sessão persiste
2. **Teste com checkbox desmarcado**: Verificar timeout de 30 minutos
3. **Teste de atividade**: Verificar se atividade reseta o timer
4. **Teste de recarregamento**: Verificar persistência das configurações
5. **Teste de logout**: Verificar limpeza das configurações