<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1a4I4Aq3RDhSjDAFtIgooKuzm6BPjFiTH

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Integração MCP Stripe

### Obter a Chave Secreta do Stripe

⚠️ **IMPORTANTE**: Você precisa de uma **Secret key** (não uma chave de usuário).

1. Acesse: https://dashboard.stripe.com/apikeys
2. Certifique-se de estar no modo **Test** (toggle no canto superior direito)
3. Na seção **Secret keys**, clique em **Reveal test key** ou **Create secret key**
4. Copie a chave que começa com `sk_test_` (para testes) ou `sk_live_` (para produção)

❌ **NÃO use chaves que começam com `sk-user-`** - essas são chaves de usuário, não chaves de API.

### Configuração

1. **Opção 1: Via arquivo `.cursor/mcp.json`** (recomendado)
   - Edite o arquivo `.cursor/mcp.json`
   - Substitua `<SUBSTITUA_PELA_SUA_STRIPE_SECRET_KEY>` pela sua chave secreta (começa com `sk_test_` ou `sk_live_`)
   - Se usar contas conectadas, também preencha `STRIPE_ACCOUNT_ID`

2. **Opção 2: Via variável de ambiente**
   - **Windows (PowerShell):**
     ```powershell
     $env:STRIPE_SECRET_KEY = "sk_test_xxx"
     ```
   - **macOS/Linux (bash/zsh):**
     ```bash
     export STRIPE_SECRET_KEY="sk_test_xxx"
     ```

### Uso

1. **Para testar a configuração:**
   ```bash
   npm run mcp:stripe
   ```
   O script validará sua chave e iniciará o servidor MCP. Se houver erro, ele mostrará instruções claras.

2. **No Cursor:**
   - Abra o Cursor neste repositório
   - O Cursor detectará automaticamente `.cursor/mcp.json`
   - O servidor `stripe` aparecerá na aba **MCP Servers**
   - Reinicie o Cursor se o servidor não aparecer imediatamente

### Como Usar o MCP Stripe no Cursor

Após configurar, você pode interagir com o Stripe diretamente pelo chat do Cursor. Aqui estão exemplos práticos:

#### 📊 **Visualizar Dados Existentes**

Você pode pedir ao Cursor para consultar dados do Stripe usando linguagem natural:

- **"Liste todos os clientes do Stripe"**
- **"Mostre os últimos 10 clientes criados"**
- **"Quais são os produtos cadastrados no Stripe?"**
- **"Liste todas as assinaturas ativas"**
- **"Mostre o saldo atual da conta Stripe"**
- **"Quais são as invoices não pagas?"**
- **"Liste todos os preços cadastrados"**

#### ➕ **Criar Novos Recursos**

Você pode pedir para criar recursos diretamente:

- **"Crie um novo cliente no Stripe com nome 'João Silva' e email 'joao@exemplo.com'"**
- **"Crie um produto chamado 'Plano Premium' com descrição 'Acesso completo'"**
- **"Crie um preço de $19.99 mensal para o produto X"**
- **"Crie um link de pagamento para o preço Y com quantidade 1"**
- **"Crie um cupom de desconto de 20% chamado 'PROMO20'"**
- **"Crie uma invoice para o cliente Z com o preço W"**

#### 🔍 **Consultar Informações Específicas**

- **"Busque o cliente com email 'usuario@exemplo.com'"**
- **"Mostre os detalhes do produto 'prod_xxxxx'"**
- **"Quais são os detalhes da assinatura 'sub_xxxxx'?"**
- **"Mostre o status do payment intent 'pi_xxxxx'"**

#### 📚 **Buscar Documentação**

- **"Como criar um link de pagamento no Stripe?"**
- **"Qual é a melhor prática para gerenciar assinaturas?"**
- **"Como processar reembolsos no Stripe?"**

#### 🔄 **Gerenciar Recursos**

- **"Atualize a assinatura 'sub_xxxxx' para cancelar"**
- **"Atualize a invoice 'in_xxxxx' para finalizar"**
- **"Crie um reembolso para o payment intent 'pi_xxxxx'"**
- **"Atualize a disputa 'dp_xxxxx' com evidências"**

#### 💡 **Dicas de Uso**

1. **Seja específico**: Quanto mais detalhes você fornecer, melhor será o resultado
   - ✅ "Crie um cliente com nome 'Maria', email 'maria@exemplo.com' e telefone '+5511999999999'"
   - ❌ "Crie um cliente"

2. **Use IDs quando necessário**: Para operações em recursos existentes, forneça o ID
   - ✅ "Atualize a assinatura sub_1ABC123..."
   - ❌ "Atualize a assinatura"

3. **Combine operações**: Você pode pedir múltiplas ações em uma única mensagem
   - "Crie um produto 'Plano Básico', depois crie um preço mensal de $9.99 para ele"

#### 🛠️ **Ferramentas Disponíveis**

O MCP Stripe oferece acesso a estas ferramentas:

- ✅ **Clientes**: Criar, listar e consultar clientes
- ✅ **Produtos**: Criar e listar produtos
- ✅ **Preços**: Criar e listar preços
- ✅ **Assinaturas**: Consultar e atualizar assinaturas
- ✅ **Invoices**: Criar, listar e atualizar faturas
- ✅ **Payment Links**: Criar links de pagamento
- ✅ **Cupons**: Criar e listar cupons de desconto
- ✅ **Reembolsos**: Criar reembolsos
- ✅ **Payment Intents**: Consultar intenções de pagamento
- ✅ **Disputas**: Consultar e atualizar disputas
- ✅ **Saldo**: Consultar saldo da conta
- ✅ **Documentação**: Buscar na documentação oficial do Stripe

#### 📝 **Exemplo Completo de Fluxo**

```
Você: "Crie um produto chamado 'Vigil Pro' com descrição 'Plano profissional do Vigil'"

Cursor: [Cria o produto e retorna o ID]

Você: "Agora crie um preço mensal de $8.99 para esse produto"

Cursor: [Cria o preço e retorna o ID]

Você: "Crie um link de pagamento para esse preço"

Cursor: [Cria o link de pagamento e retorna a URL]
```

### Troubleshooting

- **Erro "API key must start with sk_ or rk_"**: Você está usando uma chave inválida. Obtenha uma Secret key em https://dashboard.stripe.com/apikeys
- **Erro "sk-user-"**: Essa é uma chave de usuário, não uma chave de API. Use uma Secret key.
- **Servidor não aparece no Cursor**: Verifique se `.cursor/mcp.json` está na raiz do projeto e reinicie o Cursor.

### Documentação

- Documentação oficial do Stripe MCP: https://docs.stripe.com/mcp
- Stripe Dashboard: https://dashboard.stripe.com
