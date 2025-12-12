# 13 - Sistema de Anúncios

## 📋 Identificação

| Campo | Valor |
|-------|-------|
| **Nome** | Sistema de Anúncios Vigil |
| **Versão** | 1.0.0 |
| **Data** | 12/12/2024 |
| **Responsável** | Equipe de Desenvolvimento Vigil |
| **Tipo** | PRD - Sistema de Monetização |

---

## 🎯 Visão Geral

### Descrição
Sistema integrado de anúncios que combina anúncios nativos da plataforma com Google AdSense, oferecendo experiência não intrusiva e monetização eficiente baseada no plano do usuário.

### Objetivo e Propósito
- **Monetização**: Receita através de anúncios direcionados
- **Experiência do Usuário**: Anúncios nativos não intrusivos
- **Segmentação**: Targeting baseado em plano e comportamento
- **Performance**: Métricas detalhadas de engajamento
- **Incentivo Premium**: Redução/remoção de anúncios para planos pagos

---

## 🏗️ Arquitetura Técnica

### Tipos de Anúncios
```typescript
interface Ad {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  video_url?: string;
  link_url: string;
  advertiser_name: string;
  type: 'native' | 'adsense';
  status: 'active' | 'paused' | 'ended';
  approval_status?: 'pending_approval' | 'approved' | 'rejected';
  likes_count?: number;
  shares_count?: number;
  views_count?: number;
  clicks_count?: number;
}
```

### Componentes Principais
- **AdCard.tsx** - Exibição de anúncios nativos
- **AdSenseAd.tsx** - Wrapper para Google AdSense
- **useAds.ts** - Gerenciamento de anúncios
- **useAdInteractions.ts** - Interações (like, save, hide)

---

## ⚙️ Funcionalidades Detalhadas

### 1. Anúncios Nativos
- **Design Integrado**: Visual similar aos posts normais
- **Interações**: Like, compartilhar, comentar (limitado)
- **Targeting**: Baseado em plano, comportamento, comunidades
- **Frequência**: Controlada por algoritmo de injeção
- **Métricas**: Tracking completo de engajamento

### 2. Google AdSense
- **Integração Automática**: Ads inseridos automaticamente
- **Responsive**: Adaptação a diferentes tamanhos de tela
- **Compliance**: Seguindo políticas do AdSense
- **Performance**: Otimização de CPM e CTR

### 3. Controle por Plano
- **Free**: Todos os anúncios (nativos + AdSense)
- **Basic**: Todos os anúncios (nativos + AdSense)
- **Pro**: Anúncios reduzidos (50% menos)
- **Premium**: Sem anúncios (experiência limpa)

### 4. Sistema de Aprovação
- **Fila de Moderação**: Anúncios nativos precisam aprovação
- **Critérios**: Relevância, qualidade, adequação
- **Feedback**: Razões para rejeição
- **Resubmissão**: Possibilidade de corrigir e reenviar

---

## 📏 Regras de Negócio

### Frequência de Anúncios
- **Feed Principal**: 1 anúncio a cada 5-7 posts (Free/Basic)
- **Comunidades**: 1 anúncio a cada 8-10 posts
- **Pro**: 50% da frequência normal
- **Premium**: Sem anúncios

### Targeting e Segmentação
- **Plano do Usuário**: Anúncios específicos por tier
- **Comportamento**: Baseado em interações passadas
- **Comunidades**: Anúncios relevantes ao tema
- **Geolocalização**: Segmentação por região (futuro)

### Métricas e Performance
- **Impressões**: Visualizações do anúncio
- **Clicks**: Cliques no link do anúncio
- **CTR**: Click-through rate
- **Engajamento**: Likes, shares, comentários
- **Conversão**: Tracking de ações pós-click

---

## 💡 Casos de Uso Práticos

### Cenário 1: Usuário Free navega no feed
1. **Usuário Free** acessa feed principal
2. **Sistema** injeta anúncios a cada 5-7 posts
3. **Anúncios nativos** aparecem como posts normais
4. **AdSense** aparece em posições estratégicas
5. **Usuário** pode interagir com anúncios nativos
6. **Métricas** são registradas para cada interação

### Cenário 2: Anunciante cria campanha
1. **Anunciante** acessa dashboard de publicidade
2. **Sistema** oferece opções de criação de anúncio
3. **Anunciante** define targeting e orçamento
4. **Sistema** envia para fila de aprovação
5. **Moderador** revisa e aprova anúncio
6. **Anúncio** entra em rotação no feed

---

## 🚀 Roadmap e Melhorias Futuras

### Próximas Funcionalidades
- **Vídeo Ads**: Anúncios em formato de vídeo
- **Stories Ads**: Anúncios em stories (quando implementado)
- **Retargeting**: Remarketing baseado em comportamento
- **A/B Testing**: Testes de diferentes criativos
- **Programmatic**: Compra programática de anúncios

### Melhorias de Performance
- **Real-time Bidding**: Leilão em tempo real
- **Machine Learning**: Otimização automática de targeting
- **Fraud Detection**: Detecção de cliques fraudulentos
- **Viewability**: Métricas de visibilidade real

---

**Próximo Documento**: [14 - Dashboard de Publicidade](14_PUBLICIDADE.md)
