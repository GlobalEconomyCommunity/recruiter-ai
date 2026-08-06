import { describe, expect, it } from 'vitest';
import {
  formatNumber,
  formatSalary,
  getInitials,
} from './formatters';

describe('formatSalary', () => {
  it('formats a salary range', () => {
    expect(formatSalary(150_000, 250_000)).toBe('150k – 250k ₽');
  });

  it('formats a minimum salary', () => {
    expect(formatSalary(120_000)).toBe('от 120k ₽');
  });

  it('handles an unspecified salary', () => {
    expect(formatSalary()).toBe('Не указана');
  });
});

describe('formatNumber', () => {
  it('formats an integer using the Russian locale', () => {
    expect(formatNumber(12_345).replace(/\s/g, ' ')).toContain('12');
    expect(formatNumber(12_345)).toContain('345');
  });
});

describe('getInitials', () => {
  it('returns two initials', () => {
    expect(getInitials('Анна Петрова')).toBe('АП');
  });

  it('limits long names to two letters', () => {
    expect(getInitials('Иван Сергеевич Петров')).toBe('ИС');
  });
});