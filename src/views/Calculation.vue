<script setup>
/*
  TODO:
  1. Разработать функционал добавления в базу новых сотрудников
  2. Добавить возможность гибко управлять стоимостью ЗП
  3. Спецификаций может быть много
  4. Таблица с ЗП ИТровцев:
    - сделать подблок значений ЗП с налогами
  5. В блоке "Цех"
    - сделать подблок значений ЗП с налогами
  6. В блоке "Итоговая ведомость"
    - сделать инфографику сколько какой вид работ потянул от общей суммы
  7. Добавить возможность прикреплять файлы (чертежи) к проекту (заказу))
*/

import { onBeforeMount, ref, computed } from 'vue';
import { MochDataService } from '@/service/MochDataService';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const fileupload = ref();
const dropdownItemsWorkerStaff = ref(['Бабенко', 'Червань Антон', 'Васильев', 'Атаманенко', 'Татарский']);
const dropdownItemsITR = ref(['Кристина', 'Олька', 'Танюха', 'Тёмка', 'Николаев', 'Никита', 'Шеф']);

const consumables = ref([]);
const hardware = ref([]);
const metalData = ref([]);
const newStaffData = ref({ name: '', numberOfHoursWorked: null, salaryPerDay: null });
const newITRStaffData = ref({ name: '', salaryPerMonth: null });

const specification = ref({ name: '', quantity: 10, weightOfOnePiece: 5 });
const selectedStaff = ref(null);
const selectedITRStaff = ref(null);
const newStaffDialog = ref(false);
const newITRStaffDialog = ref(false);
let workersData = ref([]);
let workersTaxData = ref([]);
let ITRData = ref([]);
let numberOfHoursPerShift = ref(8);
let numberOfDaysPerShift = ref(21);
let ITRWorkedDays = ref(13);

const salariesOfWorkersTotal = computed(() =>
  workersData.value.reduce((acc, item) => {
    return acc + parseFloat(Number((item.salaryPerDay / numberOfHoursPerShift.value) * item.numberOfHoursWorked).toFixed());
  }, 0)
);

const taxOfSalariesOfWorkersTotal = computed(() =>
  Number(
    workersTaxData.value
      .reduce((acc, item) => {
        return acc + parseFloat((item.quantity * salariesOfWorkersTotal.value) / 100);
      }, 0)
      .toFixed(2)
  )
);

const salariesOfITRTotal = computed(() =>
  ITRData.value.reduce((acc, item) => {
    return acc + Number(parseFloat((item.salaryPerMonth / numberOfDaysPerShift.value) * ITRWorkedDays.value).toFixed());
  }, 0)
);

const taxOfSalariesOfITRTotal = computed(() =>
  Number(
    workersTaxData.value
      .reduce((acc, item) => {
        return acc + parseFloat((item.quantity * salariesOfITRTotal.value) / 100);
      }, 0)
      .toFixed(2)
  )
);

const salariesOfITRTotalPerMonth = computed(() =>
  ITRData.value.reduce((acc, item) => {
    return acc + Number(parseFloat(item.salaryPerMonth));
  }, 0)
);

const totalConsumables = computed(() => getTotalPrice(consumables.value));
const totalHardware = computed(() => getTotalPrice(hardware.value));
const totalMetal = computed(() => getTotalPrice(metalData.value));
const totalWeightOfMetal = computed(() => specification.value.quantity * specification.value.weightOfOnePiece);

const priceData = computed(() => {
  return [
    {
      id: 1,
      name: 'Металл',
      perItem: Number(totalMetal.value / totalWeightOfMetal.value).toFixed(2),
      total: totalMetal
    },
    {
      id: 2,
      name: 'Метизы',
      perItem: Number(totalHardware.value / totalWeightOfMetal.value).toFixed(2),
      total: totalHardware
    },
    {
      id: 3,
      name: 'Расходники',
      perItem: Number(totalConsumables.value / totalWeightOfMetal.value).toFixed(2),
      total: totalConsumables
    },
    {
      id: 4,
      name: 'Цех',
      perItem: Number((taxOfSalariesOfWorkersTotal.value + salariesOfWorkersTotal.value) / totalWeightOfMetal.value).toFixed(2),
      total: taxOfSalariesOfWorkersTotal.value + salariesOfWorkersTotal.value
    },
    {
      id: 5,
      name: 'Зарплата ИТР',
      perItem: Number((taxOfSalariesOfITRTotal.value + salariesOfITRTotal.value) / totalWeightOfMetal.value).toFixed(2),
      total: taxOfSalariesOfITRTotal.value + salariesOfITRTotal.value
    },
    {
      id: 6,
      name: 'Оцинковка',
      perItem: null,
      total: null
    },
    {
      id: 7,
      name: 'Транспорт',
      perItem: null,
      total: null
    },
    {
      id: 8,
      name: 'Аренда',
      perItem: null,
      total: null
    },
    {
      id: 9,
      name: 'Эл эн',
      perItem: null,
      total: null
    },
    {
      id: 10,
      name: 'Рентабельность',
      perItem: null,
      total: null
    }
  ];
});

onBeforeMount(() => {
  MochDataService.getConsumables().then((data) => {
    consumables.value = data;
  });

  MochDataService.getHardware().then((data) => {
    hardware.value = data;
  });

  MochDataService.getMetal().then((data) => {
    metalData.value = data;
  });

  MochDataService.getWorkersData().then((data) => {
    workersData.value = data;
  });

  MochDataService.getWorkersTaxData().then((data) => {
    workersTaxData.value = data;
  });

  MochDataService.getITRData().then((data) => {
    ITRData.value = data;
  });
});

function getTotalPrice(array) {
  return array.reduce((acc, item) => {
    return acc + parseFloat(item.price.replaceAll(' ', '').replaceAll(',', '.'));
  }, 0);
}

function onUpload() {
  toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
}

const onCellEditComplete = (event) => {
  let { data, newValue, field } = event;

  data[field] = newValue;
};

const showDialog = (key) => {
  switch (key) {
    case 'newStaffDialog':
      newStaffDialog.value = true;
      break;
    case 'newITRStaffDialog':
      newITRStaffDialog.value = true;
      break;

    default:
      break;
  }
};

const copyStaffWorker = (data) => {
  workersData.value.push({
    id: (Math.random() * 1000).toFixed(),
    name: data.name,
    numberOfHoursWorked: data.numberOfHoursWorked,
    salaryPerDay: data.salaryPerDay,
    salaryPerHour: null,
    total: null
  });
};

const saveNewStaff = () => {
  workersData.value.push({
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

const confirmDeleteStaff = (item) => {
  if (item) {
    workersData.value = workersData.value.filter((worker) => worker.id !== item.id);
  } else {
    selectedStaff.value.forEach((item) => {
      workersData.value = workersData.value.filter((worker) => worker.id !== item.id);
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
  ITRData.value.push({
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

const confirmDeleteITRStaff = (item) => {
  if (item) {
    ITRData.value = ITRData.value.filter((worker) => worker.id !== item.id);
  } else {
    selectedITRStaff.value.forEach((item) => {
      ITRData.value = ITRData.value.filter((worker) => worker.id !== item.id);
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
  ITRData.value.push({
    id: (Math.random() * 1000).toFixed(),
    name: data.name,
    salaryPerMonth: data.salaryPerMonth
  });
};
</script>

<template>
  <Fluid>
    <div class="flex flex-col gap-4">
      <div class="card flex flex-col gap-4 w-full">
        <div class="font-semibold text-xl">Спецификация</div>

        <div class="flex flex-col md:flex-column gap-4">
          <div class="flex flex-wrap gap-2 w-full">
            <label for="specificationName">Наименование изделия</label>
            <InputText v-model="specification.name" id="specificationName" type="text" />
          </div>

          <div class="flex flex-wrap gap-2 w-full">
            <label for="specificationQuantity">Количество</label>
            <InputText v-model="specification.quantity" id="specificationQuantity" type="number" />
          </div>

          <div class="flex flex-wrap gap-2 w-full">
            <label for="specificationWeightOfOnePiece">Вес одной штуки в тоннах</label>
            <InputText v-model="specification.weightOfOnePiece" id="specificationWeightOfOnePiece" type="number" />
          </div>

          <div class="flex flex-wrap gap-2 w-full">
            <label for="specificationTotalWeight">Общий вес</label>
            <InputText :value="totalWeightOfMetal" id="specificationTotalWeight" type="text" disabled />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1fr-35 gap-4">
        <div>
          <div class="card h-full">
            <div class="flex flex-row items-center justify-between gap-2">
              <div class="font-semibold text-xl">Цех</div>

              <div>
                <Button label="Добавить сотрудника" size="small" icon="pi pi-plus" severity="success" class="mr-2 text-xs max-w-[100px]" @click="showDialog('newStaffDialog')" />
                <Button label="Удалить сотрудника" size="small" icon="pi pi-trash" severity="danger" class="mr-2 text-xs max-w-[100px]" @click="confirmDeleteStaff()" :disabled="!selectedStaff || !selectedStaff.length" />
              </div>
            </div>

            <div class="flex flex-row gap-2 max-w-[250px] mb-4">
              <label for="numberOfHoursPerShift">Количество часов в смене</label>
              <InputNumber v-model="numberOfHoursPerShift" inputId="numberOfHoursPerShift" :min="0" :max="10000" fluid />
            </div>

            <DataTable :value="workersData" v-model:selection="selectedStaff" editMode="cell" @cell-edit-complete="onCellEditComplete">
              <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

              <Column field="name" header="Имя сотрудника" style="width: 25%">
                <template #body="{ data }">
                  {{ data.name }}
                </template>

                <template #editor="{ data }">
                  <!-- <InputText v-model="data.name" /> -->
                  <Select id="staff" v-model="data.name" :options="dropdownItemsWorkerStaff" class="w-full"></Select>
                </template>
              </Column>

              <Column field="numberOfHoursWorked" header="Трудозатраты" style="width: 25%">
                <template #body="{ data }">
                  {{ data.numberOfHoursWorked }}
                </template>

                <template #editor="{ data }">
                  <InputText v-model="data.numberOfHoursWorked" type="number" />
                </template>
              </Column>

              <Column field="salaryPerDay" header="В день" style="width: 25%">
                <template #body="{ data }">
                  {{ data.salaryPerDay }}
                </template>

                <template #editor="{ data }">
                  <InputText v-model="data.salaryPerDay" type="number" />
                </template>
              </Column>

              <Column field="salaryPerHour" header="В час" style="width: 25%">
                <template #body="{ data }">
                  {{ data.salaryPerDay / numberOfHoursPerShift }}
                </template>
              </Column>

              <Column field="total" header="Итого" style="width: 25%">
                <template #body="{ data }">
                  {{ Number((data.salaryPerDay / numberOfHoursPerShift) * data.numberOfHoursWorked).toFixed() }}
                </template>
              </Column>

              <Column :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                  <Button icon="pi pi-copy" class="mr-2" outlined rounded severity="success" @click="copyStaffWorker(slotProps.data)" />
                  <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteStaff(slotProps.data)" />
                </template>
              </Column>

              <template #footer>
                <div class="flex justify-end gap-4 w-full">
                  <div class="flex items-center">
                    ЗП без налога: &nbsp;<span class="font-bold text-lg"> {{ salariesOfWorkersTotal }}</span>
                  </div>

                  <div class="flex items-center">
                    ЗП с налогом: &nbsp;<span class="font-bold text-lg"> {{ taxOfSalariesOfWorkersTotal + salariesOfWorkersTotal }}</span>
                  </div>
                </div>
              </template>
            </DataTable>

            <Dialog v-model:visible="newStaffDialog" :style="{ width: '450px' }" header="Новый сотрудник" :modal="true">
              <div class="flex flex-col gap-6">
                <div>
                  <label for="name" class="block font-bold mb-3">Имя</label>
                  <Select id="staff" v-model="newStaffData.name" :options="dropdownItemsWorkerStaff" class="w-full"></Select>
                </div>

                <div>
                  <label for="numberOfHoursWorked" class="block font-bold mb-3">Трудозатраты</label>
                  <InputNumber v-model="newStaffData.numberOfHoursWorked" inputId="minmax" :min="0" :max="10000" fluid />
                </div>

                <div>
                  <label for="salaryPerDay" class="block font-bold mb-3">В день</label>
                  <InputNumber v-model="newStaffData.salaryPerDay" inputId="minmax" :min="0" :max="10000" fluid />
                </div>
              </div>

              <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="newStaffDialog = false" />
                <Button :disabled="!newStaffData.name.trim() || newStaffData.numberOfHoursWorked === null || newStaffData.salaryPerDay === null" label="Save" icon="pi pi-check" @click="saveNewStaff" />
              </template>
            </Dialog>
          </div>
        </div>

        <div>
          <div class="card h-full">
            <div class="flex flex-row items-center justify-between gap-2">
              <div class="font-semibold text-xl">Налоговые начисления</div>
            </div>

            <DataTable :value="workersTaxData" editMode="cell" @cell-edit-complete="onCellEditComplete">
              <Column field="name" header="Имя" style="width: 25%">
                <template #body="{ data }">
                  {{ data.name }}
                </template>

                <!-- <template #editor="{ data }">
                  <Select id="staff" v-model="data.name" :options="dropdownItemsWorkerStaff" class="w-full"></Select>
                </template> -->
              </Column>

              <Column field="quantity" header="Размер налога" style="width: 25%">
                <template #body="{ data }">
                  {{ data.quantity + (data.type === 'percent' ? '%' : '') }}
                </template>

                <!-- <template #editor="{ data }">
                  <InputText v-model="data.quantity" type="number" />
                </template> -->
              </Column>

              <Column field="total" header="Сумма" style="width: 25%">
                <template #body="{ data }">
                  {{ parseFloat((data.quantity * salariesOfWorkersTotal) / 100) }}
                </template>

                <template #editor="{ data }">
                  <InputText v-model="data.total" type="number" />
                </template>
              </Column>

              <template #footer>
                <div class="flex justify-end items-center font-bold w-full">
                  Итого: &nbsp;<span class="text-lg"> {{ taxOfSalariesOfWorkersTotal }}</span>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1fr-35 gap-4">
        <div class="ITR">
          <div class="card h-full">
            <div class="flex flex-row items-center justify-between gap-2 mb-4">
              <div class="font-semibold text-xl">ИТР</div>

              <div class="">
                <Button label="Добавить сотрудника" size="small" icon="pi pi-plus" severity="success" class="mr-2 text-xs max-w-[100px]" @click="showDialog('newITRStaffDialog')" />
                <Button label="Удалить сотрудника" size="small" icon="pi pi-trash" severity="danger" class="mr-2 text-xs max-w-[100px]" @click="confirmDeleteITRStaff()" :disabled="!selectedITRStaff || !selectedITRStaff.length" />
              </div>
            </div>

            <div class="flex gap-2 mb-4 items-center">
              <div class="flex flex-row gap-2 items-center">
                <label for="numberOfDaysPerShift">Количество дней в мес.</label>
                <InputNumber v-model="numberOfDaysPerShift" inputId="numberOfDaysPerShift" class="max-w-[50px]" :min="0" :max="10000" fluid />
              </div>

              <div class="flex flex-row gap-2 items-center">
                <label for="numberOfDaysPerShift">Количество дней (трудозатраты)</label>
                <InputNumber v-model="ITRWorkedDays" inputId="numberOfDaysPerShift" class="max-w-[50px]" :min="0" :max="10000" fluid />
              </div>
            </div>

            <DataTable :value="ITRData" v-model:selection="selectedITRStaff" editMode="cell" @cell-edit-complete="onCellEditComplete">
              <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

              <Column field="name" header="Имя сотрудника" style="width: 25%">
                <template #body="{ data }">
                  {{ data.name }}
                </template>

                <template #editor="{ data }">
                  <Select id="staff" v-model="data.name" :options="dropdownItemsITR" class="w-full"></Select>
                </template>
              </Column>

              <Column field="salaryPerMonth" header="ЗП в месяц" style="width: 25%">
                <template #body="{ data }">
                  {{ data.salaryPerMonth }}
                </template>

                <template #editor="{ data }">
                  <InputNumber v-model="data.salaryPerMonth" inputId="minmax" :min="0" :max="10000" fluid />
                </template>
              </Column>

              <Column field="salaryPerDay" header="ЗП по факту" style="width: 25%">
                <template #body="{ data }">
                  {{ parseFloat((data.salaryPerMonth / numberOfDaysPerShift) * ITRWorkedDays).toFixed() }}
                </template>
              </Column>

              <Column :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                  <Button icon="pi pi-copy" class="mr-2" outlined rounded severity="success" @click="copyITRWorker(slotProps.data)" />
                  <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteITRStaff(slotProps.data)" />
                </template>
              </Column>

              <template #footer>
                <div class="flex justify-end gap-4 w-full">
                  <div class="flex items-center">
                    Итого ЗП за полный месяц работы: &nbsp;<span class="font-bold text-lg"> {{ salariesOfITRTotalPerMonth }}</span>
                  </div>

                  <div class="flex items-center">
                    Итого ЗП по факту: &nbsp;<span class="font-bold text-lg"> {{ salariesOfITRTotal }}</span>
                  </div>
                </div>
              </template>
            </DataTable>

            <Dialog v-model:visible="newITRStaffDialog" :style="{ width: '450px' }" header="Новый сотрудник" :modal="true">
              <div class="flex flex-col gap-6">
                <div>
                  <label for="name" class="block font-bold mb-3">Имя</label>
                  <Select id="staff" v-model="newITRStaffData.name" :options="dropdownItemsITR" class="w-full"></Select>
                </div>

                <div>
                  <label for="salaryPerMonth" class="block font-bold mb-3">ЗП в месяц</label>
                  <InputNumber v-model="newITRStaffData.salaryPerMonth" inputId="minmax" :min="0" :max="10000" fluid />
                </div>
              </div>

              <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="newStaffDialog = false" />
                <Button :disabled="!newITRStaffData.name.trim() || newITRStaffData.salaryPerMonth === null" label="Save" icon="pi pi-check" @click="saveNewITRStaff" />
              </template>
            </Dialog>
          </div>
        </div>

        <div class="ITR-tax">
          <div class="card h-full">
            <div class="flex flex-row items-center justify-between gap-2">
              <div class="font-semibold text-xl">Налоговые начисления</div>
            </div>

            <DataTable :value="workersTaxData" editMode="cell" @cell-edit-complete="onCellEditComplete">
              <Column field="name" header="Имя" style="width: 25%">
                <template #body="{ data }">
                  {{ data.name }}
                </template>

                <!-- <template #editor="{ data }">
                  <Select id="staff" v-model="data.name" :options="dropdownItemsWorkerStaff" class="w-full"></Select>
                </template> -->
              </Column>

              <Column field="quantity" header="Размер налога" style="width: 25%">
                <template #body="{ data }">
                  {{ data.quantity + (data.type === 'percent' ? '%' : '') }}
                </template>

                <!-- <template #editor="{ data }">
                  <InputText v-model="data.quantity" type="number" />
                </template> -->
              </Column>

              <Column field="total" header="Сумма" style="width: 25%">
                <template #body="{ data }">
                  {{ parseFloat((data.quantity * salariesOfITRTotal) / 100) }}
                </template>

                <template #editor="{ data }">
                  <InputText v-model="data.total" type="number" />
                </template>
              </Column>

              <template #footer>
                <div class="flex justify-end items-center font-bold w-full">
                  Итого: &nbsp;<span class="text-lg"> {{ taxOfSalariesOfITRTotal }}</span>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex flex-row justify-between gap-2">
          <div class="font-semibold text-xl">Итоговая ведомость</div>
        </div>

        <DataTable :value="priceData" editMode="cell" showGridlines @cell-edit-complete="onCellEditComplete">
          <Column field="name" style="width: 25%">
            <template #body="{ data }">
              {{ data.name }}
            </template>
          </Column>

          <Column field="total" header="Общая" style="width: 25%">
            <template #body="{ data }">
              {{ data.total }}
            </template>
          </Column>

          <Column field="perItem" header="На 1 тн" style="width: 25%">
            <template #body="{ data }">
              {{ data.perItem }}
            </template>
          </Column>
        </DataTable>
      </div>

      <div class="card">
        <div class="flex flex-row justify-between gap-2">
          <div class="font-semibold text-xl">Расходники</div>

          <FileUpload ref="fileupload" class="max-w-[100px]" mode="basic" accept=".csv, .xlsx" :maxFileSize="1000000" @uploader="onUpload" chooseLabel="Выберите файл"> </FileUpload>
        </div>

        <Accordion :value="['0']" multiple>
          <AccordionPanel value="0">
            <AccordionHeader>Общие расходники</AccordionHeader>

            <AccordionContent>
              <DataTable :value="consumables" dataKey="order" :rowHover="true" showGridlines>
                <template #empty> No customers found. </template>

                <template #loading> Loading customers data. Please wait. </template>

                <Column field="order" header="№ п/п" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.order }}
                  </template>
                </Column>

                <Column field="name" header="Наименование" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.name }}
                  </template>
                </Column>

                <Column field="unitOfMeasurement" header="ед.изм." style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.unitOfMeasurement }}
                  </template>
                </Column>

                <Column field="quantity" header="К-во" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.quantity }}
                  </template>
                </Column>

                <Column field="taxPrice" header="цена НДС" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.taxPrice }}
                  </template>
                </Column>

                <Column field="price" header="Стоимость" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.price }}
                  </template>
                </Column>

                <template #footer>
                  <div class="flex justify-end items-center font-bold w-full">
                    Итого: &nbsp;<span class="text-lg">{{ totalConsumables }}</span>
                  </div>
                </template>
              </DataTable>
            </AccordionContent>
          </AccordionPanel>

          <AccordionPanel value="1">
            <AccordionHeader>Метизы</AccordionHeader>

            <AccordionContent>
              <DataTable :value="hardware" dataKey="order" :rowHover="true" showGridlines>
                <template #empty> No customers found. </template>

                <template #loading> Loading customers data. Please wait. </template>

                <Column field="order" header="№ п/п" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.order }}
                  </template>
                </Column>

                <Column field="name" header="Наименование" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.name }}
                  </template>
                </Column>

                <Column field="unitOfMeasurement" header="ед.изм." style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.unitOfMeasurement }}
                  </template>
                </Column>

                <Column field="quantity" header="К-во" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.quantity }}
                  </template>
                </Column>

                <Column field="taxPrice" header="цена НДС" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.taxPrice }}
                  </template>
                </Column>

                <Column field="price" header="Стоимость" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.price }}
                  </template>
                </Column>

                <template #footer>
                  <div class="flex justify-end items-center font-bold w-full">
                    Итого: &nbsp;<span class="text-lg">{{ totalHardware }}</span>
                  </div>
                </template>
              </DataTable>
            </AccordionContent>
          </AccordionPanel>

          <AccordionPanel value="2">
            <AccordionHeader>Металл</AccordionHeader>

            <AccordionContent>
              <DataTable :value="metalData" dataKey="order" :rowHover="true" showGridlines>
                <Column field="order" header="№ п/п" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.order }}
                  </template>
                </Column>

                <Column field="name" header="Наименование" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.name }}
                  </template>
                </Column>

                <Column field="unitOfMeasurement" header="ед.изм." style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.unitOfMeasurement }}
                  </template>
                </Column>

                <Column field="quantity" header="К-во" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.quantity }}
                  </template>
                </Column>

                <Column field="taxPrice" header="цена НДС" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.taxPrice }}
                  </template>
                </Column>

                <Column field="price" header="Стоимость" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.price }}
                  </template>
                </Column>

                <template #footer>
                  <div class="flex justify-end items-center font-bold w-full">
                    Итого: &nbsp;<span class="text-lg">{{ totalMetal }}</span>
                  </div>
                </template>
              </DataTable>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
    </div>
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
</style>
