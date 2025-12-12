# 12 - Timeline Histórica Interativa

## 📋 Identificação

| Campo | Valor |
|-------|-------|
| **Nome** | Timeline Histórica Interativa Vigil |
| **Versão** | 1.0.0 |
| **Data** | 12/12/2024 |
| **Responsável** | Equipe de Desenvolvimento Vigil |
| **Tipo** | PRD - Funcionalidade Avançada |

---

## 🎯 Visão Geral

### Descrição
A Timeline Histórica é uma funcionalidade única que apresenta eventos históricos de forma interativa e cronológica, permitindo que usuários explorem conexões entre acontecimentos, votem na relevância de eventos e contribuam com novos dados históricos. É uma das principais diferenciações do Vigil no mercado.

### Objetivo e Propósito
- **Educação Histórica**: Apresentar eventos de forma contextualizada
- **Interatividade**: Permitir exploração e descoberta de conexões
- **Colaboração**: Usuários podem contribuir com novos eventos
- **Gamificação**: Sistema de votos e validação comunitária
- **Diferenciação**: Funcionalidade única no mercado de redes sociais

### Público-Alvo
- **Todos os Usuários**: Acesso à visualização da timeline
- **Usuários Autenticados**: Podem votar e interagir
- **Usuários Pro+**: Podem sugerir novos eventos
- **Moderadores**: Aprovam novos eventos históricos

---

## 🏗️ Arquitetura Técnica

### Componentes Principais
- **Timeline.tsx** - Página principal da timeline
- **TimelineEvent.tsx** - Componente de evento individual
- **useTimelineEvents.ts** - Hook de gerenciamento de estado
- **useTimelineModeration.ts** - Hook para moderação

### Estrutura de Dados
```typescript
interface TimelineEvent {
  id: string;
  title: string;
  year: number;
  category: 'politics' | 'science' | 'health' | 'religion' | 'technology' | 'society';
  description?: string;
  country?: string;
  parent_id?: string;
  x_position: number;
  y_position: number;
  children_ids?: string[];
  source_1?: string;
  source_2?: string;
  event_date?: string;
  image_url?: string;
  upvotes?: number;
  downvotes?: number;
  user_votes?: { [userId: string]: 'up' | 'down' };
}

interface TimelineModerationQueueItem {
  id: string;
  title: string;
  year: number;
  category: string;
  description?: string;
  author_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  rejection_reason?: string;
}
```

---

## ⚙️ Funcionalidades Detalhadas

### 1. Visualização Interativa
- **Interface Cronológica**: Eventos organizados por ano/década
- **Categorização**: Filtros por política, ciência, saúde, etc.
- **Navegação Fluida**: Zoom e pan para explorar períodos
- **Conexões Visuais**: Links entre eventos relacionados

### 2. Sistema de Votação
- **Upvotes/Downvotes**: Validação comunitária da relevância
- **Ranking**: Eventos mais votados ganham destaque
- **Prevenção de Spam**: Limite de votos por usuário
- **Histórico**: Tracking de votos por usuário

### 3. Contribuição de Conteúdo
- **Sugestão de Eventos**: Usuários Pro+ podem sugerir
- **Formulário Estruturado**: Campos obrigatórios e opcionais
- **Fontes**: Obrigatório incluir pelo menos uma fonte
- **Fila de Moderação**: Aprovação antes da publicação

### 4. Moderação e Qualidade
- **Fila de Aprovação**: Moderadores revisam sugestões
- **Critérios de Qualidade**: Guidelines para aprovação
- **Feedback**: Razões para rejeição de eventos
- **Curadoria**: Manutenção da qualidade do conteúdo

---

## 📏 Regras de Negócio

### Acesso e Permissões
- **Visualização**: Todos os usuários (incluindo não autenticados)
- **Votação**: Apenas usuários autenticados
- **Sugestões**: Usuários Pro e Premium
- **Moderação**: Moderadores e Administradores

### Critérios de Aprovação
- **Relevância Histórica**: Evento deve ter impacto significativo
- **Fontes Confiáveis**: Pelo menos uma fonte verificável
- **Neutralidade**: Descrição imparcial e factual
- **Originalidade**: Não duplicar eventos existentes

### Sistema de Votação
- **Um voto por usuário por evento**
- **Mudança de voto permitida**
- **Peso igual**: Todos os votos têm mesmo valor
- **Transparência**: Contadores visíveis publicamente

---

## 💡 Casos de Uso Práticos

### Cenário 1: Exploração histórica
1. **Usuário** acessa Timeline
2. **Sistema** exibe eventos por década
3. **Usuário** navega para período específico (ex: 1960s)
4. **Sistema** mostra eventos relevantes da década
5. **Usuário** clica em evento para ver detalhes
6. **Sistema** exibe informações completas e conexões

### Cenário 2: Contribuição de evento
1. **Usuário Pro** identifica evento histórico ausente
2. **Usuário** clica "Sugerir Evento"
3. **Sistema** abre formulário de contribuição
4. **Usuário** preenche dados e fontes
5. **Sistema** envia para fila de moderação
6. **Moderador** revisa e aprova/rejeita
7. **Se aprovado**, evento aparece na timeline

### Cenário 3: Validação comunitária
1. **Usuário** vê evento controverso na timeline
2. **Usuário** avalia relevância e precisão
3. **Usuário** vota up/down baseado na qualidade
4. **Sistema** atualiza ranking do evento
5. **Eventos bem avaliados** ganham mais destaque
6. **Eventos mal avaliados** podem ser revisados

---

## 🚀 Roadmap e Melhorias Futuras

### Próximas Funcionalidades
- **Timeline Pessoal**: Usuários podem criar suas próprias timelines
- **Colaboração**: Edição colaborativa de eventos
- **Multimedia**: Vídeos e áudios históricos
- **Realidade Aumentada**: Visualização imersiva
- **API Pública**: Integração com outras plataformas

### Melhorias de UX
- **Performance**: Otimização para grandes datasets
- **Mobile**: Interface otimizada para dispositivos móveis
- **Acessibilidade**: Melhor suporte a tecnologias assistivas
- **Personalização**: Filtros e preferências avançadas

### Expansão de Conteúdo
- **Mais Categorias**: Economia, cultura, esportes
- **Granularidade**: Eventos por mês/dia
- **Localização**: Timeline específica por país/região
- **Temas**: Timelines temáticas especializadas

---

**Próximo Documento**: [13 - Sistema de Anúncios](13_ANUNCIOS.md)
