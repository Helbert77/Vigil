import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Ler a logo e converter para base64
const logoPath = join(rootDir, 'public', 'logo.png');
const logoBuffer = readFileSync(logoPath);
const base64 = logoBuffer.toString('base64');
const dataUri = `data:image/png;base64,${base64}`;

console.log(`Logo convertida para base64. Tamanho: ${Math.round(dataUri.length / 1024)} KB`);

// Atualizar templates
const template1Path = join(rootDir, 'supabase', 'functions', 'send-password-reset-email', 'password-reset-template.html');
const template2Path = join(rootDir, 'supabase', 'functions', 'send-password-reset-email', 'email-confirmation-template.html');

let template1 = readFileSync(template1Path, 'utf8');
let template2 = readFileSync(template2Path, 'utf8');

// Substituir URLs por base64 inline
template1 = template1.replace(/src="\{\{ \.SiteURL \}\}\/logo\.png"/g, `src="${dataUri}"`);
template2 = template2.replace(/src="\{\{ \.SiteURL \}\}\/logo\.png"/g, `src="${dataUri}"`);

writeFileSync(template1Path, template1);
writeFileSync(template2Path, template2);

console.log('✅ Templates atualizados com logo base64 inline!');
console.log('A logo agora será carregada diretamente do HTML, funcionando em qualquer cliente de email.');

