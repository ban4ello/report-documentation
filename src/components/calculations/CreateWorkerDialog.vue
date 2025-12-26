<script setup>
import { computed } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  newWorkerData: {
    type: Object,
    required: true
  },
  dropdownItemsWorkersRole: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:visible', 'update:newWorkerData', 'save']);

const localVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const localNewWorkerData = computed({
  get: () => props.newWorkerData,
  set: (value) => emit('update:newWorkerData', value)
});
</script>

<template>
  <Dialog v-model:visible="localVisible" header="Новый сотрудник" :style="{ width: '450px' }" modal>
    <div class="flex flex-col gap-6">
      <div>
        <label for="name" class="block font-bold mb-3">ФИО</label>
        <InputText v-model="localNewWorkerData.name" type="text" />
      </div>

      <div>
        <label for="numberOfHoursWorked" class="block font-bold mb-3">Должность</label>
        <Select id="role" v-model="localNewWorkerData.position" :options="dropdownItemsWorkersRole" class="w-full">
          <template #value="slotProps">
            <div class="flex items-center h-[25px]">
              <div>{{ slotProps.value.label }}</div>
            </div>
          </template>
          <template #option="slotProps">
            <div class="flex items-center">
              <div>{{ slotProps.option.label }}</div>
            </div>
          </template>
        </Select>
      </div>
    </div>

    <template #footer>
      <Button label="Отменить" icon="pi pi-times" text @click="localVisible = false" />
      <Button :disabled="!localNewWorkerData.name.trim()" label="Сохранить" icon="pi pi-check" @click="$emit('save', localNewWorkerData)" />
    </template>
  </Dialog>
</template>
