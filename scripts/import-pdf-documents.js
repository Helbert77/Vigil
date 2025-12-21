import { createClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = 'https://oprqgllsqtfdyjgvgovo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configurações
const TEMP_DIR = path.join(__dirname, 'temp_pdf_docs');

// Criar diretório temporário
function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

// Função para delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Documentos com conteúdo rico para gerar PDFs
function getDocumentsForPDF() {
  return [
    {
      title: 'Operação MK-ULTRA - Programa de Controle Mental da CIA',
      author: 'Central Intelligence Agency',
      tags: ['mk-ultra', 'mind-control', 'experiments', 'cia', 'classified'],
      source: 'CIA Historical Documents',
      content: {
        introduction: `O Projeto MK-ULTRA foi um programa de pesquisa clandestino da CIA que conduziu experimentos em seres humanos, projetado e empreendido pela Divisão de Inteligência Científica da CIA. O programa começou no início dos anos 1950 e foi oficialmente interrompido em 1973.`,
        
        objectives: [
          'Desenvolver métodos de controle mental e interrogatório',
          'Criar agentes "programados" através de drogas e hipnose',
          'Estudar os efeitos de substâncias psicoativas',
          'Desenvolver técnicas de lavagem cerebral',
          'Criar amnésia controlada em sujeitos'
        ],
        
        methods: [
          'Administração de LSD sem consentimento',
          'Terapia de eletrochoque extrema',
          'Isolamento sensorial prolongado',
          'Abuso sexual e psicológico',
          'Hipnose e sugestão pós-hipnótica'
        ],
        
        locations: [
          'Hospitais psiquiátricos nos EUA e Canadá',
          'Universidades americanas',
          'Prisões federais',
          'Instalações militares secretas',
          'Clínicas privadas'
        ],
        
        timeline: {
          '1950': 'Início do programa sob direção de Sidney Gottlieb',
          '1953': 'Morte de Frank Olson após administração de LSD',
          '1963': 'Expansão para experimentos em universidades',
          '1973': 'Encerramento oficial e destruição de documentos',
          '1975': 'Revelação pública através da Comissão Church'
        },
        
        conclusion: `O MK-ULTRA representa um dos capítulos mais sombrios da história da CIA, violando direitos humanos fundamentais em nome da segurança nacional. Milhares de pessoas foram submetidas a experimentos sem seu conhecimento ou consentimento, resultando em traumas permanentes e, em alguns casos, morte.`
      }
    },

    {
      title: 'Projeto STARGATE - Programa de Visão Remota',
      author: 'Central Intelligence Agency / Defense Intelligence Agency',
      tags: ['stargate', 'remote-viewing', 'psychic', 'esp', 'intelligence'],
      source: 'CIA Declassified Files',
      content: {
        introduction: `O Projeto STARGATE foi um programa militar americano de 20 anos que investigou fenômenos psíquicos para aplicações de inteligência e militar. O programa estudou a "visão remota" - a suposta capacidade de perceber locais, pessoas ou eventos distantes através de meios paranormais.`,
        
        objectives: [
          'Investigar capacidades de percepção extrassensorial',
          'Desenvolver técnicas de espionagem psíquica',
          'Localizar reféns e alvos militares',
          'Obter inteligência sobre instalações inimigas',
          'Prever eventos futuros através de clarividência'
        ],
        
        methodology: [
          'Seleção de indivíduos com habilidades psíquicas',
          'Treinamento em técnicas de visão remota',
          'Protocolos científicos rigorosos',
          'Validação duplo-cega de resultados',
          'Análise estatística de acurácia'
        ],
        
        notable_cases: [
          'Localização de submarino soviético perdido',
          'Descrição de instalações nucleares secretas',
          'Busca por reféns americanos no Irã',
          'Monitoramento de testes nucleares',
          'Investigação de atividades terroristas'
        ],
        
        participants: [
          'Ingo Swann - Desenvolvedor de protocolos',
          'Pat Price - Vidente remoto principal',
          'Joseph McMoneagle - Operador militar',
          'Russell Targ - Pesquisador científico',
          'Hal Puthoff - Físico e coordenador'
        ],
        
        results: `Após duas décadas de pesquisa e milhões de dólares investidos, o programa foi encerrado em 1995. Embora alguns sucessos tenham sido relatados, a avaliação final concluiu que a visão remota não era confiável o suficiente para operações de inteligência críticas.`,
        
        conclusion: `O Projeto STARGATE permanece como um dos programas mais controversos da Guerra Fria, representando a disposição dos militares americanos de explorar qualquer vantagem possível, mesmo em territórios científicos não convencionais.`
      }
    },

    {
      title: 'Operação CHAOS - Vigilância Doméstica da CIA',
      author: 'Central Intelligence Agency',
      tags: ['chaos', 'domestic-surveillance', 'antiwar', 'civil-rights', 'illegal'],
      source: 'Family Jewels Documents',
      content: {
        introduction: `A Operação CHAOS foi um programa de vigilância doméstica da CIA que operou de 1967 a 1974, violando diretamente a carta da agência que proibia operações domésticas. O programa espionou cidadãos americanos envolvidos em movimentos antiguerra e direitos civis.`,
        
        background: `Durante a Guerra do Vietnã, o presidente Lyndon Johnson pressionou a CIA para investigar possíveis conexões estrangeiras com movimentos de protesto domésticos. Isso levou à criação da Operação CHAOS sob a direção de Richard Helms.`,
        
        targets: [
          'Ativistas antiguerra',
          'Líderes de direitos civis',
          'Estudantes universitários',
          'Organizações pacifistas',
          'Jornalistas críticos'
        ],
        
        methods: [
          'Infiltração de organizações civis',
          'Interceptação de correspondência',
          'Vigilância física e eletrônica',
          'Criação de dossiês detalhados',
          'Recrutamento de informantes'
        ],
        
        scope: [
          'Mais de 300.000 indivíduos monitorados',
          '7.200 cidadãos americanos fichados',
          '1.000 organizações investigadas',
          'Operações em todas as grandes cidades',
          'Coordenação com FBI e NSA'
        ],
        
        key_figures: [
          'Richard Helms - Diretor da CIA',
          'James Angleton - Chefe de Contrainteligência',
          'Richard Ober - Chefe da Operação CHAOS',
          'William Colby - Sucessor que expôs o programa'
        ],
        
        exposure: `O programa foi exposto em 1974 por Seymour Hersh do New York Times, levando às investigações da Comissão Church e Pike. A revelação causou escândalo nacional e levou a reformas significativas na supervisão de agências de inteligência.`,
        
        conclusion: `A Operação CHAOS representou uma violação fundamental da Constituição americana e da separação entre inteligência doméstica e estrangeira. Suas revelações contribuíram para uma crise de confiança nas instituições governamentais durante os anos 1970.`
      }
    },

    {
      title: 'Invasão da Baía dos Porcos - Análise Pós-Operação',
      author: 'Central Intelligence Agency',
      tags: ['bay-of-pigs', 'cuba', 'invasion', 'kennedy', 'failure'],
      source: 'CIA Historical Review',
      content: {
        introduction: `A invasão da Baía dos Porcos foi uma operação militar fracassada patrocinada pela CIA em abril de 1961, tentando derrubar o governo de Fidel Castro em Cuba. O fracasso da operação teve consequências duradouras para a política externa americana.`,
        
        planning: `O plano foi concebido durante a administração Eisenhower em 1960, baseado no sucesso da operação guatemalteca de 1954. A CIA treinou cerca de 1.400 exilados cubanos em campos secretos na Guatemala e Nicarágua.`,
        
        objectives: [
          'Derrubar o governo de Fidel Castro',
          'Estabelecer um governo pró-americano',
          'Eliminar a influência soviética em Cuba',
          'Demonstrar poder americano na região',
          'Prevenir expansão comunista na América Latina'
        ],
        
        timeline: {
          'Março 1960': 'Eisenhower autoriza treinamento de exilados',
          'Janeiro 1961': 'Kennedy assume e herda o plano',
          '15 Abril 1961': 'Bombardeios aéreos preliminares',
          '17 Abril 1961': 'Invasão na Baía dos Porcos',
          '19 Abril 1961': 'Rendição das forças invasoras'
        },
        
        failures: [
          'Falta de apoio aéreo americano',
          'Inteligência inadequada sobre forças cubanas',
          'Vazamentos de segurança pré-invasão',
          'Subestimação da popularidade de Castro',
          'Coordenação militar deficiente'
        ],
        
        consequences: [
          '114 invasores mortos, 1.189 capturados',
          'Fortalecimento do regime de Castro',
          'Aproximação Cuba-União Soviética',
          'Humilhação internacional dos EUA',
          'Crise de confiança na CIA'
        ],
        
        lessons_learned: [
          'Necessidade de melhor coordenação civil-militar',
          'Importância de inteligência precisa',
          'Riscos de operações encobertas de grande escala',
          'Consequências de falhas de comunicação',
          'Impacto de decisões políticas em operações militares'
        ],
        
        conclusion: `A Baía dos Porcos permanece como um dos maiores fracassos da CIA, demonstrando os perigos da arrogância institucional e planejamento inadequado. O evento moldou profundamente a política de Kennedy em relação a Cuba e à União Soviética, contribuindo para a Crise dos Mísseis de 1962.`
      }
    },

    {
      title: 'Programa Phoenix - Operação de Pacificação no Vietnã',
      author: 'Central Intelligence Agency / Military Assistance Command',
      tags: ['phoenix', 'vietnam', 'counterinsurgency', 'assassination', 'war-crimes'],
      source: 'Pentagon Papers / CIA Archives',
      content: {
        introduction: `O Programa Phoenix foi uma operação controversa de contrainteligência durante a Guerra do Vietnã (1967-1972), projetada para identificar e "neutralizar" a infraestrutura política do Viet Cong no Vietnã do Sul.`,
        
        background: `Criado em resposta à eficácia da guerrilha comunista, o programa visava desmantelar a organização política clandestina que apoiava as forças militares do Viet Cong através de uma campanha sistemática de captura, conversão ou eliminação.`,
        
        structure: [
          'Coordenação CIA-militar americana',
          'Participação das forças sul-vietnamitas',
          'Rede de centros de interrogatório provinciais',
          'Unidades de operações especiais',
          'Sistema de inteligência computadorizado'
        ],
        
        methods: [
          'Coleta de inteligência através de informantes',
          'Operações de captura noturnas',
          'Interrogatórios intensivos',
          'Programa de recompensas por informações',
          'Eliminação seletiva de alvos'
        ],
        
        statistics: {
          'Período': '1967-1972',
          'Mortos': '20.587 alegados membros do VCI',
          'Capturados': '28.978 indivíduos',
          'Convertidos': '17.717 desertores',
          'Orçamento': 'Mais de $100 milhões anuais'
        },
        
        controversy: [
          'Assassinatos extrajudiciais',
          'Tortura sistemática de prisioneiros',
          'Execução de civis inocentes',
          'Violação de leis internacionais',
          'Quotas de mortes para unidades'
        ],
        
        key_figures: [
          'William Colby - Diretor do programa',
          'Robert Komer - Coordenador CORDS',
          'John Paul Vann - Conselheiro sênior',
          'Nguyen Van Thieu - Presidente do Vietnã do Sul'
        ],
        
        effectiveness: `Embora estatisticamente impressionante, a eficácia real do programa é questionável. Muitos alvos eram civis inocentes, e a brutalidade do programa alienou a população rural que os americanos tentavam conquistar.`,
        
        legacy: `O Programa Phoenix permanece como um exemplo controverso de guerra não convencional, levantando questões éticas sobre métodos de contrainteligência e os limites morais em conflitos assimétricos.`,
        
        conclusion: `O programa foi oficialmente encerrado em 1972, mas suas táticas e controvérsias continuaram a influenciar debates sobre operações especiais e direitos humanos em conflitos subsequentes.`
      }
    }
  ];
}

// Função para criar PDF formatado
function createFormattedPDF(doc) {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 7;
  const maxWidth = 170;

  // Função para adicionar nova página se necessário
  const checkNewPage = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Função para quebrar texto em linhas
  const splitText = (text, maxWidth, fontSize = 10) => {
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(text, maxWidth);
  };

  // Título principal
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  const titleLines = splitText(doc.title, maxWidth, 16);
  titleLines.forEach(line => {
    checkNewPage();
    pdf.text(line, margin, yPosition);
    yPosition += lineHeight + 2;
  });

  yPosition += 5;

  // Autor
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'normal');
  checkNewPage();
  pdf.text(`Autor: ${doc.author}`, margin, yPosition);
  yPosition += lineHeight + 2;

  // Fonte
  checkNewPage();
  pdf.text(`Fonte: ${doc.source}`, margin, yPosition);
  yPosition += lineHeight + 2;

  // Tags
  checkNewPage();
  pdf.text(`Tags: ${doc.tags.join(', ')}`, margin, yPosition);
  yPosition += lineHeight + 5;

  // Linha separadora
  checkNewPage();
  pdf.line(margin, yPosition, margin + maxWidth, yPosition);
  yPosition += 10;

  // Conteúdo
  const content = doc.content;

  // Introdução
  if (content.introduction) {
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    checkNewPage();
    pdf.text('INTRODUÇÃO', margin, yPosition);
    yPosition += lineHeight + 3;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    const introLines = splitText(content.introduction, maxWidth);
    introLines.forEach(line => {
      checkNewPage();
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 5;
  }

  // Background
  if (content.background) {
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    checkNewPage();
    pdf.text('CONTEXTO HISTÓRICO', margin, yPosition);
    yPosition += lineHeight + 3;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    const backgroundLines = splitText(content.background, maxWidth);
    backgroundLines.forEach(line => {
      checkNewPage();
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 5;
  }

  // Objetivos
  if (content.objectives) {
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    checkNewPage();
    pdf.text('OBJETIVOS', margin, yPosition);
    yPosition += lineHeight + 3;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    content.objectives.forEach((objective, index) => {
      checkNewPage();
      const objLines = splitText(`${index + 1}. ${objective}`, maxWidth - 10);
      objLines.forEach(line => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += lineHeight;
      });
    });
    yPosition += 5;
  }

  // Métodos
  if (content.methods) {
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    checkNewPage();
    pdf.text('MÉTODOS E TÉCNICAS', margin, yPosition);
    yPosition += lineHeight + 3;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    content.methods.forEach((method, index) => {
      checkNewPage();
      const methodLines = splitText(`• ${method}`, maxWidth - 10);
      methodLines.forEach(line => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += lineHeight;
      });
    });
    yPosition += 5;
  }

  // Timeline
  if (content.timeline) {
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    checkNewPage();
    pdf.text('CRONOLOGIA', margin, yPosition);
    yPosition += lineHeight + 3;

    pdf.setFontSize(10);
    Object.entries(content.timeline).forEach(([year, event]) => {
      checkNewPage();
      pdf.setFont(undefined, 'bold');
      pdf.text(year + ':', margin + 5, yPosition);
      pdf.setFont(undefined, 'normal');
      const eventLines = splitText(event, maxWidth - 30);
      eventLines.forEach((line, index) => {
        if (index === 0) {
          pdf.text(line, margin + 25, yPosition);
        } else {
          yPosition += lineHeight;
          checkNewPage();
          pdf.text(line, margin + 25, yPosition);
        }
      });
      yPosition += lineHeight + 2;
    });
    yPosition += 5;
  }

  // Conclusão
  if (content.conclusion) {
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    checkNewPage();
    pdf.text('CONCLUSÃO', margin, yPosition);
    yPosition += lineHeight + 3;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    const conclusionLines = splitText(content.conclusion, maxWidth);
    conclusionLines.forEach(line => {
      checkNewPage();
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 10;
  }

  // Rodapé
  checkNewPage(30);
  pdf.line(margin, yPosition, margin + maxWidth, yPosition);
  yPosition += 5;

  pdf.setFontSize(8);
  pdf.setFont(undefined, 'italic');
  pdf.text('Documento gerado pelo Sistema Vigil', margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text('Fonte: Documentos desclassificados da CIA', margin, yPosition);

  return pdf;
}

// Função para processar um documento e gerar PDF
async function processDocumentToPDF(doc) {
  try {
    console.log(`\n🔄 Gerando PDF: ${doc.title}`);
    
    // Criar PDF
    const pdf = createFormattedPDF(doc);
    
    // Salvar PDF temporariamente
    const timestamp = Date.now();
    const cleanTitle = doc.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40);
    const filename = `${cleanTitle}_${timestamp}.pdf`;
    const filePath = path.join(TEMP_DIR, filename);
    
    // Salvar PDF como buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    fs.writeFileSync(filePath, pdfBuffer);
    
    console.log(`✅ PDF gerado: ${filename} (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);
    
    // Converter para Data URL
    const base64Data = pdfBuffer.toString('base64');
    const dataUrl = `data:application/pdf;base64,${base64Data}`;
    
    // Inserir no banco de dados
    const { data, error } = await supabase.rpc('import_cia_document', {
      p_title: doc.title,
      p_author: doc.author,
      p_description: `Documento detalhado sobre ${doc.title.toLowerCase()}. Contém informações históricas, cronologia, métodos e análises baseadas em documentos desclassificados.`,
      p_tags: doc.tags,
      p_file_url: dataUrl,
      p_published_date: null
    });
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ PDF inserido no banco: ${doc.title}`);
    
    // Limpar arquivo temporário
    fs.unlinkSync(filePath);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Erro ao processar PDF ${doc.title}:`, error.message);
    return false;
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando geração de documentos PDF formatados');
  
  try {
    ensureTempDir();
    
    const documents = getDocumentsForPDF();
    console.log(`📚 Total de PDFs para gerar: ${documents.length}`);
    
    let processed = 0;
    let successful = 0;
    
    for (const doc of documents) {
      const success = await processDocumentToPDF(doc);
      processed++;
      
      if (success) {
        successful++;
      }
      
      // Delay entre documentos
      if (processed < documents.length) {
        console.log(`⏳ Aguardando 2s...`);
        await delay(2000);
      }
    }
    
    // Limpar diretório temporário
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
    
    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL - GERAÇÃO DE PDFs:');
    console.log(`📄 PDFs processados: ${processed}`);
    console.log(`✅ Sucessos: ${successful}`);
    console.log(`❌ Falhas: ${processed - successful}`);
    console.log(`📈 Taxa de sucesso: ${((successful / processed) * 100).toFixed(2)}%`);
    
    if (successful > 0) {
      console.log('\n🎉 PDFs formatados foram adicionados à biblioteca!');
      console.log('📖 Cada PDF contém conteúdo detalhado, formatação profissional e estrutura organizada.');
      console.log('🔍 Os documentos incluem cronologias, objetivos, métodos e análises históricas.');
    }
    
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('import-pdf-documents.js')) {
  main().catch(console.error);
}

export { processDocumentToPDF, createFormattedPDF };
