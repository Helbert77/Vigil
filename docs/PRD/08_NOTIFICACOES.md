# 08 - Sistema de Notificações

## 📋 Identificação

| Campo | Valor |
|-------|-------|
| **Nome** | Sistema de Notificações Vigil |
| **Versão** | 1.0.0 |
| **Data** | 12/12/2024 |
| **Responsável** | Equipe de Desenvolvimento Vigil |
| **Tipo** | PRD - Funcionalidade Principal |

---

## 🎯 Visão Geral

### Descrição
Sistema completo de notificações em tempo real que mantém usuários informados sobre atividades relevantes na plataforma, incluindo likes, comentários, seguidores, mensagens, aprovações administrativas e atividades de chat rooms.

### Objetivo e Propósito
- **Engajamento**: Manter usuários ativos e engajados
- **Tempo Real**: Notificações instantâneas via WebSocket
- **Personalização**: Controle granular de preferências
- **Relevância**: Filtros inteligentes para evitar spam
- **Multi-canal**: In-app, email e push (futuro)

---

## 🏗️ Arquitetura Técnica

### Tipos de Notificação
```typescript
interface Notification {
  id: string;
  actor: User;
  type: 'like' | 'comment' | 'follow' | 'comment_like' | 'mention' | 
        'message' | 'ad_approval_pending' | 'ad_approved' | 'ad_rejected' | 
        'chat_room_invitation' | 'room_access_request' | 'room_access_approved' | 
        'timeline_approved' | 'timeline_rejected';
  post_id?: string;
  is_read: boolean;
  created_at: string;
  metadata?: {
    ad_id?: string;
    room_id?: string;
    request_id?: string;
    [key: string]: any;
  };
}
```

### Funcionalidades Principais
- **Notificações em Tempo Real**: WebSocket para atualizações instantâneas
- **Contador de Não Lidas**: Badge no sidebar e header
- **Agrupamento Inteligente**: Múltiplos likes agrupados
- **Ações Rápidas**: Aprovar/rejeitar diretamente da notificação
- **Histórico Completo**: Todas as notificações são mantidas

---

## ⚙️ Funcionalidades Detalhadas

### 1. Tipos de Notificação

#### Interações Sociais
- **Like**: Alguém curtiu seu post
- **Comment**: Novo comentário em seu post
- **Comment Like**: Alguém curtiu seu comentário
- **Follow**: Novo seguidor
- **Mention**: Menção em post ou comentário

#### Mensagens e Chat
- **Message**: Nova mensagem privada
- **Chat Room Invitation**: Convite para sala de chat
- **Room Access Request**: Solicitação de acesso à sua sala
- **Room Access Approved/Rejected**: Status do seu pedido de acesso

#### Administrativas
- **Ad Approval Pending**: Anúncio enviado para aprovação
- **Ad Approved/Rejected**: Status da aprovação do anúncio
- **Timeline Approved/Rejected**: Status da sugestão de evento histórico

### 2. Configurações de Preferência
```typescript
interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  newFollowers: boolean;
  messages: boolean;
  mentions: boolean;
  adminActions: boolean;
  chatRooms: boolean;
}
```

### 3. Ações Contextuais
- **Navegação**: Clique leva ao conteúdo relacionado
- **Ações Rápidas**: Aprovar/rejeitar sem sair da página
- **Marcar como Lida**: Individual ou em lote
- **Limpar Todas**: Opção para limpar histórico

---

## 📏 Regras de Negócio

### Geração de Notificações
- **Próprias Ações**: Usuário não recebe notificação de suas próprias ações
- **Usuários Bloqueados**: Não geram notificações
- **Rate Limiting**: Máximo de notificações por tipo por período
- **Agrupamento**: Múltiplas ações similares são agrupadas

### Retenção e Limpeza
- **Histórico**: Notificações mantidas por 30 dias
- **Auto-limpeza**: Notificações antigas removidas automaticamente
- **Backup**: Notificações importantes são arquivadas

---

## 💡 Casos de Uso Práticos

### Cenário 1: Engajamento em post
1. **Usuário A** publica post
2. **Usuário B** curte o post
3. **Sistema** gera notificação de like
4. **Usuário A** recebe notificação em tempo real
5. **Contador** de não lidas é atualizado
6. **Usuário A** clica na notificação e vai para o post

### Cenário 2: Moderação administrativa
1. **Usuário** submete anúncio para aprovação
2. **Sistema** notifica administradores
3. **Admin** recebe notificação com ações rápidas
4. **Admin** aprova/rejeita diretamente da notificação
5. **Sistema** notifica usuário sobre decisão
6. **Usuário** é informado do status em tempo real

---

**Próximo Documento**: [09 - Perfil do Usuário](09_PERFIL.md)
