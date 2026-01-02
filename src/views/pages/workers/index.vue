<script setup>
import ApiService from '@/service/ApiService';
import { onBeforeMount, ref } from 'vue';
import { useConfirm } from 'primevue/useconfirm';

const workers = ref([]);
const loading = ref(false);
const editDialogVisible = ref(false);
const selectedWorker = ref(null);
const editedName = ref('');
const editedPosition = ref(null);
const confirm = useConfirm();

const positionOptions = [
  { label: 'Рабочий', key: 'worker' },
  { label: 'ИТР', key: 'itr' }
];

// Преобразование snake_case в camelCase
const camelize = (s) => s.replace(/_./g, (x) => x[1].toUpperCase());

const loadWorkers = async () => {
  loading.value = true;
  try {
    const response = await ApiService.getWorkers();
    // Преобразуем данные из snake_case в camelCase
    workers.value = response.data.map((item) => {
      return Object.keys(item).reduce((acc, key) => {
        acc[camelize(key)] = item[key];
        return acc;
      }, {});
    });
  } catch (error) {
    console.error('Ошибка при загрузке сотрудников:', error);
  } finally {
    loading.value = false;
  }
};

const openEditDialog = (worker) => {
  selectedWorker.value = worker;
  editedName.value = worker.name || '';
  // Находим соответствующую опцию по значению position из БД
  const positionOption = positionOptions.find((opt) => opt.key === worker.position) || null;
  editedPosition.value = positionOption;
  editDialogVisible.value = true;
};

const saveWorker = async () => {
  if (!selectedWorker.value || !editedName.value.trim()) {
    return;
  }

  loading.value = true;
  try {
    await ApiService.updateWorker({
      id: selectedWorker.value.id,
      name: editedName.value,
      position: editedPosition.value?.key || editedPosition.value
    });

    editDialogVisible.value = false;
    await loadWorkers();
  } catch (error) {
    console.error('Ошибка при обновлении сотрудника:', error);
  } finally {
    loading.value = false;
  }
};

const confirmDeleteWorker = (worker) => {
  confirm.require({
    message: `Вы действительно хотите удалить сотрудника "${worker.name}${worker.lastname ? ' ' + worker.lastname : ''}"?`,
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
        await ApiService.deleteWorker(worker.id);
        await loadWorkers();
      } catch (error) {
        console.error('Ошибка при удалении сотрудника:', error);
      } finally {
        loading.value = false;
      }
    }
  });
};

onBeforeMount(() => {
  loadWorkers();
});
</script>

<template>
  <div v-if="loading" class="card flex justify-center items-center h-[100vh] fixed top-0 left-0 right-0 z-9999 opacity-60">
    <ProgressSpinner />
  </div>
  <Fluid>
    <div class="card">
      <div class="font-semibold text-[--primary-color] text-xl mb-4">Сотрудники</div>
      <DataTable :value="workers" :rows="10" :rowHover="true" dataKey="id">
        <template #empty> Нет данных для отображения </template>

        <template #loading> Загружается список... Пожалуйста подождите. </template>

        <Column field="dateOfCreation" header="Дата создания" style="min-width: 12rem" sortable>
          <template #body="{ data }">
            {{ new Date(data.dateOfCreation).toLocaleDateString() }}
          </template>
        </Column>

        <Column field="name" header="Имя" style="min-width: 12rem" sortable>
          <template #body="{ data }">
            <div class="hover:text-[--primary-color] hover:cursor-pointer" @click="openEditDialog(data)">
              {{ data.name }}
            </div>
          </template>
        </Column>

        <Column field="position" header="Должность" style="min-width: 12rem" sortable>
          <template #body="{ data }">
            {{ data.position === 'worker' ? 'Рабочий' : data.position === 'itr' ? 'ИТР' : data.position }}
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="editDialogVisible" header="Редактировать сотрудника" :style="{ width: '450px' }" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-3">Имя</label>
          <InputText id="name" v-model.trim="editedName" type="text" required autofocus :invalid="!editedName.trim()" fluid />
          <small v-if="!editedName.trim()" class="text-red-500">Имя обязательно для заполнения.</small>
        </div>

        <div>
          <label for="position" class="block font-bold mb-3">Должность</label>
          <Select id="position" v-model="editedPosition" :options="positionOptions" class="w-full" fluid>
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center h-[25px]">
                <div>{{ slotProps.value.label }}</div>
              </div>
              <span v-else>Выберите должность</span>
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
        <div class="flex justify-between w-full">
          <Button label="Удалить" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteWorker(selectedWorker)" />
          <div class="flex gap-2">
            <Button label="Отменить" icon="pi pi-times" text @click="editDialogVisible = false" />
            <Button :disabled="!editedName.trim()" label="Сохранить" icon="pi pi-check" @click="saveWorker" />
          </div>
        </div>
      </template>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
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
