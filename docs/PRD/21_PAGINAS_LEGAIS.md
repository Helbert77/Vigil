# 21 - Páginas Legais e Políticas

## 📋 Identificação

| Campo | Valor |
|-------|-------|
| **Nome** | Páginas Legais e Políticas Vigil |
| **Versão** | 1.0.0 |
| **Data** | 24/01/2026 |
| **Responsável** | Equipe de Desenvolvimento Vigil |
| **Tipo** | PRD - Compliance e Legal |

---

## 🎯 Visão Geral

### Descrição
Conjunto de páginas estáticas que apresentam políticas, termos e compromissos legais do Vigil, garantindo transparência e conformidade com legislações nacionais e internacionais.

### Objetivo e Propósito
- **Transparência**: Comunicação clara sobre uso de dados
- **Compliance**: Conformidade com LGPD, GDPR, CCPA
- **Proteção**: Definição de direitos e responsabilidades
- **Acessibilidade**: Compromisso com inclusão digital
- **Confiança**: Construção de credibilidade com usuários

---

## 🏗️ Arquitetura Técnica

### Páginas Implementadas

| Página | Arquivo | Rota | Propósito |
|--------|---------|------|-----------|
| Política de Privacidade | `PrivacyPolicy.tsx` | `/privacy` | Uso de dados pessoais |
| Termos de Serviço | `TermsOfService.tsx` | `/terms` | Regras de uso da plataforma |
| Política de Cookies | `CookiePolicy.tsx` | `/cookies` | Uso de cookies e tracking |
| Acessibilidade | `Accessibility.tsx` | `/accessibility` | Compromisso com inclusão |
| Aviso Legal | `Disclaimer.tsx` | `/disclaimer` | Isenções de responsabilidade |

### Estrutura Comum

Todas as páginas seguem o mesmo padrão:

```typescript
const PageName: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl md:text-3xl font-bold mb-6">Título</h1>
      <Card>
        <div className="p-6">
          {/* Conteúdo da política */}
        </div>
      </Card>
    </div>
  );
};
```

---

## ⚙️ Funcionalidades Detalhadas

### 1. Política de Privacidade (`/privacy`)

**Seções Principais:**
- **Introdução**: Compromisso com privacidade
- **Dados Coletados**: 
  - Dados de cadastro (nome, email, senha)
  - Dados de perfil (bio, avatar, localização)
  - Dados de uso (posts, likes, comentários)
  - Dados técnicos (IP, device, browser)
- **Uso dos Dados**:
  - Funcionamento da plataforma
  - Personalização de experiência
  - Comunicação com usuários
  - Análise e melhorias
- **Compartilhamento**:
  - Não vendemos dados
  - Compartilhamento apenas com consentimento
  - Parceiros de serviço (Stripe, Supabase)
- **Direitos do Usuário**:
  - Acesso aos dados
  - Correção de dados
  - Exclusão de conta
  - Portabilidade
- **Segurança**: Medidas de proteção
- **Cookies**: Referência à política específica
- **Contato**: suporte@myvigil.co

**Conformidade:**
- ✅ LGPD (Lei Geral de Proteção de Dados - Brasil)
- ✅ GDPR (General Data Protection Regulation - Europa)
- ✅ CCPA (California Consumer Privacy Act - EUA)

### 2. Termos de Serviço (`/terms`)

**Seções Principais:**
- **Aceitação dos Termos**: Concordância obrigatória
- **Elegibilidade**: Idade mínima (13 anos)
- **Conta de Usuário**:
  - Responsabilidade por credenciais
  - Proibição de múltiplas contas
  - Suspensão por violação
- **Conteúdo do Usuário**:
  - Propriedade intelectual
  - Licença de uso ao Vigil
  - Responsabilidade por conteúdo publicado
- **Conduta Proibida**:
  - Spam, assédio, discurso de ódio
  - Conteúdo ilegal ou prejudicial
  - Manipulação de métricas
  - Uso de bots ou automação
- **Propriedade Intelectual**: Direitos do Vigil
- **Planos Pagos**: Termos de assinatura
- **Cancelamento**: Política de reembolso
- **Limitação de Responsabilidade**: Isenções legais
- **Modificações**: Direito de alterar termos
- **Lei Aplicável**: Jurisdição brasileira

### 3. Política de Cookies (`/cookies`)

**Seções Principais:**
- **O que são Cookies**: Explicação técnica
- **Tipos de Cookies Utilizados**:
  - **Essenciais**: Autenticação, sessão
  - **Funcionais**: Preferências, tema
  - **Analytics**: Google Analytics, métricas de uso
  - **Publicidade**: AdSense (se aplicável)
- **Cookies de Terceiros**:
  - Stripe: Pagamentos
  - Supabase: Autenticação
  - Google: Analytics e AdSense
- **Gerenciamento**:
  - Como desabilitar cookies
  - Impacto na experiência
  - Configurações do navegador
- **Duração**: Tempo de vida de cada cookie
- **Atualização**: Data da última revisão

**Cookies Específicos:**
```typescript
// Cookies essenciais
sb-access-token: 'Autenticação Supabase',
sb-refresh-token: 'Renovação de sessão',

// Cookies funcionais
vigil-theme: 'Tema claro/escuro',
vigil-language: 'Idioma preferido',

// Cookies de analytics
_ga: 'Google Analytics',
_gid: 'Google Analytics ID',
```

### 4. Acessibilidade (`/accessibility`)

**Seções Principais:**
- **Compromisso**: Declaração de acessibilidade
- **Conformidade com Padrões**:
  - WCAG 2.1 Nível AA
  - Seção 508
  - EN 301 549
  - Lei Brasileira de Inclusão (LBI)
- **Recursos Implementados**:
  - Navegação por teclado
  - Suporte a leitores de tela
  - Contraste adequado
  - Textos alternativos
  - Legendas em vídeos
  - Redimensionamento de texto
- **Tecnologias Assistivas Suportadas**:
  - NVDA
  - JAWS
  - VoiceOver
  - TalkBack
- **Limitações Conhecidas**: Áreas em desenvolvimento
- **Feedback**: Como reportar problemas de acessibilidade
- **Melhorias Contínuas**: Roadmap de acessibilidade

**Recursos Técnicos:**
- ARIA labels em todos os elementos interativos
- Landmarks semânticos (header, nav, main, footer)
- Skip links para navegação rápida
- Focus visible em todos os elementos
- Contraste mínimo 4.5:1 (texto normal)
- Contraste mínimo 3:1 (texto grande)

### 5. Aviso Legal (`/disclaimer`)

**Seções Principais:**
- **Natureza do Conteúdo**: Plataforma de compartilhamento
- **Responsabilidade do Usuário**: Conteúdo gerado por usuários
- **Verificação**: Vigil não verifica veracidade de teorias
- **Isenção de Garantias**: Uso por conta e risco
- **Limitação de Responsabilidade**: Danos indiretos
- **Conteúdo de Terceiros**: Links externos
- **Moderação**: Esforços de moderação, mas sem garantia
- **Uso Educacional**: Propósito de discussão e debate
- **Não é Aconselhamento**: Não substitui profissionais
- **Mudanças**: Direito de modificar sem aviso prévio

---

## 📏 Regras de Negócio

### Exibição de Políticas
- **Sempre Visível**: Links no footer de todas as páginas
- **Onboarding**: Aceite obrigatório no cadastro
- **Atualização**: Notificação quando políticas mudam
- **Histórico**: Versões anteriores disponíveis (futuro)

### Aceite de Termos
```typescript
interface UserConsent {
  user_id: string;
  terms_version: string;
  privacy_version: string;
  cookies_accepted: boolean;
  accepted_at: timestamp;
  ip_address: string;
}
```

### Idade Mínima
- **Brasil**: 13 anos (com consentimento parental)
- **Europa**: 16 anos (GDPR)
- **EUA**: 13 anos (COPPA)
- **Verificação**: Data de nascimento no cadastro

---

## 💡 Casos de Uso Práticos

### Cenário 1: Novo Usuário
1. **Usuário** acessa página de registro
2. **Sistema** exibe checkbox de aceite de termos
3. **Usuário** clica em "Termos de Serviço"
4. **Sistema** abre página em nova aba
5. **Usuário** lê e retorna
6. **Usuário** marca checkbox
7. **Sistema** permite prosseguir com cadastro

### Cenário 2: Atualização de Política
1. **Admin** atualiza Política de Privacidade
2. **Sistema** incrementa versão (1.1.0)
3. **Sistema** notifica todos os usuários ativos
4. **Usuário** recebe notificação no app
5. **Usuário** clica para ver mudanças
6. **Sistema** destaca alterações
7. **Usuário** aceita nova versão

### Cenário 3: Solicitação de Dados (LGPD)
1. **Usuário** solicita cópia de seus dados
2. **Sistema** gera arquivo JSON
3. **Sistema** envia por email criptografado
4. **Usuário** baixa e visualiza dados
5. **Usuário** pode solicitar correções ou exclusão

---

## 🎨 Interface e Design

### Layout Padrão
- **Container**: Max-width 4xl (896px)
- **Padding**: 6 (24px) em todos os lados
- **Card**: Fundo branco/escuro com border
- **Typography**: 
  - H1: 3xl (30px) em desktop, xl (20px) em mobile
  - H2: 2xl (24px)
  - H3: xl (20px)
  - Texto: base (16px)
  - Texto pequeno: sm (14px)

### Hierarquia Visual
```
┌─────────────────────────────────────┐
│ [Ícone]                             │
│ Título Principal                    │
│ Data de atualização                 │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 1. Seção Principal              │ │
│ │    Conteúdo...                  │ │
│ │                                 │ │
│ │ 2. Segunda Seção                │ │
│ │    • Item 1                     │ │
│ │    • Item 2                     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Elementos Visuais
- **Ícones**: Específicos para cada página
- **Listas**: Bullets ou numeradas conforme contexto
- **Destaque**: Bold para termos importantes
- **Links**: Cor primary com underline no hover
- **Tabelas**: Para comparações (ex: planos)

---

## ♿ Acessibilidade

### Implementações Específicas
- **Linguagem Clara**: Texto em português simples
- **Estrutura Semântica**: H1 > H2 > H3 hierárquico
- **Contraste**: Textos atendem WCAG AA
- **Navegação**: Tabindex lógico
- **Landmarks**: Sections com aria-label

### Leitores de Tela
```html
<section aria-label="Política de Privacidade">
  <h1>Política de Privacidade</h1>
  <p>Última atualização: <time datetime="2026-01-24">24 de janeiro de 2026</time></p>
</section>
```

---

## 🧪 Testes

### Casos de Teste

#### TC-LEG-001: Acesso a Política
1. Clicar em link "Privacidade" no footer
2. **Esperado**: Página carrega em < 1s, conteúdo completo visível

#### TC-LEG-002: Responsividade
1. Acessar política em mobile
2. Redimensionar para tablet
3. Redimensionar para desktop
4. **Esperado**: Layout adapta corretamente em todos os tamanhos

#### TC-LEG-003: Modo Escuro
1. Ativar modo escuro
2. Acessar cada página legal
3. **Esperado**: Contraste adequado, texto legível

#### TC-LEG-004: Navegação
1. Usar apenas teclado (Tab)
2. Navegar por toda a página
3. **Esperado**: Todos os links acessíveis, ordem lógica

#### TC-LEG-005: Impressão
1. Abrir política
2. Ctrl+P para imprimir
3. **Esperado**: Layout otimizado para impressão

---

## 📊 Métricas

### Métricas de Acesso
- **Pageviews**: Visitas a cada política
- **Tempo de Leitura**: Tempo médio na página
- **Taxa de Rejeição**: % que sai imediatamente
- **Origem**: De onde usuários acessam (footer, onboarding, etc)

### Métricas de Compliance
- **Taxa de Aceite**: % de usuários que aceitam termos
- **Solicitações LGPD**: Número de pedidos de dados
- **Exclusões**: Contas deletadas por mês
- **Reclamações**: Problemas reportados

---

## 🔗 Integrações

### Links Internos
- **Footer**: Todas as páginas linkadas
- **Onboarding**: Termos e Privacidade no registro
- **Configurações**: Link para políticas
- **Suporte**: Referência às políticas

### Links Externos
- **Legislação**: Links para textos de leis (LGPD, GDPR)
- **Autoridades**: Links para órgãos reguladores
- **Recursos**: Links para mais informações

---

## 📏 Regras de Negócio

### Versionamento
- **Formato**: Semantic Versioning (1.0.0)
- **Major**: Mudanças significativas que requerem novo aceite
- **Minor**: Melhorias e esclarecimentos
- **Patch**: Correções de texto e formatação

### Notificação de Mudanças
- **Major**: Notificação obrigatória + novo aceite
- **Minor**: Notificação informativa
- **Patch**: Sem notificação

### Histórico
```sql
CREATE TABLE policy_versions (
  id UUID PRIMARY KEY,
  policy_type TEXT, -- 'privacy', 'terms', 'cookies'
  version TEXT,
  content TEXT,
  effective_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_policy_consents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  policy_type TEXT,
  version TEXT,
  accepted_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);
```

---

## 🚀 Roadmap

### Próximas Funcionalidades
- **Histórico de Versões**: Visualizar mudanças ao longo do tempo
- **Diff Viewer**: Comparação entre versões
- **PDF Export**: Download de políticas em PDF
- **Multilíngue**: Tradução para inglês e espanhol
- **Busca**: Buscar termos específicos nas políticas
- **FAQ**: Perguntas frequentes sobre cada política
- **Vídeos Explicativos**: Resumos em vídeo
- **Chatbot Legal**: IA para responder dúvidas

### Melhorias de UX
- **Índice Flutuante**: Navegação rápida entre seções
- **Destaque de Mudanças**: Highlight em texto alterado
- **Modo Leitura**: Versão simplificada sem distrações
- **Estimativa de Tempo**: "Leitura de 5 minutos"
- **Progresso**: Barra de progresso de leitura

---

## 🔒 Segurança e Compliance

### Auditoria
- **Logs**: Registro de todos os aceites
- **IP Tracking**: Endereço IP no momento do aceite
- **Timestamp**: Data e hora exatas
- **User Agent**: Navegador e dispositivo

### Proteção Legal
- **Arbitragem**: Cláusula de resolução de disputas
- **Jurisdição**: Lei brasileira aplicável
- **Foro**: Comarca de São Paulo
- **Idioma**: Português como idioma oficial

### Atualizações Legais
- **Revisão Trimestral**: Advogado revisa políticas
- **Compliance Check**: Verificação de conformidade
- **Benchmark**: Comparação com concorrentes
- **Atualização Legislativa**: Acompanhamento de novas leis

---

## 📞 Contatos Legais

### Para Questões de Privacidade
- **Email**: privacidade@myvigil.co
- **DPO**: Encarregado de Proteção de Dados

### Para Questões Legais
- **Email**: legal@myvigil.co
- **Endereço**: [Endereço da empresa]

### Para Solicitações LGPD
- **Portal**: myvigil.co/lgpd
- **Email**: lgpd@myvigil.co
- **Prazo de Resposta**: 15 dias úteis

---

**Próximo Documento**: [22 - Analytics e Relatórios](22_ANALYTICS.md) (a criar)
**Documento Anterior**: [20 - Sistema de Suporte](20_SUPORTE.md)
