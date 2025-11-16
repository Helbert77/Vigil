import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const CONFIG_PATH = path.join(process.cwd(), '.cursor', 'mcp.json');

async function loadConfig() {
  try {
    const raw = await readFile(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn('[mcp:stripe] Não foi possível ler .cursor/mcp.json:', err.message);
    }
    return {};
  }
}

function resolveEnvValue(value) {
  if (!value || typeof value !== 'string') return undefined;
  return value.trim() === '' ? undefined : value.trim();
}

function validateApiKey(key) {
  if (!key || typeof key !== 'string') {
    return { valid: false, error: 'Chave não fornecida ou inválida' };
  }
  const trimmed = key.trim();
  if (trimmed.startsWith('sk-user-')) {
    return {
      valid: false,
      error: 'Chave inválida: "sk-user-" é uma chave de usuário, não uma chave secreta de API. Obtenha uma chave secreta (sk_test_... ou sk_live_...) no Stripe Dashboard > Developers > API keys'
    };
  }
  if (!trimmed.startsWith('sk_') && !trimmed.startsWith('rk_')) {
    return {
      valid: false,
      error: `Chave inválida: deve começar com "sk_" ou "rk_". Chave fornecida começa com "${trimmed.substring(0, 10)}..."`
    };
  }
  return { valid: true, key: trimmed };
}

async function main() {
  const config = await loadConfig();
  const stripeConfig = config?.mcpServers?.stripe ?? {};
  const configEnv = stripeConfig.env ?? {};

  const apiKeyRaw =
    resolveEnvValue(process.env.STRIPE_SECRET_KEY) ??
    resolveEnvValue(configEnv.STRIPE_SECRET_KEY);

  if (!apiKeyRaw) {
    console.error('[mcp:stripe] ❌ STRIPE_SECRET_KEY não encontrada.');
    console.error('[mcp:stripe] Defina a variável de ambiente STRIPE_SECRET_KEY ou atualize .cursor/mcp.json');
    console.error('[mcp:stripe] Obtenha sua chave em: https://dashboard.stripe.com/apikeys');
    process.exit(1);
  }

  const validation = validateApiKey(apiKeyRaw);
  if (!validation.valid) {
    console.error('[mcp:stripe] ❌ Erro na validação da chave:');
    console.error(`[mcp:stripe] ${validation.error}`);
    console.error('[mcp:stripe]');
    console.error('[mcp:stripe] Para obter uma chave secreta válida:');
    console.error('[mcp:stripe] 1. Acesse: https://dashboard.stripe.com/apikeys');
    console.error('[mcp:stripe] 2. Crie ou copie uma "Secret key" (começa com sk_test_ ou sk_live_)');
    console.error('[mcp:stripe] 3. Atualize .cursor/mcp.json ou defina STRIPE_SECRET_KEY no ambiente');
    process.exit(1);
  }

  const apiKey = validation.key;

  const accountId =
    resolveEnvValue(process.env.STRIPE_ACCOUNT_ID) ??
    resolveEnvValue(configEnv.STRIPE_ACCOUNT_ID);

  const args = ['-y', '@stripe/mcp', '--tools=all', `--api-key=${apiKey}`];

  if (accountId) {
    args.push(`--stripe-account=${accountId}`);
  }

  console.log('[mcp:stripe] Iniciando servidor MCP oficial da Stripe...');

  const isWindows = process.platform === 'win32';
  const command = isWindows ? 'cmd' : 'npx';
  const commandArgs = isWindows ? ['/c', 'npx', ...args] : args;

  const child = spawn(command, commandArgs, {
    stdio: 'inherit',
    env: {
      ...process.env,
      STRIPE_SECRET_KEY: apiKey,
      ...(accountId ? { STRIPE_ACCOUNT_ID: accountId } : {}),
    },
  });

  const autoExitRaw = process.env.MCP_STRIPE_AUTO_EXIT_MS;
  const autoExitMs = autoExitRaw ? Number(autoExitRaw) : undefined;

  if (autoExitMs && Number.isFinite(autoExitMs) && autoExitMs > 0) {
    console.log(`[mcp:stripe] MCP_STRIPE_AUTO_EXIT_MS definido (${autoExitMs} ms). O servidor será finalizado automaticamente após esse período.`);
    setTimeout(() => {
      console.log('[mcp:stripe] Encerrando servidor MCP (auto-exit).');
      child.kill();
    }, autoExitMs);
  }

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  child.on('error', (err) => {
    console.error('[mcp:stripe] Falha ao iniciar o servidor:', err.message);
    process.exit(1);
  });
}

main();

