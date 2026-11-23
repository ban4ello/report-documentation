import { MONTH } from '../constants';

/* global describe, it, expect */

describe('utils/constants', () => {
  it('exports 12 month names', () => {
    expect(Array.isArray(MONTH)).toBe(true);
    expect(MONTH).toHaveLength(12);
    expect(MONTH[0]).toBe('Январь');
    expect(MONTH[11]).toBe('Декабрь');
  });
});
