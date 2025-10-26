const fs = require('fs');
const path = require('path');

// Mapeamentos para padronizar os dados
const CATEGORY_MAPPING = {
  'Política': 'politics',
  'Ciência': 'science', 
  'Saúde': 'health',
  'Religião': 'religion',
  'Tecnologia': 'technology',
  'Sociedade': 'society',
  'Economia': 'politics',
  'Militar': 'politics',
  'Governo': 'politics',
  'Mídia': 'society',
  'Entretenimento': 'society',
  'Esporte': 'society',
  'Educação': 'society',
  'Ambiental': 'science',
  'Medicina': 'health',
  'Psicologia': 'health',
  'História': 'society',
  'Arqueologia': 'science',
  'Astronomia': 'science',
  'Física': 'science',
  'Química': 'science',
  'Biologia': 'science'
};

const STATUS_MAPPING = {
  'Confirmado': 'confirmed',
  'Disputado': 'disputed', 
  'Desmentido': 'debunked',
  'Investigando': 'disputed',
  'Pendente': 'disputed',
  'Parcialmente Confirmado': 'disputed',
  'Não Confirmado': 'disputed',
  'Falso': 'debunked',
  'Verdadeiro': 'confirmed'
};

const EVIDENCE_MAPPING = {
  'Baixo': 'baixo',
  'Médio': 'medio', 
  'Alto': 'alto',
  'Confirmado': 'confirmado',
  'Muito Baixo': 'baixo',
  'Muito Alto': 'alto'
};

const DAMAGE_MAPPING = {
  'Baixo': 'baixo',
  'Médio': 'medio',
  'Alto': 'alto', 
  'Crítico': 'critico',
  'Muito Baixo': 'baixo',
  'Muito Alto': 'critico'
};

const PRIORITY_MAPPING = {
  'Baixa': 'baixa',
  'Média': 'media',
  'Alta': 'alta',
  'Urgente': 'urgente',
  'Muito Baixa': 'baixa',
  'Muito Alta': 'urgente'
};

function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length >= headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }
  
  return data;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function extractYear(dateString) {
  if (!dateString) return new Date().getFullYear();
  
  const str = dateString.toString().toLowerCase();
  const isBC = str.includes('ac') || str.includes('a.c') || str.includes('bc');
  
  // Regex to find any sequence of digits
  const yearMatch = str.match(/(\d+)/);

  if (yearMatch) {
    let year = parseInt(yearMatch[0], 10);
    if (isBC) {
      return -year; // Store BC years as negative
    }
    return year;
  }
  
  return new Date().getFullYear(); // Fallback
}

function processEvent(row) {
  const evento = row['Evento'] || row['Event'] || row['Title'] || '';
  const data = row['Data'] || row['Date'] || row['Year'] || '';
  const resumo = row['Resumo'] || row['Summary'] || row['Description'] || '';
  const fonte1 = row['Fonte 1'] || row['Source 1'] || row['Source'] || '';
  const fonte2 = row['Fonte 2'] || row['Source 2'] || '';
  const evidencia = row['Grau de Evidência'] || row['Evidence Level'] || 'Médio';
  const danoSocial = row['Dano Social'] || row['Social Damage'] || 'Médio';
  const status = row['Status'] || 'Disputado';
  const pais = row['País'] || row['Country'] || '';
  const categoria = row['Categoria'] || row['Category'] || 'Sociedade';
  const prioridade = row['Prioridade de Verificação'] || row['Verification Priority'] || 'Média';
  
  const year = extractYear(data);
  
  // Mapear impacto baseado no dano social
  let impact = 'medium';
  const mappedDamage = DAMAGE_MAPPING[danoSocial] || 'medio';
  if (mappedDamage === 'critico') impact = 'critical';
  else if (mappedDamage === 'alto') impact = 'high';
  else if (mappedDamage === 'baixo') impact = 'low';
  
  return {
    title: evento.replace(/"/g, '').trim(),
    year: year,
    category: CATEGORY_MAPPING[categoria] || 'society',
    description: resumo.replace(/"/g, '').trim(),
    impact: impact,
    status: STATUS_MAPPING[status] || 'disputed',
    country: pais.replace(/"/g, '').trim(),
    source_1: fonte1.replace(/"/g, '').trim(),
    source_2: fonte2.replace(/"/g, '').trim(),
    evidence_level: EVIDENCE_MAPPING[evidencia] || 'medio',
    social_damage: mappedDamage,
    verification_priority: PRIORITY_MAPPING[prioridade] || 'media',
    event_date: data ? data.replace(/"/g, '').trim() : null
  };
}

function removeDuplicates(events) {
  const seen = new Set();
  const unique = [];
  
  events.forEach(event => {
    const key = `${event.title.toLowerCase().trim()}-${event.year}`;
    if (!seen.has(key) && event.title.length > 0) {
      seen.add(key);
      unique.push(event);
    }
  });
  
  return unique;
}

function generateInsertSQL(events) {
  const values = events.map(event => {
    const escapedTitle = event.title.replace(/'/g, "''");
    const escapedDescription = event.description.replace(/'/g, "''");
    const escapedCountry = event.country.replace(/'/g, "''");
    const escapedSource1 = event.source_1.replace(/'/g, "''");
    const escapedSource2 = event.source_2.replace(/'/g, "''");
    
    return `('${escapedTitle}', ${event.year}, '${event.category}', '${escapedDescription}', '${event.impact}', '${event.status}', '${escapedCountry}', '${escapedSource1}', '${escapedSource2}', '${event.evidence_level}', '${event.social_damage}', '${event.verification_priority}', NULL, 0, 0)`;
  }).join(',\n');
  
  return `-- Clear existing data
DELETE FROM public.timeline_events;

-- Insert all processed events
INSERT INTO public.timeline_events (
  title, year, category, description, impact, status, country,
  source_1, source_2, evidence_level, social_damage, verification_priority,
  event_date, x_position, y_position
) VALUES
${values};`;
}

// Processar todos os arquivos CSV
const csvFiles = [
  'data/conspiracy_theories_chronological_sorted.csv',
  'data/conspiracy_theories_expanded_100plus_v2.csv',
  'data/conspiracy_theories_expanded_200plus_fixed.csv',
  'data/conspiracy_theories_expanded_batch2.csv',
  'data/conspiracy_theories_expanded_batch3.csv',
  'data/conspiracy_theories_expanded_batch4.csv',
  'data/conspiracy_theories_expanded_batch5.csv'
];

let allEvents = [];

csvFiles.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      const csvContent = fs.readFileSync(filePath, 'utf8');
      const data = parseCSV(csvContent);
      const events = data.map(processEvent);
      allEvents = allEvents.concat(events);
      console.log(`Processado ${filePath}: ${events.length} eventos`);
    }
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error.message);
  }
});

// Remover duplicatas
const uniqueEvents = removeDuplicates(allEvents);
console.log(`Total de eventos únicos: ${uniqueEvents.length}`);

// Gerar SQL
const sql = generateInsertSQL(uniqueEvents);
fs.writeFileSync('processed_timeline_data.sql', sql);

console.log('SQL gerado em processed_timeline_data.sql');
console.log(`Eventos processados: ${allEvents.length}`);
console.log(`Eventos únicos: ${uniqueEvents.length}`);

module.exports = { processEvent, removeDuplicates, generateInsertSQL };