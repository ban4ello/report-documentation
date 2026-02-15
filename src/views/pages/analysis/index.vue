<script setup>
import { onBeforeMount, watch } from 'vue';
import { useAnalysis } from '@/composables/useAnalysis';
import AnalysisTable from '@/components/analysis/AnalysisTable.vue';
import WorkersSalaryTable from '@/components/analysis/WorkersSalaryTable.vue';
import ITRSalaryTable from '@/components/analysis/ITRSalaryTable.vue';
import DateFilter from '@/components/analysis/DateFilter.vue';
import StatisticsCharts from '@/components/analysis/StatisticsCharts.vue';

const {
  loading,
  isShowAllYear,
  isShowAllYearAnalysis,
  isShowAllYearITR,
  analysisTableFilter,
  workersSalaryFilter,
  itrSalaryFilter,
  calculationsData,
  filteredCalculationsData,
  filteredCalculationsDataForITR,
  workersSalary,
  itrSalary,
  loadCalculations,
  setFilterForAnalysisTable,
  setWorkersFilter,
  setITRFilter,
  statisticsYear,
  availableYears,
  statisticsCalculationsByYear
} = useAnalysis();

onBeforeMount(async () => {
  await loadCalculations();
});

// Устанавливаем первый доступный год после загрузки, если выбранный год не в списке
watch(
  availableYears,
  (years) => {
    if (years.length > 0 && !years.includes(statisticsYear.value)) {
      statisticsYear.value = years[0];
    }
  },
  { immediate: true }
);
</script>

<template>
  <div v-if="loading" class="card flex justify-center items-center h-[100vh] fixed top-0 left-0 right-0 z-9999 opacity-60">
    <ProgressSpinner />
  </div>

  <Fluid>
    <div class="card">
      <div class="flex gap-4 justify-between">
        <div class="font-semibold text-[--primary-color] text-xl mb-4">Анализ</div>

        <DateFilter
          :modelValue="analysisTableFilter.selectedMonth"
          v-model:showAllYear="isShowAllYearAnalysis"
          @dateChange="setFilterForAnalysisTable"
        />
      </div>

      <AnalysisTable :calculationsData="calculationsData" />
    </div>

    <div class="card">
      <div class="flex gap-4 justify-between">
        <div class="font-semibold text-[--primary-color] text-xl mb-4">ЗП Цех</div>

        <DateFilter :modelValue="workersSalaryFilter.selectedMonth" v-model:showAllYear="isShowAllYear" @dateChange="setWorkersFilter" />
      </div>

      <WorkersSalaryTable :workersSalary="workersSalary" :filteredCalculationsData="filteredCalculationsData" />
    </div>

    <div class="card">
      <div class="flex gap-4 justify-between">
        <div class="font-semibold text-[--primary-color] text-xl mb-4">ЗП ИТР</div>

        <DateFilter :modelValue="itrSalaryFilter.selectedMonth" v-model:showAllYear="isShowAllYearITR" @dateChange="setITRFilter" />
      </div>

      <ITRSalaryTable :itrSalary="itrSalary" :filteredCalculationsData="filteredCalculationsDataForITR" />
    </div>

    <div class="card">
      <div class="flex gap-4 justify-between items-center mb-4">
        <div class="font-semibold text-[--primary-color] text-xl">Статистика</div>
        <div class="flex gap-4 items-center">
          <span>Год:</span>
          <Select v-model="statisticsYear" :options="availableYears" placeholder="Выберите год" style="min-width: 120px" />
        </div>
      </div>
      <StatisticsCharts :statistics-calculations-by-year="statisticsCalculationsByYear" :statistics-year="statisticsYear" />
    </div>
  </Fluid>
</template>
