<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  showAllYear: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'update:showAllYear', 'dateChange']);

const handleDateChange = (newDate) => {
  emit('update:modelValue', newDate);
  emit('dateChange', newDate);
};

const handleShowAllYearChange = (value) => {
  emit('update:showAllYear', value);
};
</script>

<template>
  <div class="flex gap-4 items-center mb-4">
    <span>Выберите дату:</span>

    <DatePicker
      :modelValue="modelValue"
      dateFormat="mm.yy"
      placeholder="mm/yyyy"
      view="month"
      style="width: 200px;"
      @update:modelValue="handleDateChange"
    />

    <div class="flex gap-2 items-center">
      <Checkbox :modelValue="showAllYear" :value="showAllYear" :binary="true" @update:modelValue="handleShowAllYearChange" />
      <label class="font-semibold items-center text-md">За весь год</label>
    </div>
  </div>
</template>

