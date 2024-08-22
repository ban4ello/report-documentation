<script setup>
const props = defineProps({
  dropdownItemsWorkerStaff: Array,
  value: String
  // headerTitle: String
});
</script>

<template>
  <Select id="staff" :value="props.value" :options="props.dropdownItemsWorkerStaff" filter class="w-full" @change="(event) => $emit('input', event.value)">
    <!-- TODO: расширить функционал возможностью "Добавлять нового сотрудника" -->
    <!-- <template #header>
      <div v-if="props.headerTitle" class="flex p-4">
        <span class="hover:text-[--primary-color] hover:cursor-pointer" @click="$emit('clickToHeader')">{{ props.title }}</span>
      </div>
    </template> -->

    <template #value>
      <div class="flex items-center h-[25px]">
        <p>{{ props.value }}</p>
      </div>
    </template>

    <template #option="slotProps">
      <div class="flex items-center">
        <div>{{ slotProps.option }}</div>
      </div>
    </template>
  </Select>
</template>
