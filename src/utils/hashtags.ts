/**
 * Extrai hashtags de um texto
 * @param text - O texto do qual extrair hashtags
 * @returns Array de hashtags (sem o símbolo #)
 */
export const extractHashtags = (text: string): string[] => {
  if (!text) return [];
  
  // Regex para encontrar hashtags: # seguido de letras, números, underscore
  // Não inclui espaços, pontuação ou caracteres especiais
  const hashtagRegex = /#([a-zA-Z0-9_\u00C0-\u017F]+)/g;
  const matches = text.match(hashtagRegex);
  
  if (!matches) return [];
  
  // Remove o símbolo # e converte para lowercase para consistência
  const hashtags = matches.map(match => match.slice(1).toLowerCase());
  
  // Remove duplicatas
  return [...new Set(hashtags)];
};

/**
 * Verifica se um texto contém uma hashtag específica
 * @param text - O texto a verificar
 * @param hashtag - A hashtag a procurar (sem o símbolo #)
 * @returns true se a hashtag for encontrada
 */
export const containsHashtag = (text: string, hashtag: string): boolean => {
  if (!text || !hashtag) return false;
  
  const hashtags = extractHashtags(text);
  return hashtags.includes(hashtag.toLowerCase());
};