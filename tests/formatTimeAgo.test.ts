import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { formatTimeAgo } from '../src/utils/timeUtils';

describe('formatTimeAgo', () => {
  // Mock da data atual para testes consistentes
  const mockNow = new Date('2024-01-15T12:00:00Z');
  
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockNow);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Cenários de minutos (0-59 minutos)', () => {
    test('deve formatar 0 minutos como "00m"', () => {
      const timestamp = new Date('2024-01-15T12:00:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('00m');
    });

    test('deve formatar 5 minutos como "05m"', () => {
      const timestamp = new Date('2024-01-15T11:55:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('05m');
    });

    test('deve formatar 30 minutos como "30m"', () => {
      const timestamp = new Date('2024-01-15T11:30:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('30m');
    });

    test('deve formatar 59 minutos como "59m"', () => {
      const timestamp = new Date('2024-01-15T11:01:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('59m');
    });
  });

  describe('Cenários de horas (1-23 horas)', () => {
    test('deve formatar 1 hora como "1h"', () => {
      const timestamp = new Date('2024-01-15T11:00:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('1h');
    });

    test('deve formatar 1h30m como "1h" (arredonda para baixo)', () => {
      const timestamp = new Date('2024-01-15T10:30:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('1h');
    });

    test('deve formatar 12 horas como "12h"', () => {
      const timestamp = new Date('2024-01-15T00:00:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('12h');
    });

    test('deve formatar 23h59m como "23h" (arredonda para baixo)', () => {
      const timestamp = new Date('2024-01-14T12:01:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('23h');
    });
  });

  describe('Cenários de dias (1-6 dias)', () => {
    test('deve formatar 1 dia como "1d"', () => {
      const timestamp = new Date('2024-01-14T12:00:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('1d');
    });

    test('deve formatar 3 dias como "3d"', () => {
      const timestamp = new Date('2024-01-12T12:00:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('3d');
    });

    test('deve formatar 6 dias como "6d"', () => {
      const timestamp = new Date('2024-01-09T12:00:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('6d');
    });
  });

  describe('Cenários de semanas (1-4 semanas)', () => {
    test('deve formatar 1 semana (7 dias) como "1s"', () => {
      const timestamp = new Date('2024-01-08T12:00:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('1s');
    });

    test('deve formatar 2 semanas (14 dias) como "2s"', () => {
      const timestamp = new Date('2024-01-01T12:00:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('2s');
    });

    test('deve formatar 4 semanas (28 dias) como "4s"', () => {
      const timestamp = new Date('2023-12-18T12:00:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('4s');
    });
  });

  describe('Cenários de meses (30+ dias)', () => {
    test('deve formatar 1 mês (30 dias) como "1M"', () => {
      const timestamp = new Date('2023-12-16T12:00:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('1M');
    });

    test('deve formatar 2 meses (60 dias) como "2M"', () => {
      const timestamp = new Date('2023-11-16T12:00:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('2M');
    });

    test('deve formatar 6 meses (180 dias) como "6M"', () => {
      const timestamp = new Date('2023-07-19T12:00:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('6M');
    });

    test('deve formatar 12 meses (365 dias) como "12M"', () => {
      const timestamp = new Date('2023-01-15T12:00:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('12M');
    });
  });

  describe('Casos extremos e validação', () => {
    test('deve retornar null para timestamp vazio', () => {
      expect(formatTimeAgo('')).toBe(null);
    });

    test('deve retornar null para timestamp null', () => {
      expect(formatTimeAgo(null as any)).toBe(null);
    });

    test('deve retornar null para timestamp inválido', () => {
      expect(formatTimeAgo('invalid-date')).toBe(null);
    });

    test('deve retornar "0m" para data futura', () => {
      const futureTimestamp = new Date('2024-01-15T13:00:00Z').toISOString();
      expect(formatTimeAgo(futureTimestamp)).toBe('0m');
    });

    test('deve lidar com diferentes formatos de timestamp', () => {
      // Timestamp em milissegundos
      const timestampMs = mockNow.getTime() - (5 * 60 * 1000); // 5 minutos atrás
      expect(formatTimeAgo(new Date(timestampMs).toISOString())).toBe('05m');
    });
  });

  describe('Limites entre categorias', () => {
    test('deve usar minutos até 59m59s', () => {
      const timestamp = new Date('2024-01-15T11:00:01Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('59m');
    });

    test('deve usar horas a partir de 60 minutos', () => {
      const timestamp = new Date('2024-01-15T11:00:00Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('1h');
    });

    test('deve usar dias a partir de 24 horas', () => {
      const timestamp = new Date('2024-01-14T11:59:59Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('1d');
    });

    test('deve usar semanas a partir de 7 dias', () => {
      const timestamp = new Date('2024-01-08T11:59:59Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('1s');
    });

    test('deve usar meses a partir de 30 dias', () => {
      const timestamp = new Date('2023-12-16T11:59:59Z').toISOString();
      expect(formatTimeAgo(timestamp)).toBe('1M');
    });
  });

  describe('Formatação de padding para minutos', () => {
    test('deve adicionar zero à esquerda para minutos < 10', () => {
      const timestamp1 = new Date('2024-01-15T11:59:00Z').toISOString();
      expect(formatTimeAgo(timestamp1)).toBe('01m');
      
      const timestamp5 = new Date('2024-01-15T11:55:00Z').toISOString();
      expect(formatTimeAgo(timestamp5)).toBe('05m');
      
      const timestamp9 = new Date('2024-01-15T11:51:00Z').toISOString();
      expect(formatTimeAgo(timestamp9)).toBe('09m');
    });

    test('não deve adicionar zero à esquerda para minutos >= 10', () => {
      const timestamp10 = new Date('2024-01-15T11:50:00Z').toISOString();
      expect(formatTimeAgo(timestamp10)).toBe('10m');
      
      const timestamp25 = new Date('2024-01-15T11:35:00Z').toISOString();
      expect(formatTimeAgo(timestamp25)).toBe('25m');
    });
  });
});