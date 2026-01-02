<script setup>
import ApiService from '@/service/ApiService';
import { onBeforeMount, ref } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

const workers = ref([]);
const loading = ref(false);
const editDialogVisible = ref(false);
const isCreateMode = ref(false);
const selectedWorker = ref(null);
const editedName = ref('');
const editedPosition = ref(null);
const nameError = ref('');
const confirm = useConfirm();
const toast = useToast();

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

const checkDuplicateName = (name) => {
  if (!name || !name.trim()) {
    return false;
  }
  const trimmedName = name.trim().toLowerCase();
  const existingWorker = workers.value.find((worker) => {
    const workerName = worker.name?.toLowerCase() || '';
    return workerName === trimmedName;
  });

  if (existingWorker) {
    // При редактировании исключаем текущего сотрудника из проверки
    if (!isCreateMode.value && selectedWorker.value && existingWorker.id === selectedWorker.value.id) {
      return false;
    }
    return true;
  }
  return false;
};

const validateName = () => {
  if (checkDuplicateName(editedName.value)) {
    nameError.value = 'Сотрудник с таким именем уже существует';
  } else {
    nameError.value = '';
  }
};

const openEditDialog = (worker) => {
  isCreateMode.value = false;
  selectedWorker.value = worker;
  editedName.value = worker.name || '';
  nameError.value = '';
  // Находим соответствующую опцию по значению position из БД
  const positionOption = positionOptions.find((opt) => opt.key === worker.position) || null;
  editedPosition.value = positionOption;
  editDialogVisible.value = true;
};

const openCreateDialog = () => {
  isCreateMode.value = true;
  selectedWorker.value = null;
  editedName.value = '';
  editedPosition.value = null;
  nameError.value = '';
  editDialogVisible.value = true;
};

const saveWorker = async () => {
  if (!editedName.value.trim() || !editedPosition.value) {
    return;
  }

  // Проверка на дубликаты имен
  if (checkDuplicateName(editedName.value)) {
    nameError.value = 'Сотрудник с таким именем уже существует';
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Сотрудник с таким именем уже существует',
      life: 3000
    });
    return;
  }

  nameError.value = '';
  loading.value = true;
  try {
    if (isCreateMode.value) {
      // Создание нового сотрудника
      await ApiService.createWorker({
        name: editedName.value,
        lastname: '',
        position: editedPosition.value?.key || editedPosition.value
      });
      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Сотрудник создан',
        life: 3000
      });
    } else {
      // Обновление существующего сотрудника
      await ApiService.updateWorker({
        id: selectedWorker.value.id,
        name: editedName.value,
        lastname: '',
        position: editedPosition.value?.key || editedPosition.value
      });
      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Сотрудник обновлен',
        life: 3000
      });
    }

    editDialogVisible.value = false;
    await loadWorkers();
  } catch (error) {
    console.error(isCreateMode.value ? 'Ошибка при создании сотрудника:' : 'Ошибка при обновлении сотрудника:', error);

    // Проверка на ошибку дубликата имени с сервера
    if (error.response?.data?.code === 'DUPLICATE_WORKER_NAME' || error.response?.data?.message?.includes('уже существует')) {
      nameError.value = 'Сотрудник с таким именем уже существует';
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
        detail: error.response?.data?.message || (isCreateMode.value ? 'Не удалось создать сотрудника' : 'Не удалось обновить сотрудника'),
        life: 3000
      });
    }
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
      <div class="flex gap-4 justify-between">
        <div class="font-semibold text-[--primary-color] text-xl mb-4">Сотрудники</div>
        <div class="font-semibold hover:text-[--primary-color] hover:cursor-pointer text-xl mb-4" @click="openCreateDialog">
          создать нового сотрудника +
        </div>
      </div>
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

    <Dialog
      v-model:visible="editDialogVisible"
      :header="isCreateMode ? 'Новый сотрудник' : 'Редактировать сотрудника'"
      :style="{ width: '450px' }"
      :modal="true"
    >
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-3">Имя</label>
          <InputText
            id="name"
            v-model.trim="editedName"
            type="text"
            required
            autofocus
            :invalid="!editedName.trim() || !!nameError"
            fluid
            @input="validateName"
          />
          <small v-if="!editedName.trim()" class="text-red-500">Имя обязательно для заполнения.</small>
          <small v-if="nameError" class="text-red-500">{{ nameError }}</small>
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
          <Button
            v-if="!isCreateMode"
            label="Удалить"
            icon="pi pi-trash"
            severity="danger"
            outlined
            @click="confirmDeleteWorker(selectedWorker)"
          />
          <div v-else></div>
          <div class="flex gap-2">
            <Button label="Отменить" icon="pi pi-times" text @click="editDialogVisible = false" />
            <Button
              :disabled="!editedName.trim() || !editedPosition || !!nameError"
              :label="isCreateMode ? 'Создать' : 'Сохранить'"
              icon="pi pi-check"
              @click="saveWorker"
            />
          </div>
        </div>
      </template>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
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
