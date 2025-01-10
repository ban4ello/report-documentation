<script setup>
import ApiService from '@/service/ApiService';
import { onBeforeMount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MONTH } from '@/utils/constants.js';
import { camelize, formatNumber, truncateDecimal } from '@/utils/helper.js';

const router = useRouter();
const expandedRows = ref([]);
const loading = ref(false);
const calculationsData = ref([]);
const filteredCalculationsData = ref([]);
const workersSalary = ref([]);
const rawCalculationData = ref([]);
const isShowAllYear = ref(false);
const isShowAllYearAnalysis = ref(false);
const analysisTableFilter = ref({
  selectedYear: new Date().getFullYear(),
  selectedMonth: MONTH[new Date().getMonth()] + '/' + new Date().getFullYear(),
});
const workersSalaryFilter = ref({
  selectedYear: new Date().getFullYear(),
  selectedMonth: MONTH[new Date().getMonth()] + '/' + new Date().getFullYear(),
});

watch(isShowAllYear, () => {
  updateWorkersSalaryTable(rawCalculationData.value);
});

watch(isShowAllYearAnalysis, () => {
  updateAnalysisTable(rawCalculationData.value);
});

const updateAnalysisTable = (data) => {
  calculationsData.value = data.filter(item => {
    if (isShowAllYearAnalysis.value) {
      return new Date(item.dateOfCreation).getFullYear() === analysisTableFilter.value.selectedYear;
    }

    return item.customFilterField === analysisTableFilter.value.selectedMonth;
  });
};

const updateWorkersSalaryTable = (calculationData) => {
  filteredCalculationsData.value = calculationData.filter(item => {
    if (isShowAllYear.value) {
      return new Date(item.dateOfCreation).getFullYear() === workersSalaryFilter.value.selectedYear;
    }

    return item.customFilterField === workersSalaryFilter.value.selectedMonth;
  });
  let allSalaryAccruals = [];
  let workers = [];

  allSalaryAccruals = filteredCalculationsData.value.reduce((acc, item, index, array) => {
    item.workersData.table.forEach((worker, workerIndex) => {
      acc.push({
        order: item.title,
        workerName: item.workersData.table[workerIndex].name,
        salary: (worker.salaryPerDay / item.numberOfHoursPerShift) * worker.numberOfHoursWorked,
        id: worker.id,
      });
    });

    return acc;
  }, []);

  workers = allSalaryAccruals.reduce((acc, item, index, array) => {
    if (acc[item.workerName]) {
      acc[item.workerName].push(item)
    } else {
      acc[item.workerName] = [item]
    }

    return acc;
  }, {});

  workersSalary.value = Object.keys(workers).map(item => ({ table: workers[item].reduce((acc, item) => {
    acc[item.order] = item;
    return acc;
  }, {}), name: item }));
};

onBeforeMount(async () => {
  loading.value = true;

  try {
    const factCalculatonsRes = await ApiService.getCalculations({ filter: { calculation_type: 'fact' } });
    const calculationsRes = await Promise.allSettled(factCalculatonsRes.data.map(item => ApiService.getCalculationById(item.id)));
    const calculationsRow = calculationsRes.map(item => item.value.data);

    let camelizeData = calculationsRow.map((item, index) => {
      return Object.keys(item).reduce((acc, key) => {
        if (camelize(key) === 'dateOfCreation') {
          acc.customFilterField = MONTH[new Date(item[key]).getMonth()] + '/' + new Date(item[key]).getFullYear();
        }

        acc[camelize(key)] = item[key];
        
        // // !!! remove before deploy production !!!
        // if (index === 0) {
        //   const date = new Date();
        //   date.setMonth(11);
        //   date.setFullYear(2024);
        //   acc.customFilterField = MONTH[date.getMonth()] + '/' + date.getFullYear('2024');
        //   acc.dateOfCreation = new Date().setFullYear('2024');
        // }

        // if (index === 1) {
        //   const date = new Date();
        //   date.setMonth(10);
        //   date.setFullYear(2024);
        //   acc.customFilterField = MONTH[date.getMonth()] + '/' + date.getFullYear('2024');
        //   acc.dateOfCreation = new Date().setFullYear('2024');
        // }

        // if (index === 2) {
        //   const date = new Date();
        //   date.setMonth(4);
        //   date.setFullYear(2023);
        //   acc.customFilterField = MONTH[date.getMonth()] + '/' + date.getFullYear('2023');
        //   acc.dateOfCreation = new Date().setFullYear('2023');
        // }
        // // !!! remove before deploy production !!!

        return acc;
      }, {});
    });

    // console.log('calculationsData', camelizeData);
    rawCalculationData.value = camelizeData;

    updateWorkersSalaryTable(camelizeData);
    updateAnalysisTable(camelizeData);
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
});

const setFilterForAnalysisTable = (newDate) => {
  analysisTableFilter.value = {
    selectedYear: new Date(newDate).getFullYear(),
    selectedMonth: MONTH[new Date(newDate).getMonth()] + '/' + new Date(newDate).getFullYear(),
  }

  updateAnalysisTable(rawCalculationData.value);
};

const setWorkersFilter = (newDate) => {
  workersSalaryFilter.value = {
    selectedYear: new Date(newDate).getFullYear(),
    selectedMonth: MONTH[new Date(newDate).getMonth()] + '/' + new Date(newDate).getFullYear(),
  }

  updateWorkersSalaryTable(rawCalculationData.value);
};
</script>

<template>
  <div v-if="loading" class="card flex justify-center items-center h-[100vh] fixed top-0 left-0 right-0 z-9999 opacity-60">
    <ProgressSpinner />
  </div>

  <Fluid>
    <div class="card">
      <div class="flex gap-4 justify-between">
        <div class="font-semibold text-[--primary-color] text-xl mb-4">Анализ</div>

        <div class="flex gap-4 items-center mb-4">
          <span>Выберите дату:</span>

          <DatePicker
            :modelValue="analysisTableFilter.selectedMonth"
            dateFormat="mm.yy"
            placeholder="mm/yyyy"
            view="month"
            style="width: 200px;"
            @update:modelValue="setFilterForAnalysisTable"
          />

          <div class="flex gap-2 items-center">
            <Checkbox v-model="isShowAllYearAnalysis" :value="isShowAllYearAnalysis" :binary="true" />
            <label class="font-semibold items-center text-md">За весь год</label>
          </div>
        </div>
      </div>

      <DataTable
        v-model:expandedRows="expandedRows"
        :value="calculationsData"
        :rows="10"
        :rowHover="true"
        dataKey="id"
        resizableColumns
        showGridlines
      >
        <template #empty> Нет данных для отображения </template>
        <template #loading> Загружается список... Пожалуйста подождите. </template>

        <Column field="customFilterField" sortable filterField="customFilterField" dataType="text" style="min-width: 1rem">
          <template #header>
            <div v-tooltip.top="{ value: 'Дата создания', showDelay: 1000, hideDelay: 300 }" class="font-bold">
              Дата создания
            </div>
          </template>

          <template #body="{ data }">
            {{ data.customFilterField }}
          </template>
        </Column>

        <Column field="title" style="min-width: 1rem">
          <template #header>
            <div v-tooltip.top="{ value: 'Наименование', showDelay: 1000, hideDelay: 300 }" class="font-bold">
              Наименование
            </div>
          </template>

          <template #body="{ data }">
            <div
              class="hover:text-[--primary-color] hover:cursor-pointer"
              @click="router.push({ path: `/calculations/${data.id}`, query: { type: data.calculationType } })"
            >
              {{ data.title }}
            </div>
          </template>
        </Column>

        <Column style="min-width: 1rem">
          <template #header>
            <div v-tooltip.top="{ value: 'Ед. измирения', showDelay: 1000, hideDelay: 300 }" class="font-bold">
              Ед. измирения
            </div>
          </template>

          <template #body="{ data }">
            {{ data.specificationData.table[0].unitOfMeasurement }}
          </template>
        </Column>
        
        <Column style="min-width: 1rem">
          <template #header>
            <div v-tooltip.top="{ value: 'Количество', showDelay: 1000, hideDelay: 300 }" class="font-bold">
              Количество
            </div>
          </template>

          <template #body="{ data }">
            {{ data.specificationData.table.reduce((acc, item) => acc += (item.quantity * Number(item.valuePerUnit)), 0) }}
          </template>
        </Column>

        <Column style="min-width: 1rem">
          <template #header>
            <div v-tooltip.top="{ value: 'Металл за 1 ед.', showDelay: 1000, hideDelay: 300 }" class="font-bold">
              Металл за 1 ед.
            </div>
          </template>

          <template #body="{ data }">
            {{ formatNumber(truncateDecimal(data.totalMetalPerItem, 1)) }}
          </template>
        </Column>

        <Column style="min-width: 1rem">
          <template #header>
            <div v-tooltip.top="{ value: 'Переработка за 1 ед.', showDelay: 1000, hideDelay: 300 }" class="font-bold">
              Переработка за 1 ед.
            </div>
          </template>

          <template #body="{ data }">
            {{ formatNumber(truncateDecimal(data.totalProcessingPerItem, 1)) }}
          </template>
        </Column>

        <Column style="min-width: 1rem">
          <template #header>
            <div v-tooltip.top="{ value: 'Рентабельность за 1 ед.', showDelay: 1000, hideDelay: 300 }" class="font-bold">
              Рентабельность за 1 ед.
            </div>
          </template>

          <template #body="{ data }">
            {{ formatNumber(truncateDecimal(data.totalProfitabilityPerItem, 1)) }}
          </template>
        </Column>

        <Column style="min-width: 1rem">
          <template #header>
            <div v-tooltip.top="{ value: `Общая цифра за ${calculationsData[0]?.specificationData.table[0].unitOfMeasurement}`, showDelay: 1000, hideDelay: 300 }" class="font-bold">
              Общая цифра за {{ calculationsData[0]?.specificationData.table[0].unitOfMeasurement }}
            </div>
          </template>

          <template #body="{ data }">
            {{ formatNumber(truncateDecimal(data.total / data.specificationData.table.reduce((acc, item) => acc += (item.quantity * Number(item.valuePerUnit)), 0), 1)) }}
          </template>
        </Column>

        <Column style="min-width: 1rem">
          <template #header>
            <div v-tooltip.top="{ value: 'Итого', showDelay: 1000, hideDelay: 300 }" class="font-bold">
              Итого
            </div>
          </template>

          <template #body="{ data }">
            <span class="font-bold">
              {{ formatNumber(truncateDecimal(data.total, 1)) }}
            </span>
          </template>
        </Column>
      </DataTable>
    </div>

    <div class="card">
      <div class="flex gap-4 justify-between">
        <div class="font-semibold text-[--primary-color] text-xl mb-4">ЗП Цех</div>

        <div class="flex gap-4 items-center mb-4">
          <span>Выберите дату:</span>
  
          <DatePicker
            :modelValue="workersSalaryFilter.selectedMonth"
            dateFormat="mm.yy"
            placeholder="mm/yyyy"
            view="month"
            style="width: 200px;"
            @update:modelValue="setWorkersFilter"
          />
  
          <div class="flex gap-2 items-center">
            <Checkbox v-model="isShowAllYear" :value="isShowAllYear" :binary="true" />
            <label class="font-semibold items-center text-md">За весь год</label>
          </div>
        </div>
      </div>

      <DataTable
        v-model:expandedRows="expandedRows"
        :value="workersSalary"
        :rows="10"
        :rowHover="true"
        dataKey="id"
        resizableColumns
        showGridlines
        scrollable
      >
        <template #empty> Нет данных для отображения </template>
        <template #loading> Загружается список... Пожалуйста подождите. </template>

        <Column frozen>
          <template #header>
            <div v-tooltip.top="{ value: 'Имя сотрудника', showDelay: 1000, hideDelay: 300 }" class="font-bold">
              <div>
                Имя сотрудника
              </div>
            </div>
          </template>

          <template #body="{ data }">
            {{ data.name }}
          </template>
        </Column>

        <Column v-for="(col, index) of filteredCalculationsData.length" :key="col.field" :field="`col${index}`" :header="col.header">
          <template #header>
            <div v-tooltip.top="{ value: filteredCalculationsData[index]?.title, showDelay: 1000, hideDelay: 300 }" class="font-bold">
              {{ filteredCalculationsData[index]?.title }}
            </div>
          </template>

          <template #body="{ data }">
            {{ formatNumber(truncateDecimal(data.table[filteredCalculationsData[index]?.title]?.salary, 2)) || '-' }}
          </template>
        </Column>

        <Column frozen alignFrozen="right">
          <template #header>
            <div v-tooltip.top="{ value: 'Итого', showDelay: 1000, hideDelay: 300 }" class="font-bold">
              <div>
                Итого
              </div>
            </div>
          </template>

          <template #body="{ data }">
            <span class="font-bold">
              {{ formatNumber(truncateDecimal(Object.keys(data.table).reduce((acc, key) => (acc += data.table[key].salary), 0), 2)) || '-' }}
            </span>
          </template>
        </Column>
      </DataTable>
    </div>
  </Fluid>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
  font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
  font-weight: bold;
}
</style>
