/**
 * Utilitários para formatação de números e datas
 * Suporte completo para localização pt-BR e compatibilidade cross-browser
 */

export interface FormatOptions {
  locale?: string;
  timezone?: string;
  useGrouping?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Formata números com separadores de milhar
 * Compatível com todos os navegadores modernos
 */
export function formatNumber(
  value: number, 
  options: FormatOptions = {}
): string {
  const {
    locale = 'pt-BR',
    useGrouping = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0
  } = options;

  try {
    // Usa Intl.NumberFormat para formatação nativa
    const formatter = new Intl.NumberFormat(locale, {
      useGrouping,
      minimumFractionDigits,
      maximumFractionDigits
    });

    return formatter.format(value);
  } catch (error) {
    // Fallback para navegadores mais antigos
    console.warn('Intl.NumberFormat não suportado, usando fallback', error);
    return formatNumberFallback(value, useGrouping);
  }
}

/**
 * Fallback para formatação de números sem Intl.NumberFormat
 */
function formatNumberFallback(value: number, useGrouping: boolean = true): string {
  const str = Math.floor(value).toString();
  
  if (!useGrouping || str.length <= 3) {
    return str;
  }

  // Adiciona separadores de milhar manualmente
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Formata datas no formato localizado
 * Suporte a timezone do usuário
 */
export function formatDate(
  date: string | Date,
  options: FormatOptions = {}
): string {
  const {
    locale = 'pt-BR',
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  } = options;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Data inválida');
    }

    // Usa Intl.DateTimeFormat para formatação nativa
    const formatter = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: timezone
    });

    return formatter.format(dateObj);
  } catch (error) {
    console.warn('Erro na formatação de data, usando fallback', error);
    return formatDateFallback(date);
  }
}

/**
 * Fallback para formatação de datas sem Intl.DateTimeFormat
 */
function formatDateFallback(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erro no fallback de formatação de data', error);
    return 'Data inválida';
  }
}

/**
 * Formata data e hora completa
 */
export function formatDateTime(
  date: string | Date,
  options: FormatOptions = {}
): string {
  const {
    locale = 'pt-BR',
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  } = options;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Data inválida');
    }

    const formatter = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
      hour12: false
    });

    return formatter.format(dateObj);
  } catch (error) {
    console.warn('Erro na formatação de data/hora, usando fallback', error);
    return formatDateTimeFallback(date);
  }
}

/**
 * Fallback para formatação de data e hora
 */
function formatDateTimeFallback(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Erro no fallback de formatação de data/hora', error);
    return 'Data inválida';
  }
}

/**
 * Detecta se uma data foi modificada recentemente (últimas 24h)
 */
export function isRecentlyUpdated(date: string | Date): boolean {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return diffHours <= 24;
  } catch (error) {
    console.error('Erro ao verificar se data foi atualizada recentemente', error);
    return false;
  }
}

/**
 * Formata números grandes com sufixos (K, M, B)
 * Útil para números muito grandes
 */
export function formatCompactNumber(
  value: number,
  options: FormatOptions = {}
): string {
  const { locale = 'pt-BR' } = options;

  try {
    // Usa notação compacta se disponível
    const formatter = new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short'
    } as any);

    return formatter.format(value);
  } catch (error) {
    // Fallback manual para notação compacta
    if (value >= 1000000000) {
      return formatNumber(value / 1000000000, { ...options, maximumFractionDigits: 1 }) + 'B';
    } else if (value >= 1000000) {
      return formatNumber(value / 1000000, { ...options, maximumFractionDigits: 1 }) + 'M';
    } else if (value >= 1000) {
      return formatNumber(value / 1000, { ...options, maximumFractionDigits: 1 }) + 'K';
    } else {
      return formatNumber(value, options);
    }
  }
}

/**
 * Valida se uma string representa um número válido
 */
export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Valida se uma string representa uma data válida
 */
export function isValidDate(value: any): boolean {
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    return date instanceof Date && !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Obtém o timezone do usuário
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // Fallback para GMT se não conseguir detectar
    return 'UTC';
  }
}