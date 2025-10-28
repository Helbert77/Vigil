export const formatTimeAgo = (dateString: string): string | null => {
  try {
    if (!dateString) return null;
    const postDate = new Date(dateString);
    if (isNaN(postDate.getTime())) return null;
    
    const now = new Date();
    const diffInMs = now.getTime() - postDate.getTime();
    
    // Se a diferença for negativa (data futura), retorna '0m'
    if (diffInMs < 0) return '0m';
    
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    
    // 0-59 minutos: formato '00m'
    if (diffInMinutes < 60) {
      return `${diffInMinutes.toString().padStart(2, '0')}m`;
    }
    
    // 1-23 horas: formato '00h' (arredonda para baixo)
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }
    
    // 1-6 dias: formato '0d'
    if (diffInDays < 7) {
      return `${diffInDays}d`;
    }
    
    // 1-4 semanas: formato '0s'
    if (diffInDays < 30) {
      return `${diffInWeeks}s`;
    }
    
    // 1+ meses: formato '0M'
    return `${diffInMonths}M`;
  } catch (error) {
    console.error('Erro ao calcular tempo decorrido:', error);
    return null;
  }
};