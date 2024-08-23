<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Налоговые начисления'
  },
  taxTotal: {
    type: Number,
    default: 0
  },
  taxData: {
    type: Array,
    default: () => []
  },
  computedTaxData: {
    type: Object,
    default: () => {}
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  formatNumber: {
    type: Function,
    default: () => {}
  }
});

const columns = [
  { field: 'name', header: 'Имя' },
  { field: 'coefficient', header: 'Коэффициент' },
  { field: 'subtotal', header: 'Сумма' }
];

const onCellEditComplete = (event) => {
  let { data, newValue, field } = event;

  data[field] = newValue;
};
</script>

<template>
  <div class="tax-charges">
    <div class="card h-full">
      <div class="flex flex-row items-center justify-between gap-2">
        <div class="font-semibold text-[--primary-color] text-xl">{{ props.title }}</div>
      </div>

      <div class="flex flex-row items-center justify-between gap-2">
        <div class="text-lg">Исходная сумма: {{ props.formatNumber(props.totalAmount) }}</div>
      </div>

      <DataTable :value="props.taxData" editMode="cell" @cell-edit-complete="onCellEditComplete">
        <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header">
          <template #body="{ data }">
            <div v-if="col.field === 'name'">
              {{ data[col.field] }}
            </div>
            <div v-else-if="col.field === 'coefficient'">
              <div v-if="typeof data.coefficient === 'object'">{{ data.coefficient.a }} | {{ data.coefficient.b }}</div>
              <div v-else-if="data.key === 'T'">
                <span class="text-[red]">
                  {{ data[col.field] }}
                </span>
              </div>
              <div v-else>
                {{ data[col.field] }}
              </div>
            </div>
            <div v-else-if="col.field === 'subtotal'">
              <div>
                {{ props.formatNumber(props.computedTaxData[data.key]) }}
              </div>
            </div>
          </template>

          <template v-if="col.field === 'coefficient'" #editor="{ data }">
            <div v-if="typeof data.coefficient === 'object'">
              <InputNumber v-model="data.coefficient.a" fluid />
              <InputNumber v-model="data.coefficient.b" fluid />
            </div>
            <div v-else>
              <InputNumber v-model="data.coefficient" fluid />
            </div>
          </template>
        </Column>

        <template #footer>
          <div class="flex justify-end items-center font-bold w-full">
            Итого: &nbsp;<span class="text-lg"> {{ props.formatNumber(props.taxTotal) }}</span>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>
