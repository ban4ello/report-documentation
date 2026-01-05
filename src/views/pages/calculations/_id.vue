<script setup>
import { onBeforeMount, ref, computed, watch, nextTick } from 'vue';
import ApiService from '@/service/ApiService';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

// Composables
import { useCalculation } from '@/composables/useCalculation';
import { useWorkers } from '@/composables/useWorkers';
import { useCalculations } from '@/composables/useCalculations';
import { useFileUpload } from '@/composables/useFileUpload';

// Components
import SpecificationTable from '@/components/calculations/SpecificationTable.vue';
import PriceSummary from '@/components/calculations/PriceSummary.vue';
import TotalCostsSection from '@/components/calculations/TotalCostsSection.vue';
import MediaFilesSection from '@/components/calculations/MediaFilesSection.vue';
import CalculationHeader from '@/components/calculations/CalculationHeader.vue';
import VariablesSection from '@/components/calculations/VariablesSection.vue';
import WorkersSalaryAccordion from '@/components/calculations/WorkersSalaryAccordion.vue';
import ITRSalaryAccordion from '@/components/calculations/ITRSalaryAccordion.vue';
import CreateWorkerDialog from '@/components/calculations/CreateWorkerDialog.vue';

const toast = useToast();
const router = useRouter();
const calculationId = ref(null);
const isCreateMode = ref(false);

const dropdownItemsUnitOfMeasurement = ref(['тн', 'кг', 'шт', 'м', 'услуга']);

// Composables initialization
const {
  calculationData,
  loading,
  currentCalculationType,
  calculationPlanTotal,
  initializeFromQuery,
  initializeTaxData,
  createCalculation: createCalculationApi
} = useCalculation();

const { dropdownItemsWorkerStaff, dropdownItemsWorkersRole, newWorkerData, addNewWorkerToDB, loadWorkers } = useWorkers();

const isAmountWithoutMetal = ref(false);
const expandAccordionTotalCosts = ref([]);
const expandAccordionSalary = ref([]);
const selectedStaff = ref(null);
const selectedITRStaff = ref(null);
const createNewWorkerDialog = ref(false);
const increaseInSalary = ref(0);
const mediaFilesSectionRef = ref(null);

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
const { onUpload, removeFile, pasteFromBuffer } = useFileUpload(calculationData, expandAccordionTotalCosts);

const displayTotalPrice = computed(() => {
  return isAmountWithoutMetal.value ? finalTotalPriceWithoutMetal.value : finalTotalPrice.value;
});

const breadCrumbsItems = ref([]);

const computedStyleClass = computed(() => {
  const calculationType = currentCalculationType.value || calculationData.value.calculationType;
  return {
    'calculation-type-plan': calculationType === 'plan',
    'calculation-type-fact': calculationType === 'fact'
  };
});

onBeforeMount(async () => {
  const route = router.currentRoute.value;
  calculationId.value = route.name === 'calculation-create' ? 'create' : route.params.id;
  isCreateMode.value = route.name === 'calculation-create' || calculationId.value === 'create' || !calculationId.value;

  if (isCreateMode.value) {
    // Режим создания - используем composable
    await initializeFromQuery();
  } else {
    // Режим редактирования - загружаем данные
    try {
      const calculationRes = await ApiService.getCalculationById(calculationId.value);
      const camelize = (s) => s.replace(/_./g, (x) => x[1].toUpperCase());
      const data = Object.keys(calculationRes.data).reduce((acc, item) => {
        switch (camelize(item)) {
          case 'galvanizedValue':
          case 'transportValue':
          case 'rentalCostPerDay':
          case 'costOfElectricityPerDay':
          case 'profitabilityCoeficient':
          case 'numberOfHoursPerShift':
          case 'coeficientOfNds':
          case 'numberOfDaysPerShift':
          case 'itrWorkedDays':
            acc[camelize(item)] = Number(calculationRes.data[item]);
            break;

          case 'dateOfCreation':
            acc[camelize(item)] = calculationRes.data[item] ? new Date(calculationRes.data[item]) : new Date();
            break;

          default:
            acc[camelize(item)] = calculationRes.data[item];
            break;
        }

        return acc;
      }, {});

      calculationData.value = { ...calculationData.value, ...data };
      currentCalculationType.value = calculationData.value.calculationType;

      if (calculationData.value.parentCalculationId) {
        const parentCalculationRes = await ApiService.getParentCalculationChildren(calculationData.value.parentCalculationId);

        breadCrumbsItems.value = parentCalculationRes.data.map((item) => {
          return {
            label: item.title,
            route: {
              path: `/calculations/${item.id}`,
              query: {
                parentId: item.parent_calculation_id
              }
            }
          };
        });

        calculationPlanTotal.value = Number(parentCalculationRes.data.filter((item) => item.calculation_type === 'plan')[0].total);
      }
    } catch (error) {
      console.log(error);
    }
  }

  await loadWorkers();

  if (isCreateMode.value) {
    await initializeTaxData();
  }
});

const onCellEditComplete = (event) => {
  let { data, newValue, field } = event;

  // Обработка специальных случаев (Оцинковка, Транспорт) из PriceSummary
  if (data.name === 'Оцинковка') {
    calculationData.value.galvanizedValue = Number(newValue);
    data[field] = newValue;
    return;
  }

  if (data.name === 'Транспорт') {
    calculationData.value.transportValue = Number(newValue);
    data[field] = newValue;
    return;
  }

  // Для спецификации: явно обновляем элемент в массиве для гарантии реактивности
  if (data.id && calculationData.value.specificationData?.table) {
    const index = calculationData.value.specificationData.table.findIndex((item) => item.id === data.id);
    if (index !== -1) {
      // Преобразуем числовые поля
      if (field === 'quantity' || field === 'valuePerUnit') {
        calculationData.value.specificationData.table[index][field] = Number(newValue) || 0;
      } else {
        calculationData.value.specificationData.table[index][field] = newValue;
      }
    }
  } else {
    // Для других случаев (workers, itr и т.д.) просто обновляем data
    data[field] = newValue;
  }
};

const copySpecification = (data) => {
  calculationData.value.specificationData.table.push({
    id: Number((Math.random() * 1000).toFixed()),
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

const confirmDeleteSpecification = async (data) => {
  calculationData.value.specificationData.table = calculationData.value.specificationData.table.filter((item) => item.id !== data.id);

  if (!isCreateMode.value) {
    try {
      await ApiService.deleteItemFromSpecificationData(data.id);
    } catch (error) {
      console.log(error);
    } finally {
      loading.value = false;
    }
  }
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
    id: Number((Math.random() * 1000).toFixed()),
    name: data.name,
    numberOfHoursWorked: Number(data.numberOfHoursWorked),
    salaryPerDay: Number(data.salaryPerDay),
    salaryPerHour: null,
    total: null
  });
};

const confirmDeleteWorker = async (item) => {
  if (item) {
    calculationData.value.workersData.table = calculationData.value.workersData.table.filter((worker) => worker.id !== item.id);
  } else {
    selectedStaff.value.forEach((item) => {
      calculationData.value.workersData.table = calculationData.value.workersData.table.filter((worker) => worker.id !== item.id);
    });
  }

  if (!isCreateMode.value) {
    loading.value = true;
    try {
      await ApiService.deleteItemFromWorkersData(item.id);
    } catch (error) {
      console.log(error);
    } finally {
      loading.value = false;
    }
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

const confirmDeleteItrWorker = async (item) => {
  if (item) {
    calculationData.value.itrData.table = calculationData.value.itrData.table.filter((worker) => worker.id !== item.id);
  } else {
    selectedITRStaff.value.forEach((item) => {
      calculationData.value.itrData.table = calculationData.value.itrData.table.filter((worker) => worker.id !== item.id);
    });
  }

  if (!isCreateMode.value) {
    loading.value = true;
    try {
      await ApiService.deleteItemFromItrData(item.id);
    } catch (error) {
      console.log(error);
    } finally {
      loading.value = false;
    }
  }

  selectedITRStaff.value = null;
};

const copyITRWorker = (data) => {
  calculationData.value.itrData.table.push({
    id: Number((Math.random() * 1000).toFixed()),
    name: data.name,
    salaryPerMonth: data.salaryPerMonth
  });
};

const changeSelectedItem = () => {
  // This function is called from child components, but the actual update
  // is handled within the components themselves
};

const showNewWorkerModal = async () => {
  await loadWorkers();
  createNewWorkerDialog.value = true;
};

const saveNewWorker = async (worker) => {
  try {
    await addNewWorkerToDB(worker);
    await loadWorkers();
    newWorkerData.value = { name: '', lastname: '', position: '' };
    createNewWorkerDialog.value = false;
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Сотрудник создан',
      life: 3000
    });
  } catch (error) {
    console.log(error);
    // Проверка на ошибку дубликата имени с сервера
    if (error.response?.data?.code === 'DUPLICATE_WORKER_NAME' || error.response?.data?.message?.includes('уже существует')) {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: error.response?.data?.message || 'Сотрудник с таким именем уже существует',
        life: 3000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: error.response?.data?.message || 'Не удалось создать сотрудника',
        life: 3000
      });
    }
  }
};

const saveCalculation = async () => {
  if (isCreateMode.value) {
    // Режим создания
    const result = await createCalculationApi(displayTotalPrice.value, finalPriceData.value);
    if (result.success) {
      toast.add({ severity: 'success', summary: 'Успешно', detail: 'Калькуляция создана', life: 3000 });

      // Загружаем отложенные медиа файлы перед переходом
      if (mediaFilesSectionRef.value && mediaFilesSectionRef.value.uploadPendingFiles) {
        // Обновляем calculationId для компонента
        calculationId.value = result.data.id;
        // Ждем обновления компонента
        await nextTick();
        // Загружаем файлы
        try {
          await mediaFilesSectionRef.value.uploadPendingFiles();
        } catch (error) {
          console.error('Error uploading pending files:', error);
          // Продолжаем переход даже если загрузка файлов не удалась
        }
      }

      router.push({ path: `/calculations/${result.data.id}` });
    } else {
      toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать калькуляцию', life: 3000 });
    }
  } else {
    // Режим обновления
    loading.value = true;
    let today = new Date();
    today.setHours(today.getHours() + 3); // TODO: refactor (set local time)

    const getTotalValue = (data, fieldName) => {
      return data.reduce((acc, item) => {
        if (item.key === fieldName) {
          acc = item.perItem;
        }
        return acc;
      }, 0);
    };

    try {
      await ApiService.updateCalculation({
        ...calculationData.value,
        consumablesData: JSON.stringify(calculationData.value.consumablesData),
        hardwareData: JSON.stringify(calculationData.value.hardwareData),
        metalData: JSON.stringify(calculationData.value.metalData),
        dateOfCreation: calculationData.value.dateOfCreation || today,
        lastEditDate: today,
        total: displayTotalPrice.value,
        totalMetalPerItem: getTotalValue(finalPriceData.value, 'metalTotal'),
        totalProcessingPerItem: getTotalValue(finalPriceData.value, 'processing'),
        totalProfitabilityPerItem: getTotalValue(finalPriceData.value, 'profitability'),
        isMetalEnabled: calculationData.value.isMetalEnabled || false,
        isHardwareEnabled: calculationData.value.isHardwareEnabled || false
      });
      toast.add({ severity: 'success', summary: 'Успешно', detail: 'Калькуляция сохранена', life: 3000 });
    } catch (error) {
      console.log(error);
      toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось сохранить калькуляцию', life: 3000 });
    } finally {
      loading.value = false;
    }
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
</script>

<template>
  <div v-if="loading" class="card flex justify-center items-center h-[100vh] fixed top-0 left-0 right-0 z-9999 opacity-60">
    <ProgressSpinner />
  </div>

  <Fluid>
    <CalculationHeader
      :breadCrumbsItems="breadCrumbsItems"
      :calculation-data="calculationData"
      :display-total-price="displayTotalPrice"
      :calculation-plan-total="calculationPlanTotal"
      :total-specification-items="totalSpecificationItems"
      v-model:is-amount-without-metal="isAmountWithoutMetal"
      :computed-style-class="computedStyleClass"
      :loading="loading"
      :format-number="formatNumber"
      :truncate-decimal="truncateDecimal"
      :calculation-id="calculationId"
      :is-create-mode="isCreateMode"
      @create-calculation="saveCalculation"
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
        :is-metal-enabled="calculationData.isMetalEnabled"
        @update:isMetalEnabled="(data) => (calculationData.isMetalEnabled = data)"
        :is-hardware-enabled="calculationData.isHardwareEnabled"
        @update:isHardwareEnabled="(data) => (calculationData.isHardwareEnabled = data)"
        @upload="onUpload"
        @remove-file="removeFile"
        @paste-from-buffer="pasteFromBuffer"
      />

      <MediaFilesSection ref="mediaFilesSectionRef" :calculation-id="calculationId" :computed-style-class="computedStyleClass" />
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
</style>

<style lang="scss">
.grid-cols-1fr-35 {
  grid-template-columns: 1fr 35%;
}

.grid-cols-1fr-40 {
  grid-template-columns: 1fr 38%;
}

.grid-cols-35-1fr {
  grid-template-columns: 35% 1fr;
}

.progress_cell {
  padding: 3px 0 !important;
  height: 40px;

  &.p-datatable-header-cell {
    padding: var(--p-datatable-header-cell-padding) !important;
  }
}

.calculation-type-plan {
  color: var(--secondary-color) !important;
}

.calculation-type-fact {
  color: var(--primary-color) !important;
}
</style>
