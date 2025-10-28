const camelize = (s) => s.replace(/_./g, (x) => x[1].toUpperCase());

const formatNumber = (numberData) => {
  if (numberData && numberData.value) {
    return new Intl.NumberFormat('ru-RU').format(numberData.value);
  } else if (numberData) {
    return new Intl.NumberFormat('ru-RU').format(numberData);
  } else {
    return 0;
  }
};

const truncateDecimal = (num, decimalPlaces) => {
  const factor = Math.pow(10, decimalPlaces);
  return Math.trunc(num * factor) / factor;
};

export {
  camelize,
  formatNumber,
  truncateDecimal,
};