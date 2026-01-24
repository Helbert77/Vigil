# 📚 Biblioteca de PRDs - Vigil Social Network

## 🎯 Visão Geral

Esta biblioteca contém a documentação completa de Product Requirements Documents (PRDs) para o **Vigil**, uma rede social desenvolvida em React/TypeScript com Supabase. A documentação está organizada por funcionalidades e serve tanto para desenvolvedores quanto para usuários finais.

---

## 📋 Índice de Documentos

### 🏗️ Arquitetura e Fundamentos
- **[01 - Visão Geral do Sistema](01_VISAO_GERAL.md)**
  - Arquitetura geral, tecnologias utilizadas, estrutura do projeto
- **[02 - Autenticação](02_AUTENTICACAO.md)**
  - Login, registro, recuperação de senha, gerenciamento de sessão

### 🎨 Interface e Layout
- **[03 - Layout e Navegação](03_LAYOUT.md)**
  - Header, Sidebar, Rightbar, navegação mobile, responsividade

### 📝 Funcionalidades Principais
- **[04 - Sistema de Posts](04_POSTS.md)**
  - Criação, visualização, interações (likes, comentários, compartilhamentos)
- **[05 - Comunidades](05_COMUNIDADES.md)**
  - Criação, gestão, posts em comunidades, membros ativos
- **[06 - Mensagens Privadas](06_MENSAGENS.md)**
  - Chat privado, conversações, notificações de mensagens
- **[07 - Chat Rooms](07_CHAT_ROOMS.md)**
  - Salas de chat públicas e privadas, moderação de salas
- **[08 - Notificações](08_NOTIFICACOES.md)**
  - Sistema de notificações em tempo real, tipos de notificação
- **[09 - Perfil do Usuário](09_PERFIL.md)**
  - Perfil, edição, seguidores, configurações pessoais
- **[10 - Busca Avançada](10_BUSCA.md)**
  - Busca de posts, usuários, comunidades, filtros avançados

### 📚 Funcionalidades Avançadas
- **[11 - Biblioteca de Conteúdo](11_BIBLIOTECA.md)**
  - E-books, artigos, documentos, sistema de downloads
- **[12 - Timeline Histórica](12_TIMELINE.md)**
  - Timeline interativa, eventos históricos, moderação
- **[13 - Sistema de Anúncios](13_ANUNCIOS.md)**
  - Anúncios nativos, AdSense, interações com anúncios

### 💼 Publicidade e Monetização
- **[14 - Dashboard de Publicidade](14_PUBLICIDADE.md)**
  - Criação de campanhas, métricas, pagamentos via Stripe
- **[17 - Planos Premium](17_PLANOS_PREMIUM.md)**
  - Assinaturas, benefícios por plano, integração Stripe

### 🛡️ Administração e Moderação
- **[15 - Sistema de Moderação](15_MODERACAO.md)**
  - Fila de moderação, appeals, ações administrativas
- **[16 - Painel Administrativo](16_ADMINISTRACAO.md)**
  - Dashboard admin, aprovação de anúncios, métricas

### ⚙️ Configurações e Componentes
- **[18 - Configurações](18_CONFIGURACOES.md)**
  - Preferências, privacidade, bloqueios, temas
- **[19 - Componentes Comuns](19_COMPONENTES_COMUNS.md)**
  - Avatar, Card, Tooltip, Modal, componentes reutilizáveis

### 🎧 Suporte e Atendimento
- **[20 - Sistema de Suporte](20_SUPORTE.md)**
  - Tickets, categorização, emails, anexos, prioridades

### 📄 Compliance e Legal
- **[21 - Páginas Legais e Políticas](21_PAGINAS_LEGAIS.md)**
  - Privacidade, Termos, Cookies, Acessibilidade, Disclaimer

### 🎯 Recursos Especiais
- **[22 - Páginas Adicionais](22_PAGINAS_ADICIONAIS.md)**
  - Posts Salvos, Tópicos em Alta, Detalhe de Tópico, Splash Screen

---

## 🎯 Público-Alvo

### 👨‍💻 Para Desenvolvedores
- **Onboarding**: Compreensão rápida da arquitetura
- **Referência**: Padrões de código e melhores práticas
- **Manutenção**: Documentação de regras de negócio
- **Testes**: Casos de uso e cenários de teste

### 👥 Para Usuários Finais
- **Guia de Uso**: Instruções passo a passo
- **Funcionalidades**: Compreensão completa dos recursos
- **Suporte**: Resolução de dúvidas e problemas
- **Onboarding**: Introdução às funcionalidades

### 🏢 Para Gestão de Produto
- **Roadmap**: Funcionalidades planejadas
- **Métricas**: KPIs e indicadores de sucesso
- **Regras de Negócio**: Validações e restrições
- **Compliance**: Documentação para auditoria

---

## 🏗️ Estrutura dos Documentos

Cada PRD segue uma estrutura padronizada:

1. **📋 Identificação** - Nome, versão, responsáveis
2. **🎯 Visão Geral** - Descrição e objetivos
3. **🏗️ Arquitetura Técnica** - Componentes e diagramas
4. **👤 Fluxos de Usuário** - Jornadas e casos de uso
5. **⚙️ Funcionalidades** - Detalhamento técnico
6. **🎨 Interface** - Componentes React e props
7. **🔗 Integrações** - APIs e serviços externos
8. **📏 Regras de Negócio** - Validações e permissões
9. **💡 Casos Práticos** - Exemplos de uso
10. **🚨 Tratamento de Erros** - Cenários de falha
11. **⚡ Performance** - Otimizações implementadas
12. **♿ Acessibilidade** - Suporte a tecnologias assistivas
13. **🧪 Testes** - Casos de teste e QA
14. **🚀 Roadmap** - Melhorias futuras

---

## 🔧 Tecnologias Documentadas

### Frontend
- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **React Router** - Navegação

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security** - Segurança de dados
- **Real-time** - Atualizações em tempo real

### Integrações
- **Stripe** - Pagamentos e assinaturas
- **Vercel** - Deploy e hospedagem
- **AdSense** - Monetização com anúncios

---

## 📊 Métricas e KPIs

### Engajamento
- Posts criados por usuário
- Interações (likes, comentários, shares)
- Tempo de sessão médio
- Taxa de retenção

### Comunidades
- Número de comunidades ativas
- Posts por comunidade
- Membros ativos por comunidade
- Taxa de crescimento

### Monetização
- Conversão para planos premium
- Revenue per user (ARPU)
- Lifetime value (LTV)
- Churn rate

### Performance
- Tempo de carregamento
- Core Web Vitals
- Taxa de erro
- Uptime

---

## 🚀 Como Usar Esta Documentação

### Para Novos Desenvolvedores
1. Comece com **[Visão Geral](01_VISAO_GERAL.md)** para entender a arquitetura
2. Leia **[Layout](03_LAYOUT.md)** para compreender a estrutura da interface
3. Explore as funcionalidades específicas conforme necessário
4. Use os diagramas Mermaid para visualizar fluxos

### Para Usuários Finais
1. Navegue pelos PRDs das funcionalidades que deseja usar
2. Siga os guias passo a passo nas seções "Casos Práticos"
3. Consulte as seções de "Regras de Negócio" para entender limitações
4. Use o índice para encontrar rapidamente o que procura

### Para Manutenção
1. Consulte a arquitetura técnica antes de fazer alterações
2. Verifique as regras de negócio para manter consistência
3. Atualize a documentação após implementar mudanças
4. Use os casos de teste como referência para QA

---

## 📞 Suporte e Contribuições

### Reportar Problemas
- Inconsistências na documentação
- Funcionalidades não documentadas
- Erros ou informações desatualizadas

### Contribuir
- Melhorias na documentação
- Novos diagramas ou exemplos
- Casos de uso adicionais
- Traduções

---

## 📅 Histórico de Versões

| Versão | Data | Alterações |
|--------|------|------------|
| 1.0.0 | 2024-12-12 | Criação inicial da biblioteca de PRDs |
| 1.1.0 | 2026-01-24 | Atualização de PRDs existentes + 3 novos documentos |

### Detalhes da Versão 1.1.0

**PRDs Atualizados:**
- **04 - Posts** (v1.1.0): Adicionado botões de cancelamento para enquetes e evidências
- **05 - Comunidades** (v1.1.0): Adicionado acesso irrestrito para admins
- **07 - Chat Rooms** (v2.0.0): Indicadores de salas (Nova/Hot), sistema de geolocalização, funções detalhadas do chatService
- **14 - Publicidade** (v2.0.0): Filtro de anúncios, cálculo de CPC, inclusão de anúncios encerrados

**Novos PRDs Criados:**
- **20 - Sistema de Suporte**: Tickets, categorização, emails, prioridades
- **21 - Páginas Legais**: Privacidade, Termos, Cookies, Acessibilidade, Disclaimer
- **22 - Páginas Adicionais**: Posts Salvos, Tópicos em Alta, Detalhe de Tópico, Splash Screen

---

## 📝 Licença e Uso

Esta documentação é parte integrante do projeto Vigil e deve ser mantida atualizada conforme o desenvolvimento do sistema. Todos os diagramas, exemplos e especificações são propriedade intelectual do projeto.

---

**🎯 Objetivo**: Facilitar o onboarding, desenvolvimento e uso do Vigil através de documentação clara, completa e sempre atualizada.
