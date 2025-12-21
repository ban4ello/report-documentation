<script setup>
import { onBeforeMount, ref, computed, watch } from 'vue';
import { MochDataService } from '@/service/MochDataService';
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
import CalculationHeader from '@/components/calculations/CalculationHeader.vue';
import VariablesSection from '@/components/calculations/VariablesSection.vue';
import WorkersSalaryAccordion from '@/components/calculations/WorkersSalaryAccordion.vue';
import ITRSalaryAccordion from '@/components/calculations/ITRSalaryAccordion.vue';
import CreateWorkerDialog from '@/components/calculations/CreateWorkerDialog.vue';

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

const selectedStaff = ref(null);
const selectedITRStaff = ref(null);
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

const showNewWorkerModal = async () => {
  await loadWorkers();
  createNewWorkerDialog.value = true;
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

const saveNewStaff = (staffData) => {
  calculationData.value.workersData.table.push({
    id: (Math.random() * 1000).toFixed(),
    name: staffData.name,
    numberOfHoursWorked: staffData.numberOfHoursWorked,
    salaryPerDay: staffData.salaryPerDay,
    salaryPerHour: null,
    total: null
  });
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

  selectedStaff.value = null;
};

const saveNewITRStaff = (itrStaffData) => {
  calculationData.value.itrData.table.push({
    id: (Math.random() * 1000).toFixed(),
    name: itrStaffData.name,
    salaryPerMonth: itrStaffData.salaryPerMonth
  });
};

const confirmDeleteItrWorker = (item) => {
  if (item) {
    calculationData.value.itrData.table = calculationData.value.itrData.table.filter((worker) => worker.id !== item.id);
  } else {
    selectedITRStaff.value.forEach((item) => {
      calculationData.value.itrData.table = calculationData.value.itrData.table.filter((worker) => worker.id !== item.id);
    });
  }

  selectedITRStaff.value = null;
};

const copyITRWorker = (data) => {
  calculationData.value.itrData.table.push({
    id: (Math.random() * 1000).toFixed(),
    name: data.name,
    salaryPerMonth: data.salaryPerMonth
  });
};

const changeSelectedItem = () => {
  // This function is called from child components, but the actual update
  // is handled within the components themselves
};

const saveNewWorker = async (worker) => {
  try {
    await addNewWorkerToDB(worker);
    await loadWorkers();
    newWorkerData.value = { name: '', lastname: '', position: '' };
    createNewWorkerDialog.value = false;
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
    <CalculationHeader
      :calculation-data="calculationData"
      :display-total-price="displayTotalPrice"
      :calculation-plan-total="calculationPlanTotal"
      :total-specification-items="totalSpecificationItems"
      v-model:is-amount-without-metal="isAmountWithoutMetal"
      :computed-style-class="computedStyleClass"
      :loading="loading"
      :format-number="formatNumber"
      :truncate-decimal="truncateDecimal"
      @create-calculation="createCalculation"
    />

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

      <VariablesSection :calculation-data="calculationData" :computed-style-class="computedStyleClass" />

      <div class="card">
        <div class="flex flex-row justify-between gap-2 mb-4">
          <div class="font-semibold text-xl" :class="computedStyleClass">Зарплата</div>
        </div>

        <Accordion multiple :value="expandAccordionSalary">
          <WorkersSalaryAccordion
            :calculation-data="calculationData"
            v-model:selected-staff="selectedStaff"
            v-model:increase-in-salary="increaseInSalary"
            :dropdown-items-worker-staff="dropdownItemsWorkerStaff"
            :computed-style-class="computedStyleClass"
            :salaries-of-workers-total="salariesOfWorkersTotal"
            :tax-total="taxTotal"
            :computed-worker-tax-data="computedWorkerTaxData"
            :format-number="formatNumber"
            :truncate-decimal="truncateDecimal"
            @cell-edit-complete="onCellEditComplete"
            @copy-worker="copyWorkerData"
            @delete-worker="confirmDeleteWorker"
            @save-new-staff="saveNewStaff"
            @change-selected-item="changeSelectedItem"
            @show-new-worker-modal="showNewWorkerModal"
            @change-coeficient="(data) => (calculationData.coeficientOfNds = data.value)"
          />

          <ITRSalaryAccordion
            :calculation-data="calculationData"
            v-model:selected-i-t-r-staff="selectedITRStaff"
            :dropdown-items-worker-staff="dropdownItemsWorkerStaff"
            :computed-style-class="computedStyleClass"
            :salaries-of-i-t-r-total="salariesOfITRTotal"
            :salaries-of-i-t-r-total-per-month="salariesOfITRTotalPerMonth"
            :tax-i-t-r-total="taxITRTotal"
            :computed-itr-tax-data="computedItrTaxData"
            :format-number="formatNumber"
            :truncate-decimal="truncateDecimal"
            @cell-edit-complete="onCellEditComplete"
            @copy-itr-worker="copyITRWorker"
            @delete-itr-worker="confirmDeleteItrWorker"
            @save-new-itr-staff="saveNewITRStaff"
            @change-selected-item="changeSelectedItem"
            @show-new-worker-modal="showNewWorkerModal"
            @change-coeficient="(data) => (calculationData.coeficientOfNds = data.value)"
          />
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

    <CreateWorkerDialog
      v-model:visible="createNewWorkerDialog"
      v-model:new-worker-data="newWorkerData"
      :dropdown-items-workers-role="dropdownItemsWorkersRole"
      @save="saveNewWorker"
    />
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
