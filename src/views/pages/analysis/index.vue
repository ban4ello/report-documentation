<script setup>
import { onBeforeMount } from 'vue';
import { useAnalysis } from '@/composables/useAnalysis';
import AnalysisTable from '@/components/analysis/AnalysisTable.vue';
import WorkersSalaryTable from '@/components/analysis/WorkersSalaryTable.vue';
import DateFilter from '@/components/analysis/DateFilter.vue';

const {
  loading,
  isShowAllYear,
  isShowAllYearAnalysis,
  analysisTableFilter,
  workersSalaryFilter,
  calculationsData,
  filteredCalculationsData,
  workersSalary,
  loadCalculations,
  setFilterForAnalysisTable,
  setWorkersFilter
} = useAnalysis();

onBeforeMount(async () => {
  await loadCalculations();
});
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
  </Fluid>
</template>
