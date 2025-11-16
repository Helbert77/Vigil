# 🚀 GUIA RÁPIDO - Sistema de Métricas de Anúncios

## ⚡ Início Rápido (3 passos)

### 1️⃣ Executar SQL no Supabase
```
1. Acesse: https://supabase.com
2. Abra: SQL Editor
3. Execute: supabase/sql/create_ad_metrics_functions.sql
```

### 2️⃣ Acessar o Dashboard
```
1. Abra o app
2. Clique em "Analytics" na Sidebar
3. Pronto! 🎉
```

### 3️⃣ Usar o Dashboard
```
1. Selecione o período (7, 30 ou 90 dias)
2. Veja as métricas nos cards
3. Analise o gráfico de performance
4. Verifique a tabela de anúncios
```

## 📊 O que você verá

### Cards Principais (4)
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Impressões  │  Cliques    │ Engajamento │ Custo Total │
│   12.5K     │    450      │    320      │  R$ 150.00  │
│ 👁️          │    🖱️       │    ❤️       │    📈       │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Cards Detalhados (3)
```
┌─────────────┬─────────────┬─────────────┐
│  Curtidas   │Compartilham.│ Salvamentos │
│     250     │     50      │     20      │
└─────────────┴─────────────┴─────────────┘
```

### Gráfico de Performance
```
Impressões ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cliques    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Engajamento━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Tabela de Anúncios
```
┌──────────────┬──────┬────┬─────┬────┬───────┬──────┐
│   Anúncio    │ Imp. │Clic│ CTR │Eng.│ Custo │ CPC  │
├──────────────┼──────┼────┼─────┼────┼───────┼──────┤
│ Anúncio 1    │ 5.2K │ 180│2.5% │ 120│R$50.00│R$0.28│
│ Anúncio 2    │ 7.3K │ 270│3.7% │ 200│R$100  │R$0.37│
└──────────────┴──────┴────┴─────┴────┴───────┴──────┘
```

## 🎯 Métricas Explicadas

| Métrica | O que é | Como calcular |
|---------|---------|---------------|
| **Impressões** | Quantas vezes o anúncio foi visto | COUNT(event_type = 'impression') |
| **Cliques** | Quantas vezes clicaram | COUNT(event_type = 'click') |
| **CTR** | Taxa de cliques | (Cliques / Impressões) × 100 |
| **Engajamento** | Curtidas + Shares + Saves | COUNT(likes + shares + saves) |
| **Taxa de Eng.** | % de engajamento | (Engajamento / Impressões) × 100 |
| **Custo Total** | Soma dos budgets | SUM(budget) |
| **CPC** | Custo por clique | Custo Total / Cliques |

## 🎨 Cores do CTR

```
🟢 Verde  : CTR ≥ 2.0% (Excelente)
🟡 Amarelo: CTR ≥ 1.0% (Bom)
🔴 Vermelho: CTR < 1.0% (Precisa melhorar)
```

## 📁 Arquivos Criados

```
📦 Vigil
├── 📂 components/advertising/
│   ├── AdMetricsCard.tsx         ✅ Card de métricas
│   ├── AdPerformanceChart.tsx    ✅ Gráfico
│   └── AdsPerformanceTable.tsx   ✅ Tabela
│
├── 📂 pages/advertising/
│   └── AdsDashboard.tsx          ✅ Dashboard principal
│
├── 📂 supabase/sql/
│   ├── create_ad_metrics_functions.sql        ✅ Funções SQL
│   └── INSTRUCOES_INSTALACAO_METRICAS.md     ✅ Instruções
│
├── 📂 src/
│   ├── services/api.ts           ✅ +3 funções API
│   └── utils/history.ts          ✅ Rota AdsDashboard
│
├── 📂 components/layout/
│   └── Sidebar.tsx               ✅ Link Analytics
│
├── App.tsx                       ✅ Integração
├── FASE_1_METRICAS_IMPLEMENTADA.md  ✅ Documentação completa
└── GUIA_RAPIDO_METRICAS.md          ✅ Este guia
```

## ⚠️ IMPORTANTE

### Antes de usar:
1. ✅ Execute o SQL no Supabase
2. ✅ Verifique se as funções foram criadas
3. ✅ Certifique-se que a coluna `budget` existe na tabela `ads`

### Para verificar:
```sql
-- Verificar funções
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE 'get_%ad%';

-- Verificar coluna budget
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'ads' AND column_name = 'budget';
```

## 🐛 Problemas Comuns

### Dashboard vazio?
```
✅ Criar alguns anúncios
✅ Registrar métricas na tabela ad_metrics
✅ Verificar período selecionado
```

### Erro "function does not exist"?
```
❌ Funções SQL não foram criadas
✅ Execute o script SQL no Supabase
```

### Gráfico não aparece?
```
❌ Sem dados no período
✅ Selecione período maior (30 ou 90 dias)
✅ Verifique se há métricas registradas
```

## 🎉 Pronto!

Seu sistema de métricas está **100% funcional**!

- ✅ Nada mockado
- ✅ Dados reais do Supabase
- ✅ Atualização em tempo real
- ✅ Design responsivo
- ✅ Tema claro/escuro

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador
2. Verifique os logs do Supabase
3. Consulte `INSTRUCOES_INSTALACAO_METRICAS.md`
4. Consulte `FASE_1_METRICAS_IMPLEMENTADA.md`

---

**Desenvolvido com ❤️ - FASE 1 MVP**

