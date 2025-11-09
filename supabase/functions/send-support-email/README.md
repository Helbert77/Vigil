# 📧 Template de Email de Suporte - Vigil

## 🎨 Design Moderno e Elegante

Este template foi criado com as melhores práticas de design de emails, incluindo:

- ✅ **Design Responsivo** - Funciona perfeitamente em desktop, tablet e mobile
- ✅ **Gradientes Modernos** - Visual atraente com gradientes suaves
- ✅ **Animações Sutis** - Efeitos visuais que chamam atenção
- ✅ **Badges Coloridos** - Identificação visual clara de prioridades e planos
- ✅ **Avatar Dinâmico** - Iniciais do usuário geradas automaticamente
- ✅ **Tipografia Moderna** - Fontes do sistema para melhor compatibilidade
- ✅ **Dark Mode Friendly** - Cores otimizadas para leitura

---

## 📋 Estrutura do Email

### 1. **Header (Cabeçalho)**
- Gradiente roxo/azul moderno
- Logo com emoji 🎫
- Número do ticket destacado
- Efeito de pulso animado no fundo

### 2. **Status Badge**
- Badge verde indicando "Ticket Recebido"
- Ponto piscante para indicar atividade

### 3. **Card de Informações do Usuário**
- Avatar com iniciais do usuário
- Nome completo e email
- Grid 2x2 com:
  - **Plano** (Free, Basic, Pro, Premium) - com cores distintas
  - **Prioridade** (Baixa, Média, Alta) - com indicadores visuais
  - **Categoria** (Técnico, Faturamento, Feature, Outro)
  - **Data/Hora** do ticket

### 4. **Seções de Conteúdo**

#### 📋 Assunto
- Box com gradiente roxo
- Texto destacado em branco

#### 💬 Descrição Detalhada
- Box branco com borda
- Preserva formatação (quebras de linha)
- Texto em cinza escuro para fácil leitura

#### 📎 Anexos (se houver)
- Lista de anexos com ícones
- Nome do arquivo destacado
- Visual limpo e organizado

#### 🖥️ Informações Técnicas
- Box escuro estilo terminal
- Fonte monospace
- User ID, User Agent, Timestamp

### 5. **Footer (Rodapé)**
- Logo Vigil (⚡)
- Texto explicativo
- Instruções para responder

---

## 🎨 Paleta de Cores

### Planos
- **Premium**: Gradiente Dourado (`#fbbf24` → `#f59e0b`)
- **Pro**: Gradiente Roxo (`#8b5cf6` → `#7c3aed`)
- **Basic**: Gradiente Azul (`#3b82f6` → `#2563eb`)
- **Free**: Gradiente Cinza (`#94a3b8` → `#64748b`)

### Prioridades
- **Alta**: Vermelho claro (`#fee2e2` / `#991b1b`)
- **Média**: Amarelo claro (`#fef3c7` / `#92400e`)
- **Baixa**: Verde claro (`#dcfce7` / `#166534`)

### Cores Principais
- **Primário**: `#667eea` (Roxo)
- **Secundário**: `#764ba2` (Roxo escuro)
- **Sucesso**: `#10b981` (Verde)
- **Fundo**: `#f5f5f7` (Cinza muito claro)
- **Texto**: `#1a1a1a` (Preto suave)

---

## 📱 Responsividade

O template se adapta automaticamente para telas menores:

```css
@media only screen and (max-width: 600px) {
  /* Reduz padding */
  /* Ajusta tamanho de fonte */
  /* Muda grid de 2 colunas para 1 */
  /* Otimiza espaçamentos */
}
```

---

## 🚀 Como Usar no Resend.com

### Opção 1: Via API (Atual)
O template já está integrado na Edge Function `send-support-email/index.ts`

### Opção 2: Via Dashboard do Resend

1. **Acesse**: https://resend.com/emails
2. **Clique em** "Create Template"
3. **Cole o HTML** do arquivo `email-template.html`
4. **Teste** enviando um email de exemplo
5. **Salve** o template

### Opção 3: Criar Template Reutilizável

```typescript
// No Resend Dashboard, crie um template chamado "support-ticket"
// Depois use assim:

const { data, error } = await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'support@vigil.app',
  template: 'support-ticket',
  template_data: {
    ticketNumber: 'A1B2C3D4',
    userName: 'João Silva',
    userEmail: 'joao@example.com',
    userPlan: 'premium',
    priority: 'high',
    category: 'technical',
    subject: 'Problema no upload',
    description: 'Descrição detalhada...',
    // ... outros dados
  }
});
```

---

## 🎯 Variáveis Dinâmicas

O template usa as seguintes variáveis do ticket:

```typescript
{
  ticketNumber: string;      // Ex: "A1B2C3D4"
  userName: string;           // Ex: "João Silva"
  userEmail: string;          // Ex: "joao@example.com"
  userPlan: string;           // "free" | "basic" | "pro" | "premium"
  priority: string;           // "low" | "medium" | "high"
  category: string;           // "technical" | "billing" | "feature" | "other"
  subject: string;            // Assunto do ticket
  description: string;        // Descrição detalhada
  userAgent: string;          // Navegador do usuário
  userId: string;             // ID único do usuário
  timestamp: string;          // Data/hora ISO
  attachments?: Array<{       // Anexos (opcional)
    name: string;
    content: string;          // Base64
    type: string;
  }>;
}
```

---

## ✨ Recursos Especiais

### 1. **Avatar Dinâmico**
```typescript
const userInitials = ticket.userName
  .split(' ')
  .map(n => n[0])
  .join('')
  .toUpperCase()
  .slice(0, 2);
// "João Silva" → "JS"
```

### 2. **Classe de Plano Dinâmica**
```typescript
const planClass = {
  premium: 'plan-premium',
  pro: 'plan-pro',
  basic: 'plan-basic',
  free: 'plan-free'
}[ticket.userPlan.toLowerCase()];
```

### 3. **Emojis por Categoria**
```typescript
const categoryEmoji = {
  technical: '🔧',
  billing: '💳',
  feature: '💡',
  other: '📝'
}[ticket.category];
```

---

## 🔧 Personalização

### Mudar Cores Principais
```css
/* Altere no <style> */
.header {
  background: linear-gradient(135deg, #SUA_COR_1 0%, #SUA_COR_2 100%);
}
```

### Mudar Logo
```html
<!-- Altere o emoji ou use uma imagem -->
<div class="logo">
  <img src="https://seu-logo.png" alt="Logo" style="width: 48px;">
</div>
```

### Adicionar Botão de Ação
```html
<a href="https://vigil.app/tickets/${ticketNumber}" 
   style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
  Ver Ticket
</a>
```

---

## 📊 Compatibilidade

✅ **Gmail** (Desktop & Mobile)  
✅ **Outlook** (2016+, 365, Web)  
✅ **Apple Mail** (macOS & iOS)  
✅ **Yahoo Mail**  
✅ **ProtonMail**  
✅ **Thunderbird**  
✅ **Samsung Email**  

---

## 🎓 Boas Práticas Implementadas

1. ✅ **Inline CSS** - Melhor compatibilidade entre clientes de email
2. ✅ **Tabelas evitadas** - Usa divs com flexbox/grid
3. ✅ **Fontes do sistema** - Não depende de fontes externas
4. ✅ **Imagens inline** - Emojis ao invés de imagens externas
5. ✅ **Tamanho otimizado** - HTML minificado em produção
6. ✅ **Acessibilidade** - Contraste adequado e texto legível
7. ✅ **Mobile-first** - Otimizado para telas pequenas

---

## 📝 Exemplo de Uso Completo

```typescript
const emailData = {
  ticketNumber: 'A1B2C3D4',
  userName: 'Helbert Rosa',
  userEmail: 'helbert@example.com',
  userPlan: 'premium',
  priority: 'high',
  category: 'technical',
  subject: 'Erro ao fazer upload de imagem',
  description: 'Quando tento fazer upload, a página trava...',
  userAgent: 'Mozilla/5.0...',
  userId: 'uuid-123',
  timestamp: new Date().toISOString(),
  attachments: [
    {
      name: 'screenshot.png',
      content: 'base64string...',
      type: 'image/png'
    }
  ]
};

// O template irá renderizar automaticamente!
```

---

## 🎉 Resultado Final

O email terá uma aparência **profissional, moderna e elegante**, com:

- 🎨 Design visual atraente
- 📱 Totalmente responsivo
- ⚡ Carregamento rápido
- 🔒 Seguro e confiável
- 💼 Profissional

---

**Criado com ❤️ para o Vigil Support System**

