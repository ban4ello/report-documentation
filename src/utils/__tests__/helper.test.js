import { camelize, formatNumber, truncateDecimal } from '../helper';

/* global describe, it, expect */

function normalizeSpaces(value) {
  return String(value).replace(/[\u00A0\u202F\s]/g, ' ');
}

describe('utils/helper', () => {
  describe('camelize', () => {
    it('converts snake_case to camelCase', () => {
      expect(camelize('hello_world')).toBe('helloWorld');
      expect(camelize('my_super_value')).toBe('mySuperValue');
    });

    it('returns string as-is when no underscores', () => {
      expect(camelize('alreadyCamel')).toBe('alreadyCamel');
    });
  });

  describe('formatNumber', () => {
    it('formats a plain number using ru-RU locale', () => {
      // ru-RU thousands separator is usually NBSP/narrow NBSP; we normalize to avoid CI differences.
      expect(normalizeSpaces(formatNumber(1234567))).toContain('1 234 567');
    });

    it('formats object with value field', () => {
      expect(normalizeSpaces(formatNumber({ value: 2000 }))).toContain('2 000');
    });

    it('returns 0 for falsy input', () => {
      expect(formatNumber(null)).toBe(0);
      expect(formatNumber(undefined)).toBe(0);
      expect(formatNumber(0)).toBe(0);
    });
  });

  describe('truncateDecimal', () => {
    it('truncates without rounding', () => {
      expect(truncateDecimal(12.999, 2)).toBe(12.99);
      expect(truncateDecimal(12.991, 2)).toBe(12.99);
    });

    it('works with integer values', () => {
      expect(truncateDecimal(10, 3)).toBe(10);
    });
  });
});
