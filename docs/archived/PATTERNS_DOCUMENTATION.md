# Documentação dos Padrões Implementados

Este documento descreve os padrões de projeto implementados no aplicativo Vigil para melhorar a arquitetura, performance e debugging.

## 📋 Índice

1. [Factory Pattern](#factory-pattern)
2. [Observer Pattern](#observer-pattern)
3. [Lazy Loading Inteligente](#lazy-loading-inteligente)
4. [Sistema de Logging](#sistema-de-logging)
5. [Exemplos de Uso](#exemplos-de-uso)
6. [Benefícios](#benefícios)

## 🏭 Factory Pattern

### Localização
- **Arquivo:** `src/factories/ComponentFactory.ts`

### Descrição
Implementa o padrão Factory para criação centralizada e configurável de componentes UI.

### Componentes Suportados

#### Ícones
```typescript
import { createIcon } from '@/src/factories/ComponentFactory';

const EyeIcon = createIcon({
  iconType: 'eye',
  size: 'medium',
  className: 'text-blue-500'
});
```

#### Modais
```typescript
import { createModal } from '@/src/factories/ComponentFactory';

const MyModal = createModal({
  modalType: 'confirmation',
  title: 'Confirmar Ação',
  content: <p>Deseja continuar?</p>,
  onClose: () => setShowModal(false)
});
```

#### Cards
```typescript
import { createCard } from '@/src/factories/ComponentFactory';

const InfoCard = createCard({
  cardType: 'info',
  title: 'Informação',
  content: 'Conteúdo do card',
  actions: [{ label: 'OK', onClick: () => {} }]
});
```

#### Botões
```typescript
import { createButton } from '@/src/factories/ComponentFactory';

const PrimaryButton = createButton({
  buttonType: 'primary',
  label: 'Clique aqui',
  onClick: () => console.log('Clicado!')
});
```

### Benefícios
- ✅ Criação consistente de componentes
- ✅ Configuração centralizada
- ✅ Fácil manutenção e extensão
- ✅ Reutilização de código

## 👁️ Observer Pattern

### Localização
- **Arquivo:** `src/patterns/Observer.ts`

### Descrição
Sistema de eventos global que permite comunicação desacoplada entre componentes.

### Tipos de Eventos Suportados
- `notification` - Notificações do sistema
- `user_action` - Ações do usuário
- `navigation` - Eventos de navegação
- `data_update` - Atualizações de dados
- `error` - Erros do sistema

### Uso Básico

#### Emitir Eventos
```typescript
import { emitNotification, emitUserAction } from '@/src/patterns/Observer';

// Emitir notificação
emitNotification('Operação realizada com sucesso!', 'success');

// Emitir ação do usuário
emitUserAction('button_click', 'user123', { buttonId: 'save' });
```

#### Escutar Eventos (Hook)
```typescript
import { useEventSubscription } from '@/src/patterns/Observer';

const MyComponent = () => {
  useEventSubscription(
    {
      id: 'my-component-observer',
      eventTypes: ['notification', 'user_action']
    },
    (event) => {
      console.log('Evento recebido:', event);
    },
    []
  );

  return <div>Meu Componente</div>;
};
```

#### Escutar Eventos (Classe)
```typescript
import { globalEvents } from '@/src/patterns/Observer';

const observer = globalEvents.subscribe(
  ['notification'],
  (event) => {
    console.log('Notificação:', event.payload.message);
  }
);

// Limpar quando não precisar mais
globalEvents.unsubscribe(observer.id);
```

### Benefícios
- ✅ Comunicação desacoplada
- ✅ Sistema de eventos global
- ✅ Fácil debugging de fluxos
- ✅ Integração com React hooks

## 🚀 Lazy Loading Inteligente

### Localização
- **Arquivo:** `src/utils/LazyLoadingManager.ts`

### Descrição
Sistema avançado de lazy loading com preloading inteligente baseado em padrões de uso.

### Funcionalidades

#### Criar Componente Lazy
```typescript
import { createLazyComponent } from '@/src/utils/LazyLoadingManager';

const LazyComponent = createLazyComponent({
  componentPath: '@/components/MyComponent',
  preload: true,
  priority: 'high',
  cacheKey: 'my-component'
});
```

#### Registrar Uso de Página
```typescript
import { recordPageUsage } from '@/src/utils/LazyLoadingManager';

useEffect(() => {
  recordPageUsage('/my-page');
}, []);
```

#### Obter Estatísticas
```typescript
import { lazyLoadingManager } from '@/src/utils/LazyLoadingManager';

const stats = lazyLoadingManager.getPerformanceStats();
console.log('Tempo médio de carregamento:', stats.averageLoadTime);
console.log('Taxa de cache hit:', stats.cacheHitRate);
```

### Configurações Disponíveis
```typescript
interface LazyLoadConfig {
  preload?: boolean;           // Precarregar componente
  priority?: 'low' | 'medium' | 'high'; // Prioridade de carregamento
  cacheKey?: string;          // Chave personalizada para cache
  timeout?: number;           // Timeout de carregamento
  retryAttempts?: number;     // Tentativas de retry
  onError?: (error: Error) => void; // Callback de erro
}
```

### Benefícios
- ✅ Carregamento otimizado
- ✅ Preloading inteligente
- ✅ Cache eficiente
- ✅ Estatísticas de performance
- ✅ Padrões de uso adaptativos

## 📝 Sistema de Logging

### Localização
- **Arquivo:** `src/utils/Logger.ts`

### Descrição
Sistema de logging configurável com diferentes níveis e categorias.

### Níveis de Log
- `DEBUG` - Informações detalhadas para debugging
- `INFO` - Informações gerais
- `WARN` - Avisos
- `ERROR` - Erros
- `FATAL` - Erros críticos

### Uso Básico

#### Logger Global
```typescript
import { logger } from '@/src/utils/Logger';

logger.debug('Informação de debug', { detail: 'valor' });
logger.info('Operação realizada', { userId: '123' });
logger.warn('Aviso importante', { warning: 'dados' });
logger.error('Erro ocorreu', new Error('Mensagem de erro'));
```

#### Loggers Específicos
```typescript
import { uiLogger, performanceLogger, apiLogger } from '@/src/utils/Logger';

// Logger para UI
uiLogger.info('Componente renderizado', { component: 'MyComponent' });

// Logger para performance
performanceLogger.info('Tempo de carregamento', { time: 150 });

// Logger para API
apiLogger.error('Falha na requisição', { endpoint: '/api/users' });
```

### Configuração
```typescript
import { logger } from '@/src/utils/Logger';

// Configurar nível mínimo
logger.configure({
  level: 'INFO',
  enableConsole: true,
  enableStorage: true,
  maxStorageEntries: 1000
});
```

### Funcionalidades Avançadas

#### Filtrar Logs
```typescript
const errorLogs = logger.filter({ level: 'ERROR' });
const recentLogs = logger.filter({ 
  timeRange: { start: Date.now() - 3600000 } // Última hora
});
```

#### Exportar Logs
```typescript
const logsJson = logger.exportLogs('json');
const logsCsv = logger.exportLogs('csv');
```

#### Estatísticas
```typescript
const stats = logger.getStats();
console.log('Total de logs:', stats.totalLogs);
console.log('Logs por nível:', stats.logsByLevel);
```

### Benefícios
- ✅ Debugging estruturado
- ✅ Diferentes níveis de log
- ✅ Persistência local
- ✅ Filtragem e exportação
- ✅ Estatísticas detalhadas

## 💡 Exemplos de Uso

### Arquivo de Exemplo
Consulte o arquivo `src/examples/PatternUsageExample.tsx` para ver todos os padrões sendo usados em conjunto.

### Integração Completa
```typescript
import React, { useEffect } from 'react';
import { createButton } from '@/src/factories/ComponentFactory';
import { useEventSubscription, emitNotification } from '@/src/patterns/Observer';
import { recordPageUsage } from '@/src/utils/LazyLoadingManager';
import { uiLogger } from '@/src/utils/Logger';

const MyComponent = () => {
  // Registrar uso da página
  useEffect(() => {
    recordPageUsage('/my-component');
    uiLogger.info('MyComponent montado');
  }, []);

  // Escutar eventos
  useEventSubscription(
    { id: 'my-component', eventTypes: ['notification'] },
    (event) => {
      uiLogger.info('Evento recebido', event);
    },
    []
  );

  // Criar botão usando Factory
  const ActionButton = createButton({
    buttonType: 'primary',
    label: 'Ação',
    onClick: () => {
      emitNotification('Ação executada!', 'success');
      uiLogger.info('Botão clicado');
    }
  });

  return (
    <div>
      <h1>Meu Componente</h1>
      <ActionButton />
    </div>
  );
};
```

## 🎯 Benefícios Gerais

### Arquitetura
- **Separação de responsabilidades** - Cada padrão tem sua função específica
- **Baixo acoplamento** - Componentes se comunicam via eventos
- **Alta coesão** - Funcionalidades relacionadas agrupadas
- **Extensibilidade** - Fácil adicionar novos tipos e funcionalidades

### Performance
- **Lazy loading inteligente** - Carregamento otimizado baseado em uso
- **Cache eficiente** - Reutilização de componentes carregados
- **Preloading adaptativo** - Antecipa necessidades do usuário
- **Monitoramento** - Estatísticas para otimização contínua

### Debugging
- **Logs estruturados** - Informações organizadas por categoria e nível
- **Rastreamento de eventos** - Fluxo de dados visível
- **Persistência** - Logs salvos para análise posterior
- **Filtragem** - Foco em informações relevantes

### Manutenibilidade
- **Código organizado** - Padrões consistentes em todo o projeto
- **Documentação** - Exemplos e guias de uso
- **Testabilidade** - Componentes isolados e testáveis
- **Evolução** - Base sólida para futuras melhorias

## 🔧 Configuração e Personalização

Todos os padrões implementados são configuráveis e podem ser adaptados às necessidades específicas do projeto. Consulte os arquivos individuais para opções de configuração detalhadas.

## 📚 Próximos Passos

1. **Testes automatizados** - Implementar testes para os padrões
2. **Métricas avançadas** - Adicionar mais estatísticas de uso
3. **Integração com ferramentas** - Conectar com sistemas de monitoramento
4. **Otimizações** - Melhorar performance baseado em dados de uso

---

*Esta documentação deve ser atualizada conforme novos padrões são implementados ou modificações são feitas nos existentes.*