// Script para processar dados dos arquivos Excel
// Este script deve ser executado com Node.js para processar os arquivos Excel

const CATEGORY_MAPPING = {
  'Política': 'politics',
  'Ciência': 'science', 
  'Saúde': 'health',
  'Religião': 'religion',
  'Tecnologia': 'technology',
  'Sociedade': 'society',
  'Economia': 'politics', // Mapear economia para política
  'Militar': 'politics',
  'Governo': 'politics'
};

const STATUS_MAPPING = {
  'Confirmado': 'confirmed',
  'Disputado': 'disputed', 
  'Desmentido': 'debunked',
  'Investigando': 'disputed',
  'Pendente': 'disputed'
};

const EVIDENCE_MAPPING = {
  'Baixo': 'baixo',
  'Médio': 'medio', 
  'Alto': 'alto',
  'Confirmado': 'confirmado'
};

const DAMAGE_MAPPING = {
  'Baixo': 'baixo',
  'Médio': 'medio',
  'Alto': 'alto', 
  'Crítico': 'critico'
};

const PRIORITY_MAPPING = {
  'Baixa': 'baixa',
  'Média': 'media',
  'Alta': 'alta',
  'Urgente': 'urgente'
};

function processExcelRow(row) {
  // Assumindo que row é um array com os valores das colunas
  const [evento, data, resumo, fonte1, fonte2, evidencia, danoSocial, status, pais, categoria, prioridade] = row;
  
  // Extrair ano da data
  let year = new Date().getFullYear(); // Default para ano atual
  if (data) {
    const dateMatch = data.toString().match(/(\d{4})/);
    if (dateMatch) {
      year = parseInt(dateMatch[1]);
    }
  }
  
  return {
    title: evento || 'Evento sem título',
    year: year,
    category: CATEGORY_MAPPING[categoria] || 'society',
    description: resumo || '',
    impact: DAMAGE_MAPPING[danoSocial] || 'medium',
    status: STATUS_MAPPING[status] || 'disputed',
    country: pais || '',
    source_1: fonte1 || '',
    source_2: fonte2 || '',
    evidence_level: EVIDENCE_MAPPING[evidencia] || 'medio',
    social_damage: DAMAGE_MAPPING[danoSocial] || 'medio',
    verification_priority: PRIORITY_MAPPING[prioridade] || 'media',
    event_date: data ? new Date(data) : null,
    x_position: 0, // Será calculado automaticamente
    y_position: 0  // Será calculado automaticamente
  };
}

// Função para remover duplicatas baseado no título e ano
function removeDuplicates(events) {
  const seen = new Set();
  return events.filter(event => {
    const key = `${event.title.toLowerCase()}-${event.year}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Exemplo de como usar (você precisará adaptar para ler os arquivos Excel reais)
const sampleData = [
  ['Illuminati Founded', '1776', 'Secret society founded in Bavaria', 'Historical Records', 'Academic Sources', 'Alto', 'Alto', 'Confirmado', 'Germany', 'Política', 'Alta'],
  ['MKUltra Program', '1953', 'CIA mind control experiments', 'Declassified Documents', 'Senate Report', 'Confirmado', 'Alto', 'Confirmado', 'USA', 'Ciência', 'Alta']
];

const processedEvents = removeDuplicates(sampleData.map(processExcelRow));
console.log('Eventos processados:', processedEvents);

module.exports = { processExcelRow, removeDuplicates, CATEGORY_MAPPING, STATUS_MAPPING };