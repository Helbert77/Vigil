## Objetivo
- Criar um menu flutuante de ícones fixo na parte inferior, visível apenas em smartphones, com 6 ícones: `Home`, `Notifications`, `Messages`, `Communities`, `Biblioteca`, `Timeline`.
- Redirecionar para as mesmas páginas já utilizadas na Sidebar.
- Auto-ocultar ao rolar para cima e reaparecer ao rolar para baixo.

## Contexto do Código
- Sidebar e navegação existente: `components/layout/Sidebar.tsx:100–150` usa `setCurrentPage` e `handleLibraryClick`.
- Navegação centralizada: `App.tsx:104–162` define `handleNavigation(page)` que cuida de marcação de lidos, snapshot/URL e acesso à Biblioteca.
- Rotas existentes: `src/components/routing/AppRouter.tsx` tem `"/", "/notifications", "/messages", "/communities", "/timeline"`. Biblioteca é controlada via `handleNavigation('Library')`.

## Implementação
1. Criar componente `src/components/layout/MobileBottomNav.tsx`:
   - Props: `currentPage`, `onNavigate: (page: string) => void`, `unreadNotificationsCount`, `unreadMessagesCount`.
   - Ícones: reutilizar os ícones da Sidebar (`HomeIcon`, `BellIcon`, `MailIcon`, `UsersIcon`, `LibraryIcon`, `TimelineIcon`) via `Icon`.
   - Layout: `fixed bottom-0 left-0 right-0 md:hidden`, `h-16`, `bg-light-card dark:bg-dark-card`, `border-t border-light-border dark:border-dark-border`, `backdrop-blur` opcional.
   - Acessibilidade: `aria-label` por item, `role="navigation"`.
   - Auto-ocultar: hook interno que detecta direção do scroll (`window.scrollY` vs valor anterior) e aplica classes `translate-y-full`/`translate-y-0` com `transition-transform`.
   - Safe-area: padding-bottom `env(safe-area-inset-bottom)`.
   - Badges: bolhas numéricas para `Notifications` e `Messages` se `unread > 0`.

2. Integrar no `App.tsx`:
   - Importar e renderizar `<MobileBottomNav>` perto de `</main>` ou no container raiz, sempre visível em mobile.
   - Passar `currentPage` e `onNavigate={(p) => handleNavigation(p as Page)}` para reaproveitar a lógica já pronta (inclusive Biblioteca).
   - Passar `unreadNotificationsCount` e `unreadMessagesCount` dos hooks já existentes (`useNotifications`, `useConversations`).

3. Estilo e Tema
   - Basear-se nas variáveis globais de tema já usadas: `--light-card`, `--light-border`, `--dark-card`, `--dark-border` (presentes no app).
   - Ícones e texto: `text-gray-700 dark:text-gray-200` com estados ativos `text-secondary` e fundo `var(--accent-active)`.
   - Efeitos: sombra suave `shadow-lg`, `hover:opacity-90`, foco acessível.

4. Comportamento de Ocultação
   - Mostrar por padrão.
   - Ocultar quando `scrollY` diminui (rolagem para cima), com debounce para evitar jitter.
   - Mostrar quando `scrollY` aumenta (rolagem para baixo).
   - Pausar ocultação quando próximo do topo para não desaparecer indevidamente.

5. Testes
   - Arquivo: `tests/components/MobileBottomNav.test.tsx`.
   - Casos:
     - Renderiza 6 ícones com `aria-labels` corretos.
     - Clique em cada ícone aciona `onNavigate` com páginas esperadas (`'Home'`, `'Notifications'`, `'Messages'`, `'Communities'`, `'Library'`, `'Timeline'`).
     - Simula rolagem: `scrollY` aumentando → fica visível; diminuindo → esconde (verifica classe `translate-y-full`).
     - Mostra badges de não lidos em `Notifications/Messages`.

## Verificação
- Rodar `npm run dev` e validar no mobile ou devtools com largura < `768px`.
- Confirmar que o tema segue o claro/escuro e que o menu não quebra layout.
- Executar `npm test` para validar os testes do componente.

## Observações
- Biblioteca: o click chama `handleNavigation('Library')`, que já verifica `canAccessLibrary` e redireciona para `Premium` se necessário.

Posso iniciar a implementação seguindo este plano?