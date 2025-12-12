# 09 - Perfil do Usuário

## 📋 Identificação

| Campo | Valor |
|-------|-------|
| **Nome** | Sistema de Perfil do Usuário Vigil |
| **Versão** | 1.0.0 |
| **Data** | 12/12/2024 |
| **Responsável** | Equipe de Desenvolvimento Vigil |
| **Tipo** | PRD - Funcionalidade Principal |

---

## 🎯 Visão Geral

### Descrição
Sistema completo de perfis de usuário que permite personalização, visualização de atividades, gestão de seguidores e configurações pessoais. Inclui badges de verificação, estatísticas de engajamento e controles de privacidade.

### Objetivo e Propósito
- **Identidade Digital**: Representação única do usuário na plataforma
- **Personalização**: Avatar, banner, bio e preferências
- **Social**: Seguidores, seguindo, atividades públicas
- **Gamificação**: Badges, estatísticas, conquistas
- **Privacidade**: Controles granulares de visibilidade

---

## 🏗️ Arquitetura Técnica

### Estrutura do Perfil
```typescript
interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio?: string;
  joinDate: string;
  followingCount: number;
  followersCount: number;
  theme?: 'light' | 'dark';
  role?: 'user' | 'moderator' | 'admin';
  plan: 'free' | 'basic' | 'pro' | 'premium';
  
  // Configurações
  notifications?: NotificationSettings;
  mutedWords?: string[];
  showSensitiveContent?: boolean;
  showActivityStatus?: boolean;
  profileViewMode?: 'list' | 'grid';
}
```

### Componentes Principais
- **Profile.tsx** - Página principal do perfil
- **EditProfile.tsx** - Edição de informações
- **FollowListModal.tsx** - Lista de seguidores/seguindo
- **ProfileStats.tsx** - Estatísticas e métricas

---

## ⚙️ Funcionalidades Detalhadas

### 1. Visualização do Perfil
- **Header**: Avatar, banner, nome, username, bio
- **Badges**: Verificação (Pro/Premium), moderador/admin
- **Estatísticas**: Posts, seguidores, seguindo, data de entrada
- **Atividades**: Posts do usuário em ordem cronológica
- **Tabs**: Posts, Mídia, Curtidas (se público)

### 2. Edição de Perfil
- **Informações Básicas**: Nome, username, bio
- **Mídia**: Upload de avatar e banner
- **Configurações**: Tema, privacidade, notificações
- **Palavras Silenciadas**: Lista de termos bloqueados
- **Preferências**: Modo de visualização, conteúdo sensível

### 3. Sistema de Seguidores
- **Seguir/Deixar de Seguir**: Ação principal de conexão
- **Lista de Seguidores**: Modal com todos os seguidores
- **Lista de Seguindo**: Modal com usuários seguidos
- **Sugestões**: Algoritmo de sugestão de usuários
- **Notificações**: Alertas de novos seguidores

### 4. Badges e Verificação
- **Badge Verificado**: Pro (roxo), Premium (dourado)
- **Badge Moderador**: Ícone especial para moderadores
- **Badge Admin**: Ícone especial para administradores
- **Conquistas**: Sistema de badges por atividade (futuro)

---

## 📏 Regras de Negócio

### Privacidade e Visibilidade
- **Perfil Público**: Visível para todos os usuários
- **Atividades**: Posts públicos visíveis no perfil
- **Seguidores**: Lista pode ser privada (configurável)
- **Status de Atividade**: Pode ser ocultado

### Validação de Dados
- **Username**: 3-30 caracteres, único, alfanumérico + underscore
- **Nome**: 1-50 caracteres, pode conter espaços
- **Bio**: Máximo 160 caracteres
- **Avatar**: Máximo 5MB, formatos JPG/PNG/GIF
- **Banner**: Máximo 10MB, proporção 3:1

### Badges e Planos
- **Badge Verificado**: Automático para Pro/Premium
- **Badge Moderador**: Atribuído por administradores
- **Cores**: Pro (roxo), Premium (dourado)
- **Visibilidade**: Badges aparecem em posts e perfil

---

## 💡 Casos de Uso Práticos

### Cenário 1: Novo usuário configura perfil
1. **Usuário** completa registro
2. **Sistema** cria perfil básico com dados do registro
3. **Usuário** acessa "Editar Perfil"
4. **Sistema** abre formulário de edição
5. **Usuário** adiciona bio, avatar e banner
6. **Sistema** salva alterações e atualiza perfil
7. **Perfil** fica visível para outros usuários

### Cenário 2: Usuário explora perfil de outro
1. **Usuário** clica no nome de outro usuário
2. **Sistema** abre perfil completo
3. **Usuário** vê posts, estatísticas e badges
4. **Usuário** decide seguir
5. **Sistema** atualiza contadores de seguidores
6. **Usuário seguido** recebe notificação

### Cenário 3: Upgrade para Premium
1. **Usuário** faz upgrade para Premium
2. **Sistema** atualiza plano no perfil
3. **Badge dourado** aparece automaticamente
4. **Perfil** mostra status Premium
5. **Outros usuários** veem badge em posts
6. **Funcionalidades Premium** são desbloqueadas

---

## 🚀 Roadmap e Melhorias Futuras

### Próximas Funcionalidades
- **Perfil Personalizado**: Temas e layouts customizáveis
- **Conquistas**: Sistema de badges por atividade
- **Portfolio**: Seção para trabalhos e projetos
- **Links**: Links externos no perfil
- **Verificação Manual**: Processo de verificação para figuras públicas

### Melhorias de UX
- **Preview**: Visualização antes de salvar alterações
- **Crop Tool**: Editor de imagem integrado
- **Sugestões**: IA para melhorar bio e perfil
- **Analytics**: Métricas de visualização do perfil
- **Backup**: Exportação de dados do perfil

---

**Próximo Documento**: [10 - Busca Avançada](10_BUSCA.md)
