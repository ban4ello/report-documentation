<script setup>
/*
  TODO:
  - Разработать функционал добавления в базу новых сотрудников
  - Добавить возможность прикреплять файлы (чертежи) к проекту (заказу)
  - После создания "калькуляции" ("план") предлагать клонировать её (создать "факт"). В итоговый дашборд войдёт как "план" так и "факт"
  - Добавить кнопку "Сохранить"
  - Добавить кнопку "Удалить файл"
  - Добавить Textarea в блоки "Спецификация" и "Цех"
  - Добавить новый флаг для "Сумма без металла" который уберет из итоговой суммы сумму металла который подгружается из файла

  ИТР
  Цех
  Спецификация:
  Итоговая ведомость:
  Общие затраты:
*/

import { onBeforeMount, ref, computed, watch } from 'vue';
import { MochDataService } from '@/service/MochDataService';
// import { useToast } from 'primevue/usetoast';
import SearchSelect from '@/components/custom-ui/SearchSelect.vue';
import TaxCharges from '@/components/TaxCharges.vue';
// import { read, writeFileXLSX } from 'xlsx';
import * as XLS from 'xlsx';

// const toast = useToast();
const fileupload = ref();
const dropdownItemsWorkerStaff = ref(['Бабенко', 'Червань Антон', 'Васильев', 'Атаманенко', 'Татарский']);
const dropdownItemsITR = ref(['Кристина', 'Олька', 'Танюха', 'Тёмка', 'Николаев', 'Никита', 'Шеф']);
const dropdownItemsWorkersRole = ref([
  { label: 'Рабочий', key: 'worker' },
  { label: 'ИТР', key: 'ITR' }
]);
const dropdownItemsUnitOfMeasurement = ref(['тн', 'кг', 'шт', 'м']);

const consumablesData = ref([]);
const hardwareData = ref([]);
const metalData = ref([]);
const newStaffData = ref({ name: '', numberOfHoursWorked: null, salaryPerDay: null });
const newITRStaffData = ref({ name: '', salaryPerMonth: null });

const selectedStaff = ref(null);
const selectedITRStaff = ref(null);
const newStaffDialog = ref(false);
const newITRStaffDialog = ref(false);
const createNewWorkerDialog = ref(false);

let currentDate = new Date();
const today = `${currentDate.getDate()}.${currentDate.getMonth()}.${currentDate.getFullYear()}`;
const currentTime = currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds();

let calculationData = ref({ title: 'Калькуляция-' + today, dateOfCreation: today, lastEditDate: today + ' ' + currentTime });
let workersData = ref([]);
let specificationData = ref([]);
let newWorkerData = ref({ name: '', lastname: '', role: '' });
let workersTaxData = ref([]);
let ITRTaxData = ref([]);
let ITRData = ref([]);
let numberOfHoursPerShift = ref(8);
let numberOfDaysPerShift = ref(21);
let ITRWorkedDays = ref(0);
let rentalCostPerDay = ref(170);
let costOfElectricityPerDay = ref(550);
let coeficientOfNDS = ref(1.2);
let galvanizedValue = ref(0);
let transportValue = ref(0);
let profitabilityCoeficient = ref(0.1);
let increaseInSalary = ref(0);

const salariesOfWorkersTotal = computed(() =>
  workersData.value.reduce((acc, item) => {
    return acc + parseFloat(Number((item.salaryPerDay / numberOfHoursPerShift.value) * item.numberOfHoursWorked).toFixed());
  }, 0)
);

const salariesOfITRTotal = computed(() =>
  ITRData.value.reduce((acc, item) => {
    return acc + Number(parseFloat((item.salaryPerMonth / numberOfDaysPerShift.value) * ITRWorkedDays.value).toFixed());
  }, 0)
);

const salariesOfITRTotalPerMonth = computed(() =>
  ITRData.value.reduce((acc, item) => {
    return acc + Number(parseFloat(item.salaryPerMonth));
  }, 0)
);

const totalSpecificationItems = computed(
  () =>
    specificationData.value.reduce((acc, item) => {
      return acc + Number(item.quantity * item.valuePerUnit);
    }, 0) || 0
);

const taxTotal = computed(() => {
  const numberOfDecimal = 2;

  return Number(
    parseFloat(
      (computedWorkerTaxData.value.T +
        computedWorkerTaxData.value.TN +
        computedWorkerTaxData.value.K +
        computedWorkerTaxData.value.KMIL +
        computedWorkerTaxData.value.KESV) *
        coeficientOfNDS.value
    ).toFixed(numberOfDecimal)
  );
});

const taxITRTotal = computed(() => {
  const numberOfDecimal = 2;

  return Number(
    parseFloat(
      (computedITRTaxData.value.T +
        computedITRTaxData.value.TN +
        computedITRTaxData.value.K +
        computedITRTaxData.value.KMIL +
        computedITRTaxData.value.KESV) *
        coeficientOfNDS.value
    ).toFixed(numberOfDecimal)
  );
});

const totalConsumables = computed(() => getTotalPrice(consumablesData.value));
const totalHardware = computed(() => getTotalPrice(hardwareData.value));
const totalMetal = computed(() => getTotalPrice(metalData.value));

const priceData = computed(() => {
  return [
    {
      id: 1,
      name: 'Металл',
      key: 'metal',
      statistics: getPercentOfTotal(totalMetal.value),
      total: totalMetal.value || 0,
      perItem: truncateDecimal(totalMetal.value / totalSpecificationItems.value, 2)
    },
    {
      id: 2,
      name: 'Метизы',
      key: 'hardware',
      statistics: getPercentOfTotal(totalHardware.value),
      total: totalHardware.value || 0,
      perItem: truncateDecimal(totalHardware.value / totalSpecificationItems.value, 2)
    },
    {
      id: 3,
      name: 'Расходники',
      key: 'consumables',
      statistics: getPercentOfTotal(totalConsumables.value),
      total: totalConsumables.value || 0,
      perItem: truncateDecimal(totalConsumables.value / totalSpecificationItems.value, 2)
    },
    {
      id: 4,
      name: 'Цех',
      key: 'workshop',
      statistics: getPercentOfTotal(taxTotal.value),
      total: taxTotal.value || 0,
      perItem: taxTotal.value / totalSpecificationItems.value
    },
    {
      id: 5,
      name: 'Зарплата ИТР',
      key: 'wagesOfEngineers',
      statistics: getPercentOfTotal(taxITRTotal.value),
      total: taxITRTotal.value || 0,
      perItem: taxITRTotal.value / totalSpecificationItems.value
    },
    {
      id: 6,
      name: 'Оцинковка',
      key: 'galvanizing',
      statistics: getPercentOfTotal(galvanizedValue.value),
      total: galvanizedValue.value || 0,
      perItem: totalSpecificationItems.value ? galvanizedValue.value / totalSpecificationItems.value : 0
    },
    {
      id: 7,
      name: 'Транспорт',
      key: 'transport',
      statistics: getPercentOfTotal(transportValue.value),
      total: transportValue.value || 0,
      perItem: totalSpecificationItems.value ? transportValue.value / totalSpecificationItems.value : 0
    },
    {
      id: 8,
      name: 'Аренда',
      key: 'rent',
      statistics: getPercentOfTotal(rentalCostPerDay.value * ITRWorkedDays.value),
      total: rentalCostPerDay.value * ITRWorkedDays.value || 0,
      perItem: totalSpecificationItems.value ? (rentalCostPerDay.value * ITRWorkedDays.value) / totalSpecificationItems.value : 0
    },
    {
      id: 9,
      name: 'Эл. эн.',
      key: 'electricity',
      statistics: getPercentOfTotal(costOfElectricityPerDay.value * ITRWorkedDays.value) || 0,
      total: costOfElectricityPerDay.value * ITRWorkedDays.value || 0,
      perItem: totalSpecificationItems.value ? (costOfElectricityPerDay.value * ITRWorkedDays.value) / totalSpecificationItems.value : 0
    },
    {
      id: 10,
      name: 'Рентабельность',
      key: 'profitability',
      statistics: getPercentOfTotal(
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          galvanizedValue.value +
          transportValue.value +
          rentalCostPerDay.value * ITRWorkedDays.value +
          costOfElectricityPerDay.value * ITRWorkedDays.value) *
          profitabilityCoeficient.value
      ),
      total:
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          galvanizedValue.value +
          transportValue.value +
          rentalCostPerDay.value * ITRWorkedDays.value +
          costOfElectricityPerDay.value * ITRWorkedDays.value) *
        profitabilityCoeficient.value,
      perItem: totalSpecificationItems.value
        ? ((totalMetal.value +
            totalHardware.value +
            totalConsumables.value +
            taxTotal.value +
            taxITRTotal.value +
            galvanizedValue.value +
            transportValue.value +
            rentalCostPerDay.value * ITRWorkedDays.value +
            costOfElectricityPerDay.value * ITRWorkedDays.value) *
            profitabilityCoeficient.value) /
          totalSpecificationItems.value
        : 0
    },
    {
      id: 11,
      name: 'Итого',
      key: 'total',
      statistics: 0,
      total:
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          galvanizedValue.value +
          transportValue.value +
          rentalCostPerDay.value * ITRWorkedDays.value +
          costOfElectricityPerDay.value * ITRWorkedDays.value) *
          profitabilityCoeficient.value +
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          galvanizedValue.value +
          transportValue.value +
          rentalCostPerDay.value * ITRWorkedDays.value +
          costOfElectricityPerDay.value * ITRWorkedDays.value),
      perItem: totalSpecificationItems.value
        ? ((totalMetal.value +
            totalHardware.value +
            totalConsumables.value +
            taxTotal.value +
            taxITRTotal.value +
            galvanizedValue.value +
            transportValue.value +
            rentalCostPerDay.value * ITRWorkedDays.value +
            costOfElectricityPerDay.value * ITRWorkedDays.value) *
            profitabilityCoeficient.value +
            (totalMetal.value +
              totalHardware.value +
              totalConsumables.value +
              taxTotal.value +
              taxITRTotal.value +
              galvanizedValue.value +
              transportValue.value +
              rentalCostPerDay.value * ITRWorkedDays.value +
              costOfElectricityPerDay.value * ITRWorkedDays.value)) /
          totalSpecificationItems.value
        : 0
    }
  ];
});

const finalPriceData = computed(() => {
  return [
    {
      id: 1,
      name: 'Металл',
      key: 'metalTotal',
      statistics: getPercentOfTotal(totalMetal.value + totalHardware.value),
      total: totalMetal.value + totalHardware.value,
      perItem: totalSpecificationItems.value ? truncateDecimal((totalMetal.value + totalHardware.value) / totalSpecificationItems.value) : 0
    },
    {
      id: 2,
      name: 'Переработка',
      key: 'processing',
      statistics: getPercentOfTotal(
        totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          galvanizedValue.value +
          transportValue.value +
          rentalCostPerDay.value * ITRWorkedDays.value +
          costOfElectricityPerDay.value * ITRWorkedDays.value
      ),
      total:
        totalConsumables.value +
        taxTotal.value +
        taxITRTotal.value +
        galvanizedValue.value +
        transportValue.value +
        rentalCostPerDay.value * ITRWorkedDays.value +
        costOfElectricityPerDay.value * ITRWorkedDays.value,
      perItem: totalSpecificationItems.value
        ? truncateDecimal(
            (totalConsumables.value +
              taxTotal.value +
              taxITRTotal.value +
              galvanizedValue.value +
              transportValue.value +
              rentalCostPerDay.value * ITRWorkedDays.value +
              costOfElectricityPerDay.value * ITRWorkedDays.value) /
              totalSpecificationItems.value,
            2
          )
        : 0
    },
    {
      id: 3,
      name: 'Рентабельность',
      key: 'profitability',
      statistics: getPercentOfTotal(
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          galvanizedValue.value +
          transportValue.value +
          rentalCostPerDay.value * ITRWorkedDays.value +
          costOfElectricityPerDay.value * ITRWorkedDays.value) *
          profitabilityCoeficient.value
      ),
      total:
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          galvanizedValue.value +
          transportValue.value +
          rentalCostPerDay.value * ITRWorkedDays.value +
          costOfElectricityPerDay.value * ITRWorkedDays.value) *
        profitabilityCoeficient.value,
      perItem: totalSpecificationItems.value
        ? ((totalMetal.value +
            totalHardware.value +
            totalConsumables.value +
            taxTotal.value +
            taxITRTotal.value +
            galvanizedValue.value +
            transportValue.value +
            rentalCostPerDay.value * ITRWorkedDays.value +
            costOfElectricityPerDay.value * ITRWorkedDays.value) *
            profitabilityCoeficient.value) /
          totalSpecificationItems.value
        : 0
    },
    {
      id: 4,
      name: 'Итого',
      key: 'total',
      statistics: 0,
      total:
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          galvanizedValue.value +
          transportValue.value +
          rentalCostPerDay.value * ITRWorkedDays.value +
          costOfElectricityPerDay.value * ITRWorkedDays.value) *
          profitabilityCoeficient.value +
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          galvanizedValue.value +
          transportValue.value +
          rentalCostPerDay.value * ITRWorkedDays.value +
          costOfElectricityPerDay.value * ITRWorkedDays.value),
      perItem: totalSpecificationItems.value
        ? ((totalMetal.value +
            totalHardware.value +
            totalConsumables.value +
            taxTotal.value +
            taxITRTotal.value +
            galvanizedValue.value +
            transportValue.value +
            rentalCostPerDay.value * ITRWorkedDays.value +
            costOfElectricityPerDay.value * ITRWorkedDays.value) *
            profitabilityCoeficient.value +
            (totalMetal.value +
              totalHardware.value +
              totalConsumables.value +
              taxTotal.value +
              taxITRTotal.value +
              galvanizedValue.value +
              transportValue.value +
              rentalCostPerDay.value * ITRWorkedDays.value +
              costOfElectricityPerDay.value * ITRWorkedDays.value)) /
          totalSpecificationItems.value
        : 0
    }
  ];
});

const computedWorkerTaxData = computed(() => {
  const numberOfDecimal = 2;

  return workersTaxData.value.reduce(
    (acc, item) => {
      switch (item.key) {
        case 'T':
          acc.T = Number(parseFloat(item.coefficient * salariesOfWorkersTotal.value).toFixed(numberOfDecimal));
          break;
        case 'TN':
          acc.TN = Number(parseFloat((acc.T / item.coefficient.a) * item.coefficient.b).toFixed(numberOfDecimal));
          break;
        case 'K':
          acc.K = Number(parseFloat(salariesOfWorkersTotal.value - acc.T).toFixed(numberOfDecimal));
          break;
        case 'KMIL':
          acc.KMIL = Number(parseFloat(acc.K * item.coefficient).toFixed(numberOfDecimal));
          break;
        case 'KESV':
          acc.KESV = Number(parseFloat((acc.K + acc.KMIL) * item.coefficient).toFixed(numberOfDecimal));
          break;

        default:
          break;
      }

      return acc;
    },
    { TN: 0, K: 0, KMIL: 0, KESV: 0 }
  );
});

const computedITRTaxData = computed(() => {
  const numberOfDecimal = 2;

  return ITRTaxData.value.reduce(
    (acc, item) => {
      switch (item.key) {
        case 'T':
          acc.T = Number(parseFloat(item.coefficient * salariesOfITRTotal.value).toFixed(numberOfDecimal));
          break;
        case 'TN':
          acc.TN = Number(parseFloat((acc.T / item.coefficient.a) * item.coefficient.b).toFixed(numberOfDecimal));
          break;
        case 'K':
          acc.K = Number(parseFloat(salariesOfITRTotal.value - acc.T).toFixed(numberOfDecimal));
          break;
        case 'KMIL':
          acc.KMIL = Number(parseFloat(acc.K * item.coefficient).toFixed(numberOfDecimal));
          break;
        case 'KESV':
          acc.KESV = Number(parseFloat((acc.K + acc.KMIL) * item.coefficient).toFixed(numberOfDecimal));
          break;

        default:
          break;
      }

      return acc;
    },
    { TN: 0, K: 0, KMIL: 0, KESV: 0 }
  );
});

const getPercentOfTotal = (totalNumber) => {
  return (totalNumber / finalTotalPrice.value) * 100 || 0;
};

onBeforeMount(() => {
  MochDataService.getConsumables().then((data) => {
    consumablesData.value = data;
  });

  MochDataService.getHardware().then((data) => {
    hardwareData.value = data;
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

  MochDataService.getITRTaxData().then((data) => {
    ITRTaxData.value = data;
  });

  MochDataService.getITRData().then((data) => {
    ITRData.value = data;
  });

  MochDataService.getSpecificationData().then((data) => {
    specificationData.value = data;
  });
});

const finalTotalPrice = computed(() => {
  const totalPrice =
    (totalMetal.value +
      totalHardware.value +
      totalConsumables.value +
      taxTotal.value +
      taxITRTotal.value +
      galvanizedValue.value +
      transportValue.value +
      rentalCostPerDay.value * ITRWorkedDays.value +
      costOfElectricityPerDay.value * ITRWorkedDays.value) *
      profitabilityCoeficient.value +
    (totalMetal.value +
      totalHardware.value +
      totalConsumables.value +
      taxTotal.value +
      taxITRTotal.value +
      galvanizedValue.value +
      transportValue.value +
      rentalCostPerDay.value * ITRWorkedDays.value +
      costOfElectricityPerDay.value * ITRWorkedDays.value);

  return totalPrice;
});

function getTotalPrice(array) {
  return array.reduce((acc, item) => {
    if (item.price) {
      acc = acc + item.price;
    }

    return acc;
    // return acc + parseFloat(item.price.replaceAll(' ', '').replaceAll(',', '.'));
  }, 0);
}

const onUpload = async (e) => {
  const newFile = e.files[0];
  const arrayBuferFile = await newFile.arrayBuffer();
  const wb = XLS.read(arrayBuferFile);
  const sheet = wb.Sheets[wb.SheetNames[0]];

  let consumablesDataRes = [];
  let hardwareDataRes = [];
  let metalDataRes = [];
  let currentDataName = 'consumablesDataRes'; // 'hardwareDataRes' || 'metalDataRes'
  let countOfChanges = 0;

  XLS.utils.sheet_to_json(sheet).forEach((row) => {
    const formatedRow = {};

    Object.keys(row).forEach((key) => {
      formatedRow[key.trim()] = row[key];
    });

    if (!formatedRow['Наименование']) {
      if (countOfChanges === 1) {
        currentDataName = 'metalDataRes';
      } else {
        currentDataName = 'hardwareDataRes';
      }

      countOfChanges++;

      return;
    }

    switch (currentDataName) {
      case 'consumablesDataRes':
        consumablesDataRes.push({
          quantity: formatedRow['К-во'],
          name: formatedRow['Наименование'],
          price: formatedRow['Стоимость'],
          unitOfMeasurement: formatedRow['ед.изм.'],
          taxPrice: formatedRow['цена НДС'],
          order: formatedRow['№ п/п']
        });
        break;

      case 'hardwareDataRes':
        hardwareDataRes.push({
          quantity: formatedRow['К-во'],
          name: formatedRow['Наименование'],
          price: formatedRow['Стоимость'],
          unitOfMeasurement: formatedRow['ед.изм.'],
          taxPrice: formatedRow['цена НДС'],
          order: formatedRow['№ п/п']
        });
        break;
      case 'metalDataRes':
        metalDataRes.push({
          quantity: formatedRow['К-во'],
          name: formatedRow['Наименование'],
          price: formatedRow['Стоимость'],
          unitOfMeasurement: formatedRow['ед.изм.'],
          taxPrice: formatedRow['цена НДС'],
          order: formatedRow['№ п/п']
        });
        break;

      default:
        break;
    }
  });

  consumablesData.value = consumablesDataRes;
  hardwareData.value = hardwareDataRes;
  metalData.value = metalDataRes;
};

const uploadFile = () => {
  fileupload.value.upload();
};

const onCellEditComplete = (event) => {
  let { data, newValue, field } = event;

  switch (data.name) {
    case 'Оцинковка':
      galvanizedValue.value = Number(newValue);
      break;
    case 'Транспорт':
      transportValue.value = Number(newValue);
      break;

    default:
      break;
  }

  data[field] = newValue;
};

const showDialog = (key, flag = true) => {
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
  specificationData.value.push({
    id: (Math.random() * 1000).toFixed(),
    name: data.name,
    quantity: data.quantity,
    valuePerUnit: data.valuePerUnit,
    totalWeight: data.totalWeight
  });
};

const addNewSpecification = () => {
  specificationData.value.push({
    id: (Math.random() * 1000).toFixed(),
    name: null,
    quantity: null,
    valuePerUnit: null,
    totalWeight: null
  });
};

const confirmDeleteSpecification = (data) => {
  specificationData.value = specificationData.value.filter((item) => item.id !== data.id);
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

const changeSelectedItem = (event) => {
  console.log(event);
  newStaffData.value.name = event.value;
};

const showNewWorkerModal = () => {
  showDialog('createNewWorkerDialog');
};

const saveNewWorker = (worker) => {
  console.log('saveNewWorker', worker);

  switch (worker.role.key) {
    case 'worker':
      dropdownItemsWorkerStaff.value.push(worker.name);
      break;
    case 'ITR':
      dropdownItemsITR.value.push(worker.name);
      break;

    default:
      break;
  }

  showDialog('createNewWorkerDialog', false);
};

const formatNumber = (numberData) => {
  if (numberData && numberData.value) {
    return new Intl.NumberFormat('ru-RU').format(numberData.value);
  } else if (numberData) {
    return new Intl.NumberFormat('ru-RU').format(numberData);
  } else {
    return 0;
  }
};

const truncateDecimal = (num, decimalPlaces) => {
  const factor = Math.pow(10, decimalPlaces);
  return Math.trunc(num * factor) / factor;
};

watch(increaseInSalary, (newValue, oldValue) => {
  let increment = newValue > oldValue ? 5 : -5;

  // если меняется "increaseInSalary" - то должно меняться значение "salaryPerDay"
  workersData.value = workersData.value.map((item) => {
    const newPrice = Number(item.salaryPerDay) + Number(increment);

    return { ...item, salaryPerDay: newPrice };
  });
});
</script>

<template>
  <Fluid>
    <div class="card calculation-title z-50 sticky top-[60px] shadow-md">
      <div class="flex flex-row justify-between items-center gap-2">
        <div class="font-semibold text-[--primary-color] text-xl">
          <span>Название калькуляции:</span><span><InputText v-model="calculationData.title" type="text" /></span>
        </div>

        <div v-if="finalTotalPrice" class="font-semibold text-xl flex gap-4 items-center">
          <div class="flex flex-col gap-2">
            <div class="text-[--primary-color] max-w-[200px]">Итоговая сумма калькуляции:</div>
            <span>
              {{ formatNumber(truncateDecimal(finalTotalPrice, 1)) }}
            </span>
          </div>

          <div v-if="totalSpecificationItems" class="flex flex-col gap-2">
            <div class="text-[--primary-color]">На 1 ед:</div>
            <span>
              {{ formatNumber(truncateDecimal(finalTotalPrice / totalSpecificationItems, 1)) }}
            </span>
          </div>
        </div>

        <div class="font-semibold text-xl">
          <p class="text-[--primary-color]">Дата создания:</p>
          <p>{{ calculationData.dateOfCreation }}</p>
        </div>

        <div class="font-semibold text-xl">
          <p class="text-[--primary-color]">Дата последнего редактирования:</p>
          <p>{{ calculationData.lastEditDate }}</p>
        </div>
      </div>
    </div>

    <div class="flex flex-col">
      <div class="specification card h-full flex flex-col gap-4">
        <Accordion :value="['0']" multiple>
          <AccordionPanel value="0">
            <AccordionHeader><div class="font-semibold text-[--primary-color] text-xl">Спецификация</div></AccordionHeader>

            <AccordionContent>
              <DataTable :value="specificationData" editMode="cell" @cell-edit-complete="onCellEditComplete" showGridlines>
                <template #empty> Нет данных для отображения </template>

                <Column field="name" header="Наименование изделия" style="width: 25%">
                  <template #body="{ data }">
                    {{ data.name }}
                  </template>

                  <template #editor="{ data }">
                    <InputText v-model="data.name" type="text" />
                  </template>
                </Column>

                <Column field="quantity" header="Количество" style="width: 25%">
                  <template #body="{ data }">
                    {{ data.quantity }}
                  </template>

                  <template #editor="{ data }">
                    <InputText v-model="data.quantity" type="number" />
                  </template>
                </Column>

                <Column field="unitOfMeasurement" header="Единица измерения" style="width: 25%">
                  <template #body="{ data }">
                    {{ data.unitOfMeasurement }}
                  </template>

                  <template #editor="{ data }">
                    <Select
                      id="unitOfMeasurement"
                      v-model="data.unitOfMeasurement"
                      :options="dropdownItemsUnitOfMeasurement"
                      class="w-full"
                    ></Select>
                  </template>
                </Column>

                <Column field="valuePerUnit" header="Значение за одну единицу" style="width: 25%">
                  <template #body="{ data }">
                    {{ data.valuePerUnit }}
                  </template>

                  <template #editor="{ data }">
                    <InputText v-model="data.valuePerUnit" type="number" />
                  </template>
                </Column>

                <Column field="totalWeight" header="Общий вес" style="width: 25%">
                  <template #body="{ data }">
                    {{ Number(data.quantity * data.valuePerUnit).toFixed() }}
                  </template>
                </Column>

                <Column :exportable="false" style="min-width: 12rem">
                  <template #body="slotProps">
                    <Button icon="pi pi-copy" class="mr-2" outlined rounded severity="success" @click="copySpecification(slotProps.data)" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteSpecification(slotProps.data)" />
                  </template>
                </Column>

                <template #footer>
                  <div class="flex justify-center items-center text-[--primary-color] hover:cursor-pointer" @click="addNewSpecification">
                    добавить строку +
                  </div>

                  <div class="flex justify-end gap-4 w-full">
                    <div class="flex items-center">
                      Итого: &nbsp;<span class="font-bold text-lg"> {{ formatNumber(truncateDecimal(totalSpecificationItems, 4)) }}</span>
                    </div>
                  </div>
                </template>
              </DataTable>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>

      <div class="grid grid-cols-1fr-40 gap-4 mb-[2rem]">
        <div class="card subtotal mb-0">
          <div class="flex flex-row justify-between gap-2">
            <div class="font-semibold text-[--primary-color] text-xl">Подытог</div>
          </div>

          <DataTable :value="priceData" editMode="cell" @cell-edit-complete="onCellEditComplete" showGridlines>
            <template #empty> Нет данных для отображения </template>

            <Column field="name">
              <template #body="{ data }">
                <div>
                  {{ data.name }}
                </div>
              </template>
            </Column>

            <Column field="total" header="Общая">
              <template #body="{ data }">
                <div :class="{ 'text-[red]': data.key === 'total' }">
                  {{ formatNumber(data.total) }}
                </div>
              </template>

              <template #editor="{ data }">
                <InputText v-if="data.key === 'galvanizing'" v-model="data.total" type="number" />
                <InputText v-if="data.key === 'transport'" v-model="data.total" type="number" />
              </template>
            </Column>

            <Column field="perItem" header="На 1 единицу">
              <template #body="{ data }">
                {{ formatNumber(data.perItem) }}
              </template>
            </Column>

            <Column header="Статистика" class="progress_cell">
              <template #body="{ data }">
                <div v-if="data.key !== 'total'">
                  <ProgressBar
                    v-tooltip="`${parseFloat(data.statistics).toFixed()}%`"
                    :showValue="false"
                    :value="Number(parseFloat(data.statistics).toFixed())"
                    style="border-radius: 0; background-color: transparent; height: 40px"
                  ></ProgressBar>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>

        <div class="card final-statement">
          <div class="flex flex-row justify-between gap-2">
            <div class="font-semibold text-[--primary-color] text-xl">Итоговая ведомость</div>
          </div>

          <DataTable
            :value="finalPriceData"
            editMode="cell"
            @cell-edit-complete="onCellEditComplete"
            showGridlines
            :style="{ border: '2px solid green' }"
          >
            <template #empty> Нет данных для отображения </template>

            <Column field="name">
              <template #body="{ data }">
                <div :class="{ 'font-bold': data.key === 'total', 'text-lg': data.key === 'total' }">
                  {{ data.name }}
                </div>
              </template>
            </Column>

            <Column field="total" header="Общая">
              <template #body="{ data }">
                <div :class="{ 'font-bold': data.key === 'total', 'text-lg': data.key === 'total' }">
                  {{ formatNumber(truncateDecimal(Number(data.total), 1)) }}
                </div>
              </template>
            </Column>

            <Column field="perItem" header="На 1 единицу">
              <template #body="{ data }">
                <div :class="{ 'font-bold': data.key === 'total', 'text-lg': data.key === 'total' }">
                  {{ formatNumber(truncateDecimal(Number(data.perItem), 1)) }}
                </div>
              </template>
            </Column>

            <Column header="Статистика" class="progress_cell">
              <template #body="{ data }">
                <div v-if="data.key !== 'total'">
                  <ProgressBar
                    v-tooltip="`${parseFloat(data.statistics).toFixed()}%`"
                    :showValue="false"
                    :value="Number(parseFloat(data.statistics).toFixed())"
                    style="border-radius: 0; background-color: transparent; height: 40px"
                  ></ProgressBar>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <div class="card h-full flex flex-col gap-4">
        <div class="flex flex-row items-center justify-between gap-2">
          <div class="font-semibold text-[--primary-color] text-xl">Переменные</div>
        </div>

        <div class="flex flex-col gap-2 mb-4 w-[250px]">
          <div class="flex flex-row gap-2 items-center justify-between">
            <label for="rentalCostPerDay">Стоимость аренды в день:</label>
            <InputNumber v-model="rentalCostPerDay" inputId="rentalCostPerDay" class="max-w-[50px]" fluid />
          </div>

          <div class="flex flex-row gap-2 items-center justify-between">
            <label for="costOfElectricityPerDay">Стоимость эл. эн. в день:</label>
            <InputNumber v-model="costOfElectricityPerDay" inputId="costOfElectricityPerDay" class="max-w-[50px]" fluid />
          </div>

          <div class="flex flex-row gap-2 items-center justify-between">
            <label for="costOfElectricityPerDay">Коэффициент рентабельности:</label>
            <InputNumber
              v-model="profitabilityCoeficient"
              inputId="costOfElectricityPerDay"
              class="max-w-[50px]"
              :minFractionDigits="1"
              :maxFractionDigits="5"
              fluid
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1fr-40 gap-4 mb-[2rem]">
        <div class="shop">
          <div class="card h-full">
            <div class="flex flex-row items-center justify-between gap-2">
              <div class="font-semibold text-[--primary-color] text-xl">Цех</div>

              <div>
                <Button
                  label="Добавить сотрудника"
                  size="small"
                  icon="pi pi-plus"
                  severity="success"
                  class="mr-2 text-xs max-w-[100px]"
                  @click="showDialog('newStaffDialog')"
                />
                <Button
                  label="Удалить сотрудника"
                  size="small"
                  icon="pi pi-trash"
                  severity="danger"
                  class="mr-2 text-xs max-w-[100px]"
                  @click="confirmDeleteStaff()"
                  :disabled="!selectedStaff || !selectedStaff.length"
                />
              </div>
            </div>

            <div class="flex justify-between">
              <div class="flex flex-row gap-2 max-w-[250px] mb-4">
                <label for="numberOfHoursPerShift">Количество часов в смене</label>
                <InputNumber v-model="numberOfHoursPerShift" inputId="numberOfHoursPerShift" fluid />
              </div>

              <div class="flex flex-row gap-2 items-center">
                <label for="numberOfHoursPerShift">Увеличения ЗП</label>

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
              :value="workersData"
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
                  {{ formatNumber(truncateDecimal(data.salaryPerDay / numberOfHoursPerShift, 2)) }}
                </template>
              </Column>

              <Column field="total" header="Итого">
                <template #body="{ data }">
                  {{ formatNumber(truncateDecimal((data.salaryPerDay / numberOfHoursPerShift) * data.numberOfHoursWorked, 0)) }}
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
                    Итого: &nbsp;<span class="font-bold text-lg"> {{ formatNumber(salariesOfWorkersTotal) }}</span>
                  </div>
                </div>
              </template>
            </DataTable>

            <Dialog v-model:visible="newStaffDialog" :style="{ width: '450px' }" header="Выберте сотрудника" :modal="true">
              <div class="flex flex-col gap-6">
                <div>
                  <label for="name" class="block font-bold mb-3">Имя</label>
                  <SearchSelect
                    :dropdownItemsWorkerStaff="dropdownItemsWorkerStaff"
                    :value="newStaffData.name"
                    @change="changeSelectedItem"
                    @clickToHeader="showNewWorkerModal"
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
                <Button label="Cancel" icon="pi pi-times" text @click="newStaffDialog = false" />
                <Button
                  :disabled="!newStaffData.name.trim() || newStaffData.numberOfHoursWorked === null || newStaffData.salaryPerDay === null"
                  label="Сохранить"
                  icon="pi pi-check"
                  @click="saveNewStaff"
                />
              </template>
            </Dialog>
          </div>
        </div>

        <TaxCharges
          :computedTaxData="computedWorkerTaxData"
          :taxData="workersTaxData"
          :totalAmount="salariesOfWorkersTotal"
          :taxTotal="taxTotal"
          :formatNumber="formatNumber"
          :coeficientOfNDS="coeficientOfNDS"
          @changeCoeficient="(data) => (coeficientOfNDS = data.value)"
        />
      </div>

      <div class="grid grid-cols-1fr-40 gap-4 mb-[2rem]">
        <div class="ITR">
          <div class="card h-full">
            <div class="flex flex-row items-center justify-between gap-2 mb-4">
              <div class="font-semibold text-[--primary-color] text-xl">ИТР</div>

              <div class="">
                <Button
                  label="Добавить сотрудника"
                  size="small"
                  icon="pi pi-plus"
                  severity="success"
                  class="mr-2 text-xs max-w-[100px]"
                  @click="showDialog('newITRStaffDialog')"
                />
                <Button
                  label="Удалить сотрудника"
                  size="small"
                  icon="pi pi-trash"
                  severity="danger"
                  class="mr-2 text-xs max-w-[100px]"
                  @click="confirmDeleteITRStaff()"
                  :disabled="!selectedITRStaff || !selectedITRStaff.length"
                />
              </div>
            </div>

            <div class="flex gap-2 mb-4 items-center">
              <div class="flex flex-row gap-2 items-center">
                <label for="numberOfDaysPerShift">Количество дней в мес.</label>
                <InputNumber v-model="numberOfDaysPerShift" inputId="numberOfDaysPerShift" class="max-w-[50px]" fluid />
              </div>

              <div class="flex flex-row gap-2 items-center">
                <label for="numberOfDaysPerShift">Количество дней (трудозатраты)</label>
                <InputNumber v-model="ITRWorkedDays" inputId="numberOfDaysPerShift" class="max-w-[50px]" fluid />
              </div>
            </div>

            <DataTable
              :value="ITRData"
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
                  <Select id="staff" v-model="data.name" :options="dropdownItemsITR" class="w-full"></Select>
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
                  {{ formatNumber(truncateDecimal((data.salaryPerMonth / numberOfDaysPerShift) * ITRWorkedDays, 0)) }}
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

            <Dialog v-model:visible="newITRStaffDialog" :style="{ width: '450px' }" header="Выберте сотрудника" :modal="true">
              <div class="flex flex-col gap-6">
                <div>
                  <label for="name" class="block font-bold mb-3">Имя</label>
                  <Select id="staff" v-model="newITRStaffData.name" :options="dropdownItemsITR" class="w-full"></Select>
                </div>

                <div>
                  <label for="salaryPerMonth" class="block font-bold mb-3">ЗП в месяц</label>
                  <InputNumber v-model="newITRStaffData.salaryPerMonth" inputId="minmax" fluid />
                </div>
              </div>

              <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="newStaffDialog = false" />
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
          :computedTaxData="computedITRTaxData"
          :taxData="ITRTaxData"
          :totalAmount="salariesOfITRTotal"
          :taxTotal="taxITRTotal"
          :formatNumber="formatNumber"
          :coeficientOfNDS="coeficientOfNDS"
          @changeCoeficient="(data) => (coeficientOfNDS = data.value)"
        />
      </div>

      <div class="card total-costs">
        <div class="flex flex-row justify-between gap-2">
          <div class="font-semibold text-[--primary-color] text-xl">Общие затраты</div>

          <div class="flex gap-6 items-center justify-center">
            <FileUpload
              ref="fileupload"
              mode="basic"
              name="demo[]"
              accept=".xlsx"
              chooseLabel="Выберите файл"
              customUpload
              @uploader="onUpload"
            />
            <Button label="Импортировать" @click="uploadFile" severity="secondary" />
          </div>
        </div>

        <Accordion multiple>
          <AccordionPanel value="0">
            <AccordionHeader>Расходники</AccordionHeader>

            <AccordionContent>
              <DataTable :value="consumablesData" dataKey="order" :rowHover="true" showGridlines>
                <template #empty> Нет данных для отображения </template>

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
                    Итого: &nbsp;<span class="text-lg">{{ formatNumber(totalConsumables) }}</span>
                  </div>
                </template>
              </DataTable>
            </AccordionContent>
          </AccordionPanel>

          <AccordionPanel value="1">
            <AccordionHeader>Метизы</AccordionHeader>

            <AccordionContent>
              <DataTable :value="hardwareData" dataKey="order" :rowHover="true" showGridlines>
                <template #empty> Нет данных для отображения </template>

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
                    Итого: &nbsp;<span class="text-lg">{{ formatNumber(totalHardware) }}</span>
                  </div>
                </template>
              </DataTable>
            </AccordionContent>
          </AccordionPanel>

          <AccordionPanel value="2">
            <AccordionHeader>Металл</AccordionHeader>

            <AccordionContent>
              <DataTable :value="metalData" dataKey="order" :rowHover="true" showGridlines>
                <template #empty> Нет данных для отображения </template>

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
                    Итого: &nbsp;<span class="text-lg">{{ formatNumber(totalMetal) }}</span>
                  </div>
                </template>
              </DataTable>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
    </div>

    <Dialog v-model:visible="createNewWorkerDialog" header="Новый сотрудник" :style="{ width: '450px' }" modal>
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-3">Имя</label>
          <InputText v-model="newWorkerData.name" type="text" />
        </div>

        <div>
          <label for="lastname" class="block font-bold mb-3">Фамилия</label>
          <InputText v-model="newWorkerData.lastname" type="text" />
        </div>

        <div>
          <label for="numberOfHoursWorked" class="block font-bold mb-3">Должность</label>
          <Select id="role" v-model="newWorkerData.role" :options="dropdownItemsWorkersRole" class="w-full">
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
        <Button label="Cancel" icon="pi pi-times" text @click="createNewWorkerDialog = false" />
        <Button :disabled="!newWorkerData.name.trim()" label="Сохранить" icon="pi pi-check" @click="saveNewWorker(newWorkerData)" />
      </template>
    </Dialog>
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
