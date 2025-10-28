import React from 'react';
import { User } from '@/types';
import UserLink from '@/components/common/UserLink';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatTimeAgo } from './timeUtils';

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

  const mentionRegex = /@(\w+)/g;
  const parts = text.split(mentionRegex);

  return parts.map((part, index) => {
    if (index % 2 === 1) { // It's a username
      const user = allUsers.find(u => u.username.toLowerCase() === part.toLowerCase());
      if (user) {
        return (
          <UserLink
            key={`${user.id}-${index}`}
            user={user}
            isFollowing={followedUserIds.includes(user.id)}
            onFollowToggle={onFollowToggle}
            onViewProfile={onViewProfile}
            isCurrentUser={user.id === currentUser.id}
            onOpenFollowModal={onOpenFollowModal}
            className="text-secondary hover:underline"
          >
            @{part}
          </UserLink>
        );
      }
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
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