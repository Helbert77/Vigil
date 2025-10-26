// Script para inserir dados da timeline no Supabase
// Use este script como template quando tiver os dados do Excel

const CATEGORY_MAPPING = {
  'Política': 'politics',
  'Ciência': 'science', 
  'Saúde': 'health',
  'Religião': 'religion',
  'Tecnologia': 'technology',
  'Sociedade': 'society',
  'Economia': 'politics',
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
  // Estrutura: [Evento, Data, Resumo, Fonte 1, Fonte 2, Grau de Evidência, Dano Social, Status, País, Categoria, Prioridade de Verificação]
  const [evento, data, resumo, fonte1, fonte2, evidencia, danoSocial, status, pais, categoria, prioridade] = row;
  
  // Extrair ano da data, considerando AC/BC
  let year = new Date().getFullYear();
  if (data) {
    const str = data.toString().toLowerCase();
    const isBC = str.includes('ac') || str.includes('a.c') || str.includes('bc');
    const yearMatch = str.match(/(\d+)/);
    if (yearMatch) {
      year = parseInt(yearMatch[0], 10);
      if (isBC) {
        year = -year;
      }
    }
  }
  
  // Mapear impacto baseado no dano social
  let impact = 'medium';
  if (danoSocial) {
    const mappedDamage = DAMAGE_MAPPING[danoSocial];
    if (mappedDamage === 'critico') impact = 'critical';
    else if (mappedDamage === 'alto') impact = 'high';
    else if (mappedDamage === 'baixo') impact = 'low';
  }
  
  return {
    title: evento || 'Evento sem título',
    year: year,
    category: CATEGORY_MAPPING[categoria] || 'society',
    description: resumo || '',
    impact: impact,
    status: STATUS_MAPPING[status] || 'disputed',
    country: pais || '',
    source_1: fonte1 || '',
    source_2: fonte2 || '',
    evidence_level: EVIDENCE_MAPPING[evidencia] || 'medio',
    social_damage: DAMAGE_MAPPING[danoSocial] || 'medio',
    verification_priority: PRIORITY_MAPPING[prioridade] || 'media',
    event_date: data ? new Date(data).toISOString().split('T')[0] : null,
    x_position: 0,
    y_position: 0
  };
}

// Função para remover duplicatas
function removeDuplicates(events) {
  const seen = new Set();
  return events.filter(event => {
    const key = `${event.title.toLowerCase().trim()}-${event.year}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Função para gerar SQL INSERT
function generateInsertSQL(events) {
  const values = events.map(event => {
    const escapedTitle = event.title.replace(/'/g, "''");
    const escapedDescription = (event.description || '').replace(/'/g, "''");
    const escapedCountry = (event.country || '').replace(/'/g, "''");
    const escapedSource1 = (event.source_1 || '').replace(/'/g, "''");
    const escapedSource2 = (event.source_2 || '').replace(/'/g, "''");
    
    return `('${escapedTitle}', ${event.year}, '${event.category}', '${escapedDescription}', '${event.impact}', '${event.status}', '${escapedCountry}', '${escapedSource1}', '${escapedSource2}', '${event.evidence_level}', '${event.social_damage}', '${event.verification_priority}', ${event.event_date ? `'${event.event_date}'` : 'NULL'}, ${event.x_position}, ${event.y_position})`;
  }).join(',\n');
  
  return `INSERT INTO public.timeline_events (
    title, year, category, description, impact, status, country,
    source_1, source_2, evidence_level, social_damage, verification_priority,
    event_date, x_position, y_position
  ) VALUES\n${values};`;
}

console.log('Script pronto para processar dados do Excel');
console.log('Use as funções processExcelRow, removeDuplicates e generateInsertSQL');

module.exports = { processExcelRow, removeDuplicates, generateInsertSQL, CATEGORY_MAPPING, STATUS_MAPPING };