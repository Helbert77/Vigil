# 📊 Instruções de Instalação - Sistema de Métricas de Anúncios

## ⚠️ IMPORTANTE - Executar no Supabase

Para que o sistema de métricas funcione corretamente, você **DEVE** executar o script SQL no Supabase.

## 🚀 Passos para Instalação

### 1. Acessar o Supabase
1. Faça login no [Supabase](https://supabase.com)
2. Selecione seu projeto
3. Vá para **SQL Editor** no menu lateral

### 2. Executar o Script SQL
1. Abra o arquivo `create_ad_metrics_functions.sql` nesta pasta
2. Copie **TODO** o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione Ctrl+Enter)

### 3. Verificar a Instalação
Execute este comando no SQL Editor para verificar se as funções foram criadas:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_user_ad_metrics', 'get_daily_ad_metrics', 'get_ads_performance');
```

Você deve ver 3 funções listadas.

### 4. Verificar a Coluna Budget
Execute este comando para verificar se a coluna `budget` foi adicionada:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ads' AND column_name = 'budget';
```

## ✅ O que foi Criado

### Funções SQL:
1. **`get_user_ad_metrics`** - Retorna métricas agregadas de todos os anúncios
2. **`get_daily_ad_metrics`** - Retorna métricas diárias para gráficos
3. **`get_ads_performance`** - Retorna performance individual de cada anúncio

### Alterações na Tabela:
- Adicionada coluna `budget` na tabela `ads` (tipo NUMERIC, padrão 0)

## 🎯 Funcionalidades Implementadas

### Componentes:
- ✅ `AdMetricsCard` - Card reutilizável para exibir métricas
- ✅ `AdPerformanceChart` - Gráfico de performance diária
- ✅ `AdsPerformanceTable` - Tabela com performance por anúncio

### Página:
- ✅ `AdsDashboard` - Dashboard completo de analytics

### API:
- ✅ `fetchUserAdMetrics()` - Busca métricas agregadas
- ✅ `fetchDailyAdMetrics()` - Busca métricas diárias
- ✅ `fetchAdsPerformance()` - Busca performance por anúncio

### Navegação:
- ✅ Rota `/ads-dashboard` adicionada
- ✅ Link "Analytics" na Sidebar
- ✅ Integração completa no App.tsx

## 📈 Métricas Disponíveis

### Métricas Principais:
- **Impressões** - Total de visualizações
- **Cliques** - Total de cliques
- **CTR** - Click-Through Rate (Taxa de Cliques)
- **Engajamento** - Curtidas + Compartilhamentos + Salvamentos
- **Taxa de Engajamento** - Engajamento / Impressões
- **Custo Total** - Soma dos budgets dos anúncios
- **CPC** - Custo Por Clique

### Métricas Detalhadas:
- Curtidas
- Compartilhamentos
- Salvamentos

### Gráfico:
- Performance diária (Impressões, Cliques, Engajamento)

### Tabela:
- Performance individual por anúncio
- Métricas completas de cada campanha

## 🔧 Troubleshooting

### Erro: "function get_user_ad_metrics does not exist"
**Solução**: Execute o script SQL no Supabase conforme instruções acima.

### Erro: "column budget does not exist"
**Solução**: Execute o script SQL que adiciona a coluna budget.

### Dashboard vazio
**Possíveis causas**:
1. Nenhum anúncio ativo no período selecionado
2. Tabela `ad_metrics` sem dados
3. Funções SQL não foram criadas

**Solução**: Verifique se as funções SQL foram criadas e se existem anúncios ativos.

## 📝 Notas Importantes

1. **Nada está mockado** - Todas as métricas são reais e vêm do Supabase
2. **Período configurável** - 7, 30 ou 90 dias
3. **Atualização automática** - Métricas são atualizadas ao mudar o período
4. **Performance otimizada** - Funções SQL agregam dados no servidor
5. **Tratamento de erros** - Sistema retorna valores zerados em caso de erro

## 🎨 Interface

- Design responsivo (mobile e desktop)
- Tema claro e escuro
- Gráficos interativos (recharts)
- Loading states
- Estados vazios informativos

## 🚀 Próximas Fases

Este é o **MVP (Fase 1)**. Próximas implementações incluirão:
- Detalhes individuais de anúncios
- Filtros avançados
- Exportação de relatórios
- Comparação de períodos
- Métricas de conversão

