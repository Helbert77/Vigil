import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mime from 'mime-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = 'https://oprqgllsqtfdyjgvgovo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ID de um usuário admin para usar como created_by
const ADMIN_USER_ID = 'e98e65a3-94ea-4bff-ac7a-a97dc60ad666'; // Helbert Rosa (admin)

// Configurações
const BASE_URL = 'https://www.cia.gov';
const SEARCH_URL = 'https://www.cia.gov/readingroom/search/site';
const TEMP_DIR = path.join(__dirname, 'temp_pdfs');
const DELAY_BETWEEN_REQUESTS = 2000; // 2 segundos entre requisições
const MAX_DOCUMENTS_PER_RUN = 50; // Limitar para teste inicial

// Mapeamento de palavras-chave para categorias
const CATEGORY_KEYWORDS = {
  'ufo': ['ufo', 'unidentified flying object', 'aerial phenomena', 'uap'],
  'experiments': ['mk-ultra', 'mkultra', 'mind control', 'behavioral modification', 'psychological', 'experiment'],
  'operations': ['assassination', 'operation', 'covert', 'intelligence operation', 'mission'],
  'surveillance': ['surveillance', 'monitoring', 'intelligence gathering', 'reconnaissance'],
  'nuclear': ['nuclear', 'atomic', 'missile', 'weapons', 'strategic'],
  'foreign-intelligence': ['foreign', 'embassy', 'diplomatic', 'international'],
  'technology': ['technology', 'technical', 'scientific', 'research', 'development'],
  'personnel': ['personnel', 'staff', 'employee', 'officer'],
  'reports': ['report', 'analysis', 'assessment', 'briefing', 'intelligence']
};

// Função para criar diretório temporário
function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

// Função para delay entre requisições
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para fazer scraping das coleções históricas (abordagem alternativa)
async function scrapeHistoricalCollections() {
  try {
    console.log('🔍 Fazendo scraping das coleções históricas da CIA...');
    
    const url = 'https://www.cia.gov/readingroom/historical-collections';
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const collections = [];
    
    // Procurar por links de coleções
    $('a[href*="/readingroom/collection/"]').each((index, element) => {
      const $link = $(element);
      const title = $link.text().trim();
      const href = $link.attr('href');
      
      if (title && href && title.length > 5) {
        const fullUrl = href.startsWith('http') ? href : BASE_URL + href;
        collections.push({
          title,
          url: fullUrl,
          type: 'collection'
        });
      }
    });
    
    console.log(`📚 Encontradas ${collections.length} coleções históricas`);
    return collections;
    
  } catch (error) {
    console.error('❌ Erro ao fazer scraping das coleções históricas:', error.message);
    return [];
  }
}

// Função para fazer scraping de documentos de uma coleção específica
async function scrapeCollectionDocuments(collectionUrl) {
  try {
    console.log(`🔍 Fazendo scraping da coleção: ${collectionUrl}`);
    
    const response = await axios.get(collectionUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const documents = [];
    
    // Procurar por links de documentos
    $('a[href*="/readingroom/document/"]').each((index, element) => {
      const $link = $(element);
      const title = $link.text().trim();
      const href = $link.attr('href');
      
      if (title && href && title.length > 5) {
        const fullUrl = href.startsWith('http') ? href : BASE_URL + href;
        
        // Tentar extrair descrição do contexto
        const description = $link.closest('p, div, li').text().trim();
        
        documents.push({
          title,
          url: fullUrl,
          description: description.substring(0, 500),
          category: 'document'
        });
      }
    });
    
    console.log(`📄 Encontrados ${documents.length} documentos na coleção`);
    return documents;
    
  } catch (error) {
    console.error(`❌ Erro ao fazer scraping da coleção ${collectionUrl}:`, error.message);
    return [];
  }
}

// Função para usar URLs de documentos conhecidos (fallback)
function getKnownDocuments() {
  // Lista de documentos conhecidos da CIA que são públicos
  return [
    {
      title: 'METAL OBJECT FALLS ON PRIVATE HOUSE IN CORRIENTES',
      url: 'https://www.cia.gov/readingroom/document/0005516593',
      description: 'Documento sobre objeto metálico que caiu em casa privada na Argentina',
      category: 'ufo'
    },
    {
      title: 'UNTITLED (TO DONALD KEYHOE FROM C.P. CABELL ACKNOWLEDGING HIS LETTER OF MARCH 13 CONCERNING THE VARIOUS REPORTS ON UFOS)',
      url: 'https://www.cia.gov/readingroom/document/0005515777',
      description: 'Correspondência sobre relatórios de OVNIs',
      category: 'ufo'
    },
    {
      title: 'OFFICE RESPONSIBILITIES FOR NON-CONVENTIONAL TYPES OF AIR VEHICLES',
      url: 'https://www.cia.gov/readingroom/document/0005515999',
      description: 'Documento sobre responsabilidades para veículos aéreos não convencionais',
      category: 'ufo'
    },
    {
      title: 'REPORT OF THE SCIENTIFIC PANEL ON UNIDENTIFIED FLYING OBJECTS',
      url: 'https://www.cia.gov/readingroom/document/0005516125',
      description: 'Relatório do painel científico sobre objetos voadores não identificados',
      category: 'ufo'
    },
    {
      title: 'AIR FORCE REQUEST TO DECLASSIFY CIA UFO REPORT',
      url: 'https://www.cia.gov/readingroom/document/0005516063',
      description: 'Solicitação da Força Aérea para desclassificar relatório de OVNI da CIA',
      category: 'ufo'
    }
  ];
}

// Função principal para obter lista de documentos (usando múltiplas estratégias)
async function scrapeDocumentsList(category = '', page = 0) {
  try {
    console.log(`🔍 Obtendo documentos da categoria: ${category || 'todas'}`);
    
    let documents = [];
    
    // Estratégia 1: Tentar scraping das coleções históricas
    if (page === 0) {
      const collections = await scrapeHistoricalCollections();
      
      // Processar algumas coleções
      for (const collection of collections.slice(0, 3)) {
        await delay(DELAY_BETWEEN_REQUESTS);
        const collectionDocs = await scrapeCollectionDocuments(collection.url);
        documents.push(...collectionDocs);
        
        if (documents.length >= 20) break; // Limitar para não sobrecarregar
      }
    }
    
    // Estratégia 2: Se não encontrou documentos, usar lista conhecida
    if (documents.length === 0) {
      console.log('📋 Usando lista de documentos conhecidos...');
      documents = getKnownDocuments();
      
      // Filtrar por categoria se especificada
      if (category) {
        documents = documents.filter(doc => doc.category === category);
      }
    }
    
    console.log(`📄 Total de ${documents.length} documentos obtidos`);
    return documents;
    
  } catch (error) {
    console.error(`❌ Erro ao obter documentos:`, error.message);
    
    // Fallback: retornar documentos conhecidos
    console.log('📋 Usando fallback com documentos conhecidos...');
    const knownDocs = getKnownDocuments();
    return category ? knownDocs.filter(doc => doc.category === category) : knownDocs;
  }
}

// Função para extrair metadados de um documento específico
async function extractDocumentMetadata(documentUrl) {
  try {
    console.log(`📋 Extraindo metadados de: ${documentUrl}`);
    
    const response = await axios.get(documentUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Extrair metadados da página
    const metadata = {
      title: $('h1').first().text().trim(),
      documentNumber: '',
      releaseDate: '',
      publicationDate: '',
      keywords: [],
      collection: '',
      pdfUrl: '',
      description: ''
    };
    
    // Extrair informações dos campos de metadados (múltiplas estratégias)
    
    // Estratégia 1: Campos com classe .field
    $('.field').each((index, element) => {
      const $field = $(element);
      const label = $field.find('.field-label').text().trim();
      const value = $field.find('.field-item, .field-items').text().trim();
      
      if (label && value) {
        switch (label) {
          case 'Document Number (FOIA) /ESDN (CREST):':
            metadata.documentNumber = value;
            break;
          case 'Document Release Date:':
            metadata.releaseDate = value;
            break;
          case 'Publication Date:':
            metadata.publicationDate = value;
            break;
          case 'Keywords:':
            metadata.keywords = value.split(',').map(k => k.trim().toLowerCase());
            break;
          case 'Collection:':
            metadata.collection = value;
            break;
        }
      }
    });
    
    // Estratégia 2: Procurar por estrutura de metadados alternativa
    $('div').each((index, element) => {
      const $div = $(element);
      const text = $div.text().trim();
      
      // Procurar por padrões específicos
      if (text.includes('Document Number') && text.includes(':')) {
        const match = text.match(/Document Number[^:]*:\s*([^\s]+)/i);
        if (match && !metadata.documentNumber) {
          metadata.documentNumber = match[1];
        }
      }
      
      if (text.includes('Release Date') && text.includes(':')) {
        const match = text.match(/Release Date[^:]*:\s*([^\n]+)/i);
        if (match && !metadata.releaseDate) {
          metadata.releaseDate = match[1].trim();
        }
      }
      
      if (text.includes('Publication Date') && text.includes(':')) {
        const match = text.match(/Publication Date[^:]*:\s*([^\n]+)/i);
        if (match && !metadata.publicationDate) {
          metadata.publicationDate = match[1].trim();
        }
      }
    });
    
    // Extrair URL do PDF
    const pdfLink = $('a[href$=".pdf"]').first();
    if (pdfLink.length > 0) {
      const pdfHref = pdfLink.attr('href');
      metadata.pdfUrl = pdfHref.startsWith('http') ? pdfHref : BASE_URL + pdfHref;
    }
    
    // Extrair descrição do corpo do documento
    const bodyText = $('.field-name-body .field-item').text().trim();
    if (bodyText) {
      metadata.description = bodyText.substring(0, 500) + (bodyText.length > 500 ? '...' : '');
    }
    
    return metadata;
    
  } catch (error) {
    console.error(`❌ Erro ao extrair metadados de ${documentUrl}:`, error.message);
    return null;
  }
}

// Função para detectar categoria automaticamente
function detectCategory(title, description, keywords) {
  const text = (title + ' ' + description + ' ' + keywords.join(' ')).toLowerCase();
  
  for (const [category, categoryKeywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of categoryKeywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'documents'; // Categoria padrão
}

// Função para extrair tags relevantes
function extractTags(title, description, keywords) {
  const text = (title + ' ' + description).toLowerCase();
  const tags = new Set(keywords.map(k => k.toLowerCase()));
  
  // Adicionar tags baseadas em palavras-chave importantes
  const importantWords = [
    'cia', 'classified', 'secret', 'confidential', 'intelligence',
    'soviet', 'russia', 'china', 'cuba', 'vietnam',
    'cold war', 'assassination', 'surveillance', 'operation'
  ];
  
  importantWords.forEach(word => {
    if (text.includes(word)) {
      tags.add(word.replace(' ', '-'));
    }
  });
  
  return Array.from(tags).slice(0, 10); // Limitar a 10 tags
}

// Função para baixar PDF
async function downloadPDF(pdfUrl, filename) {
  try {
    console.log(`⬇️ Baixando PDF: ${filename}`);
    
    const response = await axios.get(pdfUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const filePath = path.join(TEMP_DIR, filename);
    const writer = fs.createWriteStream(filePath);
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath));
      writer.on('error', reject);
    });
    
  } catch (error) {
    console.error(`❌ Erro ao baixar PDF ${filename}:`, error.message);
    return null;
  }
}

// Função para fazer upload para Supabase Storage
async function uploadToSupabaseStorage(filePath, filename) {
  try {
    console.log(`☁️ Fazendo upload para Supabase Storage: ${filename}`);
    
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = mime.lookup(filename) || 'application/pdf';
    
    const { data, error } = await supabase.storage
      .from('posts-media')
      .upload(`library/${filename}`, fileBuffer, {
        contentType: mimeType,
        upsert: true
      });
    
    if (error) {
      throw error;
    }
    
    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('posts-media')
      .getPublicUrl(`library/${filename}`);
    
    return publicUrlData.publicUrl;
    
  } catch (error) {
    console.error(`❌ Erro ao fazer upload para Supabase Storage:`, error.message);
    return null;
  }
}

// Função para inserir documento na tabela library_items usando função SQL
async function insertDocumentToDatabase(documentData) {
  try {
    console.log(`💾 Inserindo documento no banco de dados: ${documentData.title}`);
    
    const { data, error } = await supabase.rpc('import_cia_document', {
      p_title: documentData.title,
      p_author: 'Central Intelligence Agency',
      p_description: documentData.description,
      p_tags: documentData.tags,
      p_file_url: documentData.download_url || documentData.read_url, // Usar read_url se download_url não existir
      p_published_date: documentData.published_date
    });
    
    if (error) {
      throw error;
    }
    
    if (data) {
      console.log(`✅ Documento inserido com sucesso: ${documentData.title} (ID: ${data})`);
      return { data: { id: data }, error: null };
    } else {
      console.log(`⚠️ Documento já existe: ${documentData.title}`);
      return { data: { id: data }, error: null };
    }
    
  } catch (error) {
    console.error(`❌ Erro ao inserir documento no banco de dados:`, error.message);
    return { data: null, error };
  }
}

// Função principal para processar um documento
async function processDocument(document) {
  try {
    console.log(`\n🔄 Processando documento: ${document.title}`);
    
    // 1. Extrair metadados detalhados
    const metadata = await extractDocumentMetadata(document.url);
    if (!metadata) {
      console.log(`⚠️ Não foi possível extrair metadados de: ${document.title}`);
      return false;
    }
    
    await delay(DELAY_BETWEEN_REQUESTS);
    
    // 2. FORÇAR download do PDF mesmo se não encontrado nos metadados
    let downloadUrl = null;
    let pdfUrl = metadata.pdfUrl;
    
    // Se não encontrou PDF nos metadados, tentar construir URL padrão
    if (!pdfUrl && metadata.documentNumber) {
      pdfUrl = `https://www.cia.gov/readingroom/docs/DOC_${metadata.documentNumber}.pdf`;
      console.log(`🔍 Tentando URL construída: ${pdfUrl}`);
    }
    
    // Se ainda não tem URL, usar a URL da página + .pdf
    if (!pdfUrl) {
      const urlParts = document.url.split('/');
      const docId = urlParts[urlParts.length - 1];
      pdfUrl = `https://www.cia.gov/readingroom/docs/DOC_${docId}.pdf`;
      console.log(`🔍 Tentando URL baseada no ID: ${pdfUrl}`);
    }
    
    if (pdfUrl) {
      const filename = `CIA_${metadata.documentNumber || Date.now()}.pdf`;
      const filePath = await downloadPDF(pdfUrl, filename);
      
      if (filePath) {
        // 3. Fazer upload para Supabase Storage
        downloadUrl = await uploadToSupabaseStorage(filePath, filename);
        
        // Limpar arquivo temporário
        fs.unlinkSync(filePath);
      } else {
        console.log(`⚠️ Não foi possível baixar PDF, usando link original como fallback`);
        downloadUrl = document.url; // Fallback para o link original
      }
      
      await delay(DELAY_BETWEEN_REQUESTS);
    }
    
    // 4. Detectar categoria e extrair tags
    const tags = extractTags(metadata.title || document.title, metadata.description || document.description, metadata.keywords || []);
    
    // 5. Preparar dados para inserção
    const documentData = {
      title: metadata.title || document.title,
      description: metadata.description || document.description,
      published_date: metadata.publicationDate ? new Date(metadata.publicationDate).toISOString() : null,
      tags,
      read_url: document.url,
      download_url: downloadUrl
    };
    
    // 6. Inserir no banco de dados
    const result = await insertDocumentToDatabase(documentData);
    
    return result.error === null;
    
  } catch (error) {
    console.error(`❌ Erro ao processar documento ${document.title}:`, error.message);
    return false;
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando importação de documentos desclassificados da CIA');
  
  try {
    // Criar diretório temporário
    ensureTempDir();
    
    let totalProcessed = 0;
    let totalSuccess = 0;
    let currentPage = 0;
    
    // Categorias para processar
    const categories = ['ufo', 'mkultra', '']; // '' = todas as categorias
    
    for (const category of categories) {
      console.log(`\n📂 Processando categoria: ${category || 'todas'}`);
      
      currentPage = 0;
      let hasMorePages = true;
      
      while (hasMorePages && totalProcessed < MAX_DOCUMENTS_PER_RUN) {
        // Fazer scraping da página atual
        const documents = await scrapeDocumentsList(category, currentPage);
        
        if (documents.length === 0) {
          hasMorePages = false;
          break;
        }
        
        // Processar cada documento
        for (const document of documents) {
          if (totalProcessed >= MAX_DOCUMENTS_PER_RUN) {
            break;
          }
          
          const success = await processDocument(document);
          totalProcessed++;
          
          if (success) {
            totalSuccess++;
          }
          
          // Delay entre documentos
          await delay(DELAY_BETWEEN_REQUESTS);
        }
        
        currentPage++;
        
        // Delay entre páginas
        await delay(DELAY_BETWEEN_REQUESTS * 2);
      }
      
      if (totalProcessed >= MAX_DOCUMENTS_PER_RUN) {
        break;
      }
    }
    
    // Limpar diretório temporário
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
    
    console.log('\n📊 Relatório Final:');
    console.log(`📄 Total de documentos processados: ${totalProcessed}`);
    console.log(`✅ Documentos inseridos com sucesso: ${totalSuccess}`);
    console.log(`❌ Documentos com erro: ${totalProcessed - totalSuccess}`);
    console.log(`📈 Taxa de sucesso: ${((totalSuccess / totalProcessed) * 100).toFixed(2)}%`);
    
  } catch (error) {
    console.error('❌ Erro fatal na importação:', error.message);
    process.exit(1);
  }
}

// Executar script
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('import-cia-documents.js')) {
  main().catch(console.error);
}

export {
  scrapeDocumentsList,
  extractDocumentMetadata,
  detectCategory,
  extractTags,
  downloadPDF,
  uploadToSupabaseStorage,
  insertDocumentToDatabase,
  processDocument
};
