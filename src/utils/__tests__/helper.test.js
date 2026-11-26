import { camelize, formatNumber, isPieceUnit, safeDivide, truncateDecimal } from '../helper';

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

    it('returns 0 for Infinity and NaN', () => {
      expect(formatNumber(Infinity)).toBe(0);
      expect(formatNumber(-Infinity)).toBe(0);
      expect(formatNumber(NaN)).toBe(0);
    });
  });

  describe('isPieceUnit', () => {
    it('treats шт / штуки / штука / компл / комплекты as pieces', () => {
      expect(isPieceUnit('шт')).toBe(true);
      expect(isPieceUnit('штуки')).toBe(true);
      expect(isPieceUnit('штука')).toBe(true);
      expect(isPieceUnit('компл')).toBe(true);
      expect(isPieceUnit('комплекты')).toBe(true);
      expect(isPieceUnit('Комплект')).toBe(true);
      expect(isPieceUnit(' компл ')).toBe(true);
    });

    it('does not treat weight/length units as pieces', () => {
      expect(isPieceUnit('тн')).toBe(false);
      expect(isPieceUnit('м')).toBe(false);
      expect(isPieceUnit('кг')).toBe(false);
      expect(isPieceUnit('')).toBe(false);
    });
  });

  describe('safeDivide', () => {
    it('divides normally', () => {
      expect(safeDivide(10, 2)).toBe(5);
    });

    it('returns 0 when denominator is 0 or invalid', () => {
      expect(safeDivide(10, 0)).toBe(0);
      expect(safeDivide(10, null)).toBe(0);
      expect(safeDivide(10, NaN)).toBe(0);
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

    it('coerces numeric strings from API', () => {
      expect(truncateDecimal('12345.67', 1)).toBe(12345.6);
      expect(truncateDecimal('1969.5', 1)).toBe(1969.5);
    });

    it('returns 0 for Infinity and NaN', () => {
      expect(truncateDecimal(Infinity, 1)).toBe(0);
      expect(truncateDecimal(NaN, 1)).toBe(0);
      expect(truncateDecimal('not-a-number', 1)).toBe(0);
    });
  });
});
