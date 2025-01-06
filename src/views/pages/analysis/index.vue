<script setup>
import ApiService from '@/service/ApiService';
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { MONTH } from '@/utils/constants.js';
import { camelize, formatNumber, truncateDecimal } from '@/utils/helper.js';

const router = useRouter();
const expandedRows = ref([]);
const loading = ref(false);
const calculationsData = ref([]);
const filters = ref();

const initFilters = () => {
  filters.value = {
    customFilterField: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
  };
};

initFilters();

onBeforeMount(async () => {
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
        //   acc.customFilterField = MONTH[date.getMonth()] + '/' + date.getFullYear();
        // }

        // if (index === 1) {
        //   const date = new Date();
        //   date.setMonth(4);
        //   date.setFullYear(2023);
        //   acc.customFilterField = MONTH[date.getMonth()] + '/' + date.getFullYear();
        // }

        // // !!! remove before deploy production !!!

        return acc;
      }, {});
    });

    // console.log('calculationsData', camelizeData);

    calculationsData.value = camelizeData;
  } catch (error) {
    console.log(error);
  }
});

const changeFilterModel = (newDate, filterModel) => {
  filterModel.value = MONTH[new Date(newDate).getMonth()] + '/' + new Date(newDate).getFullYear();
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
      </div>

      <DataTable
        v-model:expandedRows="expandedRows"
        v-model:filters="filters"
        filterDisplay="menu"
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

          <template #filter="{ filterModel }">
            <DatePicker
              :modelValue="filterModel.value"
              dateFormat="mm.yy"
              placeholder="mm/yyyy"
              view="month"
              @update:modelValue="(v) => changeFilterModel(v, filterModel)"
            />
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
            {{ formatNumber(truncateDecimal(data.total, 1)) }}
          </template>
        </Column>
      </DataTable>
    </div>

    <ConfirmDialog></ConfirmDialog>
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
