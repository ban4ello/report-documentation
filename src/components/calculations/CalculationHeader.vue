<script setup>
import { computed } from 'vue';

const props = defineProps({
  calculationData: {
    type: Object,
    required: true
  },
  displayTotalPrice: {
    type: Number,
    default: 0
  },
  calculationPlanTotal: {
    type: Number,
    default: 0
  },
  totalSpecificationItems: {
    type: Number,
    default: 0
  },
  isAmountWithoutMetal: {
    type: Boolean,
    default: false
  },
  computedStyleClass: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  },
  formatNumber: {
    type: Function,
    required: true
  },
  truncateDecimal: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['update:isAmountWithoutMetal', 'create-calculation']);

const localIsAmountWithoutMetal = computed({
  get: () => props.isAmountWithoutMetal,
  set: (value) => emit('update:isAmountWithoutMetal', value)
});
</script>

<template>
  <div class="calculation-title z-50 sticky top-[60px] shadow-md bg-[#fff] mb-4">
    <Panel toggleable :header="`Калькуляция-${calculationData.calculationType === 'fact' ? 'факт' : 'план'}`">
      <div class="flex flex-row items-center justify-between gap-4">
        <div class="flex flex-row justify-between items-center gap-2">
          <div class="flex gap-2">
            <div class="flex flex-col gap-2">
              <div class="font-semibold text-lg" :class="computedStyleClass">
                <span>Название калькуляции-{{ calculationData.calculationType === 'fact' ? 'факт' : 'план' }}:</span
                ><span>
                  <!-- eslint-disable-next-line vue/no-mutating-props -->
                  <InputText v-model="calculationData.title" type="text" />
                </span>
              </div>

              <div v-if="calculationData.dateOfCreation" class="font-semibold text-lg">
                <span :class="computedStyleClass">Дата создания: </span>
                <span> {{ new Date(calculationData.dateOfCreation).toLocaleDateString() }}</span>
              </div>
            </div>

            <Divider layout="vertical" />
          </div>

          <div class="flex gap-2">
            <div v-if="displayTotalPrice" class="font-semibold text-md flex items-center">
              <div class="flex flex-col">
                <div
                  class="flex flex-row gap-2 items-center"
                  :style="{
                    border: displayTotalPrice > calculationPlanTotal && calculationData.calculationType === 'fact' ? '1px solid red' : '',
                    'border-radius': '5px',
                    padding: '5px'
                  }"
                >
                  <div :class="computedStyleClass" class="max-w-[200px]">Итоговая сумма калькуляции:</div>
                  <span
                    class="font-bold"
                    :class="{
                      'text-[red]': displayTotalPrice > calculationPlanTotal && calculationData.calculationType === 'fact',
                      'text-xl': displayTotalPrice > calculationPlanTotal && calculationData.calculationType === 'fact'
                    }"
                  >
                    {{ formatNumber(truncateDecimal(displayTotalPrice, 1)) }}
                  </span>
                </div>

                <Divider layout="horizontal" />

                <div v-if="totalSpecificationItems" class="flex flex-row gap-2">
                  <div :class="computedStyleClass">На 1 ед:</div>
                  <span class="font-bold">
                    {{ formatNumber(truncateDecimal(displayTotalPrice / totalSpecificationItems, 1)) }}
                  </span>
                </div>

                <Divider layout="horizontal" />

                <div class="flex gap-2 items-center">
                  <Checkbox v-model="localIsAmountWithoutMetal" :binary="true" />
                  <label :class="computedStyleClass" class="font-semibold items-center text-md">Сумма без металла</label>
                </div>
              </div>
            </div>

            <Divider layout="vertical" />
          </div>

          <div v-if="calculationData.calculationType === 'fact'" class="flex gap-2">
            <div v-if="displayTotalPrice" class="font-semibold text-md flex items-center">
              <div class="flex flex-col">
                <div class="flex flex-row gap-2 items-center">
                  <div class="max-w-[200px]" style="color: var(--primary-color)">Сумма калькуляции-плана:</div>
                  <span class="font-bold">
                    {{ formatNumber(truncateDecimal(calculationPlanTotal, 1)) }}
                  </span>
                </div>

                <Divider layout="horizontal" />

                <div v-if="totalSpecificationItems" class="flex flex-row gap-2">
                  <div style="color: var(--primary-color)">На 1 ед:</div>
                  <span class="font-bold">
                    {{ formatNumber(truncateDecimal(calculationPlanTotal / totalSpecificationItems, 1)) }}
                  </span>
                </div>
              </div>
            </div>

            <Divider layout="vertical" />
          </div>

          <div class="font-semibold text-lg">
            <p :class="computedStyleClass">Общее кол-во:</p>
            <p>
              {{ truncateDecimal(totalSpecificationItems, 5) }}
              <span v-if="calculationData.specificationData?.table.length">
                {{ calculationData.specificationData.table[0].unitOfMeasurement }}
              </span>
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <Button
            label="Сохранить калькуляцию"
            :loading="loading"
            size="large"
            severity="success"
            class="text-xs"
            @click="$emit('create-calculation')"
          />
        </div>
      </div>
    </Panel>
  </div>
</template>
