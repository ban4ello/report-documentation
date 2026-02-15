<script setup>
import { computed } from 'vue';
import Chart from 'primevue/chart';

const props = defineProps({
  statisticsCalculationsByYear: {
    type: Array,
    default: () => []
  },
  statisticsYear: {
    type: Number,
    required: true
  }
});

// ЗП по каждому работнику Цех (те же данные, что в таблице секции "ЗП Цех")
// Формула: (worker.salaryPerDay / item.numberOfHoursPerShift) * worker.numberOfHoursWorked
const workersSalaryForChart = computed(() => {
  const allSalaryAccruals = props.statisticsCalculationsByYear.reduce((acc, item) => {
    if (!item.workersData?.table) return acc;
    item.workersData.table.forEach((worker, workerIndex) => {
      const salary = (worker.salaryPerDay / item.numberOfHoursPerShift) * worker.numberOfHoursWorked;
      acc.push({
        order: item.title,
        workerName: item.workersData.table[workerIndex].name,
        salary,
        id: worker.id
      });
    });
    return acc;
  }, []);

  const byWorker = allSalaryAccruals.reduce((acc, item) => {
    if (acc[item.workerName]) {
      acc[item.workerName] += item.salary;
    } else {
      acc[item.workerName] = item.salary;
    }
    return acc;
  }, {});

  return Object.entries(byWorker).map(([name, totalSalary]) => ({ name, totalSalary }));
});

const workersChartData = computed(() => ({
  labels: workersSalaryForChart.value.map((w) => w.name),
  datasets: [
    {
      label: 'ЗП за год',
      data: workersSalaryForChart.value.map((w) => w.totalSalary),
      backgroundColor: 'rgba(34, 197, 94, 0.6)',
      borderColor: 'rgb(34, 197, 94)',
      borderWidth: 1
    }
  ]
}));

// ЗП по каждому работнику ИТР (те же данные, что в таблице секции "ЗП ИТР")
// Формула: (itr.salaryPerMonth / item.numberOfDaysPerShift) * item.itrWorkedDays
const itrSalaryForChart = computed(() => {
  const allSalaryAccruals = props.statisticsCalculationsByYear.reduce((acc, item) => {
    if (!item.itrData?.table) return acc;
    item.itrData.table.forEach((itr) => {
      const salary = (itr.salaryPerMonth / item.numberOfDaysPerShift) * item.itrWorkedDays;
      acc.push({
        order: item.title,
        itrName: itr.name,
        salary,
        id: itr.id
      });
    });
    return acc;
  }, []);

  const byWorker = allSalaryAccruals.reduce((acc, item) => {
    if (acc[item.itrName]) {
      acc[item.itrName] += item.salary;
    } else {
      acc[item.itrName] = item.salary;
    }
    return acc;
  }, {});

  return Object.entries(byWorker).map(([name, totalSalary]) => ({ name, totalSalary }));
});

const itrChartData = computed(() => ({
  labels: itrSalaryForChart.value.map((w) => w.name),
  datasets: [
    {
      label: 'ЗП за год',
      data: itrSalaryForChart.value.map((w) => w.totalSalary),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }
  ]
}));

// Калькуляций-факт за год (все, отсортированы по стоимости по убыванию)
const calculationsFactForChart = computed(() => {
  return [...props.statisticsCalculationsByYear].filter((item) => item.total != null && item.total > 0).sort((a, b) => b.total - a.total);
});

const calculationsFactChartData = computed(() => ({
  labels: calculationsFactForChart.value.map((item) => (item.title.length > 25 ? item.title.slice(0, 25) + '...' : item.title)),
  datasets: [
    {
      label: 'Стоимость (Итого)',
      data: calculationsFactForChart.value.map((item) => item.total),
      backgroundColor: 'rgba(168, 85, 247, 0.6)',
      borderColor: 'rgb(168, 85, 247)',
      borderWidth: 1
    }
  ]
}));

// Общие опции для вертикальных bar-графиков
const verticalBarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          return new Intl.NumberFormat('ru-RU').format(context.raw);
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="card">
      <h4 class="font-semibold text-[--primary-color] text-lg mb-4">ЗП Цех по работникам за {{ statisticsYear }} год</h4>
      <div class="h-[300px]">
        <Chart v-if="workersSalaryForChart.length > 0" type="bar" :data="workersChartData" :options="verticalBarChartOptions" />
        <div v-else class="flex items-center justify-center h-full text-gray-500">Нет данных за выбранный год</div>
      </div>
    </div>

    <div class="card">
      <h4 class="font-semibold text-[--primary-color] text-lg mb-4">ЗП ИТР по работникам за {{ statisticsYear }} год</h4>
      <div class="h-[300px]">
        <Chart v-if="itrSalaryForChart.length > 0" type="bar" :data="itrChartData" :options="verticalBarChartOptions" />
        <div v-else class="flex items-center justify-center h-full text-gray-500">Нет данных за выбранный год</div>
      </div>
    </div>

    <div class="card">
      <h4 class="font-semibold text-[--primary-color] text-lg mb-4">Калькуляций-факт за {{ statisticsYear }} год</h4>
      <div class="h-[300px]">
        <Chart v-if="calculationsFactForChart.length > 0" type="bar" :data="calculationsFactChartData" :options="verticalBarChartOptions" />
        <div v-else class="flex items-center justify-center h-full text-gray-500">Нет данных за выбранный год</div>
      </div>
    </div>
  </div>
</template>
