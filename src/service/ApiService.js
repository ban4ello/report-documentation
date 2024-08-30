import api from '@/service/api';

export default {
  createCalculation({
    id,
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
    console.log(
      666,
      id,
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
    );

    return api().post('/calculation', {
      id,
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
  }
};
