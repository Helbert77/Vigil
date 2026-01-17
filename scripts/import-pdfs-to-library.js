/**
 * Script para importar PDFs da pasta data/ para o Supabase Storage e biblioteca
 * 
 * Este script:
 * 1. Faz upload dos PDFs para o Supabase Storage (bucket: library-files)
 * 2. Insere os metadados na tabela library_items
 * 
 * Uso: node scripts/import-pdfs-to-library.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidos no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Pasta onde estão os PDFs
const DATA_DIR = path.join(__dirname, '../data');

// Metadados dos livros (extraídos dos nomes dos arquivos)
const bookMetadata = {
  '1984.pdf': {
    title: '1984',
    author: 'George Orwell',
    description: 'Romance distópico sobre um regime totalitário que controla todos os aspectos da vida através da vigilância constante e manipulação da verdade.',
    tags: ['distopia', 'totalitarismo', 'vigilância', 'controle social', 'ficção'],
    published_date: '1949-06-08'
  },
  'A Escada para o Céu.pdf': {
    title: 'A Escada para o Céu',
    author: 'Zecharia Sitchin',
    description: 'Segundo livro das Crônicas da Terra, explora as conexões entre os deuses antigos e as estruturas monumentais ao redor do mundo.',
    tags: ['história alternativa', 'anunnaki', 'civilizações antigas', 'arqueologia', 'mistérios'],
    published_date: '1980-01-01'
  },
  'A história está errada.pdf': {
    title: 'A História Está Errada',
    author: 'Erich von Däniken',
    description: 'Questiona a narrativa histórica oficial apresentando evidências de tecnologias avançadas em civilizações antigas.',
    tags: ['história alternativa', 'civilizações antigas', 'tecnologia antiga', 'mistérios', 'arqueologia'],
    published_date: '2009-01-01'
  },
  'Deuses Espaçonaves e Terra.pdf': {
    title: 'Deuses, Espaçonaves e Terra',
    author: 'Erich von Däniken',
    description: 'Explora a teoria dos astronautas antigos e as evidências de visitação extraterrestre na antiguidade.',
    tags: ['astronautas antigos', 'extraterrestres', 'civilizações antigas', 'mistérios', 'história alternativa'],
    published_date: '1972-01-01'
  },
  'Eram os Deuses Astronautas.pdf': {
    title: 'Eram os Deuses Astronautas?',
    author: 'Erich von Däniken',
    description: 'Obra pioneira que propõe que os deuses das antigas mitologias eram na verdade visitantes extraterrestres.',
    tags: ['astronautas antigos', 'extraterrestres', 'mitologia', 'civilizações antigas', 'história alternativa'],
    published_date: '1968-01-01'
  },
  'Havia Gigantes na Terra.pdf': {
    title: 'Havia Gigantes na Terra',
    author: 'Zecharia Sitchin',
    description: 'Explora as evidências de seres gigantes mencionados em textos antigos e sua conexão com os Anunnaki.',
    tags: ['gigantes', 'anunnaki', 'história alternativa', 'civilizações antigas', 'mitologia'],
    published_date: '2010-01-01'
  },
  'O 12o Planeta PT.pdf': {
    title: 'O 12º Planeta',
    author: 'Zecharia Sitchin',
    description: 'Primeiro livro das Crônicas da Terra, apresenta a teoria de Nibiru e os Anunnaki como criadores da humanidade.',
    tags: ['nibiru', 'anunnaki', 'história alternativa', 'civilizações antigas', 'suméria'],
    published_date: '1976-01-01'
  },
  'O Livro Perdido de Enki.pdf': {
    title: 'O Livro Perdido de Enki',
    author: 'Zecharia Sitchin',
    description: 'Narrativa em primeira pessoa de Enki, líder Anunnaki, contando a história da criação da humanidade.',
    tags: ['enki', 'anunnaki', 'história alternativa', 'civilizações antigas', 'suméria', 'mitologia'],
    published_date: '2002-01-01'
  },
  'Os reinos perdidos_ as evidências dos gigantes.pdf': {
    title: 'Os Reinos Perdidos: As Evidências dos Gigantes',
    author: 'Zecharia Sitchin',
    description: 'Investiga as evidências arqueológicas de civilizações perdidas e a presença de gigantes na Terra.',
    tags: ['gigantes', 'civilizações perdidas', 'arqueologia', 'história alternativa', 'mistérios'],
    published_date: '1990-01-01'
  },
  'Tartaria.pdf': {
    title: 'Tartaria',
    author: 'Vários Autores',
    description: 'Compilação sobre o império perdido de Tartaria e as evidências de sua existência apagada da história oficial.',
    tags: ['tartaria', 'história alternativa', 'civilizações perdidas', 'conspiração', 'reset civilizacional'],
    published_date: '2020-01-01'
  },
  'The 12th Planet (Book I).pdf': {
    title: 'The 12th Planet (Book I)',
    author: 'Zecharia Sitchin',
    description: 'Original em inglês do primeiro livro das Crônicas da Terra sobre Nibiru e os Anunnaki.',
    tags: ['nibiru', 'anunnaki', 'alternative history', 'ancient civilizations', 'sumeria'],
    published_date: '1976-01-01'
  },
  'The Chemtrail Conspiracy Set.pdf': {
    title: 'The Chemtrail Conspiracy Set',
    author: 'Vários Autores',
    description: 'Compilação de documentos e evidências sobre chemtrails e geoengenharia.',
    tags: ['chemtrails', 'geoengenharia', 'conspiração', 'controle climático', 'saúde'],
    published_date: '2015-01-01'
  },
  'The End of Days - Armageddon and Prophecies of the Return.pdf': {
    title: 'The End of Days - Armageddon and Prophecies of the Return',
    author: 'Zecharia Sitchin',
    description: 'Último livro das Crônicas da Terra, explora profecias antigas sobre o retorno dos Anunnaki.',
    tags: ['profecias', 'anunnaki', 'apocalipse', 'história alternativa', 'fim dos tempos'],
    published_date: '2007-01-01'
  },
  'The Gods Were Astronauts - Evidence of the True Identities of.pdf': {
    title: 'The Gods Were Astronauts - Evidence of the True Identities',
    author: 'Erich von Däniken',
    description: 'Evidências que suportam a teoria de que os deuses antigos eram astronautas extraterrestres.',
    tags: ['ancient astronauts', 'extraterrestrials', 'alternative history', 'mythology', 'evidence'],
    published_date: '2001-01-01'
  },
  'The Gold of The Gods.pdf': {
    title: 'The Gold of The Gods',
    author: 'Erich von Däniken',
    description: 'Explora túneis subterrâneos na América do Sul e artefatos que desafiam a história convencional.',
    tags: ['túneis', 'ouro', 'américa do sul', 'arqueologia', 'mistérios'],
    published_date: '1973-01-01'
  },
  'The Lost Book of Enki.pdf': {
    title: 'The Lost Book of Enki',
    author: 'Zecharia Sitchin',
    description: 'Versão em inglês do relato de Enki sobre a criação da humanidade e a história dos Anunnaki.',
    tags: ['enki', 'anunnaki', 'alternative history', 'ancient civilizations', 'sumeria', 'mythology'],
    published_date: '2002-01-01'
  },
  'The Lost Empire of Tartaria.pdf': {
    title: 'The Lost Empire of Tartaria',
    author: 'Various Authors',
    description: 'Investigação sobre o império perdido de Tartaria e as evidências de sua supressão histórica.',
    tags: ['tartaria', 'alternative history', 'lost civilizations', 'conspiracy', 'reset'],
    published_date: '2019-01-01'
  },
  'The Stairway to Heaven - Book II of the Earth Chronicles.pdf': {
    title: 'The Stairway to Heaven - Book II of the Earth Chronicles',
    author: 'Zecharia Sitchin',
    description: 'Versão em inglês do segundo livro das Crônicas da Terra sobre estruturas monumentais antigas.',
    tags: ['earth chronicles', 'anunnaki', 'ancient structures', 'alternative history', 'pyramids'],
    published_date: '1980-01-01'
  }
};

/**
 * Faz upload de um arquivo PDF para o Supabase Storage
 */
async function uploadPdfToStorage(filePath, fileName) {
  try {
    console.log(`📤 Fazendo upload de: ${fileName}...`);
    
    const fileBuffer = fs.readFileSync(filePath);
    const fileExt = path.extname(fileName);
    const fileNameWithoutExt = path.basename(fileName, fileExt);
    
    // Criar nome de arquivo único e seguro
    const timestamp = Date.now();
    const safeFileName = `${fileNameWithoutExt}-${timestamp}${fileExt}`
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_');
    
    const { data, error } = await supabase.storage
      .from('library-files')
      .upload(safeFileName, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });
    
    if (error) {
      console.error(`   ❌ Erro no upload: ${error.message}`);
      return null;
    }
    
    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('library-files')
      .getPublicUrl(safeFileName);
    
    console.log(`   ✅ Upload concluído: ${safeFileName}`);
    return publicUrl;
    
  } catch (error) {
    console.error(`   ❌ Erro ao processar arquivo: ${error.message}`);
    return null;
  }
}

/**
 * Insere metadados do livro na tabela library_items
 */
async function insertLibraryItem(fileName, fileUrl) {
  try {
    const metadata = bookMetadata[fileName];
    
    if (!metadata) {
      console.warn(`   ⚠️  Metadados não encontrados para: ${fileName}`);
      return false;
    }
    
    const libraryItem = {
      type: 'ebook',
      title: metadata.title,
      author: metadata.author,
      description: metadata.description,
      file_url: fileUrl,
      date: new Date().toISOString(),
      published_date: metadata.published_date,
      tags: metadata.tags,
      views: 0,
      downloads: 0,
      created_by: null // Será preenchido automaticamente pelo RLS se houver usuário autenticado
    };
    
    const { data, error } = await supabase
      .from('library_items')
      .insert(libraryItem)
      .select()
      .single();
    
    if (error) {
      console.error(`   ❌ Erro ao inserir no banco: ${error.message}`);
      return false;
    }
    
    console.log(`   ✅ Metadados inseridos: ${metadata.title}`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ Erro ao inserir metadados: ${error.message}`);
    return false;
  }
}

/**
 * Verifica se o bucket existe e cria se necessário
 */
async function ensureBucketExists() {
  try {
    // Tentar listar buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError.message);
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'library-files');
    
    if (bucketExists) {
      console.log('✅ Bucket "library-files" já existe\n');
      return true;
    }
    
    // Criar bucket se não existir
    console.log('📦 Criando bucket "library-files"...');
    const { data, error: createError } = await supabase.storage.createBucket('library-files', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['application/pdf']
    });
    
    if (createError) {
      console.error('❌ Erro ao criar bucket:', createError.message);
      return false;
    }
    
    console.log('✅ Bucket criado com sucesso\n');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao verificar/criar bucket:', error.message);
    return false;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando importação de PDFs para a biblioteca...\n');
  
  // Verificar/criar bucket
  const bucketReady = await ensureBucketExists();
  if (!bucketReady) {
    console.error('❌ Não foi possível preparar o bucket de armazenamento');
    process.exit(1);
  }
  
  // Verificar se a pasta data existe
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`❌ Pasta não encontrada: ${DATA_DIR}`);
    process.exit(1);
  }
  
  // Listar arquivos PDF
  const files = fs.readdirSync(DATA_DIR)
    .filter(file => file.endsWith('.pdf'));
  
  console.log(`📚 Encontrados ${files.length} arquivos PDF\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  // Processar cada PDF
  for (const fileName of files) {
    console.log(`\n📖 Processando: ${fileName}`);
    const filePath = path.join(DATA_DIR, fileName);
    
    // 1. Upload para Storage
    const fileUrl = await uploadPdfToStorage(filePath, fileName);
    
    if (!fileUrl) {
      failCount++;
      continue;
    }
    
    // 2. Inserir metadados no banco
    const inserted = await insertLibraryItem(fileName, fileUrl);
    
    if (inserted) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  // Resumo
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DA IMPORTAÇÃO');
  console.log('='.repeat(60));
  console.log(`✅ Sucesso: ${successCount} livros`);
  console.log(`❌ Falhas: ${failCount} livros`);
  console.log(`📚 Total: ${files.length} livros`);
  console.log('='.repeat(60));
  
  if (successCount > 0) {
    console.log('\n✨ Importação concluída! Os livros estão disponíveis na biblioteca.');
  }
}

// Executar
main().catch(console.error);
