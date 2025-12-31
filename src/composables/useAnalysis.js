import { ref, computed } from 'vue';
import ApiService from '@/service/ApiService';
import { camelize } from '@/utils/helper';
import { MONTH } from '@/utils/constants.js';

const getCurrentDateFilter = () => {
  const date = new Date();
  return {
    selectedYear: date.getFullYear(),
    selectedMonth: MONTH[date.getMonth()] + '/' + date.getFullYear()
  };
};

export function useAnalysis() {
  const loading = ref(false);
  const rawCalculationData = ref([]);
  const isShowAllYear = ref(false);
  const isShowAllYearAnalysis = ref(false);
  const isShowAllYearITR = ref(false);

  const analysisTableFilter = ref(getCurrentDateFilter());
  const workersSalaryFilter = ref(getCurrentDateFilter());
  const itrSalaryFilter = ref(getCurrentDateFilter());

  // Computed для отфильтрованных данных анализа
  const calculationsData = computed(() => {
    return rawCalculationData.value.filter((item) => {
      if (isShowAllYearAnalysis.value) {
        return new Date(item.dateOfCreation).getFullYear() === analysisTableFilter.value.selectedYear;
      }
      return item.customFilterField === analysisTableFilter.value.selectedMonth;
    });
  });

  // Computed для отфильтрованных данных зарплат рабочих
  const filteredCalculationsData = computed(() => {
    return rawCalculationData.value.filter((item) => {
      if (isShowAllYear.value) {
        return new Date(item.dateOfCreation).getFullYear() === workersSalaryFilter.value.selectedYear;
      }
      return item.customFilterField === workersSalaryFilter.value.selectedMonth;
    });
  });

  // Computed для отфильтрованных данных зарплат ИТР
  const filteredCalculationsDataForITR = computed(() => {
    return rawCalculationData.value.filter((item) => {
      if (isShowAllYearITR.value) {
        return new Date(item.dateOfCreation).getFullYear() === itrSalaryFilter.value.selectedYear;
      }
      return item.customFilterField === itrSalaryFilter.value.selectedMonth;
    });
  });

  // Computed для зарплат работников
  const workersSalary = computed(() => {
    const allSalaryAccruals = filteredCalculationsData.value.reduce((acc, item) => {
      item.workersData.table.forEach((worker, workerIndex) => {
        acc.push({
          order: item.title,
          workerName: item.workersData.table[workerIndex].name,
          salary: (worker.salaryPerDay / item.numberOfHoursPerShift) * worker.numberOfHoursWorked,
          id: worker.id
        });
      });
      return acc;
    }, []);

    const workers = allSalaryAccruals.reduce((acc, item) => {
      if (acc[item.workerName]) {
        acc[item.workerName].push(item);
      } else {
        acc[item.workerName] = [item];
      }
      return acc;
    }, {});

    const workersList = Object.keys(workers).map((item) => {
      return {
        table: workers[item].reduce((acc, item) => {
          acc[item.order] = item;
          return acc;
        }, {}),
        name: item
      };
    });

    // Добавляем синтетическую строку 'Total' для workersSalary
    workersList.push({
      table: allSalaryAccruals.reduce((acc, item) => {
        if (acc[item.order]) {
          acc[item.order] = { ...item, salary: acc[item.order].salary + item.salary };
        } else {
          acc[item.order] = item;
        }
        return acc;
      }, {}),
      name: 'Итого'
    });

    return workersList;
  });

  // Computed для зарплат ИТР
  const itrSalary = computed(() => {
    const allSalaryAccruals = filteredCalculationsDataForITR.value.reduce((acc, item) => {
      if (item.itrData && item.itrData.table) {
        item.itrData.table.forEach((itr) => {
          const salary = (itr.salaryPerMonth / item.numberOfDaysPerShift) * item.itrWorkedDays;
          acc.push({
            order: item.title,
            itrName: itr.name,
            salary: salary,
            id: itr.id
          });
        });
      }
      return acc;
    }, []);

    const itrWorkers = allSalaryAccruals.reduce((acc, item) => {
      if (acc[item.itrName]) {
        acc[item.itrName].push(item);
      } else {
        acc[item.itrName] = [item];
      }
      return acc;
    }, {});

    const itrList = Object.keys(itrWorkers).map((item) => {
      return {
        table: itrWorkers[item].reduce((acc, item) => {
          acc[item.order] = item;
          return acc;
        }, {}),
        name: item
      };
    });

    // Добавляем синтетическую строку 'Total' для itrSalary
    itrList.push({
      table: allSalaryAccruals.reduce((acc, item) => {
        if (acc[item.order]) {
          acc[item.order] = { ...item, salary: acc[item.order].salary + item.salary };
        } else {
          acc[item.order] = item;
        }
        return acc;
      }, {}),
      name: 'Итого'
    });

    return itrList;
  });

  const loadCalculations = async () => {
    loading.value = true;
    try {
      const factCalculatonsRes = await ApiService.getCalculations({ filter: { calculation_type: 'fact' } });
      const calculationsRes = await Promise.allSettled(factCalculatonsRes.data.map((item) => ApiService.getCalculationById(item.id)));
      const calculationsRow = calculationsRes.map((item) => item.value.data);

      const camelizeData = calculationsRow.map((item) => {
        return Object.keys(item).reduce((acc, key) => {
          if (camelize(key) === 'dateOfCreation') {
            acc.customFilterField = MONTH[new Date(item[key]).getMonth()] + '/' + new Date(item[key]).getFullYear();
          }
          acc[camelize(key)] = item[key];
          return acc;
        }, {});
      });

      rawCalculationData.value = camelizeData;
    } catch (error) {
      console.error('Error loading calculations:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const setFilterForAnalysisTable = (newDate) => {
    analysisTableFilter.value = {
      selectedYear: new Date(newDate).getFullYear(),
      selectedMonth: MONTH[new Date(newDate).getMonth()] + '/' + new Date(newDate).getFullYear()
    };
  };

  const setWorkersFilter = (newDate) => {
    workersSalaryFilter.value = {
      selectedYear: new Date(newDate).getFullYear(),
      selectedMonth: MONTH[new Date(newDate).getMonth()] + '/' + new Date(newDate).getFullYear()
    };
  };

  const setITRFilter = (newDate) => {
    itrSalaryFilter.value = {
      selectedYear: new Date(newDate).getFullYear(),
      selectedMonth: MONTH[new Date(newDate).getMonth()] + '/' + new Date(newDate).getFullYear()
    };
  };

  return {
    loading,
    rawCalculationData,
    isShowAllYear,
    isShowAllYearAnalysis,
    isShowAllYearITR,
    analysisTableFilter,
    workersSalaryFilter,
    itrSalaryFilter,
    calculationsData,
    filteredCalculationsData,
    filteredCalculationsDataForITR,
    workersSalary,
    itrSalary,
    loadCalculations,
    setFilterForAnalysisTable,
    setWorkersFilter,
    setITRFilter
  };
}
