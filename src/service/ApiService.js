import api from '@/service/api';

export default {
  createCalculation({
    itrWorkedDays,
    coeficientOfNds,
    costOfElectricityPerDay,
    galvanizedValue,
    numberOfDaysPerShift,
    numberOfHoursPerShift,
    rentalCostPerDay,
    profitabilityCoeficient,
    title,
    transportValue,
    dateOfCreation,
    lastEditDate,
    parentCalculationId,
    calculationType,
    consumablesData,
    hardwareData,
    metalData
  }) {
    return api().post('/calculation', {
      itrWorkedDays,
      coeficientOfNds,
      costOfElectricityPerDay,
      galvanizedValue,
      numberOfDaysPerShift,
      numberOfHoursPerShift,
      rentalCostPerDay,
      profitabilityCoeficient,
      title,
      transportValue,
      dateOfCreation,
      lastEditDate,
      parentCalculationId,
      calculationType,
      consumablesData,
      hardwareData,
      metalData
    });
  },

  updateCalculation({
    itrWorkedDays,
    coeficientOfNds,
    costOfElectricityPerDay,
    galvanizedValue,
    numberOfDaysPerShift,
    numberOfHoursPerShift,
    rentalCostPerDay,
    profitabilityCoeficient,
    title,
    transportValue,
    lastEditDate,
    id,
    consumablesData,
    hardwareData,
    metalData
  }) {
    return api().put(`/calculation/${id}`, {
      itrWorkedDays,
      coeficientOfNds,
      costOfElectricityPerDay,
      galvanizedValue,
      numberOfDaysPerShift,
      numberOfHoursPerShift,
      rentalCostPerDay,
      profitabilityCoeficient,
      title,
      transportValue,
      lastEditDate,
      consumablesData,
      hardwareData,
      metalData
    });
  },

  getCalculations() {
    return api().get('/calculations');
  },

  getCalculationById(id) {
    return api().get(`/calculation/${id}`);
  },

  createParentCalculation({ title }) {
    return api().post('/parent-calculation', { title });
  },

  getParentCalculations() {
    return api().get('/parent-calculations');
  },

  getParentCalculationById(id) {
    return api().get(`/parent-calculation/${id}`);
  },

  getParentCalculationChildren(parentId) {
    return api().get(`/calculation?id=${parentId}`);
  }
};
