import { User } from '@/types';

/**
 * Regex para capturar menções no formato @username ou @nome completo
 * Captura até encontrar pontuação, quebra de linha, dois espaços ou fim do texto
 * 
 * Exemplos:
 * - "@joao" -> captura "joao"
 * - "@Herbert Carlos" -> captura "Herbert Carlos"
 * - "@Maria Silva." -> captura "Maria Silva"
 * - "@Pedro Santos: olá" -> captura "Pedro Santos"
 */
export const MENTION_REGEX = /@([\w\s]+?)(?=\s{2,}|[.,!?;:]|\n|$)/g;

/**
 * Extrai todos os usuários mencionados em um texto
 * @param text - Texto contendo menções
 * @param allUsers - Lista de todos os usuários disponíveis
 * @param excludeUserId - ID do usuário a ser excluído (geralmente o autor)
 * @returns Array de usuários mencionados (sem duplicatas)
 */
export function extractMentionedUsers(
  text: string,
  allUsers: User[],
  excludeUserId?: string
): User[] {
  if (!text) return [];

  const mentionedUsers = new Map<string, User>(); // Usar Map para evitar duplicatas
  const regex = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags);
  let match;

  while ((match = regex.exec(text)) !== null) {
    const capturedName = match[1].trim();
    
    // Buscar usuário por username ou name
    const user = allUsers.find(
      u => 
        (u.username.toLowerCase() === capturedName.toLowerCase() ||
         u.name.toLowerCase() === capturedName.toLowerCase()) &&
        (!excludeUserId || u.id !== excludeUserId)
    );

    if (user && !mentionedUsers.has(user.id)) {
      mentionedUsers.set(user.id, user);
    }
  }

  return Array.from(mentionedUsers.values());
}

/**
 * Verifica se um texto contém menções
 * @param text - Texto a ser verificado
 * @returns true se o texto contém pelo menos uma menção
 */
export function hasMentions(text: string): boolean {
  if (!text) return false;
  const regex = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags);
  return regex.test(text);
}

/**
 * Conta o número de menções únicas em um texto
 * @param text - Texto contendo menções
 * @param allUsers - Lista de todos os usuários disponíveis
 * @returns Número de usuários únicos mencionados
 */
export function countMentions(text: string, allUsers: User[]): number {
  return extractMentionedUsers(text, allUsers).length;
}

