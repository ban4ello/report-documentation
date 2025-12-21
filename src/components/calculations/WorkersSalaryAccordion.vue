<script setup>
import { ref, computed } from 'vue';
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
  'change-coeficient'
]);

const newStaffDialog = ref(false);
const newStaffData = ref({ name: '', numberOfHoursWorked: null, salaryPerDay: null });

const localSelectedStaff = computed({
  get: () => props.selectedStaff,
  set: (value) => emit('update:selectedStaff', value)
});

const localIncreaseInSalary = computed({
  get: () => props.increaseInSalary,
  set: (value) => emit('update:increaseInSalary', value)
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
</script>

<template>
  <AccordionPanel value="0">
    <AccordionHeader>
      <div class="flex gap-6 items-center justify-between w-full">
        <div class="flex gap-6 items-center gap-2 w-full font-semibold text-lg">Цех</div>

        <div v-if="salariesOfWorkersTotal" class="flex justify-end items-center font-bold w-full mr-4 font-semibold text-lg">
          <span :class="computedStyleClass">Итого ЗП:</span> &nbsp;<span class="text-lg">{{
            formatNumber(salariesOfWorkersTotal)
          }}</span>
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
                  <Select id="staff" v-model="data.name" :options="dropdownItemsWorkerStaff" class="w-full"></Select>
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
                    formatNumber(
                      truncateDecimal((data.salaryPerDay / calculationData.numberOfHoursPerShift) * data.numberOfHoursWorked, 0)
                    )
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
                <div
                  class="flex justify-center items-center hover:cursor-pointer"
                  :class="computedStyleClass"
                  @click="showDialog"
                >
                  добавить сотрудника +
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
              <Textarea v-model="calculationData.workersData.notes" />
            </div>

            <Dialog v-model:visible="newStaffDialog" :style="{ width: '450px' }" header="Выберите сотрудника" :modal="true">
              <div class="flex flex-col gap-6">
                <div>
                  <label for="name" class="block font-bold mb-3">Имя</label>
                  <SearchSelect
                    :dropdownItemsWorkerStaff="dropdownItemsWorkerStaff"
                    :value="newStaffData.name || ''"
                    actionName="Добавить нового сотрудника"
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
