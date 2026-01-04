import { ref } from 'vue';
import ApiService from '@/service/ApiService';

export function useWorkers() {
  const dropdownItemsWorkerStaff = ref([]);
  const dropdownItemsWorkersRole = ref([
    { label: 'Рабочий', key: 'worker' },
    { label: 'ИТР', key: 'itr' }
  ]);
  const loading = ref(false);
  const newWorkerData = ref({ name: '', lastname: '', position: '' });

  const getWorkers = async () => {
    loading.value = true;
    try {
      return await ApiService.getWorkers();
    } catch (error) {
      console.log(error);
      return { data: [] };
    } finally {
      loading.value = false;
    }
  };

  const addNewWorkerToDB = async ({ name, lastname, position }) => {
    loading.value = true;
    try {
      await ApiService.createWorker({ name, lastname, position: position.key });
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const loadWorkers = async () => {
    const workersRes = await getWorkers();
    // Сохраняем полные данные о рабочих для фильтрации по position
    dropdownItemsWorkerStaff.value = workersRes.data;
    return workersRes;
  };

  return {
    dropdownItemsWorkerStaff,
    dropdownItemsWorkersRole,
    loading,
    newWorkerData,
    getWorkers,
    addNewWorkerToDB,
    loadWorkers
  };
}
