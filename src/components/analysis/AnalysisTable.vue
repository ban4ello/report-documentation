<script setup>
import { useRouter } from 'vue-router';
import { formatNumber, truncateDecimal } from '@/utils/helper.js';

const props = defineProps({
  calculationsData: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const router = useRouter();
</script>

<template>
  <DataTable
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
        {{ data.specificationData.table[0]?.unitOfMeasurement }}
      </template>
    </Column>
    
    <Column style="min-width: 1rem">
      <template #header>
        <div v-tooltip.top="{ value: 'Количество', showDelay: 1000, hideDelay: 300 }" class="font-bold">
          Количество
        </div>
      </template>

      <template #body="{ data }">
        {{ formatNumber(truncateDecimal(data.specificationData.table.reduce((acc, item) => acc += (item.quantity * Number(item.valuePerUnit)), 0), 3)) }}
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
        <div v-tooltip.top="{ value: `Общая цифра за ${calculationsData[0]?.specificationData.table[0]?.unitOfMeasurement}`, showDelay: 1000, hideDelay: 300 }" class="font-bold">
          Общая цифра за {{ calculationsData[0]?.specificationData.table[0]?.unitOfMeasurement }}
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
</template>

