<script setup>
const props = defineProps({
  calculationData: {
    type: Object,
    required: true
  },
  computedStyleClass: {
    type: Object,
    default: () => ({})
  }
});

</script>

<template>
  <div class="card h-full flex flex-col gap-4">
    <div class="flex flex-row items-center justify-between gap-2">
      <div class="font-semibold text-xl" :class="computedStyleClass">Переменные</div>
    </div>

    <div class="flex flex-col gap-2 mb-4 max-w-[450px]">
      <div class="grid grid-cols-1fr-40 gap-2 items-center">
        <label for="rentalCostPerDay">Стоимость аренды в день:</label>
        <!-- eslint-disable-next-line vue/no-mutating-props -->
        <InputNumber v-model="calculationData.rentalCostPerDay" inputId="rentalCostPerDay" class="" fluid />
      </div>

      <div class="grid grid-cols-1fr-40 gap-2 items-center">
        <label for="costOfElectricityPerDay">Стоимость эл. эн. в день:</label>
        <!-- eslint-disable-next-line vue/no-mutating-props -->
        <InputNumber v-model="calculationData.costOfElectricityPerDay" inputId="costOfElectricityPerDay" class="" fluid />
      </div>

      <div class="grid grid-cols-1fr-40 gap-2 items-center">
        <label for="profitabilityCoeficient">Коэффициент рентабельности:</label>
        <!-- eslint-disable-next-line vue/no-mutating-props -->
        <InputNumber
          v-model="calculationData.profitabilityCoeficient"
          inputId="profitabilityCoeficient"
          class=""
          :minFractionDigits="1"
          :maxFractionDigits="5"
          fluid
        />
      </div>
    </div>
  </div>
</template>
