# 📋 Testes do Projeto Vigil

Este diretório contém todos os testes automatizados do projeto.

## 🧪 Estrutura de Testes

### Testes Ativos (3 arquivos)

#### 1. **history.test.ts**
- **Função**: Testa o sistema de navegação e histórico do navegador
- **Módulo testado**: `src/utils/history.ts`
- **Cobertura**:
  - `buildPathFromSnapshot`: Construção de URLs a partir de snapshots de navegação
  - `parseLocationToSnapshot`: Parsing de URLs para snapshots
  - `pushHistoryState`: Manipulação do histórico do navegador
  - `samePath`: Normalização e comparação de caminhos
- **Casos de teste**: 14 testes
- **Status**: ✅ Passando

#### 2. **formatTimeAgo.test.ts**
- **Função**: Testa formatação de tempo relativo (ex: "5m", "2h", "3d")
- **Módulo testado**: `src/utils/timeUtils.ts` - `formatTimeAgo()`
- **Cobertura**:
  - Formatação de minutos (0-59m)
  - Formatação de horas (1-23h)
  - Formatação de dias (1-6d)
  - Formatação de semanas (1-4s)
  - Formatação de meses (1+M)
  - Validação de entrada inválida
  - Limites entre categorias
  - Padding de zeros
- **Casos de teste**: 33 testes
- **Status**: ✅ Passando

#### 3. **authSafe.test.ts**
- **Função**: Testa gerenciamento seguro de sessão e autenticação
- **Módulo testado**: `src/utils/supabaseAuthSafe.ts`
- **Cobertura**:
  - `getSessionSafe`: Recuperação segura de sessão com tratamento de erros
  - `withAuthGuard`: Execução de operações protegidas por autenticação
  - Tratamento de refresh token inválido
  - Cleanup de sessão em caso de erro
- **Casos de teste**: 4 testes
- **Status**: ✅ Passando

## 📊 Estatísticas

- **Total de testes**: 51
- **Todos passando**: ✅ 51/51
- **Cobertura**: Funções críticas de navegação, tempo e autenticação

## 🚀 Como Executar

### Rodar todos os testes
```bash
npm test
```

### Rodar testes em modo watch (observação)
```bash
npm run test:watch
```

### Gerar relatório de cobertura
```bash
npm run test:coverage
```

### Listar todos os arquivos de teste
```bash
npm test -- --listTests
```

## 🔧 Configuração

- **Framework**: Jest 30.x
- **Ambiente**: jsdom (simula navegador)
- **TypeScript**: Suporte completo via ts-jest
- **Arquivo de config**: `jest.config.cjs`
- **Setup**: `jest.setup.js`

## 📝 Convenções

1. Todos os arquivos de teste devem estar na pasta `tests/`
2. Nomenclatura: `[módulo].test.ts` ou `[módulo].test.tsx`
3. Imports devem usar caminhos relativos a partir de `tests/`
4. Usar `describe` para agrupar testes relacionados
5. Usar nomes descritivos para `test()` ou `it()`

## 🗑️ Histórico de Limpeza

### Arquivos removidos (obsoletos):
- ❌ `tests/security/xss-prevention.test.js` - Testava arquivos HTML standalone
- ❌ `tests/security/edge-functions.test.js` - Testava Edge Functions inexistentes
- ❌ `tests/integration/html-security.test.js` - Testava arquivos de debug

### Mudanças estruturais:
- ✅ Movido `src/utils/history.test.ts` → `tests/history.test.ts`
- ✅ Centralizado todos os testes em `tests/`
- ✅ Atualizado `jest.config.cjs` para buscar apenas em `tests/`

