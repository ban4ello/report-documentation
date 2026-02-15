<script setup>
import ApiService from '@/service/ApiService';
import { onBeforeMount, ref, computed, watch } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

const templates = ref([]);
const workersList = ref([]);
const loading = ref(false);
const templateDialogVisible = ref(false);
const isCreateMode = ref(true);
const editingTemplate = ref(null);

const templateTitle = ref('');
const templateType = ref('workers');
const workersTable = ref([]);
const itrTable = ref([]);

const confirm = useConfirm();
const toast = useToast();

const templateTypeOptions = [
  { label: 'ЦЕХ', value: 'workers' },
  { label: 'ИТР', value: 'itr' }
];

const camelize = (s) => s.replace(/_./g, (x) => x[1].toUpperCase());

const loadTemplates = async () => {
  loading.value = true;
  try {
    const response = await ApiService.getTemplates();
    templates.value = (response.data || []).map((item) => {
      const t = typeof item === 'object' && item !== null
        ? Object.keys(item).reduce((acc, key) => {
            acc[camelize(key)] = item[key];
            return acc;
          }, {})
        : item;
      return t;
    });
  } catch (error) {
    console.error('Ошибка при загрузке шаблонов:', error);
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось загрузить шаблоны',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const templateTypeLabel = (type) => {
  const opt = templateTypeOptions.find((o) => o.value === type);
  return opt ? opt.label : type;
};

const openCreateDialog = async () => {
  await loadWorkers();
  isCreateMode.value = true;
  editingTemplate.value = null;
  templateTitle.value = '';
  templateType.value = 'workers';
  workersTable.value = [{ id: genId(), name: '', numberOfHoursWorked: null, salaryPerDay: null, salaryPerHour: null, total: null }];
  itrTable.value = [];
  templateDialogVisible.value = true;
};

const openEditDialog = async (template) => {
  await loadWorkers();
  isCreateMode.value = false;
  editingTemplate.value = template;
  templateTitle.value = template.title || '';
  templateType.value = template.templateType === 'workers' || template.templateType === 'itr' ? template.templateType : 'workers';

  if (template.templateType === 'workers' && template.workersData?.length) {
    workersTable.value = template.workersData.map((row) => ({
      id: row.id ?? genId(),
      name: row.name ?? '',
      numberOfHoursWorked: row.numberOfHoursWorked ?? null,
      salaryPerDay: row.salaryPerDay ?? null,
      salaryPerHour: row.salaryPerHour ?? null,
      total: row.total ?? null
    }));
  } else {
    workersTable.value = [];
  }

  if (template.templateType === 'itr' && template.itrData?.length) {
    itrTable.value = template.itrData.map((row) => ({
      id: row.id ?? genId(),
      name: row.name ?? '',
      salaryPerMonth: row.salaryPerMonth ?? null
    }));
  } else {
    itrTable.value = [];
  }

  templateDialogVisible.value = true;
};

const genId = () => Number((Math.random() * 10000).toFixed(0));

watch(templateType, (newVal) => {
  if (!newVal) return;
  if (newVal === 'workers') {
    itrTable.value = [];
    if (workersTable.value.length === 0) {
      workersTable.value = [{ id: genId(), name: '', numberOfHoursWorked: null, salaryPerDay: null, salaryPerHour: null, total: null }];
    }
  } else {
    workersTable.value = [];
    if (itrTable.value.length === 0) {
      itrTable.value = [{ id: genId(), name: '', salaryPerMonth: null }];
    }
  }
});

const isWorkersType = computed(() => templateType.value === 'workers');
const isItrType = computed(() => templateType.value === 'itr');

const loadWorkers = async () => {
  try {
    const response = await ApiService.getWorkers();
    const list = response.data || [];
    workersList.value = list.map((item) =>
      Object.keys(item).reduce((acc, key) => {
        acc[camelize(key)] = item[key];
        return acc;
      }, {})
    );
  } catch (error) {
    console.error('Ошибка при загрузке сотрудников:', error);
  }
};

const workerNamesForShop = computed(() =>
  workersList.value.filter((w) => w.position === 'worker').map((w) => w.name).filter(Boolean)
);
const workerNamesForItr = computed(() =>
  workersList.value.filter((w) => w.position === 'itr').map((w) => w.name).filter(Boolean)
);

const addWorkersRow = () => {
  workersTable.value.push({
    id: genId(),
    name: '',
    numberOfHoursWorked: null,
    salaryPerDay: null,
    salaryPerHour: null,
    total: null
  });
};

const copyWorkersRow = (row) => {
  workersTable.value.push({
    id: genId(),
    name: row.name ?? '',
    numberOfHoursWorked: row.numberOfHoursWorked ?? null,
    salaryPerDay: row.salaryPerDay ?? null,
    salaryPerHour: null,
    total: null
  });
};

const deleteWorkersRow = (row) => {
  workersTable.value = workersTable.value.filter((r) => r.id !== row.id);
};

const addItrRow = () => {
  itrTable.value.push({ id: genId(), name: '', salaryPerMonth: null });
};

const copyItrRow = (row) => {
  itrTable.value.push({
    id: genId(),
    name: row.name ?? '',
    salaryPerMonth: row.salaryPerMonth ?? null
  });
};

const deleteItrRow = (row) => {
  itrTable.value = itrTable.value.filter((r) => r.id !== row.id);
};

const saveTemplate = async () => {
  const type = templateType.value;
  if (!templateTitle.value?.trim() || !type) {
    toast.add({
      severity: 'warn',
      summary: 'Внимание',
      detail: 'Заполните название и тип шаблона',
      life: 3000
    });
    return;
  }

  if (type === 'workers') {
    const valid = workersTable.value.filter((r) => r.name?.trim());
    if (valid.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Внимание',
        detail: 'Добавьте хотя бы одну строку с именем сотрудника',
        life: 3000
      });
      return;
    }
  } else {
    const valid = itrTable.value.filter((r) => r.name?.trim());
    if (valid.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Внимание',
        detail: 'Добавьте хотя бы одну строку с именем сотрудника',
        life: 3000
      });
      return;
    }
  }

  loading.value = true;
  try {
    const workersData =
      type === 'workers'
        ? workersTable.value.map((r) => ({
            name: r.name ?? null,
            numberOfHoursWorked: r.numberOfHoursWorked ?? null,
            salaryPerDay: r.salaryPerDay ?? null,
            salaryPerHour: r.salaryPerHour ?? null,
            total: r.total ?? null
          }))
        : undefined;
    const itrData =
      type === 'itr'
        ? itrTable.value.map((r) => ({
            name: r.name ?? null,
            salaryPerMonth: r.salaryPerMonth ?? null
          }))
        : undefined;

    if (isCreateMode.value) {
      await ApiService.createTemplate({
        title: templateTitle.value.trim(),
        templateType: type,
        workersData,
        itrData
      });
      toast.add({ severity: 'success', summary: 'Успешно', detail: 'Шаблон создан', life: 3000 });
    } else {
      await ApiService.updateTemplate(editingTemplate.value.id, {
        title: templateTitle.value.trim(),
        templateType: type,
        workersData,
        itrData
      });
      toast.add({ severity: 'success', summary: 'Успешно', detail: 'Шаблон сохранён', life: 3000 });
    }

    templateDialogVisible.value = false;
    await loadTemplates();
  } catch (error) {
    console.error('Ошибка сохранения шаблона:', error);
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error.response?.data?.message || 'Не удалось сохранить шаблон',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const confirmDeleteTemplate = (template) => {
  confirm.require({
    message: `Удалить шаблон «${template.title}»?`,
    header: 'Подтверждение',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Отменить',
    acceptProps: { label: 'Удалить', severity: 'danger' },
    accept: async () => {
      loading.value = true;
      try {
        await ApiService.deleteTemplate(template.id);
        toast.add({ severity: 'success', summary: 'Успешно', detail: 'Шаблон удалён', life: 3000 });
        await loadTemplates();
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: error.response?.data?.message || 'Не удалось удалить шаблон',
          life: 3000
        });
      } finally {
        loading.value = false;
      }
    }
  });
};

onBeforeMount(() => {
  loadTemplates();
});
</script>

<template>
  <div v-if="loading && !templates.length" class="card flex justify-center items-center h-[100vh] fixed top-0 left-0 right-0 z-9999 opacity-60">
    <ProgressSpinner />
  </div>
  <Fluid>
    <div class="card">
      <div class="flex gap-4 justify-between items-center mb-4">
        <div class="font-semibold text-[--primary-color] text-xl">Шаблоны</div>
        <div class="font-semibold hover:text-[--primary-color] hover:cursor-pointer text-xl" @click="openCreateDialog">
          создать новый шаблон +
        </div>
      </div>
      <DataTable :value="templates" :rows="10" :rowHover="true" dataKey="id">
        <template #empty> Нет шаблонов </template>
        <template #loading> Загрузка... </template>

        <Column field="dateOfCreation" header="Дата создания" style="min-width: 12rem" sortable>
          <template #body="{ data }">
            {{ data.dateOfCreation ? new Date(data.dateOfCreation).toLocaleDateString() : '—' }}
          </template>
        </Column>
        <Column field="title" header="Название" style="min-width: 14rem" sortable />
        <Column field="templateType" header="Тип" style="min-width: 10rem">
          <template #body="{ data }">
            {{ templateTypeLabel(data.templateType) }}
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 10rem">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" outlined rounded @click="openEditDialog(data)" />
              <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteTemplate(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="templateDialogVisible"
      :header="isCreateMode ? 'Новый шаблон' : 'Редактировать шаблон'"
      :style="{ width: '700px' }"
      :modal="true"
      class="template-dialog"
    >
      <div class="flex flex-col gap-4">
        <div>
          <label for="template-title" class="block font-bold mb-2">Название шаблона</label>
          <InputText id="template-title" v-model.trim="templateTitle" class="w-full" placeholder="Введите название" />
        </div>
        <div>
          <label for="template-type" class="block font-bold mb-2">Тип шаблона</label>
          <Select
            id="template-type"
            v-model="templateType"
            :options="templateTypeOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            placeholder="Выберите тип"
          />
        </div>

        <div v-if="isWorkersType" class="mt-2">
          <div class="font-bold mb-2">Сотрудники (ЦЕХ)</div>
          <DataTable :value="workersTable" showGridlines dataKey="id" class="template-table">
            <template #empty> Нет строк. Нажмите «добавить» ниже. </template>
            <Column field="name" header="Имя сотрудника">
              <template #body="{ data }">
                <Select
                  v-model="data.name"
                  :options="workerNamesForShop"
                  class="w-full"
                  placeholder="Выберите сотрудника"
                  :showClear="true"
                />
              </template>
            </Column>
            <Column field="numberOfHoursWorked" header="Трудозатраты">
              <template #body="{ data }">
                <InputNumber v-model="data.numberOfHoursWorked" :inputId="'wh-' + data.id" class="w-full" />
              </template>
            </Column>
            <Column field="salaryPerDay" header="В день">
              <template #body="{ data }">
                <InputNumber v-model="data.salaryPerDay" :inputId="'sd-' + data.id" class="w-full" />
              </template>
            </Column>
            <Column :exportable="false" style="width: 8rem">
              <template #body="{ data }">
                <Button icon="pi pi-copy" outlined rounded severity="secondary" size="small" @click="copyWorkersRow(data)" />
                <Button icon="pi pi-trash" outlined rounded severity="danger" size="small" @click="deleteWorkersRow(data)" />
              </template>
            </Column>
            <template #footer>
              <div class="flex justify-center items-center hover:cursor-pointer text-[--primary-color]" @click="addWorkersRow"> добавить сотрудника + </div>
            </template>
          </DataTable>
        </div>

        <div v-if="isItrType" class="mt-2">
          <div class="font-bold mb-2">Сотрудники (ИТР)</div>
          <DataTable :value="itrTable" showGridlines dataKey="id" class="template-table">
            <template #empty> Нет строк. Нажмите «добавить» ниже. </template>
            <Column field="name" header="Имя сотрудника">
              <template #body="{ data }">
                <Select
                  v-model="data.name"
                  :options="workerNamesForItr"
                  class="w-full"
                  placeholder="Выберите сотрудника"
                  :showClear="true"
                />
              </template>
            </Column>
            <Column field="salaryPerMonth" header="ЗП в месяц">
              <template #body="{ data }">
                <InputNumber v-model="data.salaryPerMonth" :inputId="'sm-' + data.id" class="w-full" />
              </template>
            </Column>
            <Column :exportable="false" style="width: 8rem">
              <template #body="{ data }">
                <Button icon="pi pi-copy" outlined rounded severity="secondary" size="small" @click="copyItrRow(data)" />
                <Button icon="pi pi-trash" outlined rounded severity="danger" size="small" @click="deleteItrRow(data)" />
              </template>
            </Column>
            <template #footer>
              <div class="flex justify-center items-center hover:cursor-pointer text-[--primary-color]" @click="addItrRow"> добавить сотрудника + </div>
            </template>
          </DataTable>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Отменить" icon="pi pi-times" text @click="templateDialogVisible = false" />
          <Button :label="isCreateMode ? 'Создать' : 'Сохранить'" icon="pi pi-check" @click="saveTemplate" />
        </div>
      </template>
    </Dialog>

    <ConfirmDialog />
    <Toast />
  </Fluid>
</template>

<style scoped lang="scss">
.template-table {
  :deep(.p-datatable-footer) {
    border-top: 1px solid var(--p-content-border-color);
    padding: 0.75rem;
  }
}
</style>

<style lang="scss">
.p-confirm-dialog {
  max-width: 450px !important;
  width: 90vw !important;
}
</style>
