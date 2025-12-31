<script setup>
import { formatNumber, truncateDecimal } from '@/utils/helper.js';

const props = defineProps({
  itrSalary: {
    type: Array,
    required: true,
    default: () => [],
  },
  filteredCalculationsData: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const rowStyle = (data) => {
  if (data.name === 'Итого') {
    return { fontWeight: 'bold', fontStyle: 'italic' };
  }
};
</script>

<template>
  <DataTable
    :value="itrSalary"
    :rows="10"
    :rowHover="true"
    dataKey="id"
    resizableColumns
    showGridlines
    scrollable
    :rowStyle="rowStyle"
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
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
  font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
  font-weight: bold;
}
</style>

