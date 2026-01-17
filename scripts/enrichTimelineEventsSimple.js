/**
 * Script simplificado para enriquecer eventos da timeline
 * Busca imagens automaticamente via API da Wikipedia
 */

import { createClient } from '@supabase/supabase-js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = 'https://oprqgllsqtfdyjgvgovo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI2MjMwNCwiZXhwIjoyMDc0ODM4MzA0fQ.rwrHPtvHym918IMJQTgVt5ajp5eGyIBeKcDQI95wxkk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Mapeamento de títulos para páginas da Wikipedia (quando o título do evento não corresponde diretamente)
const WIKI_TITLE_MAP = {
  'O \'Homem de Gelo\' (Ötzi)': 'Ötzi',
  'A construção das Pirâmides de Gizé': 'Pirâmides_de_Gizé',
  'O assassinato de Júlio César': 'Assassinato_de_Júlio_César',
  'O Mecanismo de Antikythera': 'Máquina_de_Anticítera',
  'A Bateria de Bagdá': 'Bateria_de_Bagdá',
  'A localização de Atlântida': 'Atlântida',
  'A morte de Sócrates foi um suicídio forçado': 'Sócrates',
  'As Linhas de Nazca': 'Linhas_de_Nasca',
  'A Ordem dos Templários sobreviveu secretamente': 'Ordem_dos_Templários',
  'A Grande Peste foi uma conspiração': 'Peste_Negra',
  'O Sudário de Turim': 'Sudário_de_Turim',
  'O Manuscrito Voynich': 'Manuscrito_Voynich',
  'A \'Conspiração da Pólvora\'': 'Conspiração_da_Pólvora',
  'A Revolução Americana foi instigada pela Maçonaria': 'Revolução_Americana',
  'Illuminati e a Nova Ordem Mundial': 'Illuminati',
  'O Grande Selo dos EUA e simbolismo maçônico': 'Grande_Selo_dos_Estados_Unidos',
  'A Revolução Francesa foi uma conspiração Illuminati': 'Revolução_Francesa',
  'Terra Plana': 'Terra_plana',
  'Shakespeare não escreveu suas peças': 'William_Shakespeare',
  'A Guerra Civil Americana foi sobre os direitos dos estados, não sobre a escravidão': 'Guerra_de_Secessão',
  'O navio fantasma Mary Celeste': 'Mary_Celeste',
  'A morte de Vincent van Gogh': 'Vincent_van_Gogh',
  'O caso Dreyfus': 'Caso_Dreyfus',
  'A supressão da energia livre': 'Nikola_Tesla',
  'O Protocolo dos Sábios de Sião': 'Os_Protocolos_dos_Sábios_de_Sião',
  'O incidente de Tunguska': 'Evento_de_Tunguska',
  'O naufrágio do Titanic': 'RMS_Titanic',
  'O genocídio armênio foi uma guerra civil': 'Genocídio_armênio',
  'A \'Gripe Espanhola\' originou-se nos EUA': 'Gripe_espanhola',
  'A \'Maldição do Faraó\' (Tumba de Tutancâmon)': 'Tutancâmon',
  'O estudo da sífilis de Tuskegee': 'Estudo_de_Sífilis_de_Tuskegee',
  'O incêndio do Reichstag': 'Incêndio_do_Reichstag',
  'O monstro do Lago Ness': 'Monstro_do_Lago_Ness',
  'O desaparecimento de Amelia Earhart': 'Amelia_Earhart',
  'O massacre da floresta de Katyn': 'Massacre_de_Katyn',
  'O flúor na água é para controle mental': 'Fluoretação_da_água',
  'O ataque a Pearl Harbor foi permitido pelos EUA': 'Ataque_a_Pearl_Harbor',
  'O Experimento Filadélfia': 'Experimento_Filadélfia',
  'O Homem que Nunca Existiu (Operação Mincemeat)': 'Operation_Mincemeat',
  'Operação Paperclip': 'Operação_Paperclip',
  'O Holocausto não aconteceu (Negação do Holocausto)': 'Holocausto',
  'O voo 19 e o Triângulo das Bermudas': 'Voo_19',
  'Operação Highjump e a Base Nazista na Antártida': 'Operação_Highjump',
  'Incidente de Roswell': 'Roswell_incident',
  'O Triângulo das Bermudas': 'Triângulo_das_Bermudas',
  'Projeto MKUltra': 'Projeto_MKUltra',
  'Área 51': 'Área_51',
  'O Priorado de Sião e o Santo Graal': 'Priorado_de_Sião',
  'Assassinato de John F. Kennedy': 'Assassinato_de_John_F._Kennedy',
  'O assassinato de Malcolm X': 'Malcolm_X',
  'Paul McCartney está morto (Paul is Dead)': 'Paul_is_Dead',
  'O Protocolo de Toronto': 'Toronto_Protocol',
  'Assassinato de Martin Luther King Jr.': 'Martin_Luther_King_Jr.',
  'O assassinato de Robert F. Kennedy': 'Robert_F._Kennedy',
  'Aterrissagens na Lua': 'Apollo_11',
  'O Clube dos 27': 'Clube_dos_27',
  'O escândalo de Watergate': 'Caso_Watergate',
  'O pouso em Marte da Viking e a \'Face em Marte\'': 'Cydonia_Mensae',
  'O Sinal \'Wow!\'': 'Sinal_Wow!',
  'O projeto \'Stargate\'': 'Projeto_Stargate',
  'Vírus da AIDS criado em laboratório': 'HIV',
  'O caso Irã-Contras': 'Caso_Irã-Contras',
  'Chemtrails': 'Chemtrails',
  'Reptilianos': 'Reptilian_conspiracy_theory',
  'O aquecimento global é uma farsa': 'Aquecimento_global',
  'A Guerra do Golfo foi sobre petróleo': 'Guerra_do_Golfo',
  'HAARP': 'HAARP',
  'Morte da Princesa Diana': 'Diana_de_Gales',
  'O Sol está sendo bloqueado artificialmente (\'Global Dimming\')': 'Escurecimento_global',
  'Ataques de 11 de setembro': 'Ataques_de_11_de_setembro_de_2001',
  'A Guerra do Iraque de 2003 foi baseada em mentiras': 'Guerra_do_Iraque',
  'A crise financeira de 2008 foi planejada': 'Financial_crisis_of_2007-2008',
  'O \'Efeito Mandela\'': 'Efeito_Mandela',
  'A Máfia Khazariana': 'Teoria_da_conspiração_khazariana',
  'A teoria da \'Grande Substituição\'': 'Teoria_da_Grande_Substituição',
  'A morte de Osama bin Laden foi uma farsa': 'Osama_bin_Laden',
  'O Calendário Maia e o fim do mundo em 2012': 'Calendário_maia',
  'A crise dos refugiados na Europa foi orquestrada': 'Crise_dos_refugiados_na_Europa',
  'A Conspiração de Pizzagate': 'Pizzagate',
  'A morte de Jeffrey Epstein': 'Jeffrey_Epstein',
  'O incêndio da Catedral de Notre-Dame foi criminoso': 'Catedral_de_Notre-Dame_de_Paris',
  'A pandemia de COVID-19 foi planejada (Plandemia)': 'Pandemia_de_COVID-19',
  'As vacinas contra a COVID-19 contêm microchips': 'Vacina_contra_COVID-19',
  'A tecnologia 5G causa a COVID-19': 'Teoria_da_conspiração_5G_e_COVID-19',
  'A explosão no porto de Beirute foi um ataque': 'Explosão_no_porto_de_Beirute_em_2020',
  'O vazamento do laboratório de Wuhan': 'Origem_da_pandemia_de_COVID-19',
  'O Grande Reset': 'Great_Reset',
  'O ataque ao Capitólio dos EUA em 6 de janeiro foi uma operação de \'bandeira falsa\'': 'Ataque_ao_Capitólio_dos_Estados_Unidos_em_2021',
  'A tomada do Afeganistão pelo Talibã foi um acordo secreto': 'Talibã',
  'As \'Cidades de 15 minutos\' são prisões a céu aberto': 'Cidade_de_15_minutos',
  'A invasão da Ucrânia pela Rússia foi para destruir laboratórios de armas biológicas dos EUA': 'Invasão_da_Ucrânia_pela_Rússia_em_2022',
  'A pandemia de varíola dos macacos foi planejada': 'Varíola_dos_macacos',
  'A crise de energia de 2022 foi criada artificialmente': 'Crise_energética_de_2021-2022',
  'O ataque do Hamas a Israel em 7 de outubro foi permitido por Israel': 'Ataques_do_Hamas_a_Israel_em_2023',
  'Os incêndios florestais no Havaí em 2023 foram causados por armas de energia dirigida': 'Incêndios_florestais_no_Havaí_em_2023',
  'O terremoto na Turquia e Síria em 2023 foi induzido pelo HAARP': 'Sismos_na_Turquia_e_Síria_em_2023',
  'O descarrilamento de trem em East Palestine foi um ataque deliberado': 'Descarrilamento_de_trem_em_East_Palestine',
  'O colapso da ponte Francis Scott Key foi um ataque deliberado': 'Colapso_da_ponte_Francis_Scott_Key',
  'O ataque à sala de concertos de Moscou foi uma operação de bandeira falsa da Ucrânia': 'Ataque_à_sala_de_concertos_de_Crocus_City_Hall'
};

// Função para buscar imagem da Wikipedia via API
async function getWikipediaImage(pageTitle) {
  return new Promise((resolve, reject) => {
    const encodedTitle = encodeURIComponent(pageTitle);
    
    // Tentar primeiro em português
    const tryLanguage = (lang) => {
      return new Promise((resolveLang, rejectLang) => {
        const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`;
        const options = {
          headers: {
            'User-Agent': 'TimelineEnrichmentBot/1.0 (https://vigil.app)'
          }
        };
        
        https.get(url, options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              if (json.thumbnail && json.thumbnail.source) {
                const imageUrl = json.thumbnail.source.replace(/\/\d+px-/, '/800px-');
                resolveLang({
                  imageUrl,
                  wikiUrl: json.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodedTitle}`
                });
              } else {
                rejectLang(new Error('No image found'));
              }
            } catch (err) {
              rejectLang(err);
            }
          });
        }).on('error', rejectLang);
      });
    };
    
    // Tentar português primeiro, depois inglês
    tryLanguage('pt')
      .then(resolve)
      .catch(() => {
        tryLanguage('en')
          .then(resolve)
          .catch(reject);
      });
  });
}

// Função para fazer download de imagem
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    https.get(url, options, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        file.close();
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

// Função para fazer upload para Supabase Storage
async function uploadToSupabase(eventId, imagePath) {
  const fileExt = path.extname(imagePath).slice(1) || 'jpg';
  const filePath = `timeline-media/${eventId}.${fileExt}`;
  
  const fileBuffer = fs.readFileSync(imagePath);
  
  const { error } = await supabase.storage
    .from('posts-media')
    .upload(filePath, fileBuffer, { 
      upsert: true,
      contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`
    });
  
  if (error) {
    throw error;
  }
  
  const { data } = supabase.storage
    .from('posts-media')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

// Função principal
async function enrichEvents() {
  console.log('🚀 Iniciando enriquecimento dos eventos da timeline...\n');
  
  // Buscar todos os eventos
  const { data: events, error: fetchError } = await supabase
    .from('timeline_events')
    .select('id, title, year, source_1, image_url')
    .order('year');
  
  if (fetchError) {
    console.error('❌ Erro ao buscar eventos:', fetchError);
    return;
  }
  
  console.log(`📊 Total de eventos encontrados: ${events.length}\n`);
  
  const tempDir = path.join(__dirname, '../temp-images');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  const errors = [];
  
  for (const event of events) {
    try {
      // Se já tem imagem e link, pular (a menos que seja Ötzi que pode ser substituído)
      if (event.image_url && event.source_1 && event.id !== '0db69683-357f-481a-89af-b1848d1ec98c') {
        skippedCount++;
        continue;
      }
      
      console.log(`\n📸 Processando: ${event.title} (${event.year})`);
      
      // Determinar título da Wikipedia
      let wikiTitle = WIKI_TITLE_MAP[event.title];
      if (!wikiTitle) {
        // Tentar extrair de source_1 se existir
        if (event.source_1 && event.source_1.includes('wikipedia.org/wiki/')) {
          wikiTitle = event.source_1.split('/wiki/')[1];
        } else {
          // Usar título do evento como fallback (substituir espaços por underscores)
          wikiTitle = event.title.replace(/\s+/g, '_').replace(/[^\w_]/g, '');
        }
      }
      
      // Buscar imagem via API da Wikipedia
      const tempImagePath = path.join(tempDir, `${event.id}.jpg`);
      let imageUrl = null;
      let wikiUrl = null;
      let downloadSuccess = false;
      
      // Títulos alternativos para eventos sem imagem
      const alternativeTitles = {
        'O estudo da sífilis de Tuskegee': ['Tuskegee_Syphilis_Study', 'Tuskegee_University'],
        'O Homem que Nunca Existiu (Operação Mincemeat)': ['Operation_Mincemeat', 'Operation_Mincemeat_(film)', 'William_Martin_(fictional)'],
        'O Protocolo de Toronto': ['Serge_Monast', 'Toronto_Protocol'],
        'O Clube dos 27': ['27_Club', 'Jimi_Hendrix', 'Kurt_Cobain', 'Amy_Winehouse'],
        'O projeto \'Stargate\'': ['Stargate_Project', 'Remote_viewing'],
        'O Sol está sendo bloqueado artificialmente (\'Global Dimming\')': ['Global_dimming'],
        'O \'Efeito Mandela\'': ['Mandela_Effect', 'Nelson_Mandela', 'False_memory'],
        'A Máfia Khazariana': ['Khazar_hypothesis', 'Khazars'],
        'A teoria da \'Grande Substituição\'': ['Great_Replacement', 'Great_Replacement_conspiracy_theory', 'Renaud_Camus'],
        'A crise dos refugiados na Europa foi orquestrada': ['European_migrant_crisis'],
        'As vacinas contra a COVID-19 contêm microchips': ['COVID-19_vaccine'],
        'O Grande Reset': ['Great_Reset', 'World_Economic_Forum'],
        'O vazamento do laboratório de Wuhan': ['Wuhan'],
        'A explosão no porto de Beirute foi um ataque': ['2020_Beirut_explosion'],
        'A tecnologia 5G causa a COVID-19': ['5G'],
        'A crise de energia de 2022 foi criada artificialmente': ['Global_energy_crisis_(2021–2023)', '2021-2022_global_energy_crisis', 'Energy_crisis', 'Natural_gas', 'Oil_price'],
        'O terremoto na Turquia e Síria em 2023 foi induzido pelo HAARP': ['2023_Turkey-Syria_earthquake'],
        'O descarrilamento de trem em East Palestine foi um ataque deliberado': ['East_Palestine_train_derailment'],
        'O ataque do Hamas a Israel em 7 de outubro foi permitido por Israel': ['2023_Hamas_attack_on_Israel'],
        'O ataque à sala de concertos de Moscou foi uma operação de bandeira falsa da Ucrânia': ['Crocus_City_Hall_attack']
      };
      
      const titlesToTry = [wikiTitle];
      if (alternativeTitles[event.title]) {
        titlesToTry.push(...alternativeTitles[event.title]);
      }
      
      let lastError = null;
      for (const titleToTry of titlesToTry) {
        try {
          console.log(`   🔍 Buscando imagem na Wikipedia: ${titleToTry}...`);
          const result = await getWikipediaImage(titleToTry);
          imageUrl = result.imageUrl;
          wikiUrl = result.wikiUrl;
          console.log(`   ✅ Imagem encontrada: ${imageUrl.substring(0, 80)}...`);
          
          // Download da imagem
          console.log(`   ⬇️  Baixando imagem...`);
          await downloadImage(imageUrl, tempImagePath);
          console.log(`   ✅ Imagem baixada`);
          downloadSuccess = true;
          break; // Sucesso, sair do loop
          
        } catch (apiError) {
          lastError = apiError;
          continue; // Tentar próximo título
        }
      }
      
      if (!downloadSuccess) {
        console.log(`   ⚠️  Erro ao buscar imagem: ${lastError?.message || 'No image found'}`);
        
        // Se não encontrou imagem mas tem link, atualizar apenas o link
        if (!event.source_1) {
          const fallbackWikiUrl = `https://pt.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}`;
          const { error: updateError } = await supabase
            .from('timeline_events')
            .update({ source_1: fallbackWikiUrl })
            .eq('id', event.id);
          
          if (!updateError) {
            console.log(`   ✅ Link da Wikipedia atualizado`);
          }
        }
        errorCount++;
        errors.push(`${event.title}: ${lastError?.message || 'No image found'}`);
        continue;
      }
      
      if (!downloadSuccess) {
        continue;
      }
      
      // Upload para Supabase
      console.log(`   ⬆️  Fazendo upload para Supabase Storage...`);
      const publicUrl = await uploadToSupabase(event.id, tempImagePath);
      console.log(`   ✅ Upload concluído`);
      
      // Atualizar banco de dados
      const updates = {
        image_url: publicUrl
      };
      
      if (!event.source_1 && wikiUrl) {
        updates.source_1 = wikiUrl;
      }
      
      const { error: updateError } = await supabase
        .from('timeline_events')
        .update(updates)
        .eq('id', event.id);
      
      if (updateError) {
        throw updateError;
      }
      
      console.log(`   ✅ Banco de dados atualizado`);
      
      // Limpar arquivo temporário
      if (fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
      }
      
      successCount++;
      
      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      errorCount++;
      const errorMsg = `Erro ao processar ${event.title}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`   ❌ ${errorMsg}`);
    }
  }
  
  // Limpar diretório temporário
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  
  console.log(`\n\n📊 RESUMO FINAL:`);
  console.log(`   ✅ Sucessos: ${successCount}`);
  console.log(`   ⏭️  Pulados (já tinham imagem e link): ${skippedCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log(`\n❌ Erros encontrados:`);
    errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
    if (errors.length > 10) {
      console.log(`   ... e mais ${errors.length - 10} erros`);
    }
  }
  
  console.log(`\n✨ Processo concluído!`);
}

// Executar
enrichEvents().catch(console.error);








