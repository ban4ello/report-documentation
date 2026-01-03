import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ApiService from '@/service/ApiService';
import { camelize } from '@/utils/helper';

export function useCalculation() {
  const router = useRouter();
  const loading = ref(false);
  const parentId = ref(null);
  const currentCalculationType = ref(null);
  const calculationPlanId = ref(null);
  const calculationPlanTotal = ref(null);
  const date = new Date();

  const initialCalculationData = {
    itrWorkedDays: 1,
    numberOfDaysPerShift: 21,
    numberOfHoursPerShift: 8,
    coeficientOfNds: 1.2,
    costOfElectricityPerDay: 0,
    galvanizedValue: 0,
    rentalCostPerDay: 0,
    profitabilityCoeficient: 0,
    title: `Калькуляция ${date.toLocaleDateString()}`,
    transportValue: 0,
    dateOfCreation: date,
    lastEditDate: '',
    calculationType: 'plan',
    specificationData: {
      table: [],
      notes: ''
    },
    workersData: {
      table: [],
      notes: ''
    },
    itrData: {
      table: [],
      notes: ''
    },
    consumablesData: [],
    hardwareData: [],
    metalData: [],
    workersTaxData: [],
    itrTaxData: [],
    total: null,
    isMetalEnabled: false,
    isHardwareEnabled: false
  };

  const calculationData = ref({ ...initialCalculationData });

  const initializeFromQuery = async () => {
    const query = router.currentRoute.value.query;
    parentId.value = query.parentId;
    currentCalculationType.value = query.type;
    calculationPlanId.value = query.calculationPlanId;

    if (currentCalculationType.value === 'fact') {
      try {
        const calculationPlanRes = await ApiService.getCalculationById(calculationPlanId.value);
        const camelizeData = Object.keys(calculationPlanRes.data).reduce((acc, key) => {
          acc[camelize(key)] = calculationPlanRes.data[key];

          if (key === 'calculationType') {
            acc['calculationType'] = 'fact';
          }

          return acc;
        }, {});

        calculationPlanTotal.value = Number(camelizeData.total);
        calculationData.value = { ...calculationData.value, ...camelizeData };
      } catch (error) {
        console.log(error);
      }
    }
  };

  const createCalculation = async (finalTotalPrice, finalPriceData) => {
    loading.value = true;

    const getTotalValue = (data, fieldName) => {
      return data.reduce((acc, item) => {
        if (item.key === fieldName) {
          acc = item.perItem;
        }
        return acc;
      }, 0);
    };

    try {
      const calculationRes = await ApiService.createCalculation({
        ...calculationData.value,
        calculationType: router.currentRoute.value.query.type || 'plan',
        dateOfCreation: calculationData.value.dateOfCreation || new Date(),
        lastEditDate: new Date(),
        consumablesData: JSON.stringify(calculationData.value.consumablesData),
        hardwareData: JSON.stringify(calculationData.value.hardwareData),
        metalData: JSON.stringify(calculationData.value.metalData),
        parentCalculationId: Number(parentId.value),
        total: finalTotalPrice,
        totalMetalPerItem: getTotalValue(finalPriceData, 'metalTotal'),
        totalProcessingPerItem: getTotalValue(finalPriceData, 'processing'),
        totalProfitabilityPerItem: getTotalValue(finalPriceData, 'profitability'),
        isMetalEnabled: calculationData.value.isMetalEnabled || false,
        isHardwareEnabled: calculationData.value.isHardwareEnabled || false
      });
      return { success: true, data: calculationRes.data };
    } catch (error) {
      console.log(error);
      return { success: false, error };
    } finally {
      loading.value = false;
    }
  };

  return {
    calculationData,
    loading,
    parentId,
    currentCalculationType,
    calculationPlanId,
    calculationPlanTotal,
    initializeFromQuery,
    createCalculation
  };
}
