## Objetivo
- Remover a palavra "Virtual" do `h1` e manter apenas "Biblioteca".

## Local da alteração
- Arquivo: `pages/Library.tsx`
- Linha: 145
- Snippet atual: `'<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Biblioteca Virtual</h1>'`

## Passos
1. Editar `pages/Library.tsx` substituindo o texto do `h1` por "Biblioteca".
   - Novo snippet: `'<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Biblioteca</h1>'`
2. Manter classes existentes (`text-2xl font-bold text-gray-900 dark:text-white`) para preservar o estilo e dark mode.
3. Rodar o projeto em modo desenvolvimento e validar visualmente o título na página Biblioteca.
4. Opcional: verificar se há outros lugares com "Biblioteca Virtual" (ex.: breadcrumbs, metadata) e unificar para "Biblioteca".

## Verificação
- Acessar a página e confirmar que o `h1` exibe apenas "Biblioteca" e que o estilo permanece idêntico.

Confirma a execução dessas alterações? 