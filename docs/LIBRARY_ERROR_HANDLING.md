# Tratamento de Erros na Biblioteca

Este documento descreve os casos de erro tratados relacionados a imagens e datas na página de Biblioteca, e as soluções implementadas.

## Imagens (SafeImage)

- Formatos suportados: `jpg`, `jpeg`, `png`, `gif`, `webp`. Se o formato não for suportado, é registrado um aviso e mantida a tentativa de carregamento.
- Placeholder: um shimmer de carregamento é exibido até a imagem ser carregada.
- Fallback automático: em caso de erro no carregamento (`onError`), o componente troca para `fallbackSrc` (padrão: `/logo.png`) e volta a medir o carregamento.
- Validação de dimensões: ao carregar, valida `naturalWidth`/`naturalHeight` contra `minWidth`/`minHeight` (padrão: 64x64). Se abaixo do mínimo, registra um aviso de dimensões insuficientes.
- Monitoramento de performance: mede o tempo de carregamento. Se exceder 2500ms, registra um aviso em `performance`.
- Logs:
  - `warn` — formato não suportado, dimensões abaixo do mínimo, carregamento lento.
  - `error` — falha de carregamento de imagem, com `src` e contexto.

## Datas de Publicação

- Validação: usa `isValidDate` para checar validade do timestamp ISO. Em caso de inválido, exibe "Data inválida" e registra `warn` com `itemId` e valor.
- Futuras: identifica datas futuras com tolerância de 60s e exibe badge "Agendada"; registra `warn`.
- Formatação localizada: usa `formatDate` (locale `pt-BR` e fuso do usuário) para exibição.
- Indicadores auxiliares: mantém badge "Atualizado" (recentemente atualizado) via `isRecentlyUpdated`.

## Integração

- `SafeImage` adotado em `LibraryItemCard` (todos os modos: lista, pequeno, grande) e `LibraryItemModal` com `srcSet/sizes` existentes.
- Nos cards (modo lista), a data é validada/formatada e pode exibir status "Agendada" para futuras.
- No modal, a data mostra inválido/futuro com badges apropriados além de "Atualizado".

## Observações

- Itens da biblioteca podem ser `documentos`, `imagens` e `vídeos`. Para vídeos/imagens sem extensão na URL, o `SafeImage` ainda tenta carregar e registra aviso se o formato não puder ser inferido.
- Para vídeos, o componente de imagem não é aplicado; é recomendado adicionar um player específico caso necessário.

## Próximos Passos (opcional)

- Adicionar métricas agregadas de falhas de imagens e discrepâncias de data no painel de observabilidade.
- Extender suporte a `svg` (considerando segurança) e `avif` conforme necessidade.