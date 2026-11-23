<script setup>
import ApiService from '@/service/ApiService';
import { MochDataService } from '@/service/MochDataService';
import { MONTH } from '@/utils/constants.js';
import { computed, nextTick, onBeforeMount, ref, watch } from 'vue';
// import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
// const toast = useToast();
const dropdownItemsParentCalculations = ref([]);
const expandedRows = ref([]);

watch(
  expandedRows,
  (newValue) => {
    localStorage.setItem('calculationTableExpanded', JSON.stringify(newValue));
  },
  { deep: true }
);

const calculationPlanId = ref(null);
const loading = ref(false);

let calculationsData = ref([]);
const confirm = useConfirm();

const ALL_YEARS = 'all';
const ALL_MONTHS = 'all';
const VALID_TYPES = new Set(['all', 'has_fact', 'plan_only']);

const queryParam = (value) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const parseYearFromQuery = (value) => {
  const raw = queryParam(value);
  if (raw == null || raw === '' || raw === ALL_YEARS) return ALL_YEARS;
  const year = Number(raw);
  return Number.isInteger(year) && year > 1900 ? year : ALL_YEARS;
};

const parseMonthFromQuery = (value) => {
  const raw = queryParam(value);
  if (raw == null || raw === '' || raw === ALL_MONTHS) return ALL_MONTHS;
  const month = Number(raw);
  // URL uses 1-12 for readability
  if (Number.isInteger(month) && month >= 1 && month <= 12) return month - 1;
  return ALL_MONTHS;
};

const parseTypeFromQuery = (value) => {
  const raw = queryParam(value);
  return VALID_TYPES.has(raw) ? raw : 'all';
};

const searchQuery = ref(typeof queryParam(route.query.q) === 'string' ? queryParam(route.query.q) : '');
const selectedYear = ref(parseYearFromQuery(route.query.year));
const selectedMonth = ref(
  parseYearFromQuery(route.query.year) === ALL_YEARS ? ALL_MONTHS : parseMonthFromQuery(route.query.month)
);
const typeFilter = ref(parseTypeFromQuery(route.query.type));

const typeFilterOptions = [
  { label: 'Все типы', value: 'all' },
  { label: 'Есть факт', value: 'has_fact' },
  { label: 'Только план', value: 'plan_only' }
];

const monthOptions = [{ label: 'Весь год', value: ALL_MONTHS }, ...MONTH.map((label, index) => ({ label, value: index }))];

const parseCreationDate = (item) => {
  if (!item?.dateOfCreation) return null;
  const createdAt = new Date(item.dateOfCreation);
  return Number.isNaN(createdAt.getTime()) ? null : createdAt;
};

const yearOptions = computed(() => {
  const years = new Set();
  calculationsData.value.forEach((item) => {
    const createdAt = parseCreationDate(item);
    if (createdAt) years.add(createdAt.getFullYear());
  });

  return [
    { label: 'Все годы', value: ALL_YEARS },
    ...[...years].sort((a, b) => b - a).map((year) => ({ label: String(year), value: year }))
  ];
});

const isMonthFilterDisabled = computed(() => selectedYear.value === ALL_YEARS);

watch(selectedYear, (year) => {
  if (year === ALL_YEARS) {
    selectedMonth.value = ALL_MONTHS;
  }
});

const matchesDateFilter = (item) => {
  if (selectedYear.value === ALL_YEARS) return true;

  const createdAt = parseCreationDate(item);
  if (!createdAt) return false;

  if (createdAt.getFullYear() !== selectedYear.value) return false;
  if (selectedMonth.value === ALL_MONTHS) return true;

  return createdAt.getMonth() === selectedMonth.value;
};

const matchesSearch = (item) => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return true;

  const parentTitle = (item.title || '').toLowerCase();
  if (parentTitle.includes(query)) return true;

  const children = item.calculations || item.childrens || [];
  return children.some((child) => (child.title || '').toLowerCase().includes(query));
};

const matchesTypeFilter = (item) => {
  if (typeFilter.value === 'all') return true;

  const children = item.calculations || item.childrens || [];
  const hasFact = children.some((child) => (child.calculationType || child.calculation_type) === 'fact');

  if (typeFilter.value === 'has_fact') return hasFact;
  if (typeFilter.value === 'plan_only') return !hasFact;
  return true;
};

const filteredCalculationsData = computed(() => {
  return calculationsData.value.filter((item) => matchesDateFilter(item) && matchesSearch(item) && matchesTypeFilter(item));
});

const hasActiveFilters = computed(() => {
  return Boolean(searchQuery.value.trim()) || selectedYear.value !== ALL_YEARS || typeFilter.value !== 'all';
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedYear.value = ALL_YEARS;
  selectedMonth.value = ALL_MONTHS;
  typeFilter.value = 'all';
};

const buildQueryFromFilters = () => {
  const query = {};
  const q = searchQuery.value.trim();
  if (q) query.q = q;
  if (selectedYear.value !== ALL_YEARS) query.year = String(selectedYear.value);
  if (selectedYear.value !== ALL_YEARS && selectedMonth.value !== ALL_MONTHS) {
    query.month = String(selectedMonth.value + 1);
  }
  if (typeFilter.value !== 'all') query.type = typeFilter.value;
  return query;
};

const queriesEqual = (a, b) => {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const key of keys) {
    if (String(queryParam(a?.[key]) ?? '') !== String(queryParam(b?.[key]) ?? '')) return false;
  }
  return true;
};

let syncingFromRoute = false;
let syncToRouteTimer = null;

const syncFiltersToRoute = () => {
  if (syncingFromRoute) return;

  clearTimeout(syncToRouteTimer);
  syncToRouteTimer = setTimeout(() => {
    if (syncingFromRoute) return;
    const nextQuery = buildQueryFromFilters();
    if (queriesEqual(route.query, nextQuery)) return;
    router.replace({ query: nextQuery });
  }, 200);
};

const applyFiltersFromQuery = (query) => {
  const nextSearch = typeof queryParam(query.q) === 'string' ? queryParam(query.q) : '';
  const nextYear = parseYearFromQuery(query.year);
  const nextMonth = nextYear === ALL_YEARS ? ALL_MONTHS : parseMonthFromQuery(query.month);
  const nextType = parseTypeFromQuery(query.type);

  if (searchQuery.value !== nextSearch) searchQuery.value = nextSearch;
  if (selectedYear.value !== nextYear) selectedYear.value = nextYear;
  if (selectedMonth.value !== nextMonth) selectedMonth.value = nextMonth;
  if (typeFilter.value !== nextType) typeFilter.value = nextType;
};

watch([searchQuery, selectedYear, selectedMonth, typeFilter], syncFiltersToRoute);

watch(
  () => route.query,
  (query) => {
    if (queriesEqual(query, buildQueryFromFilters())) return;

    syncingFromRoute = true;
    applyFiltersFromQuery(query);
    nextTick(() => {
      syncingFromRoute = false;
    });
  }
);

const confirmDeleteEntity = async (data, typeOfEntity = 'parent-calculation') => {
  confirm.require({
    message: 'Вы действительно хотите удалить эту запись?',
    header: 'Внимание!',
    icon: 'pi pi-info-circle',
    rejectLabel: 'Отменить',
    rejectProps: {
      label: 'Отменить',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Удалить',
      severity: 'danger'
    },
    accept: async () => {
      loading.value = true;

      try {
        switch (typeOfEntity) {
          case 'parent-calculation':
            calculationsData.value = calculationsData.value.filter((item) => item.id !== data.id);
            await ApiService.deleteItemFromParentCalculation(data.id);

            break;
          case 'calculation':
            calculationsData.value = calculationsData.value.map((item) => {
              return {
                ...item,
                childrens: item.childrens ? item.childrens.filter((children) => children.id !== data.id) : undefined,
                calculations: item.calculations ? item.calculations.filter((child) => child.id !== data.id) : undefined
              };
            });
            await ApiService.deleteCalculation(data.id);

            break;
        }
      } catch (error) {
        console.log(error);
      } finally {
        loading.value = false;
      }
    }
  });
};

onBeforeMount(() => {
  MochDataService.getCalculationsData().then((data) => {
    dropdownItemsParentCalculations.value = data.map((item) => item.name);
  });

  ApiService.getParentCalculations().then((res) => {
    const camelize = (s) => s.replace(/_./g, (x) => x[1].toUpperCase());
    const camelizeData = res.data.map((item) => {
      return Object.keys(item).reduce((acc, key) => {
        acc[camelize(key)] = item[key];

        return acc;
      }, {});
    });

    calculationsData.value = camelizeData;

    const savedExpandedItems = localStorage.getItem('calculationTableExpanded');
    if (savedExpandedItems) {
      expandedRows.value = JSON.parse(savedExpandedItems);

      const expandedKeys = Object.keys(JSON.parse(savedExpandedItems));
      for (let i = 0; i < expandedKeys.length; i++) {
        expandRowAction(expandedKeys[i]);
      }
    }
  });
});

const expandRowAction = (rowId) => {
  try {
    ApiService.getParentCalculationChildren(rowId).then((res) => {
      // When response has no children, remove this row from expanded state so calculationTableExpanded (localStorage) stays in sync
      if (!res.data || res.data.length === 0) {
        const key = String(rowId);
        if (
          expandedRows.value &&
          typeof expandedRows.value === 'object' &&
          !Array.isArray(expandedRows.value) &&
          key in expandedRows.value
        ) {
          const next = { ...expandedRows.value };
          delete next[key];
          expandedRows.value = next;
        }
        return;
      }

      const updatedData = JSON.parse(JSON.stringify(calculationsData.value));
      calculationPlanId.value = res.data.filter((item) => item.calculation_type === 'plan')[0].id;

      const camelize = (s) => s.replace(/_./g, (x) => x[1].toUpperCase());
      const camelizeData = res.data.map((item) => {
        return Object.keys(item).reduce((acc, key) => {
          acc[camelize(key)] = item[key];

          return acc;
        }, {});
      });

      calculationsData.value = updatedData.map((item) => {
        if (Number(item.id) === Number(rowId)) {
          item.childrens = camelizeData;
        }

        return item;
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const copyParentCalculation = async (data) => {
  loading.value = true;

  try {
    const response = await ApiService.cloneParentCalculation(data.id);
    calculationsData.value.push(response.data);
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="loading" class="card flex justify-center items-center h-[100vh] fixed top-0 left-0 right-0 z-9999 opacity-60">
    <ProgressSpinner />
  </div>
  <Fluid>
    <div class="card">
      <div class="flex gap-4 justify-between">
        <div class="font-semibold text-[--primary-color] text-xl mb-4">Калькуляции</div>

        <div
          class="font-semibold hover:text-[--primary-color] hover:cursor-pointer text-xl mb-4"
          @click="router.push({ path: '/calculations/create' })"
        >
          создать новую калькуляцию-план +
        </div>
      </div>

      <div class="calculations-filters mb-4">
        <div class="flex flex-wrap gap-3 items-end">
          <div class="filter-field filter-field--search">
            <label for="calculations-search">Поиск</label>
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText id="calculations-search" v-model="searchQuery" placeholder="Название калькуляции..." class="w-full" />
            </IconField>
          </div>

          <div class="filter-field">
            <label for="calculations-year">Год</label>
            <Select
              id="calculations-year"
              v-model="selectedYear"
              :options="yearOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Все годы"
              class="w-full"
            />
          </div>

          <div class="filter-field">
            <label for="calculations-month">Месяц</label>
            <Select
              id="calculations-month"
              v-model="selectedMonth"
              :options="monthOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Весь год"
              :disabled="isMonthFilterDisabled"
              class="w-full"
            />
          </div>

          <div class="filter-field">
            <label for="calculations-type">Тип</label>
            <Select
              id="calculations-type"
              v-model="typeFilter"
              :options="typeFilterOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>

          <Button
            v-if="hasActiveFilters"
            label="Сбросить"
            icon="pi pi-filter-slash"
            severity="secondary"
            outlined
            class="filter-reset"
            @click="resetFilters"
          />
        </div>

        <div class="text-sm text-surface-500 mt-3">
          Показано {{ filteredCalculationsData.length }} из {{ calculationsData.length }}
        </div>
      </div>
      <!-- :paginator="true" -->

      <DataTable
        v-model:expandedRows="expandedRows"
        :value="filteredCalculationsData"
        :rows="10"
        :rowHover="true"
        dataKey="id"
        sortField="dateOfCreation"
        :sortOrder="-1"
        @row-expand="(row) => expandRowAction(row.data.id)"
      >
        <template #empty>
          {{ hasActiveFilters ? 'Ничего не найдено по текущим фильтрам' : 'Нет данных для отображения' }}
        </template>

        <template #loading> Загружается список... Пожалуйста подождите. </template>

        <Column expander style="width: 5rem" />

        <Column field="title" header="Название" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.title }}
          </template>
        </Column>

        <Column field="dateOfCreation" header="Дата создания" sortable dataType="date" style="min-width: 12rem">
          <template #body="{ data }">
            {{ new Date(data.dateOfCreation).toLocaleDateString() }}
          </template>
        </Column>

        <Column :exportable="false">
          <template #body="slotProps">
            <Button icon="pi pi-copy" class="mr-2" outlined rounded severity="success" @click="copyParentCalculation(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteEntity(slotProps.data)" />
          </template>
        </Column>

        <template #expansion="slotProps">
          <DataTable showGridlines :value="slotProps.data.childrens" class="shadow-md" sortField="calculationType" :sortOrder="-1">
            <Column field="title" header="Название" sortable style="min-width: 12rem">
              <template #body="{ data }">
                <div
                  class="hover:text-[--primary-color] hover:cursor-pointer"
                  @click="router.push({ path: `/calculations/${data.id}`, query: { parentId: slotProps.data.id, type: data.type } })"
                >
                  {{ data.title }}
                </div>
              </template>
            </Column>

            <Column field="dateOfCreation" header="Дата создания" sortable style="min-width: 12rem">
              <template #body="{ data }">
                {{ new Date(data.dateOfCreation).toLocaleDateString() }}
              </template>
            </Column>

            <Column field="calculationType" header="Вид калькуляции" sortable style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.calculationType === 'plan' ? 'План' : 'Факт' }}
              </template>
            </Column>

            <Column :exportable="false" style="min-width: 12rem">
              <template #body="{ data }">
                <div>
                  <!-- <Button icon="pi pi-copy" class="mr-2" outlined rounded severity="success" /> -->
                  <Button
                    v-if="data.calculationType === 'fact'"
                    icon="pi pi-trash"
                    outlined
                    rounded
                    severity="danger"
                    @click="confirmDeleteEntity(data, 'calculation')"
                  />
                </div>
              </template>
            </Column>

            <template #footer>
              <div
                class="flex justify-center items-center text-[--primary-color] hover:cursor-pointer"
                @click="
                  router.push({ path: '/calculations/create', query: { parentId: slotProps.data.id, type: 'fact', calculationPlanId } })
                "
              >
                добавить калькуляцию-факт +
              </div>
            </template>
          </DataTable>
        </template>
      </DataTable>
    </div>

    <ConfirmDialog></ConfirmDialog>
  </Fluid>
</template>

<style scoped lang="scss">
.calculations-filters {
  .filter-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    width: 11rem;
    flex: 0 0 11rem;

    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--p-text-muted-color, #64748b);
    }

    &--search {
      width: auto;
      flex: 1 1 18rem;
      min-width: 16rem;
      max-width: 28rem;
    }
  }

  .filter-reset {
    width: auto !important;
    flex: 0 0 auto;
    align-self: flex-end;
  }
}

:deep(.p-datatable-frozen-tbody) {
  font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
  font-weight: bold;
}
</style>
