# 🔧 GUIA DE CORREÇÃO DE SEGURANÇA - VIGIL

Este guia fornece instruções passo a passo para corrigir as vulnerabilidades identificadas no relatório de segurança.

---

## 📋 PRÉ-REQUISITOS

- [ ] Backup completo do banco de dados
- [ ] Acesso ao Supabase Dashboard
- [ ] Acesso ao repositório Git
- [ ] Ambiente de staging para testes
- [ ] Pelo menos 2-3 horas disponíveis

---

## 🚨 PARTE 1: CORREÇÕES CRÍTICAS (FAZER PRIMEIRO)

### 1.1 Remover Service Role Key do Código Cliente

**Tempo estimado:** 10 minutos  
**Risco de quebra:** Baixo

#### Passos:

1. **Editar `integrations/supabase/client.ts`:**

```typescript
// ❌ REMOVER estas linhas (16-17):
export const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// ❌ REMOVER a função createServiceClient (linhas 97-102)
export const createServiceClient = () => {
  if (typeof window !== 'undefined') {
    console.warn('[segurança] Não use createServiceClient no navegador.');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
};
```

2. **Verificar se algum arquivo importa `createServiceClient`:**

```bash
# No terminal:
cd "C:\Users\Herbert Carlos\Downloads\Cursor\Vigil"
rg "createServiceClient" --type ts --type tsx
```

3. **Se houver importações, remover ou substituir por chamadas via Edge Functions**

4. **Testar a aplicação:**

```bash
npm run dev
```

5. **Commit das alterações:**

```bash
git add integrations/supabase/client.ts
git commit -m "security: remove service_role_key from client code"
```

---

### 1.2 Corrigir Políticas RLS do Banco de Dados

**Tempo estimado:** 30 minutos  
**Risco de quebra:** Médio (testar em staging primeiro)

#### Passos:

1. **Fazer backup do banco:**

```bash
# Via Supabase CLI:
supabase db dump -f backup_before_security_fix.sql
```

2. **Executar o script de correção:**

**Opção A - Via Supabase Dashboard:**
- Ir para SQL Editor
- Copiar conteúdo de `scripts/fix-security-issues.sql`
- Executar seção por seção (não tudo de uma vez)
- Verificar erros após cada seção

**Opção B - Via Supabase CLI:**

```bash
supabase db push --file scripts/fix-security-issues.sql
```

3. **Verificar se as políticas foram aplicadas:**

```sql
-- Executar no SQL Editor:
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('anuncios', 'timeline_events', 'communities')
ORDER BY tablename, policyname;
```

4. **Testar funcionalidades afetadas:**

- [ ] Criar/editar/deletar anúncio (como usuário comum)
- [ ] Tentar deletar anúncio de outro usuário (deve falhar)
- [ ] Criar evento na timeline (como admin)
- [ ] Tentar criar evento na timeline (como usuário comum - deve falhar)
- [ ] Criar comunidade (verificar limite de 3 para usuários free)

5. **Se tudo funcionar, commit:**

```bash
git add scripts/fix-security-issues.sql
git commit -m "security: fix RLS policies for critical tables"
```

---

### 1.3 Corrigir Armazenamento de Chaves Privadas

**Tempo estimado:** 45 minutos  
**Risco de quebra:** Alto (requer migração de dados)

#### Opção 1: Migrar para IndexedDB com Criptografia

1. **Instalar dependências:**

```bash
npm install idb
```

2. **Criar novo serviço de criptografia seguro:**

Criar arquivo: `src/services/secure-encryption.service.ts`

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

interface SecureKeysDB extends DBSchema {
  'encrypted-keys': {
    key: string;
    value: {
      encryptedKey: string;
      salt: string;
      iv: string;
    };
  };
}

export class SecureEncryptionService {
  private static dbPromise: Promise<IDBPDatabase<SecureKeysDB>> | null = null;

  private static async getDB() {
    if (!this.dbPromise) {
      this.dbPromise = openDB<SecureKeysDB>('vigil-secure-keys', 1, {
        upgrade(db) {
          db.createObjectStore('encrypted-keys');
        },
      });
    }
    return this.dbPromise;
  }

  // Derivar chave de criptografia do password do usuário
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const importedKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      importedKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Armazenar chave privada de forma segura
  static async storePrivateKey(
    privateKey: string,
    userId: string,
    userPassword: string
  ): Promise<void> {
    const db = await this.getDB();
    
    // Gerar salt aleatório
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Derivar chave de criptografia
    const encryptionKey = await this.deriveKey(userPassword, salt);
    
    // Gerar IV aleatório
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Criptografar a chave privada
    const encoder = new TextEncoder();
    const privateKeyBuffer = encoder.encode(privateKey);
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      privateKeyBuffer
    );
    
    // Armazenar no IndexedDB
    await db.put('encrypted-keys', {
      encryptedKey: encodeBase64(new Uint8Array(encryptedBuffer)),
      salt: encodeBase64(salt),
      iv: encodeBase64(iv),
    }, `pk_${userId}`);
  }

  // Recuperar chave privada
  static async getPrivateKey(
    userId: string,
    userPassword: string
  ): Promise<string | null> {
    try {
      const db = await this.getDB();
      const stored = await db.get('encrypted-keys', `pk_${userId}`);
      
      if (!stored) return null;
      
      // Decodificar dados armazenados
      const salt = decodeBase64(stored.salt);
      const iv = decodeBase64(stored.iv);
      const encryptedKey = decodeBase64(stored.encryptedKey);
      
      // Derivar chave de descriptografia
      const decryptionKey = await this.deriveKey(userPassword, salt);
      
      // Descriptografar
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        decryptionKey,
        encryptedKey
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Failed to decrypt private key:', error);
      return null;
    }
  }

  // Limpar chave privada
  static async clearPrivateKey(userId: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('encrypted-keys', `pk_${userId}`);
  }

  // Gerar par de chaves
  static generateKeyPair() {
    const keyPair = nacl.box.keyPair();
    return {
      publicKey: encodeBase64(keyPair.publicKey),
      privateKey: encodeBase64(keyPair.secretKey),
    };
  }

  // Criptografar mensagem (mantém a mesma interface)
  static encryptMessage(
    message: string,
    recipientPublicKey: string,
    senderPrivateKey: string
  ): { encrypted: string; nonce: string } {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = decodeUTF8(message);
    const recipientPubKeyUint8 = decodeBase64(recipientPublicKey);
    const senderPrivKeyUint8 = decodeBase64(senderPrivateKey);

    const encrypted = nacl.box(
      messageUint8,
      nonce,
      recipientPubKeyUint8,
      senderPrivKeyUint8
    );

    return {
      encrypted: encodeBase64(encrypted),
      nonce: encodeBase64(nonce),
    };
  }

  // Descriptografar mensagem (mantém a mesma interface)
  static decryptMessage(
    encryptedData: string,
    nonce: string,
    senderPublicKey: string,
    recipientPrivateKey: string
  ): string | null {
    try {
      const encryptedUint8 = decodeBase64(encryptedData);
      const nonceUint8 = decodeBase64(nonce);
      const senderPubKeyUint8 = decodeBase64(senderPublicKey);
      const recipientPrivKeyUint8 = decodeBase64(recipientPrivateKey);

      const decrypted = nacl.box.open(
        encryptedUint8,
        nonceUint8,
        senderPubKeyUint8,
        recipientPrivKeyUint8
      );

      if (!decrypted) return null;

      return encodeUTF8(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }
}
```

3. **Substituir importações:**

```bash
# Buscar todos os arquivos que usam EncryptionService
rg "EncryptionService" --type ts --type tsx
```

4. **Atualizar importações:**

```typescript
// ❌ Antes:
import { EncryptionService } from '@/services/encryption.service';

// ✅ Depois:
import { SecureEncryptionService as EncryptionService } from '@/services/secure-encryption.service';
```

5. **Migrar chaves existentes (criar script de migração):**

Criar: `scripts/migrate-encryption-keys.ts`

```typescript
import { EncryptionService } from '../src/services/encryption.service';
import { SecureEncryptionService } from '../src/services/secure-encryption.service';

async function migrateKeys() {
  // Obter userId do usuário logado
  const userId = localStorage.getItem('userId');
  if (!userId) {
    console.log('No user logged in');
    return;
  }

  // Obter chave antiga do localStorage
  const oldKey = EncryptionService.getPrivateKey(userId);
  if (!oldKey) {
    console.log('No old key found');
    return;
  }

  // Solicitar password do usuário
  const password = prompt('Digite sua senha para migrar suas chaves de criptografia:');
  if (!password) return;

  // Armazenar com novo método
  await SecureEncryptionService.storePrivateKey(oldKey, userId, password);

  // Remover chave antiga
  EncryptionService.clearPrivateKey(userId);

  console.log('Migration completed successfully!');
}

// Executar na primeira vez que o usuário logar após atualização
migrateKeys();
```

6. **Testar:**

- [ ] Criar novo par de chaves
- [ ] Enviar mensagem criptografada
- [ ] Receber e descriptografar mensagem
- [ ] Fazer logout e login novamente
- [ ] Verificar se as chaves persistem

---

## ⚠️ PARTE 2: CORREÇÕES DE ALTA PRIORIDADE

### 2.1 Implementar Rate Limiting

**Tempo estimado:** 1 hora  
**Custo:** Grátis (tier gratuito do Upstash)

#### Passos:

1. **Criar conta no Upstash:**
   - Ir para https://upstash.com
   - Criar database Redis
   - Copiar `UPSTASH_REDIS_URL` e `UPSTASH_REDIS_TOKEN`

2. **Adicionar variáveis de ambiente no Supabase:**
   - Dashboard > Settings > Edge Functions > Secrets
   - Adicionar:
     - `UPSTASH_REDIS_URL`
     - `UPSTASH_REDIS_TOKEN`

3. **Criar arquivo de rate limiting:**

Criar: `supabase/functions/_shared/ratelimit.ts`

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_URL')!,
  token: Deno.env.get('UPSTASH_REDIS_TOKEN')!,
});

// Rate limiters para diferentes casos de uso
export const rateLimiters = {
  // 10 requisições por minuto (emails, notificações)
  strict: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
  }),
  
  // 30 requisições por minuto (API geral)
  moderate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
  }),
  
  // 100 requisições por minuto (leitura)
  relaxed: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
  }),
};

export async function checkRateLimit(
  req: Request,
  limiter: Ratelimit = rateLimiters.moderate
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const ip = req.headers.get("x-forwarded-for") ?? 
             req.headers.get("x-real-ip") ?? 
             "anonymous";
  
  const { success, limit, remaining, reset } = await limiter.limit(ip);
  
  return { success, limit, remaining, reset };
}
```

4. **Aplicar em Edge Functions:**

Exemplo: `supabase/functions/send-support-email/index.ts`

```typescript
import { checkRateLimit, rateLimiters } from "../_shared/ratelimit.ts";

Deno.serve(async (req) => {
  // Verificar rate limit
  const rateLimit = await checkRateLimit(req, rateLimiters.strict);
  
  if (!rateLimit.success) {
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        retryAfter: rateLimit.reset
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": rateLimit.limit.toString(),
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.reset.toString(),
        },
      }
    );
  }
  
  // ... resto do código
});
```

5. **Aplicar em todas as Edge Functions críticas:**

- [ ] `send-support-email`
- [ ] `send-push`
- [ ] `create-checkout-session`
- [ ] `moderar-conteudo`
- [ ] `generate-content`

---

### 2.2 Adicionar Validação de Entrada

**Tempo estimado:** 30 minutos

1. **Instalar Zod nas Edge Functions:**

Criar: `supabase/functions/_shared/validation.ts`

```typescript
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Schemas de validação comuns
export const schemas = {
  email: z.object({
    email: z.string().email().max(255),
    subject: z.string().min(5).max(200),
    message: z.string().min(10).max(5000),
  }),
  
  notification: z.object({
    userId: z.string().uuid(),
    title: z.string().min(1).max(100),
    body: z.string().min(1).max(500),
  }),
  
  content: z.object({
    text: z.string().min(1).max(10000),
  }),
};

export function validateRequest<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
    }
    return { success: false, error: 'Invalid input' };
  }
}
```

2. **Aplicar validação:**

```typescript
import { validateRequest, schemas } from "../_shared/validation.ts";

Deno.serve(async (req) => {
  const body = await req.json();
  
  const validation = validateRequest(body, schemas.email);
  if (!validation.success) {
    return new Response(
      JSON.stringify({ error: validation.error }),
      { status: 400 }
    );
  }
  
  const { email, subject, message } = validation.data;
  // ... processar
});
```

---

### 2.3 Habilitar Proteção Contra Senhas Vazadas

**Tempo estimado:** 5 minutos

1. **Ir para Supabase Dashboard:**
   - Authentication > Settings
   - Scroll até "Password Settings"
   - Habilitar "Leaked Password Protection"
   - Salvar

---

## 🔐 PARTE 3: MELHORIAS ADICIONAIS

### 3.1 Adicionar Headers de Segurança

Editar `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com;",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    }
  }
});
```

---

## ✅ CHECKLIST FINAL

### Antes de Deploy em Produção:

- [ ] Todas as correções críticas aplicadas
- [ ] Testes executados em staging
- [ ] Backup do banco de dados criado
- [ ] Equipe notificada sobre mudanças
- [ ] Documentação atualizada
- [ ] Monitoramento configurado

### Após Deploy:

- [ ] Verificar logs de erro
- [ ] Testar funcionalidades principais
- [ ] Monitorar métricas de segurança
- [ ] Executar novo teste de segurança em 7 dias

---

## 📞 SUPORTE

Se encontrar problemas durante a implementação:

1. Verificar logs do Supabase
2. Consultar documentação oficial
3. Abrir issue no repositório
4. Contatar equipe de segurança

---

**Última atualização:** 01 de Fevereiro de 2026
