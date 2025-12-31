<script setup>
import { computed } from 'vue';

const props = defineProps({
  dropdownItemsWorkerStaff: Array,
  value: String,
  actionName: String,
  type: String,
  isShowOnlyType: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:isShowOnlyType', 'input', 'clickToAction']);

const localIsShowOnlyType = computed({
  get: () => props.isShowOnlyType,
  set: (value) => emit('update:isShowOnlyType', value)
});
</script>

<template>
  <Select
    id="staff"
    :value="props.value"
    :options="dropdownItemsWorkerStaff"
    filter
    class="w-full"
    @change="(event) => $emit('input', event.value)"
  >
    <template #value>
      <div class="flex items-center h-[25px]">
        <p>{{ props.value }}</p>
      </div>
    </template>

    <template #option="slotProps">
      <div class="flex items-center">
        <div>
          <span>{{ slotProps.option }}</span>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center pl-4 pr-4">
        <div class="flex gap-2 items-center mb-2">
          <Checkbox v-model="localIsShowOnlyType" :binary="true" />
          <label class="font-semibold items-center text-md">Показывать только {{ type === 'worker' ? 'рабочих' : 'ИТР' }}</label>
        </div>

        <div class="p-3 text-[--primary-color]">
          <Button :label="actionName" fluid text size="small" icon="pi pi-plus" @click="$emit('clickToAction')" />
        </div>
      </div>
    </template>
  </Select>
</template>
