import api from '@/service/api';

export default {
  createCalculation({
    ITRWorkedDays,
    coeficientOfNDS,
    costOfElectricityPerDay,
    galvanizedValue,
    numberOfDaysPerShift,
    numberOfHoursPerShift,
    rentalCostPerDay,
    profitabilityCoeficient,
    title,
    transportValue,
    dateOfCreation,
    lastEditDate
  }) {
    return api().post('/calculation', {
      ITRWorkedDays,
      coeficientOfNDS,
      costOfElectricityPerDay,
      galvanizedValue,
      numberOfDaysPerShift,
      numberOfHoursPerShift,
      rentalCostPerDay,
      profitabilityCoeficient,
      title,
      transportValue,
      dateOfCreation,
      lastEditDate
    });
  },

  getCalculations() {
    return api().get('/calculations');
  },

  getCalculationById(id) {
    return api().get(`/calculation/${id}`);
  }
};
