# Guia de Instalação do TestSprite MCP

Este guia irá ajudá-lo a configurar o TestSprite MCP no Cursor.

## Pré-requisitos

1. **Node.js versão 22 ou superior** (você tem v20.19.5 - considere atualizar)
   - Baixe em: https://nodejs.org/
   - Verifique a versão: `node --version`

2. **Conta TestSprite**
   - Crie uma conta gratuita em: https://www.testsprite.com/
   - Faça login no painel: https://www.testsprite.com/

3. **Obter Chave de API**
   - No painel do TestSprite, vá em "Configurações" > "API Keys"
   - Clique em "Nova Chave de API"
   - Copie a chave gerada (você precisará dela na configuração)

## Configuração no Cursor

### Passo 1: Abrir Configurações do Cursor

1. Abra o Cursor
2. Pressione `Ctrl+Shift+J` (ou `⌘⇧J` no Mac) para abrir as configurações
3. Ou vá em: **File > Preferences > Settings**

### Passo 2: Configurar MCP

1. Na busca de configurações, procure por "MCP" ou "Model Context Protocol"
2. Ou navegue até: **Tools & Integration > MCP**
3. Clique em "Add custom MCP" ou edite o arquivo de configuração MCP

### Passo 3: Adicionar Configuração do TestSprite

Adicione a seguinte configuração JSON ao arquivo de configuração MCP do Cursor:

```json
{
  "mcpServers": {
    "TestSprite": {
      "command": "npx",
      "args": ["@testsprite/testsprite-mcp@latest"],
      "env": {
        "API_KEY": "SUA_CHAVE_DE_API_AQUI"
      }
    }
  }
}
```

**Importante:** Substitua `SUA_CHAVE_DE_API_AQUI` pela chave de API que você obteve no passo anterior.

### Passo 4: Localização do Arquivo de Configuração

O arquivo de configuração MCP do Cursor geralmente está localizado em:

- **Windows**: `%APPDATA%\Cursor\User\globalStorage\mcp.json` ou similar
- **Mac**: `~/Library/Application Support/Cursor/User/globalStorage/mcp.json`
- **Linux**: `~/.config/Cursor/User/globalStorage/mcp.json`

Ou você pode configurar diretamente através da interface do Cursor nas configurações.

### Passo 5: Reiniciar o Cursor

Após adicionar a configuração, reinicie o Cursor para que as mudanças tenham efeito.

### Passo 6: Verificar Instalação

Após reiniciar, você pode testar se o TestSprite está funcionando fazendo uma pergunta como:

```
Ajude-me a testar este projeto com o TestSprite.
```

O assistente deve reconhecer e oferecer usar as ferramentas do TestSprite MCP.

## Solução de Problemas

### Erro: Node.js versão antiga
- **Problema**: Você tem Node.js v20.19.5, mas o TestSprite requer v22+
- **Solução**: Atualize o Node.js para a versão mais recente em https://nodejs.org/

### Erro: Comando não encontrado
- Verifique se o Node.js está instalado corretamente
- Verifique se o `npx` está disponível: `npx --version`

### Erro: API Key inválida
- Verifique se copiou a chave de API corretamente
- Certifique-se de que não há espaços extras antes ou depois da chave
- Gere uma nova chave de API se necessário

### TestSprite não aparece nas ferramentas
- Verifique se a configuração JSON está correta (sem erros de sintaxe)
- Reinicie o Cursor completamente
- Verifique os logs do Cursor para erros relacionados ao MCP

## Recursos Adicionais

- Documentação oficial: https://docs.testsprite.com/mcp/installation
- Site do TestSprite: https://www.testsprite.com/
- Suporte: Consulte a documentação oficial para mais ajuda

## Próximos Passos

Após a instalação bem-sucedida, você poderá:

1. Gerar planos de teste para frontend e backend
2. Executar testes automatizados
3. Gerar relatórios de teste
4. Analisar a cobertura de testes do seu projeto

