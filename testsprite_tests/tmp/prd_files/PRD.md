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
- **Mantenha-me Conectado**: Opção de sessão persistente (30 minutos quando desmarcado)
- **Recuperação de Senha**: Fluxo completo de recuperação via email
- **Atualização de Senha**: Interface dedicada para alteração de senha

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
  - Texto (markdown suportado)
  - Imagens
  - Vídeos
  - Áudios
- **Funcionalidades Avançadas**:
  - Tags para categorização
  - Enquetes (polls)
  - Quadro de evidências (evidence board)
  - Análise de teoria (theory analysis)
- **Associação com Comunidades**: Posts podem ser vinculados a comunidades específicas

#### 2.2.2 Interações com Posts
- **Curtidas**: Sistema de likes
- **Comentários**: Threads de comentários aninhados
- **Salvamento**: Posts podem ser salvos para leitura posterior
- **Compartilhamento**: Compartilhamento via mensagem direta
- **Visualizações**: Contador de visualizações

#### 2.2.3 Moderação de Posts
- **Denúncias**: Usuários podem denunciar posts por:
  - Spam
  - Assédio
  - Discurso de ódio
  - Violência
  - Conteúdo sexual
  - Desinformação
  - Conteúdo inapropriado
- **Ações de Moderação**:
  - Apagar post (autor ou admin/moderador)
  - Sistema de severidade automática (severity score)
  - Fila de moderação priorizada

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
  - PDF
  - DOCX
  - Imagens
  - Outros formatos de documento
- **Estatísticas**: Contadores de visualizações e downloads
- **Restrição de Acesso**: Disponível apenas para planos Basic, Pro e Premium

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
- **Botão de Suporte**: Acesso rápido para usuários Basic, Pro e Premium
- **Modal de Suporte**: Interface para envio de solicitações
- **Integração com Email**: Envio automático de emails de suporte

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
- **Limitações**:
  - Sem acesso à Biblioteca
  - Sem suporte prioritário
  - Comunidades restritas não acessíveis

### 3.2 Plano Basic
- Todas as funcionalidades do Free
- Acesso à Biblioteca
- Suporte via botão flutuante
- Acesso a comunidades Basic+
- **Preço**: Definido na página Premium

### 3.3 Plano Pro
- Todas as funcionalidades do Basic
- Acesso a comunidades Pro+
- Funcionalidades avançadas de análise
- **Preço**: Definido na página Premium

### 3.4 Plano Premium
- Todas as funcionalidades do Pro
- Acesso completo a todas as comunidades
- Prioridade em suporte
- Funcionalidades exclusivas
- **Preço**: Definido na página Premium

### 3.5 Sistema de Pagamento
- **Integração**: Stripe para processamento de pagamentos
- **Ciclos**: Mensal e Anual
- **Gerenciamento**: Cancelamento e atualização de planos
- **Promoções**: Sistema de descontos promocionais

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
2. Visualiza splash screen (5 segundos)
3. Opção de login ou registro
4. Autenticação via Supabase
5. Redirecionamento para Home

#### 6.1.2 Criação de Post
1. Usuário clica em "Criar Post"
2. Preenche conteúdo (texto, mídia, tags)
3. Opcionalmente adiciona enquete ou evidências
4. Seleciona comunidade (opcional)
5. Publica post
6. Post aparece no feed em tempo real

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
- Disponível apenas para planos Basic, Pro e Premium
- Usuários Free são redirecionados para página Premium

#### 6.2.3 Sistema de Severidade
- Spam: 60
- Assédio: 85
- Discurso de ódio: 95
- Violência: 90
- Conteúdo sexual: 90
- Desinformação: 70
- Inapropriado: 65

#### 6.2.4 Filtros de Conteúdo
- Usuários bloqueados: Conteúdo oculto
- Palavras silenciadas: Posts/comentários filtrados
- Restrições de comunidade: Posts filtrados por plano

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

### 9.1 Fase 1 (Atual)
- ✅ Sistema de autenticação
- ✅ Criação e visualização de posts
- ✅ Sistema de comunidades
- ✅ Mensagens diretas
- ✅ Sistema de moderação básico
- ✅ Planos de assinatura

### 9.2 Fase 2 (Próximas)
- 🔄 Melhorias no sistema de moderação
- 🔄 Analytics avançado
- 🔄 Notificações push
- 🔄 Melhorias na Biblioteca

### 9.3 Fase 3 (Futuro)
- 📋 Sistema de badges e conquistas
- 📋 API pública
- 📋 Integrações com outras plataformas
- 📋 App mobile nativo

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
- **Theory Analysis**: Análise de teoria com falácias e contra-argumentos

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

### 12.2 Referências
- Documentação Supabase: https://supabase.com/docs
- Documentação React: https://react.dev
- Documentação Stripe: https://stripe.com/docs
- Documentação Vite: https://vitejs.dev

---

**Documento criado em:** 2024  
**Última atualização:** 2024  
**Próxima revisão:** A definir

