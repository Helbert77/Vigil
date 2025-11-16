# ⚠️ INSTRUÇÕES URGENTES - EXECUTAR SQL NO SUPABASE

## 🚨 PROBLEMA ATUAL

Os erros que você está vendo acontecem porque **as tabelas e funções SQL não existem no Supabase ainda**.

```
❌ Tabela 'ads' não existe
❌ Tabela 'ad_metrics' não existe  
❌ Funções SQL não existem
```

## ✅ SOLUÇÃO (3 PASSOS SIMPLES)

### **PASSO 1: Acessar o Supabase**

1. Abra seu navegador
2. Vá para: https://supabase.com
3. Faça login
4. Selecione seu projeto: **oprqgllsqtfdyjgvgovo**

---

### **PASSO 2: Abrir o SQL Editor**

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New Query"** (ou "+ New query")

---

### **PASSO 3: Executar o Script**

1. Abra o arquivo: `supabase/sql/EXECUTAR_PRIMEIRO_SETUP_COMPLETO_ANUNCIOS.sql`
2. **Copie TODO o conteúdo** do arquivo (Ctrl+A, Ctrl+C)
3. **Cole** no SQL Editor do Supabase (Ctrl+V)
4. Clique em **"Run"** (ou pressione Ctrl+Enter)
5. Aguarde a execução (deve levar 2-5 segundos)

---

## ✅ VERIFICAÇÃO

Após executar, você deve ver mensagens como:

```
✅ Setup completo executado com sucesso!
✅ Tabela ads criada
✅ Tabela ad_metrics criada
✅ Funções de métricas criadas
✅ RLS configurado
✅ Sistema pronto para uso!
```

---

## 🎯 DEPOIS DE EXECUTAR

1. **Recarregue a página** do seu app (F5)
2. Os erros devem desaparecer
3. Você poderá:
   - ✅ Criar anúncios
   - ✅ Ver lista de anúncios
   - ✅ Ver analytics
   - ✅ Tudo funcionando!

---

## 📋 O QUE O SCRIPT FAZ

### 1. Cria a Tabela `ads`:
```sql
- id (UUID)
- title (TEXT)
- description (TEXT)
- link_url (TEXT)
- image_url (TEXT)
- video_url (TEXT)
- type ('native' | 'adsense')
- status ('active' | 'paused' | 'ended')
- start_date (DATE)
- end_date (DATE)
- budget (NUMERIC)
- advertiser_id (UUID)
- advertiser_name (TEXT)
- advertiser_avatar (TEXT)
- likes_count (INTEGER)
- shares_count (INTEGER)
- views_count (INTEGER)
- comments_count (INTEGER)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### 2. Cria a Tabela `ad_metrics`:
```sql
- id (UUID)
- ad_id (UUID)
- user_id (UUID)
- event_type ('impression' | 'click' | 'like' | 'share' | 'save')
- created_at (TIMESTAMPTZ)
```

### 3. Cria 3 Funções SQL:
```sql
- get_user_ad_metrics(user_id, days)
- get_daily_ad_metrics(user_id, days)
- get_ads_performance(user_id, days)
```

### 4. Configura Segurança (RLS):
```sql
- Usuários só veem seus próprios anúncios
- Apenas o dono pode editar/excluir
- Métricas são públicas para leitura
```

---

## 🆘 SE ALGO DER ERRADO

### Erro: "relation ads already exists"
**Solução:** Tudo bem! Significa que a tabela já existe. Continue usando o app.

### Erro: "permission denied"
**Solução:** Você precisa ser admin do projeto. Verifique suas permissões.

### Erro: "syntax error"
**Solução:** Certifique-se de copiar TODO o conteúdo do arquivo SQL, desde a primeira linha até a última.

---

## 📞 RESUMO RÁPIDO

```bash
1. Acesse: https://supabase.com
2. Projeto: oprqgllsqtfdyjgvgovo
3. Menu: SQL Editor
4. Arquivo: EXECUTAR_PRIMEIRO_SETUP_COMPLETO_ANUNCIOS.sql
5. Copiar TUDO
6. Colar no SQL Editor
7. Clicar em "Run"
8. Recarregar o app (F5)
9. ✅ PRONTO!
```

---

## 🎉 APÓS EXECUTAR

Seu sistema estará **100% funcional**:
- ✅ Criar anúncios com upload de imagem/vídeo
- ✅ Listar todos seus anúncios
- ✅ Ativar/Pausar/Excluir anúncios
- ✅ Ver analytics completo
- ✅ Métricas em tempo real

---

## ⏱️ TEMPO ESTIMADO

- **Copiar/Colar:** 30 segundos
- **Executar SQL:** 5 segundos
- **Recarregar app:** 2 segundos
- **TOTAL:** Menos de 1 minuto! ⚡

---

## 🚀 EXECUTE AGORA!

O sistema está pronto, só falta executar o SQL no Supabase! 🎯

