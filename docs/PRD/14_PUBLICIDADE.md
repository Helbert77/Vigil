# 14 - Dashboard de Publicidade

## 📋 Identificação

| Campo | Valor |
|-------|-------|
| **Nome** | Dashboard de Publicidade Vigil |
| **Versão** | 2.0.0 |
| **Data** | 24/01/2026 |
| **Última Atualização** | 24/01/2026 |
| **Responsável** | Equipe de Desenvolvimento Vigil |
| **Tipo** | PRD - Sistema de Monetização |

---

## 🎯 Visão Geral

### Descrição
Plataforma completa para anunciantes criarem, gerenciarem e monitorarem campanhas publicitárias na rede Vigil, com integração ao Stripe para pagamentos e métricas detalhadas de performance.

### Objetivo e Propósito
- **Self-Service**: Anunciantes podem criar campanhas autonomamente
- **Transparência**: Métricas claras e em tempo real
- **Flexibilidade**: Múltiplos formatos e opções de pagamento
- **ROI**: Ferramentas para otimização de retorno
- **Compliance**: Aderência a políticas publicitárias

---

## 🏗️ Arquitetura Técnica

### Páginas Principais
- **AdsDashboard.tsx** - Visão geral das campanhas
- **MyAds.tsx** - Gerenciamento de anúncios
- **SelectAdPlan.tsx** - Seleção de planos publicitários
- **CreateAdModal.tsx** - Criação de novos anúncios
- **PaymentSuccess.tsx** - Confirmação de pagamento

### Integração com Stripe
- **Pagamentos**: Processamento seguro de transações
- **Planos**: Pacotes pré-definidos e CPM personalizado
- **Webhooks**: Confirmação automática de pagamentos
- **Refunds**: Sistema de reembolsos automático

---

## ⚙️ Funcionalidades Detalhadas

### 1. Dashboard Principal

#### Controles Superiores
- **Botão "Criar Anúncio"**: Abre modal de criação
- **Seletor de Período**: 7, 30 ou 90 dias
- **Filtro por Anúncio**: Dropdown com todos os anúncios do usuário

#### Filtro de Anúncios
```typescript
const [selectedAdId, setSelectedAdId] = useState<string>('all');

// Opções do dropdown
<select value={selectedAdId} onChange={(e) => setSelectedAdId(e.target.value)}>
  <option value="all">Todos os anúncios</option>
  {adsPerformance.map((ad) => (
    <option key={ad.id} value={ad.id}>{ad.title}</option>
  ))}
</select>
```

**Comportamento do Filtro:**
- **"Todos os anúncios"**: Exibe métricas agregadas de todas as campanhas
- **Anúncio específico**: Filtra todas as métricas para mostrar apenas dados daquele anúncio
- **Atualização em tempo real**: Cards, gráfico e tabela atualizam instantaneamente
- **Distribuição proporcional**: Gráfico diário distribui métricas proporcionalmente

#### Métricas Principais (Cards)

**Card 1: Impressões Totais**
- Ícone: 👁️ (Olho)
- Valor: Número total de impressões
- Descrição: Taxa de engajamento (engajamento/impressões)

**Card 2: Clicks Totais**
- Ícone: 🖱️ (Mouse)
- Valor: Número total de clicks
- Descrição: CTR (Click-Through Rate)

**Card 3: Engajamento Total**
- Ícone: ❤️ (Coração)
- Valor: Likes + Shares + Comentários
- Descrição: Média de engajamento por impressão

**Card 4: Custo Total**
- Ícone: 📈 (Trending Up)
- Valor: Soma de todos os custos (€ X.XX)
- Descrição: 
  - "CPC médio: € X.XX" (quando há clicks)
  - "CPC médio: Sem cliques" (quando totalClicks = 0)

**Cálculo do CPC:**
```typescript
const totalCost = filteredMetrics.performance.reduce((sum, ad) => sum + ad.cost, 0);
const totalClicks = filteredMetrics.aggregated?.total_clicks || 0;
const avgCpc = totalClicks > 0 ? totalCost / totalClicks : null;

// Exibição
description={
  avgCpc !== null 
    ? `CPC médio: € ${avgCpc.toFixed(2)}` 
    : 'CPC médio: Sem cliques'
}
```

#### Gráfico de Performance Diária
- **Tipo**: Gráfico de linhas com múltiplas séries
- **Séries**: Impressões, Clicks, Engajamento
- **Eixo X**: Datas (formato DD/MM)
- **Eixo Y**: Valores absolutos
- **Tooltip**: Valores detalhados ao passar o mouse
- **Responsivo**: Adapta para mobile

**Filtro Aplicado:**
Quando um anúncio específico é selecionado, o gráfico distribui as métricas diárias proporcionalmente:
```typescript
const adProportion = selectedAd.impressions / aggregatedMetrics.total_impressions;
const filteredDaily = dailyMetrics.map(day => ({
  date: day.date,
  impressions: Math.round(day.impressions * adProportion),
  clicks: Math.round(day.clicks * adProportion),
  engagement: Math.round(day.engagement * adProportion)
}));
```

#### Tabela de Performance Individual
- **Colunas**: Título, Status, Impressões, Clicks, CTR, Engajamento, Custo
- **Ordenação**: Clique no header para ordenar
- **Status com Badge**: 
  - 🟢 Ativo (verde)
  - ⏸️ Pausado (amarelo)
  - 🔴 Encerrado (vermelho)
- **Ações**: Ver detalhes, editar, pausar/retomar
- **Filtro**: Filtra automaticamente quando anúncio é selecionado no dropdown

### 2. Criação de Campanhas
- **Wizard Guiado**: Processo passo a passo
- **Formatos**: Imagem, vídeo, texto
- **Targeting**: Segmentação por plano, comunidades, interesses
- **Orçamento**: Pacotes fixos ou CPM personalizado
- **Preview**: Visualização antes da publicação

### 3. Planos Publicitários
```typescript
interface AdPlan {
  id: string;
  name: string;
  price: number;
  impressions: number;
  duration_days: number;
  targeting_options: string[];
  features: string[];
}

// Exemplos de planos
const AD_PLANS = [
  {
    name: "Starter",
    price: 50,
    impressions: 10000,
    duration_days: 7
  },
  {
    name: "Growth", 
    price: 150,
    impressions: 35000,
    duration_days: 14
  },
  {
    name: "Pro",
    price: 300,
    impressions: 80000,
    duration_days: 30
  }
];
```

### 4. Métricas e Analytics

#### Cards de Métricas
- **Impressões Totais**: Número total de visualizações de todos os anúncios
- **Clicks Totais**: Total de cliques recebidos
- **Engajamento Total**: Soma de likes, shares e comentários nos anúncios
- **Custo Total**: Valor total gasto (inclui anúncios ativos e encerrados)
  - Exibe CPC médio quando há clicks
  - Exibe "Sem cliques" quando CPC não é calculável

#### Métricas Calculadas
- **CTR (Click-Through Rate)**: Taxa de cliques sobre impressões
- **CPM (Cost Per Mille)**: Custo por mil impressões
- **CPC (Cost Per Click)**: Custo por clique (null quando não há clicks)
- **Taxa de Engajamento**: Engajamento total / Impressões totais

#### Gráfico de Performance Diária
- Visualização de impressões, clicks e engajamento ao longo do tempo
- Distribuição proporcional quando filtrado por anúncio específico
- Atualização automática baseada no filtro selecionado

#### Tabela de Performance Individual
- Lista todos os anúncios com métricas detalhadas
- Status (ativo, pausado, encerrado)
- Impressões, clicks, CTR, engajamento e custo por anúncio
- Ordenação e filtros disponíveis

### 5. Sistema de Coleta de Métricas

#### Tabela `ad_metrics`
```sql
CREATE TABLE ad_metrics (
  id UUID PRIMARY KEY,
  ad_id UUID REFERENCES anuncios(id),
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Funções RPC do Supabase

**`get_user_ad_metrics(user_id, days)`**
- Retorna métricas agregadas de todos os anúncios do usuário
- Inclui anúncios ativos e encerrados
- Calcula totais de impressões, clicks, engajamento

**`get_daily_ad_metrics(user_id, days)`**
- Retorna métricas diárias para o gráfico de performance
- Agrupa por data para visualização temporal

**`get_ads_performance(user_id, days)`**
- Lista individual de cada anúncio com suas métricas
- Inclui status, título, impressões, clicks, CTR, custo
- Usado para a tabela de performance e filtro de anúncios

---

## 📏 Regras de Negócio

### Aprovação de Anúncios
- **Revisão Manual**: Todos os anúncios passam por aprovação
- **Critérios**: Relevância, qualidade, adequação às políticas
- **Tempo de Aprovação**: Até 24 horas úteis
- **Feedback**: Razões específicas para rejeição
- **Resubmissão**: Possibilidade de corrigir e reenviar

### Políticas Publicitárias
- **Conteúdo Proibido**: Drogas, armas, conteúdo adulto
- **Qualidade**: Imagens de alta resolução, texto legível
- **Veracidade**: Informações precisas e verificáveis
- **Compliance**: Aderência a leis locais e internacionais

### Sistema de Pagamentos
- **Pré-pagamento**: Pagamento antes da veiculação
- **Stripe Integration**: Processamento seguro
- **Reembolsos**: Automáticos para anúncios rejeitados
- **Faturamento**: Notas fiscais automáticas

---

## 💡 Casos de Uso Práticos

### Cenário 1: Primeira campanha
1. **Anunciante** acessa dashboard publicitário
2. **Sistema** exibe tutorial de boas-vindas
3. **Anunciante** clica "Criar Primeira Campanha"
4. **Wizard** guia através do processo
5. **Anunciante** seleciona plano e faz pagamento
6. **Sistema** envia para aprovação
7. **Após aprovação**, campanha entra no ar

### Cenário 2: Otimização de campanha
1. **Anunciante** vê baixo CTR no dashboard
2. **Sistema** sugere otimizações automáticas
3. **Anunciante** testa novo criativo
4. **Sistema** faz A/B test automaticamente
5. **Métricas** mostram melhoria de performance
6. **Anunciante** pausa versão com pior performance

### Cenário 3: Análise de ROI
1. **Anunciante** configura tracking de conversões
2. **Sistema** monitora ações pós-click
3. **Dashboard** mostra funil completo
4. **Anunciante** identifica melhor segmento
5. **Sistema** sugere realocação de orçamento
6. **ROI** melhora com otimizações

---

## 🚀 Roadmap e Melhorias Futuras

### Próximas Funcionalidades
- **Automação**: Campanhas com otimização automática
- **Lookalike Audiences**: Segmentação por similaridade
- **Dynamic Ads**: Anúncios personalizados automaticamente
- **Attribution**: Tracking cross-device e cross-platform
- **API**: Interface para agências e ferramentas terceiras

### Melhorias de UX
- **Mobile Dashboard**: App para gerenciar campanhas
- **Bulk Operations**: Operações em massa
- **Templates**: Modelos pré-definidos de anúncios
- **Collaboration**: Múltiplos usuários por conta
- **White Label**: Solução para agências

---

**Próximo Documento**: [15 - Sistema de Moderação](15_MODERACAO.md)
