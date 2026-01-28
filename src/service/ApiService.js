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
    metalData,
    specificationData,
    workersData,
    itrData,
    workersTaxData,
    itrTaxData,
    totalMetalPerItem,
    totalProcessingPerItem,
    totalProfitabilityPerItem,
    total,
    isMetalEnabled,
    isHardwareEnabled
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
      metalData,
      specificationData,
      workersData,
      itrData,
      workersTaxData,
      itrTaxData,
      totalMetalPerItem,
      totalProcessingPerItem,
      totalProfitabilityPerItem,
      total,
      isMetalEnabled,
      isHardwareEnabled
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
    dateOfCreation,
    lastEditDate,
    id,
    consumablesData,
    hardwareData,
    metalData,
    specificationData,
    workersData,
    itrData,
    workersTaxData,
    itrTaxData,
    totalMetalPerItem,
    totalProcessingPerItem,
    totalProfitabilityPerItem,
    total,
    isMetalEnabled,
    isHardwareEnabled
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
      dateOfCreation,
      lastEditDate,
      consumablesData,
      hardwareData,
      metalData,
      specificationData,
      workersData,
      itrData,
      workersTaxData,
      itrTaxData,
      totalMetalPerItem,
      totalProcessingPerItem,
      totalProfitabilityPerItem,
      total,
      isMetalEnabled,
      isHardwareEnabled
    });
  },

  getCalculations(params) {
    const searchParams = new URLSearchParams(params && params.filter).toString();

    return api().get(`/calculations?${searchParams}`);
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
  },

  deleteItemFromWorkersData(workerId) {
    return api().delete(`/workers-data-table/${workerId}`);
  },

  deleteItemFromItrData(workerId) {
    return api().delete(`/itr-data-table/${workerId}`);
  },

  deleteItemFromSpecificationData(specificationId) {
    return api().delete(`/specification-data-table/${specificationId}`);
  },

  deleteItemFromParentCalculation(parentCalculationId) {
    return api().delete(`/parent-calculation/${parentCalculationId}`);
  },

  deleteCalculation(calculationId) {
    return api().delete(`/calculation/${calculationId}`);
  },

  createWorker({ name, lastname, position }) {
    return api().post('/worker', {
      name,
      lastname,
      position
    });
  },

  getWorkers() {
    return api().get('/workers');
  },

  updateWorker({ id, name, lastname, position }) {
    return api().put(`/worker/${id}`, {
      name,
      lastname,
      position
    });
  },

  deleteWorker(id) {
    return api().delete(`/worker/${id}`);
  },

  signup({ username, password, email, role }) {
    return api().post('/signup', { username, password, email, role });
  },

  login({ email, password }) {
    return api().post('/login', { email, password });
  },

  logout() {
    return api().post('/logout');
  },

  uploadCalculationMediaFiles(calculationId, formData) {
    return api().post(`/calculation/${calculationId}/media-files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  getCalculationMediaFiles(calculationId) {
    return api().get(`/calculation/${calculationId}/media-files`);
  },

  downloadCalculationMediaFile(fileId) {
    return api().get(`/calculation-media-file/${fileId}`, {
      responseType: 'blob'
    });
  },

  deleteCalculationMediaFile(fileId) {
    return api().delete(`/calculation-media-file/${fileId}`);
  }
};
