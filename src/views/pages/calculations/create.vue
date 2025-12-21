<script setup>
import { onBeforeMount, ref, computed, watch } from 'vue';
import { MochDataService } from '@/service/MochDataService';
import SearchSelect from '@/components/custom-ui/SearchSelect.vue';
import TaxCharges from '@/components/TaxCharges.vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// Composables
import { useCalculation } from '@/composables/useCalculation';
import { useWorkers } from '@/composables/useWorkers';
import { useCalculations } from '@/composables/useCalculations';
import { useFileUpload } from '@/composables/useFileUpload';

// Components
import SpecificationTable from '@/components/calculations/SpecificationTable.vue';
import PriceSummary from '@/components/calculations/PriceSummary.vue';
import TotalCostsSection from '@/components/calculations/TotalCostsSection.vue';

const toast = useToast();
const router = useRouter();

// Composables initialization
const {
  calculationData,
  loading,
  currentCalculationType,
  calculationPlanTotal,
  initializeFromQuery,
  createCalculation: createCalculationApi
} = useCalculation();

const { dropdownItemsWorkerStaff, dropdownItemsWorkersRole, newWorkerData, addNewWorkerToDB, loadWorkers } = useWorkers();

const dropdownItemsUnitOfMeasurement = ref(['тн', 'кг', 'шт', 'м']);

const isAmountWithoutMetal = ref(false);
const expandAccordionTotalCosts = ref([]);
const expandAccordionSalary = ref([]);
const newStaffData = ref({ name: '', numberOfHoursWorked: null, salaryPerDay: null });
const newITRStaffData = ref({ name: '', salaryPerMonth: null });

const selectedStaff = ref(null);
const selectedITRStaff = ref(null);
const newStaffDialog = ref(false);
const newITRStaffDialog = ref(false);
const createNewWorkerDialog = ref(false);
const increaseInSalary = ref(0);

// Calculations composable
const {
  salariesOfWorkersTotal,
  salariesOfITRTotal,
  salariesOfITRTotalPerMonth,
  totalSpecificationItems,
  totalConsumables,
  totalHardware,
  totalMetal,
  computedWorkerTaxData,
  computedItrTaxData,
  taxTotal,
  taxITRTotal,
  finalTotalPrice,
  finalTotalPriceWithoutMetal,
  priceData,
  finalPriceData,
  formatNumber,
  truncateDecimal
} = useCalculations(calculationData);

// File upload composable
const { onUpload, removeFile } = useFileUpload(calculationData, expandAccordionTotalCosts);

// Setup route leave guard
// eslint-disable-next-line no-unused-vars
const { workersTaxData, itrTaxData, ...calculationDataClone } = calculationData.value;
const cloneCalculationDate = JSON.stringify(calculationDataClone);

onBeforeRouteLeave((to, from, next) => {
  // eslint-disable-next-line no-unused-vars
  const { workersTaxData: wt, itrTaxData: it, ...calculationDataClone2 } = calculationData.value;
  const cloneCalculationDate2 = JSON.stringify(calculationDataClone2);

  if (cloneCalculationDate !== cloneCalculationDate2) {
    const conf = confirm('желаете покинуть страницу?');
    if (conf) {
      next();
    }
  } else {
    next();
  }
});

// // NOTE: need for test
// let currentDate = new Date();
// const today = `${currentDate.getDate()}.${currentDate.getMonth()}.${currentDate.getFullYear()}`;
// const currentTime = currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds();

// let calculationData = ref({
//   title: 'Калькуляция-' + today,
//   dateOfCreation: today,
//   lastEditDate: today + ' ' + currentTime,
//   calculationType: 'plan',
//   galvanizedValue: 1000,
//   transportValue: 2000,
//   rentalCostPerDay: 170,
//   costOfElectricityPerDay: 550,
//   profitabilityCoeficient: 0.1,
//   numberOfHoursPerShift: 8,
//   coeficientOfNds: 1.2,
//   numberOfDaysPerShift: 21,
//   itrWorkedDays: 13,
//   specificationData: {
//     table: [
//       {
//         id: 1,
//         name: 'Изделие №1',
//         quantity: 1,
//         valuePerUnit: 2.0018,
//         unitOfMeasurement: 'тн',
//         totalWeight: null
//       }
//     ],
//     notes: 'specificationData notes'
//   },
//   workersData: {
//     table: [
//       {
//         id: 1,
//         name: 'Бабенко',
//         numberOfHoursWorked: 63,
//         salaryPerDay: 1690
//       },
//       {
//         id: 2,
//         name: 'Червань Антон',
//         numberOfHoursWorked: 79,
//         salaryPerDay: 1700
//       },
//       {
//         id: 3,
//         name: 'Червань Артем',
//         numberOfHoursWorked: 77,
//         salaryPerDay: 1680
//       }
//     ],
//     notes: 'workersData notes'
//   },
//   itrData: {
//     table: [
//       {
//         id: 1,
//         name: 'Кристина',
//         salaryPerMonth: 1000
//       },
//       {
//         id: 2,
//         name: 'Олька',
//         salaryPerMonth: 10000
//       },
//       {
//         id: 3,
//         name: 'Танюха',
//         salaryPerMonth: 0
//       },
//       {
//         id: 4,
//         name: 'Тёмка',
//         salaryPerMonth: 3000
//       },
//       {
//         id: 5,
//         name: 'Николаев',
//         salaryPerMonth: 15000
//       },
//       {
//         id: 6,
//         name: 'Шеф',
//         salaryPerMonth: 5000
//       }
//     ]
//   },
//   consumablesData: [
//     // {
//     //   order: 1,
//     //   name: 'Проволока сварочная 15 кг',
//     //   unitOfMeasurement: 'бухты',
//     //   quantity: 2,
//     //   taxPrice: '1 016,10',
//     //   price: '2 032,20'
//     // }
//   ],
//   hardwareData: [
//     // {
//     //   order: 17,
//     //   name: 'Болты М20*60',
//     //   unitOfMeasurement: 'шт',
//     //   quantity: 276,
//     //   taxPrice: '24,00',
//     //   price: '6 624,00'
//     // }
//   ],
//   metalData: [
//     // {
//     //   order: 1,
//     //   name: 'Лист металла',
//     //   unitOfMeasurement: 'тн',
//     //   quantity: 12,
//     //   taxPrice: '1124,00',
//     //   price: '8 624,00'
//     // }
//   ],
//   workersTaxData: [],
//   itrTaxData: [],
//   total: null
// });

onBeforeMount(async () => {
  await initializeFromQuery();
  await loadWorkers();

  MochDataService.getWorkersTaxData().then((data) => {
    calculationData.value.workersTaxData = data;
  });

  MochDataService.getItrTaxData().then((data) => {
    calculationData.value.itrTaxData = data;
  });
});

const displayTotalPrice = computed(() => {
  return isAmountWithoutMetal.value ? finalTotalPriceWithoutMetal.value : finalTotalPrice.value;
});

const onCellEditComplete = (event) => {
  let { data, newValue, field } = event;

  switch (data.name) {
    case 'Оцинковка':
      calculationData.value.galvanizedValue = Number(newValue);
      break;
    case 'Транспорт':
      calculationData.value.transportValue = Number(newValue);
      break;

    default:
      break;
  }

  data[field] = newValue;
};

const showDialog = async (key, flag = true) => {
  await loadWorkers();

  switch (key) {
    case 'newStaffDialog':
      newStaffDialog.value = flag;
      break;
    case 'newITRStaffDialog':
      newITRStaffDialog.value = flag;
      break;
    case 'createNewWorkerDialog':
      createNewWorkerDialog.value = flag;
      break;

    default:
      break;
  }
};

const copySpecification = (data) => {
  calculationData.value.specificationData.table.push({
    id: (Math.random() * 1000).toFixed(),
    name: data.name,
    quantity: data.quantity,
    valuePerUnit: data.valuePerUnit,
    unitOfMeasurement: data.unitOfMeasurement,
    totalWeight: data.totalWeight
  });
};

const addNewSpecification = () => {
  calculationData.value.specificationData.table.push({
    id: (Math.random() * 1000).toFixed(),
    name: null,
    quantity: null,
    valuePerUnit: null,
    unitOfMeasurement: null,
    totalWeight: null
  });
};

const confirmDeleteSpecification = (data) => {
  calculationData.value.specificationData.table = calculationData.value.specificationData.table.filter((item) => item.id !== data.id);
};

const saveNewStaff = () => {
  calculationData.value.workersData.table.push({
    id: (Math.random() * 1000).toFixed(),
    name: newStaffData.value.name,
    numberOfHoursWorked: newStaffData.value.numberOfHoursWorked,
    salaryPerDay: newStaffData.value.salaryPerDay,
    salaryPerHour: null,
    total: null
  });

  newStaffDialog.value = false;
  newStaffData.value = {
    name: '',
    numberOfHoursWorked: null,
    salaryPerDay: null
  };
};

const copyWorkerData = (data) => {
  calculationData.value.workersData.table.push({
    id: (Math.random() * 1000).toFixed(),
    name: data.name,
    numberOfHoursWorked: data.numberOfHoursWorked,
    salaryPerDay: data.salaryPerDay,
    salaryPerHour: null,
    total: null
  });
};

const confirmDeleteWorker = (item) => {
  if (item) {
    calculationData.value.workersData.table = calculationData.value.workersData.table.filter((worker) => worker.id !== item.id);
  } else {
    selectedStaff.value.forEach((item) => {
      calculationData.value.workersData.table = calculationData.value.workersData.table.filter((worker) => worker.id !== item.id);
    });
  }

  newStaffDialog.value = false;
  selectedStaff.value = null;

  newStaffData.value = {
    name: '',
    numberOfHoursWorked: null,
    salaryPerDay: null
  };
};

const saveNewITRStaff = () => {
  calculationData.value.itrData.table.push({
    id: (Math.random() * 1000).toFixed(),
    name: newITRStaffData.value.name,
    salaryPerMonth: newITRStaffData.value.salaryPerMonth
  });

  newITRStaffDialog.value = false;
  newITRStaffData.value = {
    name: '',
    salaryPerMonth: null
  };
};

const confirmDeleteItrWorker = (item) => {
  if (item) {
    calculationData.value.itrData.table = calculationData.value.itrData.table.filter((worker) => worker.id !== item.id);
  } else {
    selectedITRStaff.value.forEach((item) => {
      calculationData.value.itrData.table = calculationData.value.itrData.table.filter((worker) => worker.id !== item.id);
    });
  }

  newITRStaffDialog.value = false;
  selectedITRStaff.value = null;

  newITRStaffData.value = {
    name: '',
    salaryPerMonth: null
  };
};

const copyITRWorker = (data) => {
  calculationData.value.itrData.table.push({
    id: (Math.random() * 1000).toFixed(),
    name: data.name,
    salaryPerMonth: data.salaryPerMonth
  });
};

const changeSelectedItem = (event, type) => {
  if (type === 'workers') {
    newStaffData.value.name = event.value;
  } else {
    newITRStaffData.value.name = event.value;
  }
};

const showNewWorkerModal = () => {
  showDialog('createNewWorkerDialog');
};

const saveNewWorker = async (worker) => {
  try {
    await addNewWorkerToDB(worker);
    await loadWorkers();

    if (newStaffDialog.value) {
      newStaffData.value.name = newWorkerData.value.name;
    }

    if (newITRStaffDialog.value) {
      newITRStaffData.value.name = newWorkerData.value.name;
    }

    newWorkerData.value = { name: '', lastname: '', position: '' };
    showDialog('createNewWorkerDialog', false);
  } catch (error) {
    console.log(error);
  }
};

const createCalculation = async () => {
  const result = await createCalculationApi(displayTotalPrice.value, finalPriceData.value);

  if (result.success) {
    showSuccess();
    router.push({ path: `/calculations/${result.data.id}` });
  } else {
    showError();
  }
};

watch(increaseInSalary, (newValue, oldValue) => {
  let increment = newValue > oldValue ? 5 : -5;

  // если меняется "increaseInSalary" - то должно меняться значение "salaryPerDay"
  calculationData.value.workersData.table = calculationData.value.workersData.table.map((item) => {
    const newPrice = Number(item.salaryPerDay) + Number(increment);

    return { ...item, salaryPerDay: newPrice };
  });
});

const computedStyleClass = computed(() => {
  return {
    'text-[--secondary-color]': currentCalculationType.value === 'plan',
    'text-[--primary-color]': currentCalculationType.value === 'fact'
  };
});

const showSuccess = () => {
  toast.add({ severity: 'success', summary: 'Успешно', detail: 'Запрос отправден', life: 3000 });
};

const showError = () => {
  toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Запрос не отправлен', life: 3000 });
};
</script>

<template>
  <div v-if="loading" class="card flex justify-center items-center h-[100vh] fixed top-0 left-0 right-0 z-9999 opacity-60">
    <ProgressSpinner />
  </div>

  <Fluid>
    <div class="calculation-title z-50 sticky top-[60px] shadow-md bg-[#fff] mb-4">
      <Panel toggleable :header="`Калькуляция-${calculationData.calculationType === 'fact' ? 'факт' : 'план'}`">
        <div class="flex flex-row items-center justify-between gap-4">
          <div class="flex flex-row justify-between items-center gap-2">
            <div class="flex gap-2">
              <div class="flex flex-col gap-2">
                <div class="font-semibold text-lg" :class="computedStyleClass">
                  <span>Название калькуляции-{{ calculationData.calculationType === 'fact' ? 'факт' : 'план' }}:</span
                  ><span><InputText v-model="calculationData.title" type="text" /></span>
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
                    <Checkbox v-model="isAmountWithoutMetal" :value="isAmountWithoutMetal" :binary="true" />
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
                    <div class="text-[--primary-color] max-w-[200px]">Сумма калькуляции-плана:</div>
                    <span class="font-bold">
                      {{ formatNumber(truncateDecimal(calculationPlanTotal, 1)) }}
                    </span>
                  </div>

                  <Divider layout="horizontal" />

                  <div v-if="totalSpecificationItems" class="flex flex-row gap-2">
                    <div class="text-[--primary-color]">На 1 ед:</div>
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
              @click="createCalculation"
            />
          </div>
        </div>
      </Panel>
    </div>

    <div class="flex flex-col">
      <SpecificationTable
        :specification-data="calculationData.specificationData"
        :dropdown-items-unit-of-measurement="dropdownItemsUnitOfMeasurement"
        :computed-style-class="computedStyleClass"
        @add="addNewSpecification"
        @delete="confirmDeleteSpecification"
        @copy="copySpecification"
        @cell-edit-complete="onCellEditComplete"
      />

      <PriceSummary
        :price-data="priceData"
        :final-price-data="finalPriceData"
        :computed-style-class="computedStyleClass"
        @cell-edit-complete="onCellEditComplete"
      />

      <div class="card h-full flex flex-col gap-4">
        <div class="flex flex-row items-center justify-between gap-2">
          <div class="font-semibold text-xl" :class="computedStyleClass">Переменные</div>
        </div>

        <div class="flex flex-col gap-2 mb-4 max-w-[450px]">
          <div class="grid grid-cols-1fr-40 gap-2 items-center">
            <label for="rentalCostPerDay">Стоимость аренды в день:</label>
            <InputNumber v-model="calculationData.rentalCostPerDay" inputId="rentalCostPerDay" class="" fluid />
          </div>

          <div class="grid grid-cols-1fr-40 gap-2 items-center">
            <label for="costOfElectricityPerDay">Стоимость эл. эн. в день:</label>
            <InputNumber v-model="calculationData.costOfElectricityPerDay" inputId="costOfElectricityPerDay" class="" fluid />
          </div>

          <div class="grid grid-cols-1fr-40 gap-2 items-center">
            <label for="profitabilityCoeficient">Коэффициент рентабельности:</label>
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

      <div class="card">
        <div class="flex flex-row justify-between gap-2 mb-4">
          <div class="font-semibold text-xl" :class="computedStyleClass">Зарплата</div>
        </div>

        <Accordion multiple :value="expandAccordionSalary">
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

                        <InputNumber v-model="increaseInSalary" :step="5" showButtons buttonLayout="horizontal" style="width: 140px">
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
                      v-model:selection="selectedStaff"
                      editMode="cell"
                      @cell-edit-complete="onCellEditComplete"
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
                            @click="copyWorkerData(slotProps.data)"
                          />
                          <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteWorker(slotProps.data)" />
                        </template>
                      </Column>

                      <template #footer>
                        <div
                          class="flex justify-center items-center hover:cursor-pointer"
                          :class="computedStyleClass"
                          @click="showDialog('newStaffDialog')"
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
                            @change="(data) => changeSelectedItem(data, 'workers')"
                            @clickToAction="showNewWorkerModal"
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
                        <Button label="Отменить" icon="pi pi-times" text @click="newStaffDialog = false" />
                        <!-- :disabled="!newStaffData.name.trim() || newStaffData.numberOfHoursWorked === null || newStaffData.salaryPerDay === null" -->
                        <Button label="Сохранить" icon="pi pi-check" @click="saveNewStaff" />
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
                  @changeCoeficient="(data) => (calculationData.coeficientOfNds = data.value)"
                />
              </div>
            </AccordionContent>
          </AccordionPanel>

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
                        <InputNumber
                          v-model="calculationData.numberOfDaysPerShift"
                          inputId="numberOfDaysPerShift"
                          class="max-w-[50px]"
                          fluid
                        />
                      </div>

                      <div class="flex flex-row gap-2 items-center">
                        <label for="itrWorkedDays">Количество дней (трудозатраты)</label>
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
                      v-model:selection="selectedITRStaff"
                      editMode="cell"
                      @cell-edit-complete="onCellEditComplete"
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
                            @click="copyITRWorker(slotProps.data)"
                          />
                          <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteItrWorker(slotProps.data)" />
                        </template>
                      </Column>

                      <template #footer>
                        <div
                          class="flex justify-center items-center hover:cursor-pointer"
                          :class="computedStyleClass"
                          @click="showDialog('newITRStaffDialog')"
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
                            @change="(data) => changeSelectedItem(data, 'itr')"
                            @clickToAction="showNewWorkerModal"
                          />
                        </div>

                        <div>
                          <label for="salaryPerMonth" class="block font-bold mb-3">ЗП в месяц</label>
                          <InputNumber v-model="newITRStaffData.salaryPerMonth" inputId="minmax" fluid />
                        </div>
                      </div>

                      <template #footer>
                        <Button label="Отменить" icon="pi pi-times" text @click="newStaffDialog = false" />
                        <Button
                          :disabled="!newITRStaffData.name.trim() || newITRStaffData.salaryPerMonth === null"
                          label="Сохранить"
                          icon="pi pi-check"
                          @click="saveNewITRStaff"
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
                  @changeCoeficient="(data) => (calculationData.coeficientOfNds = data.value)"
                />
              </div>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>

      <TotalCostsSection
        :consumables-data="calculationData.consumablesData"
        :hardware-data="calculationData.hardwareData"
        :metal-data="calculationData.metalData"
        :total-consumables="totalConsumables"
        :total-hardware="totalHardware"
        :total-metal="totalMetal"
        :expand-accordion-total-costs="expandAccordionTotalCosts"
        :computed-style-class="computedStyleClass"
        @upload="onUpload"
        @remove-file="removeFile"
      />
    </div>

    <Dialog v-model:visible="createNewWorkerDialog" header="Новый сотрудник" :style="{ width: '450px' }" modal>
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-3">ФИО</label>
          <InputText v-model="newWorkerData.name" type="text" />
        </div>

        <div>
          <label for="numberOfHoursWorked" class="block font-bold mb-3">Должность</label>
          <Select id="role" v-model="newWorkerData.position" :options="dropdownItemsWorkersRole" class="w-full">
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
        <Button label="Отменить" icon="pi pi-times" text @click="createNewWorkerDialog = false" />
        <Button :disabled="!newWorkerData.name.trim()" label="Сохранить" icon="pi pi-check" @click="saveNewWorker(newWorkerData)" />
      </template>
    </Dialog>
    <Toast />
  </Fluid>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
  font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
  font-weight: bold;
}

.grid-cols-1fr-35 {
  grid-template-columns: 1fr 35%;
}

.grid-cols-1fr-40 {
  grid-template-columns: 1fr 38%;
}

.grid-cols-35-1fr {
  grid-template-columns: 35% 1fr;
}
</style>

<style lang="scss">
.progress_cell {
  padding: 3px 0 !important;
  height: 40px;

  &.p-datatable-header-cell {
    padding: var(--p-datatable-header-cell-padding) !important;
  }
}
</style>
