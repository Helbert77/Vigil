import React from 'react';
import { User } from '@/types';
import UserLink from '@/components/common/UserLink';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatTimeAgo } from './timeUtils';
import { MENTION_REGEX } from './mentionUtils';

export const renderTextWithMentions = (
  text: string,
  allUsers: User[],
  currentUser: User,
  followedUserIds: string[],
  onFollowToggle: (userId: string) => void,
  onViewProfile: (userId: string) => void,
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void
) => {
  if (!text) return null;

  // Usar o regex compartilhado de mentionUtils para consistência
  const mentionRegex = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags);
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    const fullMatch = match[0]; // @username
    const capturedName = match[1].trim(); // username sem @
    const matchStart = match.index;

    // Adiciona o texto antes da menção
    if (matchStart > lastIndex) {
      parts.push(
        <React.Fragment key={`text-${lastIndex}`}>
          {text.substring(lastIndex, matchStart)}
        </React.Fragment>
      );
    }

    // Tenta encontrar o usuário por username ou name
    const user = allUsers.find(
      u => 
        u.username.toLowerCase() === capturedName.toLowerCase() ||
        u.name.toLowerCase() === capturedName.toLowerCase()
    );

    if (user) {
      parts.push(
        <UserLink
          key={`mention-${user.id}-${matchStart}`}
          user={user}
          isFollowing={followedUserIds.includes(user.id)}
          onFollowToggle={onFollowToggle}
          onViewProfile={onViewProfile}
          isCurrentUser={user.id === currentUser.id}
          onOpenFollowModal={onOpenFollowModal}
          className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium hover:underline"
        >
          @{capturedName}
        </UserLink>
      );
    } else {
      // Se o usuário não foi encontrado, ainda renderiza como menção mas sem link
      parts.push(
        <span key={`mention-unknown-${matchStart}`} className="text-blue-500 dark:text-blue-400 font-medium">
          @{capturedName}
        </span>
      );
    }

    lastIndex = matchStart + fullMatch.length;
  }

  // Adiciona o texto restante após a última menção
  if (lastIndex < text.length) {
    parts.push(
      <React.Fragment key={`text-${lastIndex}`}>
        {text.substring(lastIndex)}
      </React.Fragment>
    );
  }

  return <>{parts}</>;
};

/**
 * Formata uma data no formato 'DD de MM' (ex: "15 de Maio")
 * @param dateString - String de data ISO ou timestamp
 * @returns String formatada ou null em caso de erro
 */
export const formatDateDayMonth = (dateString: string): string | null => {
  try {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return null;
  }
};

/**
 * Formata uma data para exibir apenas o horário no formato HH:MM
 * @param dateString - String de data ISO ou timestamp
 * @returns String formatada ou null em caso de erro
 */
export const formatTimeOnly = (dateString: string): string | null => {
  try {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    return format(date, 'HH:mm');
  } catch (error) {
    console.error('Erro ao formatar horário:', error);
    return null;
  }
};

/**
 * Formata uma data no formato completo 'dd de Mês - hh:mm' (ex: "25 de Janeiro - 14:30")
 * @param dateString - String de data ISO ou timestamp
 * @returns String formatada ou null em caso de erro
 */
export const formatDateTimeComplete = (dateString: string): string | null => {
  try {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    return format(date, "dd 'de' MMMM - HH:mm", { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data e hora:', error);
    return null;
  }
};

/**
 * Formata o tempo decorrido desde a criação do post com regras específicas:
 * - 0-59 minutos: '00m' (ex: '05m', '59m')
 * - 1-23 horas: '00h' (ex: '1h', '23h') - arredonda para baixo
 * - 1-6 dias: '0d' (ex: '1d', '6d')
 * - 1-4 semanas: '0s' (ex: '1s', '4s')
 * - 1+ meses: '0M' (ex: '1M', '2M')
 * @param dateString - String de data ISO ou timestamp
 * @returns String formatada ou null em caso de erro
 */
// formatTimeAgo function is now imported from timeUtils.ts
export { formatTimeAgo };