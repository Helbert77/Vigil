# 17 - Planos Premium

## 📋 Identificação

| Campo | Valor |
|-------|-------|
| **Nome** | Sistema de Planos Premium Vigil |
| **Versão** | 1.0.0 |
| **Data** | 12/12/2024 |
| **Responsável** | Equipe de Desenvolvimento Vigil |
| **Tipo** | PRD - Sistema de Monetização |

---

## 🎯 Visão Geral

### Descrição
Sistema de assinaturas premium que oferece funcionalidades exclusivas e experiência aprimorada através de diferentes tiers de planos, com integração completa ao Stripe para processamento de pagamentos.

### Objetivo e Propósito
- **Monetização**: Receita recorrente através de assinaturas
- **Valor Agregado**: Funcionalidades exclusivas para assinantes
- **Segmentação**: Diferentes níveis para diferentes necessidades
- **Retenção**: Incentivos para manter assinatura ativa
- **Crescimento**: Modelo escalável de receita

---

## 🏗️ Arquitetura Técnica

### Estrutura de Planos
```typescript
interface PlanLimits {
  postCharLimit: number;
  canEditPost: boolean;
  canAccessCommunities: boolean;
  canAccessLibrary: boolean;
  canCreateCommunities: boolean;
  hasAds: boolean | 'reduced';
  supportLevel: 'none' | 'email' | 'chat';
  hasVerifiedBadge?: boolean;
  earlyAccess?: boolean;
}

const PLAN_CONFIG = {
  free: {
    price: 0,
    limits: {
      postCharLimit: 280,
      canEditPost: false,
      canAccessCommunities: false,
      canAccessLibrary: false,
      canCreateCommunities: false,
      hasAds: true,
      supportLevel: 'none'
    }
  },
  basic: {
    price: 3.99,
    limits: {
      postCharLimit: 1000,
      canEditPost: true,
      canAccessCommunities: false,
      canAccessLibrary: false,
      canCreateCommunities: false,
      hasAds: true,
      supportLevel: 'none'
    }
  },
  pro: {
    price: 8.99,
    limits: {
      postCharLimit: 5000,
      canEditPost: true,
      canAccessCommunities: true,
      canAccessLibrary: true,
      canCreateCommunities: false,
      hasAds: 'reduced',
      supportLevel: 'email',
      hasVerifiedBadge: true
    }
  },
  premium: {
    price: 19.99,
    limits: {
      postCharLimit: 25000,
      canEditPost: true,
      canAccessCommunities: true,
      canAccessLibrary: true,
      canCreateCommunities: true,
      hasAds: false,
      supportLevel: 'chat',
      hasVerifiedBadge: true,
      earlyAccess: true
    }
  }
};
```

### Componentes Principais
- **Premium.tsx** - Página de planos e upgrade
- **SubscriptionManager.tsx** - Gestão de assinatura
- **PaymentFlow.tsx** - Fluxo de pagamento
- **PlanComparison.tsx** - Comparação de planos

---

## ⚙️ Funcionalidades Detalhadas

### 1. Página de Planos
- **Comparação Visual**: Tabela clara de benefícios
- **Preços**: Mensal e anual com desconto
- **Testimonials**: Depoimentos de usuários premium
- **FAQ**: Perguntas frequentes sobre planos
- **Trial**: Períodos de teste gratuito

### 2. Processo de Upgrade
- **Seleção de Plano**: Escolha entre Basic, Pro, Premium
- **Período**: Mensal ou anual (com desconto)
- **Pagamento**: Integração com Stripe
- **Confirmação**: Email e notificação in-app
- **Ativação**: Imediata após pagamento confirmado

### 3. Gestão de Assinatura
- **Status**: Ativa, cancelada, expirada
- **Renovação**: Automática com opção de cancelar
- **Upgrade/Downgrade**: Mudança de plano a qualquer momento
- **Histórico**: Faturas e pagamentos anteriores
- **Cancelamento**: Processo simples com retenção

### 4. Benefícios por Plano

#### Free
- Posts até 280 caracteres
- Feed básico com anúncios
- Perfil público básico

#### Basic ($3.99/mês)
- Posts até 1.000 caracteres
- Edição de posts
- Suporte básico

#### Pro ($8.99/mês)
- Posts até 5.000 caracteres
- Acesso a comunidades
- Biblioteca de conteúdo
- Anúncios reduzidos (50%)
- Badge verificado roxo
- Suporte por email

#### Premium ($19.99/mês)
- Posts até 25.000 caracteres
- Criar comunidades
- Chat rooms exclusivos
- Sem anúncios
- Badge verificado dourado
- Suporte prioritário por chat
- Acesso antecipado a features

---

## 📏 Regras de Negócio

### Preços e Promoções
- **Desconto Anual**: 20% de desconto para pagamento anual
- **Promoção de Lançamento**: Preços promocionais iniciais
- **Trials**: Pro (7 dias), Premium (14 dias)
- **Bônus Anual**: Meses extras para planos anuais

### Upgrade/Downgrade
- **Upgrade**: Imediato com cobrança proporcional
- **Downgrade**: Efetivo no próximo ciclo de cobrança
- **Cancelamento**: Acesso mantido até fim do período pago
- **Reativação**: Possível a qualquer momento

### Controle de Acesso
- **Verificação Contínua**: Validação de plano em tempo real
- **Graceful Degradation**: Funcionalidades desabilitadas gradualmente
- **Notificações**: Avisos sobre expiração e renovação
- **Retenção**: Ofertas especiais para usuários cancelando

---

## 💡 Casos de Uso Práticos

### Cenário 1: Usuário Free descobre limitações
1. **Usuário Free** tenta acessar biblioteca
2. **Sistema** exibe modal de upgrade
3. **Modal** explica benefícios do plano Pro
4. **Usuário** clica "Experimentar Grátis"
5. **Sistema** inicia trial de 7 dias
6. **Usuário** ganha acesso temporário às funcionalidades

### Cenário 2: Upgrade para Premium
1. **Usuário Pro** quer criar comunidade
2. **Sistema** informa que precisa ser Premium
3. **Usuário** acessa página de planos
4. **Sistema** destaca benefícios do Premium
5. **Usuário** seleciona plano anual com desconto
6. **Stripe** processa pagamento
7. **Sistema** ativa Premium imediatamente

### Cenário 3: Cancelamento e retenção
1. **Usuário Premium** decide cancelar
2. **Sistema** oferece desconto de retenção
3. **Usuário** recusa e confirma cancelamento
4. **Sistema** mantém acesso até fim do período
5. **Emails** de reativação são enviados
6. **Usuário** pode reativar com oferta especial

---

## 🚀 Roadmap e Melhorias Futuras

### Novos Planos
- **Enterprise**: Para organizações e empresas
- **Creator**: Para criadores de conteúdo
- **Student**: Desconto para estudantes
- **Family**: Planos familiares compartilhados

### Funcionalidades Premium
- **Analytics Avançados**: Métricas detalhadas
- **API Access**: Acesso à API da plataforma
- **White Label**: Versão sem marca Vigil
- **Priority Support**: Suporte 24/7 dedicado
- **Custom Features**: Funcionalidades sob demanda

### Melhorias de Conversão
- **A/B Testing**: Testes de preços e ofertas
- **Personalization**: Ofertas baseadas em comportamento
- **Referral Program**: Programa de indicação
- **Corporate Sales**: Vendas B2B dedicadas

---

**Próximo Documento**: [18 - Configurações](18_CONFIGURACOES.md)
