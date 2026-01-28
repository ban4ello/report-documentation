import { computed } from 'vue';
import { formatNumber, truncateDecimal } from '@/utils/helper';

export function useCalculations(calculationData) {
  const salariesOfWorkersTotal = computed(() =>
    calculationData.value.workersData.table.reduce((acc, item) => {
      return (
        acc + parseFloat(Number((item.salaryPerDay / calculationData.value.numberOfHoursPerShift) * item.numberOfHoursWorked).toFixed())
      );
    }, 0)
  );

  const salariesOfITRTotal = computed(() =>
    calculationData.value.itrData.table.reduce((acc, item) => {
      return (
        acc +
        Number(
          parseFloat((item.salaryPerMonth / calculationData.value.numberOfDaysPerShift) * calculationData.value.itrWorkedDays).toFixed()
        )
      );
    }, 0)
  );

  const salariesOfITRTotalPerMonth = computed(() =>
    calculationData.value.itrData.table.reduce((acc, item) => {
      return acc + Number(parseFloat(item.salaryPerMonth));
    }, 0)
  );

  const totalSpecificationItems = computed(
    () =>
      calculationData.value.specificationData.table.reduce((acc, item) => {
        return acc + Number(item.quantity * item.valuePerUnit);
      }, 0) || 0
  );

  // Сумма quantity для элементов с unitOfMeasurement === 'шт'
  const totalQuantityInPieces = computed(
    () =>
      calculationData.value.specificationData.table.reduce((acc, item) => {
        if (item.unitOfMeasurement === 'шт') {
          return acc + Number(item.quantity || 0);
        }
        return acc;
      }, 0) || 0
  );

  // Проверка, есть ли элементы с unitOfMeasurement === 'шт'
  const hasPiecesUnit = computed(() => calculationData.value.specificationData.table.some((item) => item.unitOfMeasurement === 'шт'));

  // Знаменатель для расчета perItem: если есть 'шт', используем totalQuantityInPieces, иначе totalSpecificationItems
  const divisorForPerItem = computed(() => {
    return hasPiecesUnit.value && totalQuantityInPieces.value > 0 ? totalQuantityInPieces.value : totalSpecificationItems.value;
  });

  /**
   * Преобразует строку с числом в формате "3 072,00" в число
   * @param {string|number} value - Значение для преобразования
   * @returns {number} Преобразованное число
   */
  const parsePrice = (value) => {
    if (!value) return 0;

    // Если уже число, возвращаем как есть
    if (typeof value === 'number') {
      return value;
    }

    // Если строка, обрабатываем формат "3 072,00"
    if (typeof value === 'string') {
      // Убираем все пробелы и заменяем запятую на точку
      const cleanedValue = value.replace(/\s/g, '').replace(',', '.');
      const parsed = parseFloat(cleanedValue);
      return isNaN(parsed) ? 0 : parsed;
    }

    return 0;
  };

  const getTotalPrice = (array) => {
    return array.reduce((acc, item) => {
      if (item.price) {
        acc = acc + parsePrice(item.price);
      }
      return acc;
    }, 0);
  };

  const totalConsumables = computed(() => getTotalPrice(calculationData.value.consumablesData));
  const totalHardware = computed(() => getTotalPrice(calculationData.value.hardwareData));
  const totalMetal = computed(() => getTotalPrice(calculationData.value.metalData));

  // Эффективное значение totalHardware - исключается из расчетов если isMetalEnabled === true
  const effectiveTotalHardware = computed(() => {
    if (calculationData.value.isHardwareEnabled === true) {
      return 0;
    }
    return totalHardware.value;
  });

  // Эффективное значение totalMetal - исключается из расчетов если isHardwareEnabled === true
  const effectiveTotalMetal = computed(() => {
    if (calculationData.value.isMetalEnabled === true) {
      return 0;
    }
    return totalMetal.value;
  });

  const computedWorkerTaxData = computed(() => {
    const numberOfDecimal = 2;

    return calculationData.value.workersTaxData.reduce(
      (acc, item) => {
        switch (item.key) {
          case 'T':
            acc.T = Number(parseFloat(item.coefficient * salariesOfWorkersTotal.value).toFixed(numberOfDecimal));
            break;
          case 'TN':
            acc.TN = Number(parseFloat((acc.T / item.coefficientA) * item.coefficientB).toFixed(numberOfDecimal));
            break;
          case 'K':
            acc.K = Number(parseFloat(salariesOfWorkersTotal.value - acc.T).toFixed(numberOfDecimal));
            break;
          case 'KMIL':
            acc.KMIL = Number(parseFloat(acc.K * item.coefficient).toFixed(numberOfDecimal));
            break;
          case 'KESV':
            acc.KESV = Number(parseFloat((acc.K + acc.KMIL) * item.coefficient).toFixed(numberOfDecimal));
            break;
          default:
            break;
        }

        return acc;
      },
      { TN: 0, K: 0, KMIL: 0, KESV: 0 }
    );
  });

  const computedItrTaxData = computed(() => {
    const numberOfDecimal = 2;

    return calculationData.value.itrTaxData.reduce(
      (acc, item) => {
        switch (item.key) {
          case 'T':
            acc.T = Number(parseFloat(item.coefficient * salariesOfITRTotal.value).toFixed(numberOfDecimal));
            break;
          case 'TN':
            acc.TN = Number(parseFloat((acc.T / item.coefficientA) * item.coefficientB).toFixed(numberOfDecimal));
            break;
          case 'K':
            acc.K = Number(parseFloat(salariesOfITRTotal.value - acc.T).toFixed(numberOfDecimal));
            break;
          case 'KMIL':
            acc.KMIL = Number(parseFloat(acc.K * item.coefficient).toFixed(numberOfDecimal));
            break;
          case 'KESV':
            acc.KESV = Number(parseFloat((acc.K + acc.KMIL) * item.coefficient).toFixed(numberOfDecimal));
            break;
          default:
            break;
        }

        return acc;
      },
      { TN: 0, K: 0, KMIL: 0, KESV: 0 }
    );
  });

  const taxTotal = computed(() => {
    const numberOfDecimal = 2;

    return Number(
      parseFloat(
        (computedWorkerTaxData.value.T +
          computedWorkerTaxData.value.TN +
          computedWorkerTaxData.value.K +
          computedWorkerTaxData.value.KMIL +
          computedWorkerTaxData.value.KESV) *
          calculationData.value.coeficientOfNds
      ).toFixed(numberOfDecimal)
    );
  });

  const taxITRTotal = computed(() => {
    const numberOfDecimal = 2;

    return Number(
      parseFloat(
        (computedItrTaxData.value.T +
          computedItrTaxData.value.TN +
          computedItrTaxData.value.K +
          computedItrTaxData.value.KMIL +
          computedItrTaxData.value.KESV) *
          calculationData.value.coeficientOfNds
      ).toFixed(numberOfDecimal)
    );
  });

  const getPercentOfTotal = (totalNumber, finalTotalPrice) => {
    return (totalNumber / finalTotalPrice) * 100 || 0;
  };

  const finalTotalPrice = computed(() => {
    const baseTotal =
      effectiveTotalMetal.value +
      effectiveTotalHardware.value +
      totalConsumables.value +
      taxTotal.value +
      taxITRTotal.value +
      calculationData.value.galvanizedValue +
      calculationData.value.transportValue +
      calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
      calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays;

    return baseTotal * (1 + calculationData.value.profitabilityCoeficient);
  });

  const finalTotalPriceWithoutMetal = computed(() => {
    const baseTotal =
      effectiveTotalHardware.value +
      totalConsumables.value +
      taxTotal.value +
      taxITRTotal.value +
      calculationData.value.galvanizedValue +
      calculationData.value.transportValue +
      calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
      calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays;

    return baseTotal * (1 + calculationData.value.profitabilityCoeficient);
  });

  const priceData = computed(() => {
    const baseTotal =
      effectiveTotalMetal.value +
      effectiveTotalHardware.value +
      totalConsumables.value +
      taxTotal.value +
      taxITRTotal.value +
      calculationData.value.galvanizedValue +
      calculationData.value.transportValue +
      calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
      calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays;

    const profitability = baseTotal * calculationData.value.profitabilityCoeficient;
    const total = baseTotal + profitability;

    return [
      {
        id: 1,
        name: 'Металл',
        key: 'metal',
        statistics: getPercentOfTotal(totalMetal.value, finalTotalPrice.value),
        total: totalMetal.value || 0,
        perItem: divisorForPerItem.value ? truncateDecimal(totalMetal.value / divisorForPerItem.value, 2) : 0
      },
      {
        id: 2,
        name: 'Метизы',
        key: 'hardware',
        statistics: getPercentOfTotal(totalHardware.value, finalTotalPrice.value),
        total: totalHardware.value || 0,
        perItem: divisorForPerItem.value ? truncateDecimal(totalHardware.value / divisorForPerItem.value, 2) : 0
      },
      {
        id: 3,
        name: 'Расходники',
        key: 'consumables',
        statistics: getPercentOfTotal(totalConsumables.value, finalTotalPrice.value),
        total: totalConsumables.value || 0,
        perItem: divisorForPerItem.value ? truncateDecimal(totalConsumables.value / divisorForPerItem.value, 2) : 0
      },
      {
        id: 4,
        name: 'Цех',
        key: 'workshop',
        statistics: getPercentOfTotal(taxTotal.value, finalTotalPrice.value),
        total: taxTotal.value || 0,
        perItem: divisorForPerItem.value ? taxTotal.value / divisorForPerItem.value : 0
      },
      {
        id: 5,
        name: 'Зарплата ИТР',
        key: 'wagesOfEngineers',
        statistics: getPercentOfTotal(taxITRTotal.value, finalTotalPrice.value),
        total: taxITRTotal.value || 0,
        perItem: divisorForPerItem.value ? taxITRTotal.value / divisorForPerItem.value : 0
      },
      {
        id: 6,
        name: 'Оцинковка',
        key: 'galvanizing',
        statistics: getPercentOfTotal(calculationData.value.galvanizedValue, finalTotalPrice.value),
        total: calculationData.value.galvanizedValue || 0,
        perItem: divisorForPerItem.value ? calculationData.value.galvanizedValue / divisorForPerItem.value : 0
      },
      {
        id: 7,
        name: 'Транспорт',
        key: 'transport',
        statistics: getPercentOfTotal(calculationData.value.transportValue, finalTotalPrice.value),
        total: calculationData.value.transportValue || 0,
        perItem: divisorForPerItem.value ? calculationData.value.transportValue / divisorForPerItem.value : 0
      },
      {
        id: 8,
        name: 'Аренда',
        key: 'rent',
        statistics: getPercentOfTotal(calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays, finalTotalPrice.value),
        total: calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays || 0,
        perItem: divisorForPerItem.value
          ? (calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays) / divisorForPerItem.value
          : 0
      },
      {
        id: 9,
        name: 'Эл. эн.',
        key: 'electricity',
        statistics:
          getPercentOfTotal(calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays, finalTotalPrice.value) ||
          0,
        total: calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays || 0,
        perItem: divisorForPerItem.value
          ? (calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) / divisorForPerItem.value
          : 0
      },
      {
        id: 10,
        name: 'Рентабельность',
        key: 'profitability',
        statistics: getPercentOfTotal(profitability, finalTotalPrice.value),
        total: profitability,
        perItem: divisorForPerItem.value ? profitability / divisorForPerItem.value : 0
      },
      {
        id: 11,
        name: 'Итого',
        key: 'total',
        statistics: 0,
        total: total,
        perItem: divisorForPerItem.value ? total / divisorForPerItem.value : 0
      }
    ];
  });

  const finalPriceData = computed(() => {
    const baseTotal =
      effectiveTotalMetal.value +
      effectiveTotalHardware.value +
      totalConsumables.value +
      taxTotal.value +
      taxITRTotal.value +
      calculationData.value.galvanizedValue +
      calculationData.value.transportValue +
      calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
      calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays;

    const profitability = baseTotal * calculationData.value.profitabilityCoeficient;
    const total = baseTotal + profitability;

    return [
      {
        id: 1,
        name: 'Металл',
        key: 'metalTotal',
        statistics: getPercentOfTotal(effectiveTotalMetal.value + effectiveTotalHardware.value, finalTotalPrice.value),
        total: effectiveTotalMetal.value + effectiveTotalHardware.value,
        perItem: divisorForPerItem.value
          ? truncateDecimal((effectiveTotalMetal.value + effectiveTotalHardware.value) / divisorForPerItem.value)
          : 0
      },
      {
        id: 2,
        name: 'Переработка',
        key: 'processing',
        statistics: getPercentOfTotal(
          totalConsumables.value +
            taxTotal.value +
            taxITRTotal.value +
            calculationData.value.galvanizedValue +
            calculationData.value.transportValue +
            calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
            calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays,
          finalTotalPrice.value
        ),
        total:
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          calculationData.value.galvanizedValue +
          calculationData.value.transportValue +
          calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
          calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays,
        perItem: divisorForPerItem.value
          ? truncateDecimal(
              (totalConsumables.value +
                taxTotal.value +
                taxITRTotal.value +
                calculationData.value.galvanizedValue +
                calculationData.value.transportValue +
                calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
                calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) /
                divisorForPerItem.value,
              2
            )
          : 0
      },
      {
        id: 3,
        name: 'Рентабельность',
        key: 'profitability',
        statistics: getPercentOfTotal(profitability, finalTotalPrice.value),
        total: profitability,
        perItem: divisorForPerItem.value ? profitability / divisorForPerItem.value : 0
      },
      {
        id: 4,
        name: 'Итого',
        key: 'total',
        statistics: 0,
        total: total,
        perItem: divisorForPerItem.value ? total / divisorForPerItem.value : 0
      }
    ];
  });

  return {
    salariesOfWorkersTotal,
    salariesOfITRTotal,
    salariesOfITRTotalPerMonth,
    totalSpecificationItems,
    totalConsumables,
    totalHardware,
    totalMetal,
    computedWorkerTaxData,
    computedItrTaxData,
    taxTotal,
    taxITRTotal,
    finalTotalPrice,
    finalTotalPriceWithoutMetal,
    priceData,
    finalPriceData,
    formatNumber,
    truncateDecimal
  };
}
