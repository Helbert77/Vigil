import i18n from './config';

/**
 * Formata números baseado no idioma atual
 * @param num - Número a ser formatado
 * @param options - Opções de formatação
 * @returns Número formatado
 */
export const formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => {
  const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
  return num.toLocaleString(locale, options);
};

/**
 * Formata datas baseado no idioma atual
 * @param date - Data a ser formatada
 * @param options - Opções de formatação
 * @returns Data formatada
 */
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, options);
};

/**
 * Formata hora baseado no idioma atual
 * @param date - Data/hora a ser formatada
 * @param options - Opções de formatação
 * @returns Hora formatada
 */
export const formatTime = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString(locale, options);
};

/**
 * Formata data e hora baseado no idioma atual
 * @param date - Data/hora a ser formatada
 * @param options - Opções de formatação
 * @returns Data e hora formatadas
 */
export const formatDateTime = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return dateObj.toLocaleString(locale, defaultOptions);
};

/**
 * Formata moeda baseado no idioma atual
 * @param value - Valor a ser formatado
 * @param currency - Código da moeda (padrão: EUR)
 * @returns Valor formatado como moeda
 */
export const formatCurrency = (value: number, currency: string = 'EUR'): string => {
  const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Retorna o locale atual baseado no idioma
 * @returns Locale string (pt-BR ou en-US)
 */
export const getCurrentLocale = (): string => {
  return i18n.language === 'pt' ? 'pt-BR' : 'en-US';
};
