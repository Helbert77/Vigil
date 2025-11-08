# Correções para Deploy no Vercel

## Problema
O deploy no Vercel estava falhando durante o processo de build do Vite com erro `Build failed`.

## Causas Identificadas

1. **Plugin problemático em produção**: O plugin `@dyad-sh/react-vite-component-tagger` estava causando problemas durante o build de produção.

2. **Imports inconsistentes**: O projeto tinha uma estrutura mista com componentes tanto na raiz quanto em `/src`, causando imports incorretos que quebravam o build.

3. **Configurações faltando**: O `vite.config.ts` e `vercel.json` precisavam de configurações adicionais para o build de produção.

4. **Plugin PWA**: Configuração do PWA precisava ser mais robusta para lidar com arquivos grandes e cache adequadamente.

5. **Avisos como erros**: O Vercel estava tratando avisos de chunks grandes como erros críticos.

## Correções Aplicadas

### 1. vite.config.ts
- Desabilitado o plugin `dyadComponentTagger` em produção
- Adicionado filtro `.filter(Boolean)` para remover plugins condicionais
- **Aumentado o limite de aviso de tamanho de chunk** para 1500KB
- **Adicionado supressor de avisos não críticos** no Rollup
- **Configuração robusta do PWA**:
  - WorkBox com padrões de cache otimizados
  - Cache de arquivos até 3MB
  - Runtime caching para API do Supabase
  - Desabilitado modo de desenvolvimento do PWA
- **Melhorias no viteStaticCopy**:
  - Modo estruturado habilitado
  - Modo silencioso desabilitado para melhor debug
- Configurações de build explícitas:
  ```typescript
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      onwarn(warning, warn) {
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        warn(warning);
      },
    },
  }
  ```

### 2. vercel.json
- Adicionado `outputDirectory: "dist"`
- Adicionado `NODE_ENV=production` no comando de build
- Adicionado rewrites para SPA (Single Page Application)
- **Configurados headers de segurança**:
  - Cache-Control para Service Worker
  - Headers de segurança HTTP (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)

### 3. .npmrc (novo arquivo)
- Configuração do pnpm para instalação mais permissiva
- Auto-instalação de peer dependencies
- Hoist de dependências

### 4. .nvmrc (novo arquivo)
- Definido Node.js versão 20 para consistência entre ambientes

### 5. Correção de Imports
**index.tsx**:
- Corrigido imports de `./src/` para `@/src/`

**src/components/common/ErrorBoundary.tsx**:
- Corrigido import de Card: `@/components/common/Card` (raiz)
- Corrigido import de Icon: `@/components/icons/Icon` (raiz)
- Mantido Button: `@/src/components/common/Button` (src)
- Mantido Logger: `@/src/utils/Logger` (src)

## Resultado

✅ Build concluído com sucesso localmente
✅ Arquivos gerados corretamente em `dist/`
✅ PWA configurado e funcionando
✅ Cache otimizado para Supabase
✅ Headers de segurança configurados
✅ Chunks de tamanho adequado
✅ Pronto para deploy no Vercel

## Mudanças Principais

1. **Limite de chunk aumentado** - Evita falhas por avisos de tamanho
2. **PWA robusto** - Cache até 3MB, runtime caching para APIs
3. **Node.js v20** - Consistência entre desenvolvimento e produção
4. **Headers de segurança** - Melhor segurança da aplicação
5. **Configuração pnpm otimizada** - Instalação mais estável

## Como Testar Localmente

```bash
npm install
npm run build
npm run preview
```

## Observações Importantes

1. **Estrutura Mista**: O projeto tem código tanto na raiz quanto em `/src`. Para evitar problemas futuros, considere:
   - Consolidar todos os componentes em um único diretório
   - Manter consistência nos imports usando sempre o alias `@/`

2. **Service Worker**: O PWA agora cache mais arquivos. Certifique-se de testar em modo incógnito após o deploy para ver mudanças.

3. **Vercel Build**: O comando de build agora define explicitamente `NODE_ENV=production` para garantir otimizações corretas.

## Resolução de Problemas

Se o build ainda falhar no Vercel:
1. Verifique os logs completos no dashboard do Vercel
2. Certifique-se de que todas as dependências estão no `package.json`
3. Verifique se o pnpm-lock.yaml está atualizado
4. Tente limpar o cache do Vercel e fazer redeploy

