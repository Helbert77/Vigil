# 22 - Páginas Adicionais e Recursos Especiais

## 📋 Identificação

| Campo | Valor |
|-------|-------|
| **Nome** | Páginas Adicionais Vigil |
| **Versão** | 1.0.0 |
| **Data** | 24/01/2026 |
| **Responsável** | Equipe de Desenvolvimento Vigil |
| **Tipo** | PRD - Recursos Complementares |

---

## 🎯 Visão Geral

### Descrição
Conjunto de páginas e recursos complementares que enriquecem a experiência do usuário, incluindo posts salvos, tópicos em alta, detalhes de tópicos e tela de splash.

### Objetivo e Propósito
- **Organização**: Acesso rápido a conteúdo salvo
- **Descoberta**: Exploração de tópicos populares
- **Engajamento**: Incentivo à participação em discussões
- **Branding**: Experiência de carregamento profissional

---

## 🏗️ Arquitetura Técnica

### Páginas Implementadas

| Página | Arquivo | Rota | Propósito |
|--------|---------|------|-----------|
| Posts Salvos | `Saved.tsx` | `/saved` | Biblioteca pessoal de posts |
| Tópicos em Alta | `TrendingTopics.tsx` | `/trending` | Exploração de tendências |
| Detalhe de Tópico | `TopicDetail.tsx` | `/topic/:tag` | Posts de um tópico específico |
| Tela de Splash | `SplashScreen.tsx` | `/` (inicial) | Carregamento do app |

---

## ⚙️ Funcionalidades Detalhadas

### 1. Posts Salvos (`/saved`)

**Descrição:**
Página que exibe todos os posts que o usuário salvou para ler depois, similar a um sistema de bookmarks.

**Funcionalidades:**
- **Lista de Posts Salvos**: Exibição em feed vertical
- **Integração com Anúncios**: Anúncios intercalados entre posts
- **Interações Completas**: Like, comentar, compartilhar, dessalvar
- **Estado Vazio**: Mensagem amigável quando não há posts salvos
- **Ordenação**: Posts mais recentemente salvos primeiro

**Interface:**
```typescript
interface SavedProps {
  posts: Post[];
  savedPostIds: string[];
  onToggleSave: (postId: string) => void;
  user: User;
  // ... outras props de interação
}
```

**Estado Vazio:**
```tsx
<div className="text-center py-16">
  <BookmarkIcon />
  <h2 className="text-xl font-semibold mb-2">Nenhum post salvo</h2>
  <p className="text-gray-600 dark:text-gray-400">
    Salve posts interessantes para acessá-los depois
  </p>
</div>
```

**Integração com Anúncios:**
- Anúncios inseridos a cada 5 posts
- Tracking de impressões e clicks
- Interações com anúncios (like, save, hide)

### 2. Tópicos em Alta (`/trending`)

**Descrição:**
Página que lista todos os tópicos (hashtags) em ordem de popularidade, permitindo exploração e descoberta de conteúdo.

**Funcionalidades:**
- **Lista de Tópicos**: Cards com hashtag e contagem de posts
- **Busca**: Filtro em tempo real por nome do tópico
- **Ordenação**: 
  - Por número de posts (padrão)
  - Alfabética
- **Navegação**: Clique leva para página de detalhe do tópico
- **Indicadores Visuais**:
  - 🔥 Ícone de fogo para tópicos muito populares
  - 📈 Ícone de trending para crescimento
  - Contagem de posts por tópico

**Interface:**
```typescript
interface TrendingTopicsPageProps {
  trendingTopics: TrendingTopic[];
  onViewTag: (tag: string) => void;
  onGoBack: () => void;
}

interface TrendingTopic {
  tag: string;
  count: number;
  trending?: boolean;
}
```

**Layout:**
- Grid responsivo (1 col mobile, 2 cols tablet, 3 cols desktop)
- Cards com hover effect
- Busca no topo
- Seletor de ordenação

**Busca e Filtros:**
```typescript
const filteredTopics = trendingTopics.filter(topic =>
  topic.tag.toLowerCase().includes(searchTerm.toLowerCase())
);

const sortedTopics = sortBy === 'posts' 
  ? filteredTopics.sort((a, b) => b.count - a.count)
  : filteredTopics.sort((a, b) => a.tag.localeCompare(b.tag));
```

### 3. Detalhe de Tópico (`/topic/:tag`)

**Descrição:**
Página que exibe todos os posts relacionados a um tópico específico, funcionando como um feed filtrado.

**Funcionalidades:**
- **Feed Filtrado**: Apenas posts com a hashtag específica
- **Header do Tópico**: 
  - Nome do tópico em destaque
  - Contagem de posts
  - Botão de voltar
- **Interações Completas**: Todas as interações de posts normais
- **Anúncios Contextuais**: Anúncios relacionados ao tópico (futuro)
- **Estatísticas**: Engajamento médio, autores principais

**Interface:**
```typescript
interface TopicDetailProps {
  tag: string;
  posts: Post[];
  user: User;
  onNavigateBack: () => void;
  // ... props de interação com posts
}
```

**Header:**
```tsx
<div className="bg-gradient-to-r from-primary to-purple-600 p-6 rounded-lg mb-6">
  <button onClick={onNavigateBack}>← Voltar</button>
  <h1 className="text-3xl font-bold text-white">#{tag}</h1>
  <p className="text-white/80">{posts.length} posts</p>
</div>
```

### 4. Tela de Splash (`SplashScreen`)

**Descrição:**
Tela inicial exibida durante o carregamento do aplicativo, com logo e animações.

**Funcionalidades:**
- **Logo Animado**: Fade in + scale
- **Loading Indicator**: Spinner ou barra de progresso
- **Mensagem**: "Carregando..." ou frases motivacionais
- **Transição**: Fade out suave para app principal
- **Timeout**: Máximo 5s, depois carrega mesmo incompleto

**Estados:**
```typescript
enum SplashState {
  LOADING = 'loading',      // Carregando recursos
  READY = 'ready',          // Pronto para transição
  ERROR = 'error',          // Erro no carregamento
  TIMEOUT = 'timeout'       // Timeout excedido
}
```

**Animações:**
```css
@keyframes fadeInScale {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 📏 Regras de Negócio

### Posts Salvos
- **Limite**: Sem limite de posts salvos
- **Persistência**: Salvos permanentemente até dessalvar
- **Sincronização**: Real-time entre dispositivos
- **Privacidade**: Apenas usuário vê seus salvos

### Tópicos em Alta
- **Cálculo**: Baseado em posts nas últimas 24h
- **Atualização**: A cada 1 hora
- **Mínimo**: Tópico precisa de 3+ posts para aparecer
- **Filtros**: Remove tópicos banidos ou inadequados

### Detalhe de Tópico
- **Ordenação**: Posts mais recentes primeiro
- **Paginação**: 20 posts por página
- **Cache**: 5 minutos de cache
- **Moderação**: Posts moderados aparecem normalmente

---

## 💡 Casos de Uso Práticos

### Cenário 1: Salvar para Ler Depois
1. **Usuário** vê post interessante no feed
2. **Usuário** clica no ícone de bookmark
3. **Sistema** adiciona à lista de salvos
4. **Toast**: "Post salvo com sucesso"
5. **Mais tarde**, usuário acessa `/saved`
6. **Sistema** exibe todos os posts salvos
7. **Usuário** lê e dessalva

### Cenário 2: Explorar Tópico Popular
1. **Usuário** vê tópico #Conspiração no sidebar
2. **Usuário** clica no tópico
3. **Sistema** navega para `/trending`
4. **Usuário** vê lista de tópicos em alta
5. **Usuário** clica em #Conspiração
6. **Sistema** navega para `/topic/Conspiração`
7. **Usuário** vê feed filtrado com posts do tópico

### Cenário 3: Buscar Tópico Específico
1. **Usuário** acessa `/trending`
2. **Usuário** digita "UFO" na busca
3. **Sistema** filtra tópicos em tempo real
4. **Usuário** vê apenas tópicos relacionados a UFO
5. **Usuário** clica em #UFOSighting
6. **Sistema** navega para detalhe do tópico

---

## 🎨 Interface e Design

### Página de Salvos

**Layout:**
- Feed vertical com posts
- Anúncios intercalados
- Infinite scroll
- Pull to refresh (mobile)

**Estado Vazio:**
- Ícone grande de bookmark
- Título: "Nenhum post salvo"
- Descrição: "Salve posts interessantes..."
- CTA: "Explorar Feed"

### Página de Trending Topics

**Layout:**
- Grid responsivo de cards
- Busca no topo
- Filtros de ordenação
- Contadores de posts

**Card de Tópico:**
```tsx
<Card className="hover:shadow-lg transition-shadow cursor-pointer">
  <div className="p-4">
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-bold">#{tag}</h3>
      {trending && <FireIcon className="text-orange-500" />}
    </div>
    <p className="text-gray-600">{count} posts</p>
  </div>
</Card>
```

### Página de Detalhe de Tópico

**Header:**
- Gradiente roxo com nome do tópico
- Contagem de posts
- Botão de voltar
- Estatísticas (futuro)

**Feed:**
- Posts filtrados por hashtag
- Todas as interações disponíveis
- Anúncios contextuais

### Tela de Splash

**Design:**
- Fundo gradiente (primary colors)
- Logo centralizado
- Animação de entrada
- Loading spinner
- Texto motivacional (opcional)

---

## ⚡ Performance

### Otimizações

**Posts Salvos:**
- Lazy loading de posts
- Virtual scrolling para listas grandes
- Cache de posts salvos (5 min)
- Prefetch de imagens

**Trending Topics:**
- Cache de 1 hora
- Paginação de resultados
- Debounce na busca (300ms)
- Memoização de filtros

**Topic Detail:**
- Cache por tópico (5 min)
- Infinite scroll otimizado
- Prefetch de próxima página
- Compression de imagens

**Splash Screen:**
- Preload de assets críticos
- Lazy load de recursos secundários
- Timeout de segurança (5s)
- Fallback para erro

---

## 🧪 Testes

### Casos de Teste

#### TC-SAV-001: Salvar e Acessar Post
1. Salvar post no feed
2. Navegar para `/saved`
3. **Esperado**: Post aparece na lista

#### TC-SAV-002: Dessalvar Post
1. Acessar `/saved`
2. Dessalvar post
3. **Esperado**: Post removido da lista imediatamente

#### TC-TRE-001: Buscar Tópico
1. Acessar `/trending`
2. Digitar termo na busca
3. **Esperado**: Filtro em tempo real, resultados corretos

#### TC-TRE-002: Ordenar Tópicos
1. Acessar `/trending`
2. Mudar ordenação para "Alfabética"
3. **Esperado**: Lista reordenada corretamente

#### TC-TOP-001: Visualizar Tópico
1. Clicar em tópico trending
2. **Esperado**: Navega para `/topic/:tag` com posts filtrados

#### TC-SPL-001: Splash Screen
1. Abrir app pela primeira vez
2. **Esperado**: Splash exibido por 2-3s, transição suave

---

## 🚀 Roadmap

### Próximas Funcionalidades

**Posts Salvos:**
- **Coleções**: Organizar salvos em pastas
- **Tags**: Adicionar tags personalizadas
- **Notas**: Adicionar notas privadas a posts salvos
- **Exportar**: Download de posts salvos em PDF/JSON
- **Compartilhar Coleção**: Compartilhar lista de salvos

**Trending Topics:**
- **Trending por Período**: Hoje, Semana, Mês, Ano
- **Trending por Categoria**: Filtrar por tipo de conteúdo
- **Gráfico de Crescimento**: Visualizar evolução do tópico
- **Notificações**: Alertas para tópicos de interesse
- **Seguir Tópico**: Receber atualizações de tópicos específicos

**Topic Detail:**
- **Filtros Avançados**: Por data, engajamento, autor
- **Estatísticas**: Autores principais, horários de pico
- **Related Topics**: Tópicos relacionados
- **Export**: Download de posts do tópico
- **Subscribe**: Notificações de novos posts

**Splash Screen:**
- **Personalização**: Mensagens baseadas em horário
- **Progress**: Barra de progresso detalhada
- **Tips**: Dicas aleatórias sobre o app
- **Changelog**: Novidades da versão (primeira abertura)

---

## 📊 Métricas

### Posts Salvos
- **Taxa de Salvamento**: % de posts salvos vs visualizados
- **Média de Salvos**: Salvos por usuário
- **Taxa de Dessalvar**: % de posts dessalvados
- **Tempo até Dessalvar**: Quanto tempo posts ficam salvos

### Trending Topics
- **Pageviews**: Acessos à página de trending
- **Click-through**: % de cliques em tópicos
- **Busca**: Termos mais buscados
- **Engajamento**: Posts visualizados via trending

### Topic Detail
- **Tempo na Página**: Tempo médio de leitura
- **Posts Visualizados**: Quantos posts do tópico são lidos
- **Conversão**: % que interage com posts do tópico
- **Retenção**: % que retorna ao mesmo tópico

---

**Próximo Documento**: [23 - Sistema de Radar](23_RADAR.md) (a criar)
**Documento Anterior**: [21 - Páginas Legais](21_PAGINAS_LEGAIS.md)
