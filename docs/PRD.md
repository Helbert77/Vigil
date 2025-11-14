# Product Requirements Document (PRD)
## Vigil - Rede Social de Teorias da Conspiração

**Versão:** 1.0  
**Data:** 2024  
**Status:** Em Desenvolvimento

---

## 1. Visão Geral do Produto

### 1.1 Propósito
O Vigil é uma rede social temática focada em teorias da conspiração, onde usuários podem compartilhar, discutir e analisar teorias de forma estruturada. A plataforma oferece um ambiente profissional com interface moderna, suportando modos claro e escuro, e funcionalidades avançadas de interação social.

### 1.2 Objetivos de Negócio
- Criar uma comunidade engajada de usuários interessados em teorias da conspiração
- Oferecer uma plataforma segura e moderada para discussões
- Gerar receita através de planos de assinatura (Basic, Pro, Premium)
- Estabelecer um ecossistema de comunidades temáticas

### 1.3 Público-Alvo
- **Primário**: Usuários interessados em teorias da conspiração, pesquisadores independentes, curiosos sobre eventos históricos alternativos
- **Secundário**: Criadores de conteúdo, comunidades temáticas, pesquisadores acadêmicos

---

## 2. Funcionalidades Principais

### 2.1 Autenticação e Perfis de Usuário

#### 2.1.1 Autenticação
- **Login/Registro**: Sistema de autenticação via Supabase Auth
- **Mantenha-me Conectado**: 
  - Checkbox marcado (padrão): Sessão persistente indefinida
  - Checkbox desmarcado: Sessão expira após 30 minutos de inatividade
  - Monitoramento de atividade: mousedown, mousemove, keypress, scroll, touchstart, click
- **Recuperação de Senha**: Fluxo completo de recuperação via email
- **Atualização de Senha**: Interface dedicada para alteração de senha
- **Tela de Splash**: Exibida por 5 segundos no primeiro acesso após login
- **Segurança**: JWT tokens com refresh automático

#### 2.1.2 Perfis de Usuário
- **Informações Básicas**:
  - Nome, username, avatar, banner
  - Biografia personalizada
  - Data de entrada na plataforma
- **Estatísticas**:
  - Contagem de seguidores e seguindo
  - Número de posts e comentários
- **Configurações de Privacidade**:
  - Modo de visualização de perfil (lista/grid)
  - Status de atividade online
  - Conteúdo sensível (mostrar/ocultar)
- **Personalização**:
  - Tema claro/escuro
  - Palavras silenciadas (muted words)
  - Preferências de notificações

### 2.2 Sistema de Posts

#### 2.2.1 Criação de Posts
- **Conteúdo Multimídia**:
  - Texto (com suporte a menções @username)
  - Imagens (com opção de marcar como sensível)
  - Vídeos (com opção de marcar como sensível)
  - Áudios
- **Limites de Caracteres por Plano**:
  - Free: 280 caracteres
  - Basic: 1.000 caracteres
  - Pro: 5.000 caracteres
  - Premium: 25.000 caracteres
- **Funcionalidades Avançadas**:
  - Tags para categorização
  - Enquetes (polls) com duração configurável (dias, horas, minutos)
  - Quadro de evidências (evidence board) com 4 tipos:
    - Texto: Notas e descrições
    - Imagem: Evidências visuais
    - Vídeo: Evidências em vídeo
    - Link: Referências externas
  - Emojis rápidos: 👍, 🔥, 🤔, 😂, 💡, 🤯, 👽, 🛸, 👁️, 📜, 📡, 💥
- **Associação com Comunidades**: 
  - Posts podem ser vinculados a comunidades específicas
  - Opção de postar apenas na comunidade ou também no feed global
- **Conteúdo Sensível**: Marcação de mídia sensível com overlay de aviso
- **Moderação Automática**: Verificação de conteúdo antes da publicação

#### 2.2.2 Interações com Posts
- **Curtidas**: Sistema de likes com contador
- **Comentários**: 
  - Threads de comentários aninhados
  - Curtidas em comentários
  - Edição e exclusão de comentários próprios
  - Menções em comentários
- **Salvamento**: Posts podem ser salvos para leitura posterior (página Saved)
- **Compartilhamento**: Compartilhamento via mensagem direta para usuários seguidos
- **Visualizações**: Contador de visualizações com incremento automático
- **Enquetes**: Votação em enquetes com visualização de resultados em tempo real

#### 2.2.3 Moderação de Posts
- **Edição de Posts**: 
  - Disponível apenas para planos Basic, Pro e Premium
  - Autor pode editar texto do post após publicação
  - Não permite edição de mídia ou enquetes
- **Denúncias**: Usuários podem denunciar posts por:
  - Spam (severidade: 60)
  - Assédio (severidade: 85)
  - Discurso de ódio (severidade: 95)
  - Violência (severidade: 90)
  - Conteúdo sexual (severidade: 90)
  - Desinformação (severidade: 70)
  - Conteúdo inapropriado (severidade: 65)
- **Ações de Moderação**:
  - **Apagar Meu Post**: Botão visível apenas para o autor
  - **Apagar Post**: Botão visível para admins/moderadores em posts de outros usuários
  - **Bloquear Usuário**: Oculta todo conteúdo do usuário bloqueado
  - Sistema de severidade automática (severity score)
  - Fila de moderação priorizada por severidade
- **Moderação Preventiva**: 
  - Verificação automática de conteúdo antes da publicação
  - Posts retidos para revisão se violarem diretrizes
  - Filtro de palavras silenciadas (muted words)

### 2.3 Sistema de Comunidades

#### 2.3.1 Criação e Gestão
- **Criação de Comunidades**: Usuários podem criar comunidades temáticas
- **Planos de Comunidade**: Comunidades podem ter restrições de plano:
  - `all`: Acesso livre
  - `basic+`: Requer plano Basic ou superior
  - `pro+`: Requer plano Pro ou superior
  - `premium`: Requer plano Premium
- **Edição**: Proprietários podem editar planos de acesso

#### 2.3.2 Participação
- **Entrada/Saída**: Usuários podem entrar e sair de comunidades
- **Membros Ativos**: Visualização de membros ativos em tempo real
- **Feed da Comunidade**: Posts específicos da comunidade

### 2.4 Sistema de Mensagens

#### 2.4.1 Mensagens Diretas
- **Conversas**: Sistema de mensagens diretas entre usuários
- **Lista de Conversas**: Visualização de todas as conversas
- **Janela de Chat**: Interface de chat em tempo real
- **Notificações**: Contador de mensagens não lidas

#### 2.4.2 Funcionalidades
- **Envio de Mensagens**: Texto e mídia
- **Marcação como Lida**: Sistema de leitura
- **Exclusão**: Usuários podem deletar conversas

### 2.5 Sistema de Notificações

#### 2.5.1 Tipos de Notificações
- Curtidas em posts
- Comentários em posts
- Novos seguidores
- Mensagens recebidas
- Menções em posts/comentários

#### 2.5.2 Gerenciamento
- **Preferências**: Usuários podem configurar quais notificações receber
- **Marcação como Lida**: Sistema de leitura
- **Limpeza**: Opção de limpar todas as notificações
- **Contador**: Indicador de notificações não lidas

### 2.6 Sistema de Busca

#### 2.6.1 Funcionalidades de Busca
- **Busca Global**: Pesquisa em posts, usuários, comunidades e tags
- **Busca Avançada**: Filtros por tipo de conteúdo
- **Busca por Tags**: Navegação por tópicos populares
- **Tópicos em Alta**: Visualização de trending topics

### 2.7 Biblioteca (Library)

#### 2.7.1 Funcionalidades
- **Armazenamento de Arquivos**: Upload e gerenciamento de documentos
- **Visualização**: Suporte para múltiplos formatos:
  - PDF (com visualizador integrado)
  - DOCX (com pré-visualização)
  - Imagens (JPG, PNG, GIF, WebP)
  - Outros formatos de documento
- **Estatísticas**: Contadores de visualizações e downloads
- **Restrição de Acesso**: Disponível apenas para planos Pro e Premium
- **Redirecionamento**: Usuários Free e Basic são redirecionados para página Premium ao tentar acessar

#### 2.7.2 Gerenciamento
- **Adicionar Itens**: Upload de novos arquivos
- **Editar Metadados**: Informações sobre os arquivos
- **Excluir Itens**: Remoção de arquivos

### 2.8 Sistema de Moderação Administrativa

#### 2.8.1 Fila de Moderação
- **Denúncias Pendentes**: Visualização de denúncias ordenadas por severidade
- **Ações Disponíveis**:
  - Aprovar conteúdo
  - Remover conteúdo
  - Banir usuário
  - Ignorar denúncia

#### 2.8.2 Sistema de Recursos (Appeals)
- **Recursos de Usuários**: Usuários podem recorrer de ações de moderação
- **Revisão**: Administradores revisam recursos
- **Decisões**: Aprovação ou rejeição de recursos

#### 2.8.3 Dashboard Administrativo
- **Métricas**: Estatísticas da plataforma
- **Gerenciamento de Usuários**: Ações administrativas
- **Relatórios**: Visualização de dados agregados

### 2.9 Sistema de Suporte

#### 2.9.1 Funcionalidades
- **Botão de Suporte Flutuante**: 
  - Visível para usuários Basic, Pro e Premium
  - Botão fixo no canto inferior direito
- **Modal de Suporte**: Interface para envio de solicitações
- **Integração com Email**: Envio automático de emails de suporte
- **Suporte por E-mail**: Disponível para todos os planos
- **Suporte via Chat**: Exclusivo para plano Premium (tempo real)

### 2.10 Timeline

#### 2.10.1 Funcionalidades
- **Eventos Cronológicos**: Visualização de eventos em linha do tempo
- **Adição de Eventos**: Usuários podem adicionar eventos históricos
- **Navegação Temporal**: Navegação por períodos históricos

---

## 3. Planos de Assinatura

### 3.1 Plano Free (Gratuito)
- Acesso básico à plataforma
- Criação de posts e comentários
- Participação em comunidades públicas
- Mensagens diretas
- Busca básica
- Suporte por e-mail
- **Limitações**:
  - **Limite de caracteres por post**: 280 caracteres
  - **Sem edição de posts**: Não pode editar posts após publicação
  - **Sem acesso à Biblioteca**: Não pode acessar documentos e arquivos
  - **Sem acesso a comunidades restritas**: Apenas comunidades públicas
  - **Sem selo verificado**: Perfil sem badge de verificação
  - **Anúncios**: Visualização de anúncios na plataforma
  - **Sem suporte via chat**: Apenas suporte por e-mail

### 3.2 Plano Basic
- Todas as funcionalidades do Free
- **Limite de caracteres por post**: 1.000 caracteres
- **Edição de posts**: Pode editar posts após publicação
- **Acesso a comunidades Basic+**: Acesso a comunidades que exigem plano Basic ou superior
- Suporte por e-mail
- Suporte via botão flutuante
- **Anúncios**: Ainda visualiza anúncios
- **Preço**: Definido na página Premium
- **Teste grátis**: Disponível período de teste

### 3.3 Plano Pro
- Todas as funcionalidades do Basic
- **Limite de caracteres por post**: 5.000 caracteres
- **Acesso à Biblioteca**: Acesso completo a documentos e arquivos
- **Acesso a comunidades Pro+**: Acesso a comunidades que exigem plano Pro ou superior
- **Selo verificado**: Badge de verificação no perfil
- Suporte por e-mail
- Suporte via botão flutuante
- **Anúncios**: Ainda visualiza anúncios
- **Preço**: Definido na página Premium
- **Teste grátis**: Disponível período de teste

### 3.4 Plano Premium
- Todas as funcionalidades do Pro
- **Limite de caracteres por post**: 25.000 caracteres
- **Acesso completo a todas as comunidades**: Sem restrições
- **Criar comunidades**: Pode criar comunidades exclusivas para Premium
- **Sem anúncios**: Experiência sem publicidade
- **Suporte via chat**: Suporte prioritário via chat em tempo real
- **Acesso antecipado**: Acesso a funcionalidades beta e novos recursos
- **Selo verificado**: Badge de verificação premium no perfil
- **Preço**: Definido na página Premium
- **Teste grátis**: Disponível período de teste

### 3.5 Sistema de Pagamento
- **Integração**: Stripe para processamento de pagamentos
- **Ciclos de Cobrança**: 
  - Mensal: Pagamento recorrente mensal
  - Anual: Pagamento anual com desconto e meses grátis adicionais
- **Gerenciamento**: 
  - Cancelamento de assinatura via interface
  - Atualização de planos (upgrade/downgrade)
  - Histórico de pagamentos
- **Promoções**: 
  - Sistema de descontos promocionais (preço de lançamento)
  - Meses grátis em planos anuais
  - Período de teste grátis para novos usuários
- **Checkout**: Redirecionamento seguro para Stripe Checkout
- **Webhooks**: Sincronização automática de status de assinatura

---

## 4. Requisitos Técnicos

### 4.1 Stack Tecnológico

#### 4.1.1 Frontend
- **Framework**: React 18.2.0 com TypeScript
- **Build Tool**: Vite 6.2.0
- **Estilização**: Tailwind CSS (utility-first)
- **Roteamento**: Sistema customizado baseado em componentes
- **Estado**: React Hooks (useState, useEffect) e Context API
- **Animações**: Framer Motion 12.23.24

#### 4.1.2 Backend e Infraestrutura
- **Backend**: Supabase (PostgreSQL + Real-time + Auth + Storage)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL via Supabase
- **Armazenamento**: Supabase Storage para arquivos e mídia
- **Real-time**: Supabase Real-time subscriptions

#### 4.1.3 Integrações
- **Pagamentos**: Stripe
- **Analytics**: Vercel Speed Insights
- **Deploy**: Vercel

#### 4.1.4 Mobile
- **Framework**: Capacitor 7.4.3
- **Plataformas**: Android e iOS
- **Build**: Gradle (Android) e Xcode (iOS)
- **Funcionalidades Mobile**:
  - Navegação inferior (bottom navigation)
  - Touch-friendly: Elementos otimizados para toque
  - Orientação: Suporte a retrato e paisagem
  - Performance: Otimizações específicas para conexões 3G
  - Responsividade: Breakpoints mobile (< 768px), tablet (768px-1024px), desktop (> 1024px)

### 4.2 Arquitetura

#### 4.2.1 Estrutura de Pastas
```
vigil/
├── components/          # Componentes React reutilizáveis
├── pages/              # Páginas principais da aplicação
├── contexts/           # Contextos React (Session, Theme, Toast, Users)
├── hooks/              # Custom hooks
├── services/           # Serviços de API
├── utils/              # Utilitários e helpers
├── types.ts            # Definições TypeScript
├── constants.ts        # Constantes da aplicação
└── docs/               # Documentação
```

#### 4.2.2 Padrões de Código
- **Componentes**: Funcionais com TypeScript
- **Estilização**: Apenas Tailwind CSS (sem arquivos CSS separados)
- **Estado Global**: Context API para estado compartilhado
- **API**: Serviços centralizados em `src/services/api.ts`
- **Tipos**: TypeScript strict mode

### 4.3 Requisitos de Performance

#### 4.3.1 Carregamento
- **Lazy Loading**: Componentes carregados sob demanda
- **Code Splitting**: Divisão de código por rotas
- **Otimização de Imagens**: Lazy loading e otimização

#### 4.3.2 Real-time
- **Subscriptions**: Supabase Real-time para atualizações instantâneas
- **Otimização**: Filtros e debounce para reduzir carga

### 4.4 Segurança

#### 4.4.1 Autenticação
- **JWT Tokens**: Gerenciamento via Supabase Auth
- **Refresh Tokens**: Renovação automática
- **Row Level Security (RLS)**: Políticas de segurança no banco

#### 4.4.2 Dados
- **Validação**: Validação de entrada em todos os formulários
- **Sanitização**: Limpeza de dados do usuário
- **CORS**: Configuração adequada de CORS

---

## 5. Requisitos de UX/UI

### 5.1 Design System

#### 5.1.1 Temas
- **Modo Claro**: Paleta de cores claras
- **Modo Escuro**: Paleta de cores escuras
- **Transição**: Transições suaves entre temas

#### 5.1.2 Componentes
- **Cards**: Componentes de card reutilizáveis
- **Modais**: Sistema de modais consistente
- **Toasts**: Notificações toast para feedback
- **Avatares**: Componentes de avatar padronizados

### 5.2 Responsividade

#### 5.2.1 Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

#### 5.2.2 Adaptações Mobile
- **Sidebar**: Menu lateral colapsável em mobile
- **Bottom Navigation**: Navegação inferior em mobile
- **Touch-friendly**: Elementos otimizados para toque

### 5.3 Acessibilidade

#### 5.3.1 Requisitos
- **ARIA Labels**: Labels apropriados para screen readers
- **Navegação por Teclado**: Suporte completo
- **Contraste**: Contraste adequado de cores
- **Página de Acessibilidade**: Documentação dedicada

---

## 6. Requisitos Funcionais Detalhados

### 6.1 Fluxos Principais

#### 6.1.1 Registro e Login
1. Usuário acessa a plataforma
2. Tela de login/registro
3. Opção "Mantenha-me conectado" (checkbox)
4. Autenticação via Supabase Auth
5. Visualiza splash screen (5 segundos) - apenas no primeiro acesso
6. Redirecionamento para Home
7. Configuração de sessão baseada na opção escolhida

#### 6.1.2 Criação de Post
1. Usuário clica em "Criar Post" ou área de texto
2. Preenche conteúdo (texto com limite baseado no plano)
3. Opcionalmente adiciona:
   - Mídia (imagem, vídeo ou áudio)
   - Marcação de conteúdo sensível
   - Enquete com opções e duração
   - Quadro de evidências (texto, imagem, vídeo, link)
   - Emojis rápidos
   - Menções (@username)
4. Seleciona comunidade (opcional)
5. Sistema verifica:
   - Limite de caracteres do plano
   - Palavras silenciadas
   - Moderação automática de conteúdo
6. Publica post
7. Post aparece no feed em tempo real
8. Notificações enviadas para usuários mencionados

#### 6.1.3 Denúncia de Conteúdo
1. Usuário clica em "Denunciar"
2. Modal abre com opções de motivo
3. Usuário seleciona motivo e adiciona notas (opcional)
4. Sistema calcula severity score automaticamente
5. Denúncia é adicionada à fila de moderação
6. Moderador revisa e toma ação

#### 6.1.4 Upgrade de Plano
1. Usuário acessa página Premium
2. Visualiza planos disponíveis
3. Seleciona plano e ciclo (mensal/anual)
4. Redirecionado para Stripe Checkout
5. Após pagamento, plano é atualizado
6. Acesso a funcionalidades premium é liberado

### 6.2 Regras de Negócio

#### 6.2.1 Acesso a Comunidades
- Comunidades públicas: Todos os usuários
- Comunidades Basic+: Requer plano Basic ou superior
- Comunidades Pro+: Requer plano Pro ou superior
- Comunidades Premium: Requer plano Premium

#### 6.2.2 Acesso à Biblioteca
- Disponível apenas para planos Pro e Premium
- Usuários Free e Basic são redirecionados para página Premium
- Verificação de segurança em múltiplos pontos (UI e backend)

#### 6.2.3 Sistema de Severidade
- Spam: 60
- Assédio: 85
- Discurso de ódio: 95
- Violência: 90
- Conteúdo sexual: 90
- Desinformação: 70
- Inapropriado: 65

#### 6.2.4 Filtros de Conteúdo
- Usuários bloqueados: Todo conteúdo oculto (posts, comentários, notificações)
- Palavras silenciadas: Posts/comentários filtrados automaticamente
- Restrições de comunidade: Posts filtrados por plano do usuário
- Conteúdo sensível: Oculto por padrão com opção de visualizar (configurável)
- Filtro de menções: Apenas usuários seguidos podem mencionar

---

## 7. Requisitos Não-Funcionais

### 7.1 Performance
- **Tempo de Carregamento**: < 3 segundos para primeira renderização
- **Tempo de Resposta**: < 500ms para ações do usuário
- **Otimização**: Code splitting e lazy loading

### 7.2 Escalabilidade
- **Banco de Dados**: Suportar milhões de posts e usuários
- **Armazenamento**: Escalável via Supabase Storage
- **CDN**: Distribuição de conteúdo estático

### 7.3 Confiabilidade
- **Uptime**: 99.9% de disponibilidade
- **Backup**: Backups automáticos do banco de dados
- **Recuperação**: Sistema de recuperação de erros

### 7.4 Manutenibilidade
- **Código Limpo**: Padrões consistentes
- **Documentação**: Documentação técnica completa
- **Testes**: Cobertura de testes adequada

---

## 8. Métricas e KPIs

### 8.1 Métricas de Engajamento
- Posts criados por dia
- Comentários por post
- Taxa de curtidas
- Tempo médio na plataforma

### 8.2 Métricas de Negócio
- Taxa de conversão para planos pagos
- Churn rate
- Receita recorrente mensal (MRR)
- Lifetime value (LTV)

### 8.3 Métricas Técnicas
- Tempo de resposta da API
- Taxa de erro
- Uptime
- Performance de carregamento

---

## 9. Roadmap e Prioridades

### 9.1 Fase 1 (Concluída) ✅
- ✅ Sistema de autenticação com sessão persistente
- ✅ Criação e visualização de posts com múltiplos formatos
- ✅ Sistema de comunidades com restrições por plano
- ✅ Mensagens diretas em tempo real
- ✅ Sistema de moderação com denúncias e severidade
- ✅ Planos de assinatura com Stripe
- ✅ Quadro de evidências em posts
- ✅ Enquetes com votação em tempo real
- ✅ Edição de posts (planos pagos)
- ✅ Biblioteca de documentos
- ✅ Timeline de eventos
- ✅ Sistema de busca avançada
- ✅ Notificações em tempo real
- ✅ Suporte via botão flutuante
- ✅ Temas claro e escuro
- ✅ Responsividade mobile completa
- ✅ Capacitor para Android e iOS

### 9.2 Fase 2 (Em Desenvolvimento) 🔄
- 🔄 Melhorias no sistema de moderação com IA
- 🔄 Analytics avançado para usuários Premium
- 🔄 Notificações push mobile
- 🔄 Melhorias na Biblioteca (mais formatos)
- 🔄 Sistema de reputação de usuários
- 🔄 Geração de conteúdo com IA (Gemini)

### 9.3 Fase 3 (Planejado) 📋
- 📋 Sistema de badges e conquistas
- 📋 API pública para desenvolvedores
- 📋 Integrações com outras plataformas
- 📋 App mobile nativo (além do Capacitor)
- 📋 Sistema de streaming ao vivo
- 📋 Marketplace de conteúdo premium

---

## 10. Riscos e Mitigações

### 10.1 Riscos Técnicos
- **Risco**: Escalabilidade do banco de dados
- **Mitigação**: Otimização de queries e uso de índices adequados

- **Risco**: Problemas de segurança
- **Mitigação**: Auditorias regulares e Row Level Security

### 10.2 Riscos de Negócio
- **Risco**: Baixa adoção de planos pagos
- **Mitigação**: Marketing direcionado e funcionalidades premium atrativas

- **Risco**: Conteúdo problemático
- **Mitigação**: Sistema de moderação robusto e políticas claras

---

## 11. Glossário

- **RLS**: Row Level Security - Política de segurança no nível de linha do banco de dados
- **JWT**: JSON Web Token - Token de autenticação
- **MRR**: Monthly Recurring Revenue - Receita recorrente mensal
- **LTV**: Lifetime Value - Valor do cliente ao longo do tempo
- **Churn**: Taxa de cancelamento de assinaturas
- **Severity Score**: Pontuação de severidade para denúncias
- **Evidence Board**: Quadro de evidências em posts

---

## 12. Anexos

### 12.1 Estrutura de Dados Principais

#### User
```typescript
{
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio?: string;
  plan: 'free' | 'basic' | 'pro' | 'premium';
  role?: 'user' | 'moderator' | 'admin';
  // ... outros campos
}
```

#### Post
```typescript
{
  id: string;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  tags: string[];
  communityId?: string;
  poll?: Poll;
  evidenceBoard?: EvidenceItem[];
  // ... outros campos
}
```

#### Community
```typescript
{
  id: string;
  name: string;
  description: string;
  requiredPlan: 'all' | 'basic+' | 'pro+' | 'premium';
  // ... outros campos
}
```

### 12.2 Páginas e Rotas Disponíveis
- `/` - Home (feed principal)
- `/profile/:userId` - Perfil de usuário
- `/settings` - Configurações
- `/notifications` - Notificações
- `/messages` - Mensagens diretas
- `/saved` - Posts salvos
- `/communities` - Comunidades
- `/community/:id` - Detalhes da comunidade
- `/library` - Biblioteca (Pro/Premium)
- `/timeline` - Linha do tempo de eventos
- `/post/:id` - Detalhes do post
- `/search` - Busca avançada
- `/topic/:tag` - Posts por tag
- `/premium` - Planos de assinatura
- `/trending` - Tópicos em alta
- `/explore` - Explorar usuários
- `/moderation` - Fila de moderação (Admin/Moderador)
- `/dashboard` - Dashboard administrativo (Admin)
- `/appeals` - Recursos de moderação (Admin)
- `/about` - Sobre a plataforma
- `/terms` - Termos de serviço
- `/privacy` - Política de privacidade
- `/cookies` - Política de cookies
- `/disclaimer` - Aviso legal
- `/accessibility` - Acessibilidade
- `/login` - Login/Registro
- `/update-password` - Atualização de senha

### 12.3 Referências Técnicas
- Documentação Supabase: https://supabase.com/docs
- Documentação React: https://react.dev
- Documentação Stripe: https://stripe.com/docs
- Documentação Vite: https://vitejs.dev
- Documentação Capacitor: https://capacitorjs.com/docs
- Documentação Tailwind CSS: https://tailwindcss.com/docs
- Documentação Framer Motion: https://www.framer.com/motion

---

**Documento criado em:** Novembro 2024  
**Última atualização:** Novembro 2024  
**Próxima revisão:** Dezembro 2024  
**Versão do App:** 0.0.0

