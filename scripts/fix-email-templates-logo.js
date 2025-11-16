import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Caminhos dos templates
const template1Path = join(rootDir, 'supabase', 'functions', 'send-password-reset-email', 'password-reset-template.html');
const template2Path = join(rootDir, 'supabase', 'functions', 'send-password-reset-email', 'email-confirmation-template.html');

// Ler templates
let template1 = readFileSync(template1Path, 'utf8');
let template2 = readFileSync(template2Path, 'utf8');

// Remover base64 inline e usar URL do Supabase Storage
// A logo deve ser hospedada em: https://[PROJECT_ID].supabase.co/storage/v1/object/public/email-assets/logo.png
// Ou usar a URL do site: {{ .SiteURL }}/logo.png
const logoUrl = '{{ .SiteURL }}/logo.png';

// Substituir todas as ocorrências de base64 por URL
// Regex para encontrar src="data:image/png;base64,..."
const base64Regex = /src="data:image\/png;base64,[^"]+"/g;

template1 = template1.replace(base64Regex, `src="${logoUrl}"`);
template2 = template2.replace(base64Regex, `src="${logoUrl}"`);

// Salvar templates
writeFileSync(template1Path, template1);
writeFileSync(template2Path, template2);

console.log('✅ Templates atualizados!');
console.log(`📏 Tamanho do template 1: ${template1.length} caracteres`);
console.log(`📏 Tamanho do template 2: ${template2.length} caracteres`);
console.log('');
console.log('⚠️  IMPORTANTE: Para que a logo funcione nos emails:');
console.log('1. Certifique-se de que a logo está acessível em {{ .SiteURL }}/logo.png');
console.log('2. Configure a Site URL no Supabase: Settings > API > Site URL');
console.log('3. OU hospede a logo no Supabase Storage e atualize a URL nos templates');
console.log('');
console.log('💡 Dica: Para evitar bloqueios, considere hospedar a logo em um CDN confiável');

