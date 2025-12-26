<script setup>
import { ref, computed } from 'vue';
import SearchSelect from '@/components/custom-ui/SearchSelect.vue';
import TaxCharges from '@/components/TaxCharges.vue';

const props = defineProps({
  calculationData: {
    type: Object,
    required: true
  },
  selectedITRStaff: {
    type: Array,
    default: null
  },
  dropdownItemsWorkerStaff: {
    type: Array,
    default: () => []
  },
  computedStyleClass: {
    type: Object,
    default: () => ({})
  },
  salariesOfITRTotal: {
    type: Number,
    default: 0
  },
  salariesOfITRTotalPerMonth: {
    type: Number,
    default: 0
  },
  taxITRTotal: {
    type: Number,
    default: 0
  },
  computedItrTaxData: {
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
  'update:selectedITRStaff',
  'cell-edit-complete',
  'copy-itr-worker',
  'delete-itr-worker',
  'save-new-itr-staff',
  'change-selected-item',
  'show-new-worker-modal',
  'change-coeficient'
]);

const newITRStaffDialog = ref(false);
const newITRStaffData = ref({ name: '', salaryPerMonth: null });

const localSelectedITRStaff = computed({
  get: () => props.selectedITRStaff,
  set: (value) => emit('update:selectedITRStaff', value)
});

const showDialog = () => {
  newITRStaffDialog.value = true;
};

const closeDialog = () => {
  newITRStaffDialog.value = false;
  newITRStaffData.value = {
    name: '',
    salaryPerMonth: null
  };
};

const handleSaveNewITRStaff = () => {
  emit('save-new-itr-staff', newITRStaffData.value);
  closeDialog();
};

const handleChangeSelectedItem = (data) => {
  newITRStaffData.value.name = data.value || data;
  emit('change-selected-item', data, 'itr');
};
</script>

<template>
  <AccordionPanel value="1">
    <AccordionHeader>
      <div class="flex gap-6 items-center justify-between w-full">
        <div class="flex gap-6 items-center gap-2 w-full font-semibold text-lg">ИТР</div>

        <div v-if="salariesOfITRTotal" class="flex justify-end items-center font-bold w-full mr-4 font-semibold text-lg">
          <span :class="computedStyleClass">Итого ЗП:</span> &nbsp;<span class="text-lg">{{
            formatNumber(salariesOfITRTotal)
          }}</span>
        </div>

        <div v-if="taxITRTotal" class="flex justify-end items-center font-bold w-full mr-4 font-semibold text-lg">
          <span :class="computedStyleClass">Итого налоговые начисления:</span> &nbsp;<span class="text-lg">{{
            formatNumber(taxITRTotal)
          }}</span>
        </div>
      </div>
    </AccordionHeader>

    <AccordionContent>
      <div class="grid grid-cols-1fr-40 gap-4 mb-[2rem]">
        <div class="ITR">
          <div class="card h-full">
            <div class="flex gap-2 mb-4 items-center">
                      <div class="flex flex-row gap-2 items-center">
                        <label for="numberOfDaysPerShift">Количество дней в мес.</label>
                        <!-- eslint-disable-next-line vue/no-mutating-props -->
                        <InputNumber
                          v-model="calculationData.numberOfDaysPerShift"
                          inputId="numberOfDaysPerShift"
                          class="max-w-[50px]"
                          fluid
                        />
                      </div>

                      <div class="flex flex-row gap-2 items-center">
                        <label for="itrWorkedDays">Количество дней (трудозатраты)</label>
                        <!-- eslint-disable-next-line vue/no-mutating-props -->
                        <InputNumber
                          v-model="calculationData.itrWorkedDays"
                          inputId="itrWorkedDays"
                          class="max-w-[50px]"
                          fluid
                          :minFractionDigits="1"
                          :maxFractionDigits="5"
                        />
                      </div>
            </div>

            <DataTable
              :value="calculationData.itrData.table"
              v-model:selection="localSelectedITRStaff"
              editMode="cell"
              @cell-edit-complete="$emit('cell-edit-complete', $event)"
              showGridlines
            >
              <template #empty> Нет данных для отображения </template>

              <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

              <Column field="name" header="Имя сотрудника" style="width: 25%">
                <template #body="{ data }">
                  {{ data.name }}
                </template>

                <template #editor="{ data }">
                  <Select id="staff" v-model="data.name" :options="dropdownItemsWorkerStaff" class="w-full"></Select>
                </template>
              </Column>

              <Column field="salaryPerMonth" header="ЗП в месяц" style="width: 25%">
                <template #body="{ data }">
                  {{ formatNumber(data.salaryPerMonth) }}
                </template>

                <template #editor="{ data }">
                  <InputNumber v-model="data.salaryPerMonth" inputId="minmax" fluid />
                </template>
              </Column>

              <Column field="salaryPerDay" header="ЗП по факту" style="width: 25%">
                <template #body="{ data }">
                  {{
                    formatNumber(
                      truncateDecimal(
                        (data.salaryPerMonth / calculationData.numberOfDaysPerShift) * calculationData.itrWorkedDays,
                        0
                      )
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
                    @click="$emit('copy-itr-worker', slotProps.data)"
                  />
                  <Button icon="pi pi-trash" outlined rounded severity="danger" @click="$emit('delete-itr-worker', slotProps.data)" />
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
                    Итого ЗП за полный месяц работы: &nbsp;<span class="font-bold text-lg">
                      {{ formatNumber(salariesOfITRTotalPerMonth) }}</span
                    >
                  </div>

                  <div class="flex items-center">
                    Итого ЗП по факту: &nbsp;<span class="font-bold text-lg"> {{ formatNumber(salariesOfITRTotal) }}</span>
                  </div>
                </div>
              </template>
            </DataTable>

            <Dialog v-model:visible="newITRStaffDialog" :style="{ width: '450px' }" header="Выберите сотрудника" :modal="true">
              <div class="flex flex-col gap-6">
                <div>
                  <label for="name" class="block font-bold mb-3">Имя</label>

                  <SearchSelect
                    :dropdownItemsWorkerStaff="dropdownItemsWorkerStaff"
                    :value="newITRStaffData.name || ''"
                    actionName="Добавить нового сотрудника"
                    @input="(value) => handleChangeSelectedItem({ value })"
                    @clickToAction="$emit('show-new-worker-modal')"
                  />
                </div>

                <div>
                  <label for="salaryPerMonth" class="block font-bold mb-3">ЗП в месяц</label>
                  <InputNumber v-model="newITRStaffData.salaryPerMonth" inputId="minmax" fluid />
                </div>
              </div>

              <template #footer>
                <Button label="Отменить" icon="pi pi-times" text @click="closeDialog" />
                <Button
                  :disabled="!newITRStaffData.name.trim() || newITRStaffData.salaryPerMonth === null"
                  label="Сохранить"
                  icon="pi pi-check"
                  @click="handleSaveNewITRStaff"
                />
              </template>
            </Dialog>
          </div>
        </div>

        <TaxCharges
          :computedTaxData="computedItrTaxData"
          :taxData="calculationData.itrTaxData"
          :totalAmount="salariesOfITRTotal"
          :taxTotal="taxITRTotal"
          :formatNumber="formatNumber"
          :coeficientOfNds="calculationData.coeficientOfNds"
          @changeCoeficient="(data) => $emit('change-coeficient', data)"
        />
      </div>
    </AccordionContent>
  </AccordionPanel>
</template>
