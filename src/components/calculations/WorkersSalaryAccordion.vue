<script setup>
import { ref, computed } from 'vue';
import ApiService from '@/service/ApiService';
import SearchSelect from '@/components/custom-ui/SearchSelect.vue';
import TaxCharges from '@/components/TaxCharges.vue';

const props = defineProps({
  calculationData: {
    type: Object,
    required: true
  },
  selectedStaff: {
    type: Array,
    default: null
  },
  increaseInSalary: {
    type: Number,
    default: 0
  },
  dropdownItemsWorkerStaff: {
    type: Array,
    default: () => []
  },
  computedStyleClass: {
    type: Object,
    default: () => ({})
  },
  salariesOfWorkersTotal: {
    type: Number,
    default: 0
  },
  taxTotal: {
    type: Number,
    default: 0
  },
  computedWorkerTaxData: {
    type: Object,
    default: () => ({})
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

const emit = defineEmits([
  'update:selectedStaff',
  'update:increaseInSalary',
  'cell-edit-complete',
  'copy-worker',
  'delete-worker',
  'save-new-staff',
  'change-selected-item',
  'show-new-worker-modal',
  'change-coeficient',
  'apply-template'
]);

const newStaffDialog = ref(false);
const newStaffData = ref({ name: '', numberOfHoursWorked: null, salaryPerDay: null });
const isShowOnlyType = ref(true);
const templateDialogVisible = ref(false);
const templatesLoading = ref(false);
const workerTemplates = ref([]);
const selectedTemplateId = ref(null);

const selectedTemplate = computed(() => workerTemplates.value.find((item) => item.id === selectedTemplateId.value) || null);

const localSelectedStaff = computed({
  get: () => props.selectedStaff,
  set: (value) => emit('update:selectedStaff', value)
});

const localIncreaseInSalary = computed({
  get: () => props.increaseInSalary,
  set: (value) => emit('update:increaseInSalary', value)
});

// Фильтрованный список имен рабочих
const filteredWorkerNames = computed(() => {
  if (!Array.isArray(props.dropdownItemsWorkerStaff) || props.dropdownItemsWorkerStaff.length === 0) {
    return [];
  }

  // Проверяем, является ли первый элемент строкой (старый формат) или объектом (новый формат)
  const isObjectFormat = typeof props.dropdownItemsWorkerStaff[0] === 'object' && props.dropdownItemsWorkerStaff[0] !== null;

  if (isObjectFormat) {
    // Новый формат: массив объектов с полем position
    if (isShowOnlyType.value) {
      // Показываем только рабочих (position === 'worker')
      return props.dropdownItemsWorkerStaff.filter((worker) => worker.position === 'worker').map((worker) => worker.name);
    } else {
      // Показываем всех
      return props.dropdownItemsWorkerStaff.map((worker) => worker.name);
    }
  } else {
    // Старый формат: массив строк (для обратной совместимости)
    return props.dropdownItemsWorkerStaff;
  }
});

const showDialog = () => {
  newStaffDialog.value = true;
};

const closeDialog = () => {
  newStaffDialog.value = false;
  newStaffData.value = {
    name: '',
    numberOfHoursWorked: null,
    salaryPerDay: null
  };
};

const handleSaveNewStaff = () => {
  emit('save-new-staff', newStaffData.value);
  closeDialog();
};

const handleChangeSelectedItem = (data) => {
  newStaffData.value.name = data.value || data;
  emit('change-selected-item', data, 'workers');
};

const openTemplateDialog = async () => {
  selectedTemplateId.value = null;
  templateDialogVisible.value = true;
  templatesLoading.value = true;

  try {
    const response = await ApiService.getTemplates();
    workerTemplates.value = (response.data || []).filter((item) => item.templateType === 'workers');
  } catch (error) {
    console.error('Ошибка при загрузке шаблонов ЦЕХ:', error);
    workerTemplates.value = [];
  } finally {
    templatesLoading.value = false;
  }
};

const closeTemplateDialog = () => {
  templateDialogVisible.value = false;
  selectedTemplateId.value = null;
};

const applySelectedTemplate = () => {
  if (!selectedTemplate.value) return;

  const rows = (selectedTemplate.value.workersData || []).map((row) => ({
    id: Number((Math.random() * 10000).toFixed(0)),
    name: row.name || '',
    numberOfHoursWorked: row.numberOfHoursWorked ?? null,
    salaryPerDay: row.salaryPerDay ?? null,
    salaryPerHour: row.salaryPerHour ?? null,
    total: row.total ?? null
  }));

  emit('apply-template', rows);
  closeTemplateDialog();
};
</script>

<template>
  <AccordionPanel value="0">
    <AccordionHeader>
      <div class="flex gap-6 items-center justify-between w-full">
        <div class="flex gap-6 items-center gap-2 w-full font-semibold text-lg">Цех</div>

        <div v-if="salariesOfWorkersTotal" class="flex justify-end items-center font-bold w-full mr-4 font-semibold text-lg">
          <span :class="computedStyleClass">Итого ЗП:</span> &nbsp;<span class="text-lg">{{ formatNumber(salariesOfWorkersTotal) }}</span>
        </div>

        <div v-if="taxTotal" class="flex justify-end items-center font-bold w-full mr-4 font-semibold text-lg">
          <span :class="computedStyleClass">Итого налоговые начисления:</span> &nbsp;<span class="text-lg">{{
            formatNumber(taxTotal)
          }}</span>
        </div>
      </div>
    </AccordionHeader>

    <AccordionContent>
      <div class="grid grid-cols-1fr-40 gap-4 mb-[2rem]">
        <div class="shop">
          <div class="card h-full">
            <div class="flex justify-between">
              <div class="flex flex-row gap-2 max-w-[250px] mb-4">
                <label for="numberOfHoursPerShift">Количество часов в смене</label>
                <!-- eslint-disable-next-line vue/no-mutating-props -->
                <InputNumber v-model="calculationData.numberOfHoursPerShift" inputId="numberOfHoursPerShift" fluid />
              </div>

              <div class="flex flex-row gap-2 items-center">
                <label for="increaseInSalary">Увеличения ЗП</label>

                <InputNumber v-model="localIncreaseInSalary" :step="5" showButtons buttonLayout="horizontal" style="width: 140px">
                  <template #incrementbuttonicon>
                    <span class="pi pi-plus" />
                  </template>
                  <template #decrementbuttonicon>
                    <span class="pi pi-minus" />
                  </template>
                </InputNumber>
              </div>
            </div>

            <DataTable
              :value="calculationData.workersData.table"
              v-model:selection="localSelectedStaff"
              editMode="cell"
              @cell-edit-complete="$emit('cell-edit-complete', $event)"
              showGridlines
            >
              <template #empty> Нет данных для отображения </template>

              <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

              <Column field="name" header="Имя сотрудника">
                <template #body="{ data }">
                  {{ data.name }}
                </template>

                <template #editor="{ data }">
                  <Select id="staff" v-model="data.name" :options="filteredWorkerNames" class="w-full"></Select>
                </template>
              </Column>

              <Column field="numberOfHoursWorked" header="Трудозатраты">
                <template #body="{ data }">
                  {{ data.numberOfHoursWorked }}
                </template>

                <template #editor="{ data }">
                  <InputText v-model="data.numberOfHoursWorked" type="number" />
                </template>
              </Column>

              <Column field="salaryPerDay" header="В день">
                <template #body="{ data }">
                  {{ formatNumber(truncateDecimal(data.salaryPerDay, 0)) }}
                </template>

                <template #editor="{ data }">
                  <InputText v-model="data.salaryPerDay" type="number" />
                </template>
              </Column>

              <Column field="salaryPerHour" header="В час">
                <template #body="{ data }">
                  {{ formatNumber(truncateDecimal(data.salaryPerDay / calculationData.numberOfHoursPerShift, 2)) }}
                </template>
              </Column>

              <Column field="total" header="Итого">
                <template #body="{ data }">
                  {{
                    formatNumber(truncateDecimal((data.salaryPerDay / calculationData.numberOfHoursPerShift) * data.numberOfHoursWorked, 0))
                  }}
                </template>
              </Column>

              <Column :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                  <Button
                    icon="pi pi-copy"
                    class="mr-2"
                    outlined
                    rounded
                    severity="success"
                    @click="$emit('copy-worker', slotProps.data)"
                  />
                  <Button icon="pi pi-trash" outlined rounded severity="danger" @click="$emit('delete-worker', slotProps.data)" />
                </template>
              </Column>

              <template #footer>
                <div class="flex justify-start items-center gap-3">
                  <Button
                    label="Добавить сотрудника"
                    icon="pi pi-user-plus"
                    severity="success"
                    outlined
                    size="small"
                    class="salary-footer-btn"
                    @click="showDialog"
                  />
                  <Button
                    label="Заполнить из шаблона"
                    icon="pi pi-copy"
                    severity="success"
                    outlined
                    size="small"
                    class="salary-footer-btn"
                    @click="openTemplateDialog"
                  />
                </div>

                <div class="flex justify-end gap-4 w-full">
                  <div class="flex items-center">
                    Итого: &nbsp;<span class="font-bold text-lg"> {{ formatNumber(salariesOfWorkersTotal) }}</span>
                  </div>
                </div>
              </template>
            </DataTable>

            <div>
              <label for="workersData" :class="computedStyleClass">Заметки:</label>
              <!-- eslint-disable-next-line vue/no-mutating-props -->
              <Textarea v-model="calculationData.workersData.notes" />
            </div>

            <Dialog v-model:visible="newStaffDialog" :style="{ width: '550px' }" header="Выберите сотрудника" :modal="true">
              <div class="flex flex-col gap-6">
                <div>
                  <label for="name" class="block font-bold mb-3">Имя</label>
                  <SearchSelect
                    :dropdownItemsWorkerStaff="filteredWorkerNames"
                    :value="newStaffData.name || ''"
                    actionName="Добавить нового сотрудника"
                    type="worker"
                    v-model:isShowOnlyType="isShowOnlyType"
                    @input="(value) => handleChangeSelectedItem({ value })"
                    @clickToAction="$emit('show-new-worker-modal')"
                  />
                </div>

                <div>
                  <label for="numberOfHoursWorked" class="block font-bold mb-3">Трудозатраты</label>
                  <InputNumber v-model="newStaffData.numberOfHoursWorked" inputId="minmax" fluid />
                </div>

                <div>
                  <label for="salaryPerDay" class="block font-bold mb-3">В день</label>
                  <InputNumber v-model="newStaffData.salaryPerDay" inputId="minmax" fluid />
                </div>
              </div>

              <template #footer>
                <Button label="Отменить" icon="pi pi-times" text @click="closeDialog" />
                <Button label="Сохранить" icon="pi pi-check" @click="handleSaveNewStaff" />
              </template>
            </Dialog>

            <Dialog
              v-model:visible="templateDialogVisible"
              :style="{ width: '480px' }"
              header="Заполнить из шаблона ЦЕХ"
              :modal="true"
            >
              <div class="flex flex-col gap-4">
                <p class="m-0 text-surface-600">Текущая таблица зарплат Цех будет заменена строками из выбранного шаблона.</p>

                <div v-if="templatesLoading" class="flex justify-center py-4">
                  <ProgressSpinner style="width: 40px; height: 40px" />
                </div>

                <div v-else-if="workerTemplates.length === 0" class="text-surface-500">
                  Нет шаблонов типа ЦЕХ. Создайте их в разделе «Настройки».
                </div>

                <div v-else>
                  <label for="workers-template" class="block font-bold mb-3">Шаблон</label>
                  <Select
                    id="workers-template"
                    v-model="selectedTemplateId"
                    :options="workerTemplates"
                    optionLabel="title"
                    optionValue="id"
                    placeholder="Выберите шаблон"
                    class="w-full"
                  />
                </div>
              </div>

              <template #footer>
                <Button label="Отменить" icon="pi pi-times" text @click="closeTemplateDialog" />
                <Button
                  label="Применить"
                  icon="pi pi-check"
                  :disabled="!selectedTemplateId || templatesLoading"
                  @click="applySelectedTemplate"
                />
              </template>
            </Dialog>
          </div>
        </div>

        <TaxCharges
          :computedTaxData="computedWorkerTaxData"
          :taxData="calculationData.workersTaxData"
          :totalAmount="salariesOfWorkersTotal"
          :taxTotal="taxTotal"
          :formatNumber="formatNumber"
          :coeficientOfNds="calculationData.coeficientOfNds"
          @changeCoeficient="(data) => $emit('change-coeficient', data)"
        />
      </div>
    </AccordionContent>
  </AccordionPanel>
</template>

<style scoped>
.salary-footer-btn {
  width: auto !important;
  flex: 0 0 auto;
}
</style>
