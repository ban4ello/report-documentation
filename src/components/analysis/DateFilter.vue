<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  },
  showAllYear: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'update:showAllYear', 'dateChange']);

const handleDateChange = (newDate) => {
  emit('update:modelValue', newDate);
  emit('dateChange', newDate);
};

const handleShowAllYearChange = (value) => {
  emit('update:showAllYear', value);
};

// Русская локализация для календаря
const ruLocale = {
  firstDayOfWeek: 1,
  dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  today: 'Сегодня',
  clear: 'Очистить',
  dateFormat: 'mm.yy',
  weekHeader: 'Неделя'
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
      style="width: 200px"
      :locale="ruLocale"
      @update:modelValue="handleDateChange"
    />

    <div class="flex gap-2 items-center">
      <Checkbox :modelValue="showAllYear" :value="showAllYear" :binary="true" @update:modelValue="handleShowAllYearChange" />
      <label class="font-semibold items-center text-md">За весь год</label>
    </div>
  </div>
</template>
