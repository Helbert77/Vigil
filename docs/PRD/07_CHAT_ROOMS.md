# 07 - Sistema de Chat Rooms

## 📋 Identificação

| Campo | Valor |
|-------|-------|
| **Nome** | Sistema de Chat Rooms Vigil |
| **Versão** | 2.0.0 |
| **Data** | 12/12/2024 |
| **Última Atualização** | 24/01/2026 |
| **Responsável** | Equipe de Desenvolvimento Vigil |
| **Tipo** | PRD - Funcionalidade Avançada |

---

## 🎯 Visão Geral

### Descrição
O sistema de Chat Rooms oferece salas de bate-papo em tempo real para usuários Premium, permitindo conversas em grupo sobre temas específicos. Inclui funcionalidades avançadas como radar de atividade, moderação de salas, controle de acesso e métricas de engajamento.

### Objetivo e Propósito
- **Comunicação em Grupo**: Conversas temáticas em tempo real
- **Exclusividade Premium**: Incentivo para upgrade de plano
- **Moderação Avançada**: Controle de qualidade das conversas
- **Engajamento**: Aumento do tempo de permanência na plataforma
- **Comunidade**: Fortalecimento de laços entre usuários

### Público-Alvo
- **Usuários Premium**: Acesso completo às funcionalidades
- **Moderadores**: Gestão de salas e comportamento
- **Administradores**: Supervisão geral do sistema

---

## 🏗️ Arquitetura Técnica

### Componentes Principais
- **ChatPage.tsx** - Página principal do chat (3200+ linhas)
- **RadarView.tsx** - Visualização de atividade das salas
- **chatService.ts** - Serviços de chat em tempo real
- **LocationPermissionModal.tsx** - Modal de permissão de localização
- **GeolocationPresenceContext.tsx** - Contexto de presença geográfica

### Serviços e APIs (chatService.ts)

**Gestão de Salas:**
- `fetchChatRooms()` - Buscar todas as salas disponíveis
- `createChatRoom()` - Criar nova sala
- `updateChatRoom()` - Atualizar configurações da sala
- `deleteChatRoom()` - Deletar sala
- `joinChatRoom()` - Entrar em uma sala
- `leaveChatRoom()` - Sair de uma sala
- `isUserInRoom()` - Verificar se usuário está na sala
- `getUserJoinedRooms()` - Buscar salas que o usuário participa

**Mensagens:**
- `fetchMessages()` - Buscar mensagens de chat 1:1
- `sendMessage()` - Enviar mensagem privada
- `fetchRoomMessages()` - Buscar mensagens de uma sala
- `sendRoomMessage()` - Enviar mensagem em sala
- `clearRoomMessages()` - Limpar histórico de mensagens

**Real-time:**
- `subscribeToMessages()` - Inscrever em mensagens privadas
- `subscribeToRoomMessages()` - Inscrever em mensagens da sala
- `subscribeToChatRooms()` - Inscrever em mudanças de salas
- `subscribeToRoomParticipants()` - Inscrever em participantes

**Métricas e Atividade:**
- `updateRoomActivity()` - Atualizar última atividade
- `updateRoomLastRead()` - Marcar mensagens como lidas
- `fetchRoomUnreadCounts()` - Buscar contagem de não lidas
- `fetchRoomsParticipantCounts()` - Contar participantes por sala
- `fetchRoomsMessageCountsLastHour()` - Mensagens na última hora (para badge 🔥)
- `fetchRoomParticipants()` - Listar participantes da sala

**Convites e Acesso:**
- `fetchUserInvitations()` - Buscar convites pendentes
- `requestRoomAccess()` - Solicitar acesso a sala privada

**Busca e Descoberta:**
- `searchUsers()` - Buscar usuários para chat
- `fetchNewUsers()` - Buscar novos usuários
- `fetchChatBuddies()` - Buscar contatos frequentes
- `fetchFollowersWithProfiles()` - Buscar seguidores

### Funcionalidades Principais
- **Salas Públicas e Privadas**: Diferentes níveis de acesso
- **Radar de Atividade**: Visualização em tempo real da atividade
- **Moderação**: Ferramentas de controle de comportamento
- **Convites**: Sistema de convites para salas privadas
- **Métricas**: Contadores de mensagens e participantes

### Estrutura de Dados
```typescript
interface ChatRoom {
  id: string;
  title: string;
  description?: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
  participant_count: number;
  message_count_last_hour: number;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
}
```

---

## ⚙️ Funcionalidades Detalhadas

### 1. Radar de Atividade

#### Visualização em Tempo Real
O Radar mostra todas as salas disponíveis com indicadores visuais de atividade:

**Indicadores Implementados:**

🌟 **Sala "Nova" (Badge Verde)**
```typescript
const isRoomNew = (createdAt: string): boolean => {
  if (!createdAt) return false;
  
  const createdDate = new Date(createdAt);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
  
  // Considera nova se foi criada há menos de 24 horas
  return hoursSinceCreation < 24;
};
```
- Ícone: Estrela verde (⭐)
- Critério: Sala criada há menos de 24 horas
- Propósito: Destacar salas recém-criadas para atrair participantes iniciais

🔥 **Sala "Hot/Quente" (Badge Vermelho)**
```typescript
const isRoomHot = (roomId: string, messageCountsMap: Map<string, number>): boolean => {
  if (!roomId || !messageCountsMap) return false;
  
  const messageCount = messageCountsMap.get(roomId) || 0;
  
  // Sala é hot se tem mais de 50 mensagens na última hora (já filtradas)
  return messageCount > 50;
};
```
- Ícone: Fogo (🔥)
- Critério: Mais de 50 mensagens na última hora
- Propósito: Indicar salas com alta atividade em tempo real
- **Importante**: Contagem exclui mensagens deletadas pelo usuário atual

#### Funcionalidades do Radar
- **Atualização em Tempo Real**: Indicadores atualizam automaticamente
- **Contadores Dinâmicos**: 
  - Número de participantes online
  - Mensagens na última hora
  - Total de mensagens não lidas
- **Filtragem**: Por tipo de sala (pública/privada) e nível de atividade
- **Navegação Rápida**: Clique para entrar diretamente na sala
- **Geolocalização**: Integração com sistema de presença geográfica (opcional)

### 2. Gestão de Salas
- **Criação**: Usuários Premium podem criar salas
- **Configuração**: Público/privado, descrição, regras
- **Moderação**: Ferramentas para criadores de sala
- **Exclusão**: Remoção de salas inativas ou problemáticas

### 3. Sistema de Convites
- **Salas Privadas**: Acesso apenas por convite
- **Solicitações**: Usuários podem solicitar acesso
- **Aprovação**: Moderadores aprovam/rejeitam solicitações
- **Notificações**: Alertas para convites e aprovações

### 4. Controle de Acesso
- **Apenas Premium**: Funcionalidade exclusiva
- **Verificação Contínua**: Validação de plano em tempo real
- **Degradação Graceful**: Acesso limitado para usuários que fazem downgrade

### 5. Sistema de Geolocalização (Radar)

#### Integração com GeolocationPresenceContext
```typescript
import { GeolocationPresenceProvider, useGeolocationPresence } from '@/src/contexts/GeolocationPresenceContext';
```

**Funcionalidades:**
- **Descoberta por Proximidade**: Encontrar usuários próximos geograficamente
- **Presença em Tempo Real**: Supabase Realtime Presence
- **Modal de Permissão**: `LocationPermissionModal` para solicitar acesso à localização
- **Privacidade**: Nenhum dado de localização armazenado no banco de dados
- **Opcional**: Usuário pode optar por não compartilhar localização

**Componentes:**
- `RadarView.tsx`: Visualização do radar de proximidade
- `LocationPermissionModal.tsx`: Modal de solicitação de permissão
- `useGeolocation.ts`: Hook para captura de GPS
- `GeolocationPresenceContext.tsx`: Contexto de presença em tempo real

**Fluxo:**
1. Usuário acessa Chat
2. Sistema solicita permissão de localização (se não concedida)
3. Usuário aceita ou recusa
4. Se aceito: localização compartilhada via Realtime Presence
5. Radar mostra usuários próximos em salas públicas
6. Usuário pode iniciar chat com pessoas próximas

---

## 📏 Regras de Negócio

### Acesso por Plano
- **Free/Basic/Pro**: Visualização apenas (modo somente leitura)
- **Premium**: Acesso completo (criar salas, participar, moderar)
- **Administradores**: Acesso total independente do plano

### Limites e Restrições
- **Máximo de salas por usuário**: 3 salas ativas
- **Participantes por sala**: Máximo 50 usuários
- **Rate limiting**: 10 mensagens por minuto por usuário
- **Moderação automática**: Detecção de spam e conteúdo inadequado

### Métricas de Atividade
- **Sala "Nova"**: Criada há menos de 24 horas
- **Sala "Quente"**: Mais de 50 mensagens na última hora
- **Sala Inativa**: Sem mensagens por 7 dias (candidata à remoção)

---

## 💡 Casos de Uso Práticos

### Cenário 1: Usuário Premium cria sala temática
1. **Usuário Premium** acessa página de Chat
2. **Sistema** exibe radar de atividade e opção "Criar Sala"
3. **Usuário** clica "Criar Sala" e preenche informações
4. **Sistema** cria sala e adiciona usuário como moderador
5. **Sala** aparece no radar com indicador "Nova"
6. **Outros usuários Premium** podem descobrir e entrar

### Cenário 2: Conversa em tempo real
1. **Usuários** entram em sala ativa
2. **Sistema** mostra histórico recente de mensagens
3. **Usuários** enviam mensagens em tempo real
4. **Sistema** atualiza contador de atividade
5. **Radar** reflete aumento de atividade da sala
6. **Sala** pode se tornar "Quente" se atingir threshold

---

## 🚀 Roadmap e Melhorias Futuras

### Próximas Funcionalidades
- **Mensagens de Voz**: Áudio em tempo real
- **Compartilhamento de Tela**: Para apresentações
- **Bots**: Integração com chatbots temáticos
- **Gamificação**: Pontos e badges por participação
- **Integração**: Conexão com comunidades

### Melhorias Técnicas
- **Escalabilidade**: Suporte a mais usuários simultâneos
- **Performance**: Otimização de real-time
- **Mobile**: App nativo para chat
- **Offline**: Sincronização quando reconectar

---

**Próximo Documento**: [11 - Biblioteca de Conteúdo](11_BIBLIOTECA.md)
