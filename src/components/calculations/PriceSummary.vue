<script setup>
import { formatNumber, truncateDecimal } from '@/utils/helper';

const props = defineProps({
  priceData: {
    type: Array,
    required: true
  },
  finalPriceData: {
    type: Array,
    required: true
  },
  computedStyleClass: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['cell-edit-complete']);

const onCellEditComplete = (event) => {
  emit('cell-edit-complete', event);
};
</script>

<template>
  <div class="grid grid-cols-1fr-40 gap-4 mb-[2rem]">
    <div class="card subtotal mb-0">
      <div class="flex flex-row justify-between gap-2">
        <div class="font-semibold text-xl" :class="computedStyleClass">Подытог</div>
      </div>

      <DataTable :value="priceData" editMode="cell" @cell-edit-complete="onCellEditComplete" showGridlines>
        <template #empty> Нет данных для отображения </template>

        <Column field="name">
          <template #body="{ data }">
            <div>
              {{ data.name }}
            </div>
          </template>
        </Column>

        <Column field="total" header="Общая">
          <template #body="{ data }">
            <div :class="{ 'text-[red]': data.key === 'total' }">
              {{ formatNumber(data.total) }}
            </div>
          </template>
        </Column>

        <Column field="perItem" header="На 1 единицу">
          <template #body="{ data }">
            {{ formatNumber(data.perItem) }}
          </template>
        </Column>

        <Column header="Статистика" class="progress_cell">
          <template #body="{ data }">
            <div v-if="data.key !== 'total'">
              <ProgressBar
                v-tooltip="`${parseFloat(data.statistics).toFixed()}%`"
                :showValue="false"
                :value="Number(parseFloat(data.statistics).toFixed())"
                style="border-radius: 0; background-color: transparent; height: 40px"
              ></ProgressBar>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <div class="card final-statement">
      <div class="flex flex-row justify-between gap-2">
        <div class="font-semibold text-xl" :class="computedStyleClass">Итоговая ведомость</div>
      </div>

      <DataTable
        :value="finalPriceData"
        editMode="cell"
        @cell-edit-complete="onCellEditComplete"
        showGridlines
        :style="{ border: '2px solid green', 'margin-bottom': '2rem' }"
      >
        <template #empty> Нет данных для отображения </template>

        <Column field="name">
          <template #body="{ data }">
            <div :class="{ 'font-bold': data.key === 'total', 'text-lg': data.key === 'total' }">
              {{ data.name }}
            </div>
          </template>
        </Column>

        <Column field="total" header="Общая">
          <template #body="{ data }">
            <div :class="{ 'font-bold': data.key === 'total', 'text-lg': data.key === 'total' }">
              {{ formatNumber(truncateDecimal(Number(data.total), 1)) }}
            </div>
          </template>
        </Column>

        <Column field="perItem" header="На 1 единицу">
          <template #body="{ data }">
            <div :class="{ 'font-bold': data.key === 'total', 'text-lg': data.key === 'total' }">
              {{ formatNumber(truncateDecimal(Number(data.perItem), 1)) }}
            </div>
          </template>
        </Column>

        <Column header="Статистика" class="progress_cell">
          <template #body="{ data }">
            <div v-if="data.key !== 'total'">
              <ProgressBar
                v-tooltip="`${parseFloat(data.statistics).toFixed()}%`"
                :showValue="false"
                :value="Number(parseFloat(data.statistics).toFixed())"
                style="border-radius: 0; background-color: transparent; height: 40px"
              ></ProgressBar>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
