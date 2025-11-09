# 🎯 Guia de Implementação do Sistema de Suporte

## ✅ O que foi implementado

### 1. **Componentes React**

#### `components/support/SupportModal.tsx`
Modal completo com:
- ✅ Categorias de suporte (Técnico, Faturamento, Feature, Outros)
- ✅ Formulário com validação
- ✅ Upload de anexos (até 5MB)
- ✅ Prioridade automática baseada no plano
- ✅ Informações do sistema incluídas automaticamente
- ✅ Design moderno e responsivo

#### `components/support/SupportButton.tsx`
Botão de suporte com duas variantes:
- **Floating**: Botão flutuante no canto inferior direito (implementado no App)
- **Inline**: Botão para usar em páginas de configurações

### 2. **Backend - Edge Function**

#### `supabase/functions/send-support-email/index.ts`
Função serverless que:
- ✅ Recebe o ticket do frontend
- ✅ Salva no banco de dados
- ✅ Envia email para a equipe de suporte
- ✅ Envia email de confirmação para o usuário
- ✅ Usa Resend API para envio de emails
- ✅ Templates HTML profissionais

### 3. **Banco de Dados**

#### `CRIAR_TABELA_SUPPORT.sql`
Tabela `support_tickets` com:
- ✅ Todas as informações do ticket
- ✅ RLS (Row Level Security) configurado
- ✅ Políticas para usuários e admins
- ✅ Índices para performance
- ✅ Triggers para updated_at

### 4. **API Integration**

#### `src/services/api.ts`
- ✅ Função `submitSupportTicket` adicionada
- ✅ Integração com Supabase Edge Functions

---

## 🚀 Como Configurar

### Passo 1: Criar Tabela no Supabase

1. Abra o SQL Editor: https://supabase.com/dashboard/project/oprqgllsqtfdyjgvgovo/sql/new
2. Copie e cole o conteúdo de `CRIAR_TABELA_SUPPORT.sql`
3. Execute o SQL
4. Verifique se a tabela foi criada com sucesso

### Passo 2: Configurar Resend (Serviço de Email)

1. Crie uma conta em https://resend.com (grátis para até 3.000 emails/mês)
2. Verifique seu domínio ou use o domínio de teste
3. Obtenha sua API Key
4. Configure no Supabase:
   ```bash
   # No terminal, com Supabase CLI instalado:
   supabase secrets set RESEND_API_KEY=re_seu_token_aqui
   ```

### Passo 3: Deploy da Edge Function

```bash
# No terminal, na raiz do projeto:
supabase functions deploy send-support-email
```

### Passo 4: Configurar Email de Suporte

Edite `supabase/functions/send-support-email/index.ts`:
```typescript
const SUPPORT_EMAIL = 'seu-email@vigil.app'; // Altere para seu email real
```

### Passo 5: Configurar Email do Usuário

Edite `components/support/SupportButton.tsx`:
```typescript
userEmail: user.username + '@vigil.app', // Ajuste conforme seu sistema
// Se você tem email real no perfil, use: user.email
```

---

## 💡 Como Usar

### Para Usuários

1. **Botão Flutuante** aparece automaticamente para usuários Basic, Pro e Premium
2. Clique no botão no canto inferior direito
3. Preencha o formulário:
   - Escolha a categoria
   - Escreva o assunto
   - Descreva o problema em detalhes
   - Anexe arquivos se necessário (opcional)
4. Clique em "Enviar Ticket"
5. Receba confirmação por email

### Para Adicionar em Outras Páginas

```tsx
import SupportButton from '@/components/support/SupportButton';

// Em qualquer página:
<SupportButton user={currentUser} variant="inline" />
```

---

## 📧 Emails Enviados

### 1. Email para a Equipe de Suporte
- ✅ Design profissional
- ✅ Todas as informações do ticket
- ✅ Prioridade destacada
- ✅ Informações técnicas (User Agent, etc)
- ✅ Reply-to configurado para o email do usuário

### 2. Email de Confirmação para o Usuário
- ✅ Confirmação de recebimento
- ✅ Número do ticket
- ✅ Tempo estimado de resposta
- ✅ Design amigável

---

## 🎨 Personalização

### Cores e Estilo
Todos os componentes usam as classes Tailwind do projeto, então se adaptam automaticamente ao tema dark/light.

### Categorias
Para adicionar/remover categorias, edite `SupportModal.tsx`:
```typescript
const categories = [
  { value: 'technical', label: '🔧 Suporte Técnico', description: '...' },
  // Adicione mais aqui
];
```

### Prioridade
A prioridade é definida automaticamente:
- **High**: Usuários Pro e Premium
- **Medium**: Usuários Basic
- **Low**: Usuários Free (se você permitir)

---

## 🔒 Segurança

- ✅ RLS habilitado - usuários só veem seus próprios tickets
- ✅ Validação de tamanho de arquivos (máx 5MB)
- ✅ Validação de tipos de arquivo
- ✅ Sanitização de inputs
- ✅ CORS configurado corretamente

---

## 📊 Painel Admin (Futuro)

Você pode criar um painel para visualizar e responder tickets:

```tsx
// Exemplo de query para listar tickets
const { data: tickets } = await supabase
  .from('support_tickets')
  .select('*')
  .order('created_at', { ascending: false });
```

---

## 💰 Custos

### Resend (Email)
- **Grátis**: 3.000 emails/mês
- **Pro**: $20/mês para 50.000 emails

### Supabase Edge Functions
- **Grátis**: 500.000 invocações/mês
- Mais que suficiente para suporte

---

## 🐛 Troubleshooting

### Erro: "Failed to send email"
- Verifique se a RESEND_API_KEY está configurada
- Verifique se o domínio está verificado no Resend

### Erro: "Permission denied"
- Execute o SQL para criar a tabela
- Verifique as políticas RLS

### Botão não aparece
- Verifique se o usuário tem plano Basic, Pro ou Premium
- Verifique se o import está correto

---

## 🎉 Pronto!

O sistema está completo e pronto para uso. Os usuários Pro e Basic agora têm acesso a suporte prioritário via email! 🚀

