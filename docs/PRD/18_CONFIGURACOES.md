# 18 - Sistema de Configurações

## 📋 Identificação

| Campo | Valor |
|-------|-------|
| **Nome** | Sistema de Configurações Vigil |
| **Versão** | 1.0.0 |
| **Data** | 12/12/2024 |
| **Responsável** | Equipe de Desenvolvimento Vigil |
| **Tipo** | PRD - Funcionalidade Principal |

---

## 🎯 Visão Geral

### Descrição
Centro de controle completo onde usuários podem personalizar sua experiência na plataforma, gerenciar privacidade, configurar notificações, controlar bloqueios e ajustar preferências pessoais.

### Objetivo e Propósito
- **Personalização**: Controle total sobre a experiência do usuário
- **Privacidade**: Configurações granulares de privacidade
- **Segurança**: Gestão de senha, sessões e segurança
- **Notificações**: Controle fino sobre alertas e comunicações
- **Acessibilidade**: Opções para diferentes necessidades

---

## 🏗️ Arquitetura Técnica

### Estrutura de Configurações
```typescript
interface UserSettings {
  // Perfil
  profile: {
    name: string;
    username: string;
    bio: string;
    avatarUrl: string;
    bannerUrl: string;
  };
  
  // Privacidade
  privacy: {
    profileVisibility: 'public' | 'followers' | 'private';
    showActivityStatus: boolean;
    showFollowersList: boolean;
    allowDirectMessages: 'everyone' | 'followers' | 'none';
  };
  
  // Notificações
  notifications: {
    likes: boolean;
    comments: boolean;
    newFollowers: boolean;
    messages: boolean;
    mentions: boolean;
    adminActions: boolean;
    chatRooms: boolean;
    email: boolean;
    push: boolean;
  };
  
  // Conteúdo
  content: {
    showSensitiveContent: boolean;
    mutedWords: string[];
    blockedUsers: string[];
    profileViewMode: 'list' | 'grid';
  };
  
  // Aparência
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    fontSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
  };
}
```

### Componentes Principais
- **Settings.tsx** - Página principal de configurações
- **SettingsSection.tsx** - Seções individuais
- **PrivacySettings.tsx** - Configurações de privacidade
- **NotificationSettings.tsx** - Configurações de notificações

---

## ⚙️ Funcionalidades Detalhadas

### 1. Configurações de Perfil
- **Informações Básicas**: Nome, username, bio
- **Imagens**: Avatar e banner com crop tool
- **Validação**: Verificação de username único
- **Preview**: Visualização antes de salvar
- **Histórico**: Mudanças recentes no perfil

### 2. Privacidade e Segurança
- **Visibilidade do Perfil**: Público, seguidores, privado
- **Status de Atividade**: Mostrar/ocultar última atividade
- **Lista de Seguidores**: Pública ou privada
- **Mensagens Diretas**: Controle de quem pode enviar
- **Sessões Ativas**: Visualizar e encerrar sessões
- **Alteração de Senha**: Processo seguro com validação

### 3. Notificações
- **Granularidade**: Controle por tipo de notificação
- **Canais**: In-app, email, push (futuro)
- **Horários**: Não perturbe em horários específicos
- **Frequência**: Imediata, resumo diário, semanal
- **Filtros**: Apenas de seguidores, todos os usuários

### 4. Conteúdo e Filtragem
- **Conteúdo Sensível**: Mostrar/ocultar com aviso
- **Palavras Silenciadas**: Lista de termos bloqueados
- **Usuários Bloqueados**: Gestão de bloqueios
- **Modo de Visualização**: Lista ou grid para posts
- **Filtros de Feed**: Personalização do algoritmo

### 5. Aparência e Acessibilidade
- **Tema**: Claro, escuro, automático (sistema)
- **Idioma**: Seleção de idioma da interface
- **Tamanho da Fonte**: Pequena, média, grande
- **Movimento Reduzido**: Para usuários sensíveis
- **Alto Contraste**: Melhor visibilidade
- **Navegação por Teclado**: Otimizações de acessibilidade

---

## 📏 Regras de Negócio

### Validações
- **Username**: 3-30 caracteres, único, alfanumérico + underscore
- **Senha**: Mínimo 8 caracteres, complexidade obrigatória
- **Bio**: Máximo 160 caracteres
- **Palavras Silenciadas**: Máximo 100 termos
- **Bloqueios**: Máximo 1000 usuários bloqueados

### Restrições por Plano
- **Free**: Configurações básicas
- **Basic+**: Todas as configurações de privacidade
- **Pro+**: Filtros avançados de conteúdo
- **Premium**: Configurações de aparência avançadas

### Sincronização
- **Multi-device**: Configurações sincronizadas entre dispositivos
- **Backup**: Backup automático de configurações
- **Importação**: Importar configurações de backup
- **Reset**: Restaurar configurações padrão

---

## 💡 Casos de Uso Práticos

### Cenário 1: Usuário configura privacidade
1. **Usuário** acessa Configurações > Privacidade
2. **Sistema** exibe opções de privacidade
3. **Usuário** altera perfil para "apenas seguidores"
4. **Sistema** confirma mudança e explica impacto
5. **Configuração** é aplicada imediatamente
6. **Perfil** fica visível apenas para seguidores

### Cenário 2: Personalização de notificações
1. **Usuário** recebe muitas notificações
2. **Usuário** acessa Configurações > Notificações
3. **Sistema** mostra controles granulares
4. **Usuário** desabilita likes, mantém comentários
5. **Sistema** salva preferências
6. **Notificações** seguem nova configuração

### Cenário 3: Bloqueio de usuário problemático
1. **Usuário** sofre assédio de outro usuário
2. **Usuário** acessa perfil do agressor
3. **Usuário** clica "Bloquear Usuário"
4. **Sistema** confirma ação e explica consequências
5. **Bloqueio** é aplicado imediatamente
6. **Usuário bloqueado** não pode mais interagir

---

## 🚀 Roadmap e Melhorias Futuras

### Configurações Avançadas
- **Filtros de IA**: Configurações de algoritmo personalizado
- **Horários Personalizados**: Notificações por horário
- **Geolocalização**: Configurações baseadas em localização
- **Integração**: Conectar com outras plataformas
- **Automação**: Regras automáticas de filtragem

### Melhorias de UX
- **Wizard de Configuração**: Guia para novos usuários
- **Configurações Inteligentes**: Sugestões baseadas em uso
- **Backup na Nuvem**: Sincronização avançada
- **Configurações por Contexto**: Diferentes para casa/trabalho
- **Voice Control**: Configuração por comando de voz

### Acessibilidade Avançada
- **Leitores de Tela**: Otimizações específicas
- **Navegação Alternativa**: Para usuários com limitações motoras
- **Personalização Visual**: Cores, contrastes, fontes
- **Tradução Automática**: Tradução de conteúdo em tempo real
- **Simplificação**: Modo simplificado para iniciantes

---

**Próximo Documento**: [19 - Componentes Comuns](19_COMPONENTES_COMUNS.md)
