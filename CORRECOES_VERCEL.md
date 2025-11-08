# Correções para Deploy no Vercel

## Problema
O deploy no Vercel estava falha durante o processo de build do Vite com erro `Build failed`.

## Causas Identificadas

1. **Plugin problemático em produção**: O plugin `@dyad-sh/react-vite-component-tagger` estava causando problemas durante o build de produção.

2. **Imports inconsistentes**: O projeto tinha uma estrutura mista com componentes tanto na raiz quanto em `/src`, causando imports incorretos que quebravam o build.

3. **Configurações faltando**: O `vite.config.ts` e `vercel.json` precisavam de configurações adicionais para o build de produção.

## Correções Aplicadas

### 1. vite.config.ts
- Desabilitado o plugin `dyadComponentTagger` em produção
- Adicionado filtro `.filter(Boolean)` para remover plugins condicionais
- Adicionado configurações de build explícitas:
  ```typescript
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  }
  ```

### 2. vercel.json
- Adicionado `outputDirectory: "dist"`
- Adicionado rewrites para SPA (Single Page Application)

### 3. Correção de Imports
**index.tsx**:
- Corrigido imports de `./src/` para `@/src/`

**src/components/common/ErrorBoundary.tsx**:
- Corrigido import de Card: `@/components/common/Card` (raiz)
- Corrigido import de Icon: `@/components/icons/Icon` (raiz)
- Mantido Button: `@/src/components/common/Button` (src)
- Mantido Logger: `@/src/utils/Logger` (src)

## Resultado

✅ Build concluído com sucesso
✅ Arquivos gerados corretamente em `dist/`
✅ PWA configurado e funcionando
✅ Pronto para deploy no Vercel

## Como Testar Localmente

```bash
npm install
npm run build
npm run preview
```

## Observações

O projeto tem uma estrutura mista com código tanto na raiz quanto em `/src`. Para evitar problemas futuros, considere:
- Consolidar todos os componentes em um único diretório (`src/` ou raiz)
- Manter consistência nos imports usando sempre o alias `@/`
- Revisar outros arquivos que possam ter imports inconsistentes

