const camelize = (s) => s.replace(/_./g, (x) => x[1].toUpperCase());

/** Единицы, которые в расчёте «на 1 единицу» работают как штуки (делитель = quantity). */
const PIECE_UNIT_ALIASES = new Set(['шт', 'штуки', 'штука', 'компл', 'комплект', 'комплекты']);

const normalizeUnitKey = (unit) =>
  String(unit || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/ё/g, 'е');

const isPieceUnit = (unit) => PIECE_UNIT_ALIASES.has(normalizeUnitKey(unit));

const toFiniteNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

/** Деление с защитой от нулевого/невалидного знаменателя (иначе Infinity → «∞» в UI). */
const safeDivide = (numerator, denominator) => {
  const denom = Number(denominator);
  if (!Number.isFinite(denom) || denom === 0) return 0;
  return toFiniteNumber(numerator) / denom;
};

const formatNumber = (numberData) => {
  let value;
  if (numberData && numberData.value) {
    value = numberData.value;
  } else if (numberData) {
    value = numberData;
  } else {
    return 0;
  }

  if (!Number.isFinite(Number(value))) return 0;
  return new Intl.NumberFormat('ru-RU').format(value);
};

const truncateDecimal = (num, decimalPlaces = 0) => {
  // Number.isFinite не приводит типы — строки с числами из API (напр. "1969.5") иначе становятся 0
  const value = toFiniteNumber(num);
  const factor = Math.pow(10, decimalPlaces);
  return Math.trunc(value * factor) / factor;
};

export {
  camelize,
  formatNumber,
  isPieceUnit,
  normalizeUnitKey,
  PIECE_UNIT_ALIASES,
  safeDivide,
  truncateDecimal,
};
