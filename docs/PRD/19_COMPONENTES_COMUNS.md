# 19 - Componentes Comuns Reutilizáveis

## 📋 Identificação

| Campo | Valor |
|-------|-------|
| **Nome** | Biblioteca de Componentes Comuns Vigil |
| **Versão** | 1.0.0 |
| **Data** | 12/12/2024 |
| **Responsável** | Equipe de Desenvolvimento Vigil |
| **Tipo** | PRD - Sistema de Design |

---

## 🎯 Visão Geral

### Descrição
Biblioteca de componentes React reutilizáveis que formam a base do sistema de design do Vigil, garantindo consistência visual, acessibilidade e manutenibilidade em toda a aplicação.

### Objetivo e Propósito
- **Consistência**: Visual e comportamental em toda a aplicação
- **Reutilização**: Componentes modulares e reutilizáveis
- **Manutenibilidade**: Mudanças centralizadas propagam globalmente
- **Acessibilidade**: Padrões de acessibilidade integrados
- **Performance**: Componentes otimizados e memoizados

---

## 🏗️ Arquitetura Técnica

### Estrutura de Componentes
```
components/
├── common/           # Componentes básicos reutilizáveis
│   ├── Avatar.tsx
│   ├── Card.tsx
│   ├── Tooltip.tsx
│   ├── Modal.tsx
│   └── Button.tsx
├── icons/           # Biblioteca de ícones
│   ├── Icon.tsx
│   ├── LogoIcon.tsx
│   └── VerifiedBadgeIcon.tsx
├── layout/          # Componentes de layout
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── NavLink.tsx
└── forms/           # Componentes de formulário
    ├── Input.tsx
    ├── TextArea.tsx
    └── Select.tsx
```

### Design System
- **Cores**: Paleta consistente com variações para tema claro/escuro
- **Tipografia**: Hierarquia de fontes e tamanhos
- **Espaçamento**: Sistema de grid e espaçamentos padronizados
- **Componentes**: Biblioteca de componentes base
- **Tokens**: Design tokens para consistência

---

## ⚙️ Componentes Detalhados

### 1. Avatar
```typescript
interface AvatarProps {
  src?: string;
  alt: string;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  userId?: string;
  showStatus?: boolean;
  onClick?: () => void;
}
```

**Funcionalidades:**
- **Tamanhos Padronizados**: 5 tamanhos pré-definidos
- **Fallback**: Iniciais do nome quando sem imagem
- **Status Online**: Indicador de atividade (opcional)
- **Lazy Loading**: Carregamento otimizado de imagens
- **Acessibilidade**: Alt text e ARIA labels

### 2. Card
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  hover?: boolean;
  onClick?: () => void;
}
```

**Funcionalidades:**
- **Container Padrão**: Base para todos os cards
- **Variações**: Diferentes níveis de padding e sombra
- **Interativo**: Suporte a hover e click
- **Responsivo**: Adaptação automática a diferentes telas
- **Tema**: Suporte a tema claro/escuro

### 3. Tooltip
```typescript
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}
```

**Funcionalidades:**
- **Posicionamento Inteligente**: Ajuste automático para viewport
- **Delay Configurável**: Controle de tempo de exibição
- **Acessibilidade**: ARIA labels e keyboard support
- **Performance**: Renderização sob demanda
- **Responsivo**: Adaptação para touch devices

### 4. Modal
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
}
```

**Funcionalidades:**
- **Overlay**: Fundo escuro com blur
- **Focus Management**: Trap de foco dentro do modal
- **Escape Key**: Fechamento com tecla ESC
- **Scroll Lock**: Previne scroll da página de fundo
- **Animações**: Transições suaves de entrada/saída

### 5. Button
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}
```

**Funcionalidades:**
- **Variantes**: 5 estilos diferentes para diferentes contextos
- **Estados**: Loading, disabled, hover, focus, active
- **Ícones**: Suporte a ícones à esquerda e direita
- **Acessibilidade**: ARIA states e keyboard navigation
- **Responsivo**: Tamanhos adaptativos

### 6. Icon System
```typescript
interface IconProps {
  className?: string;
  size?: number;
  color?: string;
  children: React.ReactNode;
}
```

**Funcionalidades:**
- **SVG Base**: Todos os ícones são SVG para qualidade
- **Customização**: Tamanho e cor configuráveis
- **Biblioteca**: Conjunto consistente de ícones
- **Acessibilidade**: ARIA hidden para ícones decorativos
- **Performance**: Ícones otimizados e comprimidos

### 7. Toast Notifications
```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Funcionalidades:**
- **Tipos Visuais**: 4 tipos com cores e ícones específicos
- **Auto-dismiss**: Fechamento automático configurável
- **Ações**: Botões de ação opcionais
- **Stack**: Múltiplas notificações empilhadas
- **Animações**: Entrada e saída suaves

### 8. Loading States
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}
```

**Funcionalidades:**
- **Spinner**: Loading circular animado
- **Skeleton**: Placeholder para conteúdo carregando
- **Tamanhos**: Múltiplos tamanhos pré-definidos
- **Customização**: Cores e dimensões configuráveis
- **Performance**: Animações otimizadas com CSS

---

## 📏 Regras de Design

### Paleta de Cores
```css
:root {
  /* Primary */
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-primary-light: #60a5fa;
  
  /* Secondary */
  --color-secondary: #6b7280;
  --color-secondary-dark: #4b5563;
  --color-secondary-light: #9ca3af;
  
  /* Success/Error/Warning */
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  
  /* Neutral */
  --color-gray-50: #f9fafb;
  --color-gray-900: #111827;
}
```

### Tipografia
```css
/* Hierarquia de Fontes */
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
```

### Espaçamento
```css
/* Sistema de Espaçamento */
.space-1 { margin: 0.25rem; }
.space-2 { margin: 0.5rem; }
.space-3 { margin: 0.75rem; }
.space-4 { margin: 1rem; }
.space-6 { margin: 1.5rem; }
.space-8 { margin: 2rem; }
```

### Breakpoints Responsivos
```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

---

## ♿ Acessibilidade

### Padrões Implementados
- **WCAG 2.1 AA**: Conformidade com diretrizes de acessibilidade
- **Keyboard Navigation**: Navegação completa por teclado
- **Screen Readers**: Suporte a leitores de tela
- **Color Contrast**: Contraste adequado para todos os textos
- **Focus Management**: Indicadores visuais claros

### Exemplos de Implementação
```jsx
// Button com acessibilidade
<Button
  aria-label="Curtir post"
  aria-pressed={isLiked}
  onClick={handleLike}
>
  <HeartIcon aria-hidden="true" />
  {likesCount}
</Button>

// Modal com focus trap
<Modal
  isOpen={isOpen}
  onClose={onClose}
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Título do Modal</h2>
  <p id="modal-description">Descrição do conteúdo</p>
</Modal>
```

---

## 🧪 Testes e Qualidade

### Estratégia de Testes
- **Unit Tests**: Jest + React Testing Library
- **Visual Regression**: Storybook + Chromatic
- **Accessibility Tests**: axe-core integration
- **Performance Tests**: Bundle size monitoring

### Documentação
- **Storybook**: Documentação interativa de componentes
- **Props Documentation**: TypeScript interfaces documentadas
- **Usage Examples**: Exemplos de uso para cada componente
- **Design Guidelines**: Diretrizes de quando usar cada componente

---

## 🚀 Roadmap e Melhorias Futuras

### Próximos Componentes
- **DataTable**: Tabela com sorting, filtering, pagination
- **DatePicker**: Seletor de datas avançado
- **RichTextEditor**: Editor de texto rico
- **Charts**: Componentes de gráficos
- **FileUpload**: Upload de arquivos com drag & drop

### Melhorias
- **Design Tokens**: Sistema de tokens mais robusto
- **Theming**: Suporte a múltiplos temas
- **Animation Library**: Biblioteca de animações
- **Form Validation**: Validação integrada
- **Internationalization**: Suporte a múltiplos idiomas

### Ferramentas
- **Design System Site**: Site dedicado ao design system
- **Figma Integration**: Sincronização com Figma
- **Code Generation**: Geração automática de código
- **Performance Monitoring**: Monitoramento de performance
- **Usage Analytics**: Analytics de uso dos componentes

---

## 📝 Considerações Finais

A biblioteca de componentes comuns do Vigil é fundamental para manter a consistência e qualidade da aplicação. Cada componente é projetado com foco em reutilização, acessibilidade e performance, garantindo uma experiência superior para todos os usuários.

A documentação detalhada e os exemplos práticos facilitam o uso correto dos componentes pela equipe de desenvolvimento, enquanto os padrões estabelecidos garantem evolução consistente do sistema de design.

---

**Biblioteca PRD Completa!** 🎉

A biblioteca de PRDs do Vigil está agora completa com 19 documentos abrangentes cobrindo todas as funcionalidades da plataforma, desde autenticação até componentes reutilizáveis. Esta documentação serve como fonte única da verdade para desenvolvedores, designers, gestores de produto e novos usuários da plataforma.
