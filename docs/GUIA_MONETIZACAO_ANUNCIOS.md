# Guia Completo de Monetização com Anúncios

Este guia explica como monetizar seu aplicativo Vigil através de anúncios, incluindo configuração do Google AdSense e venda de anúncios próprios.

## Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Google AdSense](#google-adsense)
3. [Anúncios Próprios](#anúncios-próprios)
4. [Modelos de Precificação](#modelos-de-precificação)
5. [Melhores Práticas](#melhores-práticas)
6. [Ferramentas e Análise](#ferramentas-e-análise)

---

## Visão Geral do Sistema

O Vigil possui um sistema de anúncios nativos integrado que:

- **Frequência baseada em planos:**
  - **Free**: 1 anúncio a cada 4 posts
  - **Basic**: 1 anúncio a cada 6 posts
  - **Pro**: 1 anúncio a cada 8 posts
  - **Premium/Admin**: Sem anúncios

- **Rastreamento completo de métricas:**
  - Impressões (visualizações)
  - Cliques
  - Likes, shares e saves
  - CTR (Click-Through Rate)

- **Suporte para:**
  - Anúncios próprios (native ads)
  - Google AdSense (opcional)

---

## Google AdSense

### O que é o Google AdSense?

O Google AdSense é uma plataforma que permite exibir anúncios automaticamente no seu site e ganhar dinheiro quando os usuários visualizam ou clicam nos anúncios.

### Requisitos para Aprovação

1. **Conteúdo Original**: Seu site deve ter conteúdo único e de qualidade
2. **Tráfego Mínimo**: Recomendado pelo menos 500-1000 visitantes/dia
3. **Idade do Site**: Pelo menos 6 meses de idade (recomendado)
4. **Políticas do Google**: Cumprir todas as políticas de conteúdo do AdSense
5. **Design Profissional**: Site bem estruturado e navegável

### Como Obter uma Conta AdSense

#### Passo 1: Criar Conta

1. Acesse: https://www.google.com/adsense/
2. Clique em "Começar"
3. Faça login com sua conta Google
4. Preencha as informações:
   - URL do seu site
   - País
   - Informações de pagamento

#### Passo 2: Adicionar Código ao Site

1. Após criar a conta, você receberá um código JavaScript
2. No Vigil, edite o arquivo `index.html`:

```html
<!-- Descomente e adicione seu Client ID -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
```

3. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_SLOT_FEED=1234567890
```

#### Passo 3: Aguardar Aprovação

- O Google pode levar de 1 dia a 2 semanas para revisar seu site
- Você receberá um email quando for aprovado
- Durante a revisão, mantenha o código instalado

### Receita Estimada com AdSense

**RPM (Receita por Mil Impressões):**
- **Nicho de Tecnologia/Conspiração**: $2-8 RPM
- **Exemplo**: 100.000 impressões/mês = $200-800/mês

**Fatores que Afetam a Receita:**
- Localização geográfica dos usuários
- Nicho do conteúdo
- Qualidade do tráfego
- Taxa de cliques (CTR)

---

## Anúncios Próprios

### Vantagens dos Anúncios Próprios

- **Maior Receita**: Você fica com 100% do valor
- **Controle Total**: Escolhe quais anúncios exibir
- **Relacionamento Direto**: Constrói parcerias com anunciantes
- **Flexibilidade**: Define seus próprios preços e termos

### Como Vender Anúncios Próprios

#### 1. Criar Tabela de Anúncios

Execute o script para criar as tabelas no Supabase:

```bash
node scripts/create-ads-tables.js
```

#### 2. Adicionar Anúncios via Dashboard do Supabase

Acesse o Supabase Dashboard e insira anúncios na tabela `ads`:

```sql
INSERT INTO ads (
  title,
  description,
  image_url,
  link_url,
  advertiser_name,
  advertiser_avatar,
  type,
  status,
  start_date,
  end_date
) VALUES (
  'Título do Anúncio',
  'Descrição detalhada do produto ou serviço',
  'https://exemplo.com/imagem.jpg',
  'https://exemplo.com/landing-page',
  'Nome do Anunciante',
  'https://exemplo.com/logo.png',
  'native',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days'
);
```

#### 3. Encontrar Anunciantes

**Onde Encontrar:**
- Empresas relacionadas ao seu nicho (teorias, tecnologia, privacidade)
- Plataformas de afiliados (Amazon, Hotmart, Monetizze)
- Anunciantes diretos via email/LinkedIn
- Redes de anúncios especializadas

**Como Abordar:**
1. Prepare um Media Kit com:
   - Estatísticas de tráfego
   - Demografia da audiência
   - Tabela de preços
   - Exemplos de anúncios

2. Email de Apresentação:
```
Assunto: Oportunidade de Publicidade no Vigil

Olá [Nome],

Sou [Seu Nome], fundador do Vigil, uma plataforma com [X] usuários ativos mensais focados em [nicho].

Acredito que seu produto/serviço seria relevante para nossa audiência. Oferecemos:
- [X] impressões mensais
- Anúncios nativos integrados ao feed
- Rastreamento completo de métricas

Gostaria de discutir uma parceria?

Atenciosamente,
[Seu Nome]
```

---

## Modelos de Precificação

### 1. CPM (Custo Por Mil Impressões)

**Como Funciona:**
- Anunciante paga por cada 1.000 impressões
- Mais comum para branding e awareness

**Precificação Sugerida:**
- **Iniciante** (< 50k impressões/mês): $3-5 CPM
- **Intermediário** (50k-200k): $5-10 CPM
- **Estabelecido** (> 200k): $10-20 CPM

**Exemplo de Cálculo:**
```
100.000 impressões × $8 CPM = $800
```

### 2. CPC (Custo Por Clique)

**Como Funciona:**
- Anunciante paga apenas quando alguém clica no anúncio
- Melhor para conversões diretas

**Precificação Sugerida:**
- **Nicho Geral**: $0.50-1.50 por clique
- **Nicho Específico**: $1.50-5.00 por clique

**Exemplo de Cálculo:**
```
500 cliques × $2 CPC = $1.000
```

### 3. Flat Rate (Taxa Fixa)

**Como Funciona:**
- Preço fixo por período (semana/mês)
- Mais simples de gerenciar

**Precificação Sugerida:**
- **Semanal**: $200-500
- **Mensal**: $800-2.000
- **Trimestral**: $2.000-5.000 (com desconto)

### 4. Híbrido

**Exemplo:**
- Base fixa + bônus por performance
- $500/mês + $1 por clique acima de 200 cliques

---

## Melhores Práticas

### 1. Experiência do Usuário

✅ **Faça:**
- Mantenha anúncios relevantes ao conteúdo
- Use design nativo (similar aos posts)
- Respeite a frequência baseada em planos
- Identifique claramente como "Patrocinado"

❌ **Não Faça:**
- Exibir anúncios enganosos
- Usar pop-ups intrusivos
- Ignorar feedback negativo dos usuários
- Violar privacidade dos usuários

### 2. Otimização de Receita

**Teste A/B:**
- Diferentes posições de anúncios
- Variações de design
- Textos de CTA (Call-to-Action)

**Análise de Dados:**
- Monitore CTR por anúncio
- Identifique horários de pico
- Segmente por tipo de usuário

**Diversificação:**
- Combine AdSense + anúncios próprios
- Múltiplos anunciantes
- Diferentes formatos (imagem, vídeo)

### 3. Conformidade Legal

**LGPD/GDPR:**
- Obtenha consentimento para cookies
- Política de privacidade clara
- Opção de opt-out

**Transparência:**
- Divulgue relacionamentos com anunciantes
- Identifique conteúdo patrocinado
- Mantenha integridade editorial

---

## Ferramentas e Análise

### 1. Dashboard de Métricas (Vigil)

Acesse as métricas dos anúncios via Supabase:

```sql
-- Estatísticas de um anúncio
SELECT 
  event_type,
  COUNT(*) as total,
  COUNT(DISTINCT user_id) as unique_users
FROM ad_metrics
WHERE ad_id = 'seu-ad-id'
GROUP BY event_type;

-- CTR por anúncio
SELECT 
  a.title,
  COUNT(CASE WHEN m.event_type = 'impression' THEN 1 END) as impressions,
  COUNT(CASE WHEN m.event_type = 'click' THEN 1 END) as clicks,
  ROUND(
    COUNT(CASE WHEN m.event_type = 'click' THEN 1 END)::numeric / 
    NULLIF(COUNT(CASE WHEN m.event_type = 'impression' THEN 1 END), 0) * 100,
    2
  ) as ctr_percentage
FROM ads a
LEFT JOIN ad_metrics m ON a.id = m.ad_id
GROUP BY a.id, a.title;
```

### 2. Google Analytics

Configure eventos personalizados:

```javascript
// Rastrear clique em anúncio
gtag('event', 'ad_click', {
  'ad_id': adId,
  'ad_title': adTitle,
  'user_plan': userPlan
});
```

### 3. Ferramentas Externas

**Para AdSense:**
- Google AdSense Dashboard
- Google Analytics
- AdSense Auto Ads

**Para Anúncios Próprios:**
- Bitly (rastreamento de links)
- Hotjar (heatmaps)
- Mixpanel (análise de eventos)

---

## Projeções de Receita

### Cenário Conservador

**Dados:**
- 10.000 usuários ativos/mês
- 50% no plano Free (veem anúncios)
- 5 posts visualizados por sessão
- 2 sessões/mês por usuário

**Cálculo:**
```
5.000 usuários × 5 posts × 2 sessões = 50.000 visualizações
50.000 ÷ 4 (frequência free) = 12.500 impressões de anúncios

Com $5 CPM: 12.500 × $5 / 1000 = $62,50/mês
Com anúncios próprios a $10 CPM: $125/mês
```

### Cenário Otimista

**Dados:**
- 100.000 usuários ativos/mês
- 60% veem anúncios
- 10 posts por sessão
- 4 sessões/mês

**Cálculo:**
```
60.000 usuários × 10 posts × 4 sessões = 2.400.000 visualizações
2.400.000 ÷ 4 = 600.000 impressões de anúncios

Com $8 CPM: 600.000 × $8 / 1000 = $4.800/mês
Com mix de AdSense + próprios: $6.000-8.000/mês
```

---

## Checklist de Implementação

### Fase 1: Preparação (Semana 1)

- [ ] Executar script de criação de tabelas
- [ ] Configurar Google AdSense (se aplicável)
- [ ] Preparar Media Kit
- [ ] Definir política de anúncios

### Fase 2: Teste (Semana 2-3)

- [ ] Adicionar 2-3 anúncios de teste
- [ ] Monitorar métricas
- [ ] Coletar feedback dos usuários
- [ ] Ajustar frequência se necessário

### Fase 3: Escala (Mês 2+)

- [ ] Contatar potenciais anunciantes
- [ ] Implementar sistema de pagamento
- [ ] Criar dashboard de relatórios
- [ ] Otimizar baseado em dados

---

## Recursos Adicionais

### Documentação

- [Google AdSense Help](https://support.google.com/adsense/)
- [IAB Standards](https://www.iab.com/guidelines/)
- [LGPD - Lei Geral de Proteção de Dados](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

### Comunidades

- r/adops (Reddit)
- Digital Point Forums
- Warrior Forum

### Livros Recomendados

- "Google AdSense Secrets" - Joel Comm
- "The AdSense Code" - Joel Comm
- "Monetizing Innovation" - Madhavan Ramanujam

---

## Suporte

Para dúvidas sobre a implementação técnica, consulte:
- Documentação do código em `src/utils/adFrequency.ts`
- Componentes em `components/ads/`
- API em `src/services/api.ts`

**Boa sorte com a monetização! 🚀**

