# 14 - Dashboard de Publicidade

## 📋 Identificação

| Campo | Valor |
|-------|-------|
| **Nome** | Dashboard de Publicidade Vigil |
| **Versão** | 1.0.0 |
| **Data** | 12/12/2024 |
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
- **Visão Geral**: Resumo de todas as campanhas ativas
- **Métricas Principais**: Impressões, clicks, CTR, gastos
- **Gráficos**: Performance ao longo do tempo
- **Alertas**: Notificações sobre campanhas que precisam atenção
- **Recomendações**: Sugestões de otimização baseadas em IA

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
- **Impressões**: Número de visualizações
- **Clicks**: Cliques no anúncio
- **CTR**: Click-through rate
- **CPM**: Custo por mil impressões
- **CPC**: Custo por clique
- **Conversões**: Ações pós-click (se configurado)
- **ROI**: Retorno sobre investimento

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
