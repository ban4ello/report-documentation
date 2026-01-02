<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import FileUpload from 'primevue/fileupload';
import ApiService from '@/service/ApiService';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
  calculationId: {
    type: [String, Number],
    required: true
  },
  computedStyleClass: {
    type: Object,
    default: () => ({})
  }
});

const toast = useToast();
const fileUploadRef = ref(null);
const mediaFiles = ref([]);
const loading = ref(false);
const pendingFiles = ref([]); // Файлы, ожидающие загрузки после создания калькуляции
const previewOverlay = ref(null);
const previewFile = ref(null);
const previewImageUrl = ref(null);
const previewLoading = ref(false);
const previewTimeout = ref(null);
const previewCache = ref(new Map()); // Кэш для предпросмотров
const fileNameRefs = ref(new Map()); // Refs для элементов имен файлов

const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const maxFileSize = 10 * 1024 * 1024; // 10MB

const loadMediaFiles = async () => {
  if (!props.calculationId || props.calculationId === 'create') {
    mediaFiles.value = [];
    return;
  }

  loading.value = true;
  try {
    const response = await ApiService.getCalculationMediaFiles(props.calculationId);
    mediaFiles.value = response.data || [];
  } catch (error) {
    console.error('Error loading media files:', error);
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось загрузить медиа файлы',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const onFileSelect = (event) => {
  const files = event.files;
  const invalidFiles = [];

  files.forEach((file) => {
    if (!allowedTypes.includes(file.type)) {
      invalidFiles.push(file.name);
    } else if (file.size > maxFileSize) {
      invalidFiles.push(`${file.name} (превышен размер 10MB)`);
    }
  });

  if (invalidFiles.length > 0) {
    toast.add({
      severity: 'warn',
      summary: 'Предупреждение',
      detail: `Некоторые файлы не подходят: ${invalidFiles.join(', ')}. Разрешены только PDF, JPG, PNG до 10MB`,
      life: 5000
    });
    // Удаляем невалидные файлы из списка
    event.files = files.filter((file) => allowedTypes.includes(file.type) && file.size <= maxFileSize);
  }
};

const onUpload = async (event) => {
  const files = event.files;
  if (!files || files.length === 0) return;

  // Если калькуляция еще не создана, сохраняем файлы для последующей загрузки
  if (!props.calculationId || props.calculationId === 'create') {
    pendingFiles.value = [...pendingFiles.value, ...files];
    toast.add({
      severity: 'info',
      summary: 'Информация',
      detail: `Файлы будут загружены после сохранения калькуляции. Выбрано файлов: ${pendingFiles.value.length}`,
      life: 3000
    });

    // Очищаем загрузчик
    if (fileUploadRef.value) {
      fileUploadRef.value.clear();
    }
    return;
  }

  // Если калькуляция уже создана, загружаем файлы сразу
  loading.value = true;
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    await ApiService.uploadCalculationMediaFiles(props.calculationId, formData);

    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Файлы загружены',
      life: 3000
    });

    // Очищаем загрузчик
    if (fileUploadRef.value) {
      fileUploadRef.value.clear();
    }

    // Перезагружаем список файлов
    await loadMediaFiles();
  } catch (error) {
    console.error('Error uploading files:', error);
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error.response?.data?.message || 'Не удалось загрузить файлы',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

// Метод для загрузки отложенных файлов после создания калькуляции
const uploadPendingFiles = async () => {
  if (pendingFiles.value.length === 0 || !props.calculationId || props.calculationId === 'create') {
    return;
  }

  loading.value = true;
  try {
    const formData = new FormData();
    pendingFiles.value.forEach((file) => {
      formData.append('files', file);
    });

    await ApiService.uploadCalculationMediaFiles(props.calculationId, formData);

    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: `Загружено файлов: ${pendingFiles.value.length}`,
      life: 3000
    });

    // Очищаем отложенные файлы
    pendingFiles.value = [];

    // Перезагружаем список файлов
    await loadMediaFiles();
  } catch (error) {
    console.error('Error uploading pending files:', error);
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error.response?.data?.message || 'Не удалось загрузить файлы',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const deleteFile = async (fileId) => {
  loading.value = true;
  try {
    await ApiService.deleteCalculationMediaFile(fileId);
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Файл удален',
      life: 3000
    });
    await loadMediaFiles();
  } catch (error) {
    console.error('Error deleting file:', error);
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось удалить файл',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const downloadFile = async (file) => {
  try {
    const response = await ApiService.downloadCalculationMediaFile(file.id);
    const blob = new Blob([response.data], { type: file.fileType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось скачать файл',
      life: 3000
    });
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (fileType) => {
  if (fileType === 'application/pdf') return 'pi-file-pdf';
  if (fileType.startsWith('image/')) return 'pi-image';
  return 'pi-file';
};

const isImageFile = (fileType) => {
  return fileType.startsWith('image/');
};

const setFileNameRef = (el, fileId) => {
  if (el) {
    fileNameRefs.value.set(fileId, el);
  } else {
    fileNameRefs.value.delete(fileId);
  }
};

const showPreview = async (event, file) => {
  if (!isImageFile(file.fileType)) {
    return; // Предпросмотр только для изображений
  }

  // Проверяем, что событие существует
  if (!event) {
    return;
  }

  // Очищаем предыдущий таймаут
  if (previewTimeout.value) {
    clearTimeout(previewTimeout.value);
  }

  // Получаем элемент из refs или из события
  const targetElement = fileNameRefs.value.get(file.id) || event.currentTarget || event.target;

  // Проверяем, что элемент существует и в DOM
  if (!targetElement) {
    return;
  }

  // Задержка перед показом предпросмотра (500ms)
  previewTimeout.value = setTimeout(async () => {
    // Проверяем, что overlay существует
    if (!previewOverlay.value) {
      return;
    }

    // Проверяем, что элемент все еще в DOM
    if (!targetElement || !document.contains(targetElement)) {
      return;
    }

    previewFile.value = file;
    previewLoading.value = true;

    // Проверяем кэш
    if (previewCache.value.has(file.id)) {
      previewImageUrl.value = previewCache.value.get(file.id);
      await nextTick();
      try {
        // Создаем синтетическое событие для toggle
        const syntheticEvent = {
          currentTarget: targetElement,
          target: targetElement
        };
        if (targetElement && previewOverlay.value) {
          previewOverlay.value.toggle(syntheticEvent, targetElement);
        }
      } catch (error) {
        console.error('Error showing preview overlay:', error);
      }
      previewLoading.value = false;
      return;
    }

    previewImageUrl.value = null;

    try {
      const response = await ApiService.downloadCalculationMediaFile(file.id);
      const blob = new Blob([response.data], { type: file.fileType });
      const url = window.URL.createObjectURL(blob);
      previewImageUrl.value = url;
      // Сохраняем в кэш
      previewCache.value.set(file.id, url);
      await nextTick();
      try {
        // Создаем синтетическое событие для toggle
        const syntheticEvent = {
          currentTarget: targetElement,
          target: targetElement
        };
        if (targetElement && previewOverlay.value) {
          previewOverlay.value.toggle(syntheticEvent, targetElement);
        }
      } catch (error) {
        console.error('Error showing preview overlay:', error);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось загрузить предпросмотр',
        life: 2000
      });
    } finally {
      previewLoading.value = false;
    }
  }, 500);
};

const hidePreview = () => {
  // Очищаем таймаут при скрытии
  if (previewTimeout.value) {
    clearTimeout(previewTimeout.value);
    previewTimeout.value = null;
  }
  // Не удаляем URL из кэша, чтобы можно было быстро показать снова
  previewFile.value = null;
};

const cancelPreview = () => {
  if (previewTimeout.value) {
    clearTimeout(previewTimeout.value);
    previewTimeout.value = null;
  }
};

onMounted(() => {
  loadMediaFiles();
});

onBeforeUnmount(() => {
  // Очищаем таймаут
  if (previewTimeout.value) {
    clearTimeout(previewTimeout.value);
  }
  // Очищаем кэш и освобождаем URL
  previewCache.value.forEach((url) => {
    window.URL.revokeObjectURL(url);
  });
  previewCache.value.clear();
  // Очищаем текущий предпросмотр
  if (previewImageUrl.value) {
    window.URL.revokeObjectURL(previewImageUrl.value);
  }
});

defineExpose({
  loadMediaFiles,
  uploadPendingFiles
});
</script>

<template>
  <div class="card media-files-section">
    <div class="flex flex-row justify-between gap-2 mb-4">
      <div class="font-semibold text-xl" :class="computedStyleClass">Медиа файлы</div>
    </div>

    <div class="flex flex-col gap-4">
      <FileUpload
        ref="fileUploadRef"
        mode="advanced"
        :multiple="true"
        accept=".pdf,.jpg,.jpeg,.png"
        :maxFileSize="maxFileSize"
        :auto="false"
        chooseLabel="Выберите файлы"
        uploadLabel="Загрузить"
        cancelLabel="Отмена"
        :customUpload="true"
        @select="onFileSelect"
        @uploader="onUpload"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center py-8">
            <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-2"></i>
            <p class="text-gray-500">Перетащите файлы сюда или нажмите для выбора</p>
            <p class="text-sm text-gray-400 mt-2">Поддерживаются: PDF, JPG, PNG (макс. 10MB)</p>
          </div>
        </template>
      </FileUpload>

      <div
        v-if="pendingFiles.length > 0 && (!calculationId || calculationId === 'create')"
        class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded"
      >
        <div class="flex items-center gap-2 text-blue-700">
          <i class="pi pi-info-circle"></i>
          <span class="text-sm font-medium">
            Ожидают загрузки: {{ pendingFiles.length }} файл(ов). Файлы будут загружены после сохранения калькуляции.
          </span>
        </div>
      </div>

      <div v-if="loading && mediaFiles.length === 0" class="flex justify-center py-4">
        <ProgressSpinner />
      </div>

      <div v-if="mediaFiles.length > 0" class="mt-4">
        <DataTable :value="mediaFiles" showGridlines>
          <template #empty>Нет файлов</template>

          <Column field="fileName" header="Имя файла" style="min-width: 200px">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <i :class="['pi', getFileIcon(data.fileType)]" class="text-blue-500"></i>
                <span
                  v-if="isImageFile(data.fileType)"
                  :ref="(el) => setFileNameRef(el, data.id)"
                  class="cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                  @mouseenter="(e) => showPreview(e, data)"
                  @mouseleave="cancelPreview"
                  v-tooltip="'Наведите для предпросмотра'"
                >
                  {{ data.fileName }}
                </span>
                <span v-else>{{ data.fileName }}</span>
              </div>
            </template>
          </Column>

          <Column field="fileType" header="Тип" style="min-width: 100px">
            <template #body="{ data }">
              <Tag :value="data.fileType.split('/')[1].toUpperCase()" />
            </template>
          </Column>

          <Column field="fileSize" header="Размер" style="min-width: 100px">
            <template #body="{ data }">
              {{ formatFileSize(data.fileSize) }}
            </template>
          </Column>

          <Column field="dateOfCreation" header="Дата загрузки" style="min-width: 150px">
            <template #body="{ data }">
              {{ new Date(data.dateOfCreation).toLocaleString('ru-RU') }}
            </template>
          </Column>

          <Column header="Действия" style="min-width: 150px">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button icon="pi pi-download" severity="secondary" size="small" @click="downloadFile(data)" v-tooltip="'Скачать'" />
                <Button icon="pi pi-trash" severity="danger" size="small" @click="deleteFile(data.id)" v-tooltip="'Удалить'" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Overlay для предпросмотра изображений -->
      <OverlayPanel ref="previewOverlay" @hide="hidePreview" :dismissable="true" :showCloseIcon="true" class="preview-overlay">
        <div v-if="previewLoading" class="flex items-center justify-center p-8 min-w-[300px] min-h-[200px]">
          <ProgressSpinner />
        </div>
        <div v-else-if="previewImageUrl && previewFile" class="preview-container">
          <img
            :src="previewImageUrl"
            :alt="previewFile.fileName"
            class="preview-image rounded shadow-lg"
            style="max-width: 80vw; max-height: 80vh"
          />
          <div class="mt-3 text-sm text-gray-600 border-t pt-2">
            <p class="font-semibold">{{ previewFile.fileName }}</p>
            <p class="text-xs text-gray-500">{{ formatFileSize(previewFile.fileSize) }}</p>
          </div>
        </div>
      </OverlayPanel>
    </div>
  </div>
</template>

<style scoped lang="scss">
.media-files-section {
  :deep(.p-fileupload) {
    .p-fileupload-buttonbar {
      background: transparent;
      border: none;
      padding: 0;
    }

    .p-fileupload-content {
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 2rem;
      background: #f9fafb;
      transition: all 0.3s;

      &:hover {
        border-color: #3b82f6;
        background: #f0f9ff;
      }
    }
  }
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 90vw;
}

.preview-image {
  max-width: 600px;
  max-height: 600px;
  object-fit: contain;
  border: 1px solid #e5e7eb;
}

:deep(.preview-overlay) {
  .p-overlaypanel-content {
    padding: 1.5rem;
  }
}
</style>
