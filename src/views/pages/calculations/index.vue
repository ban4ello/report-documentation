<script setup>
/*
  TODO:
  - Запоминать какой выпадающий список был выбран чтобы когда возвращаеься на страницу - список быд открыт в том же месте
*/

import { onBeforeMount, ref } from 'vue';
import { MochDataService } from '@/service/MochDataService';
// import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
const router = useRouter();
// const toast = useToast();
const dropdownItemsParentCalculations = ref([]);
const expandedRows = ref([]);

let calculationsData = ref([]);

onBeforeMount(() => {
  MochDataService.getCalculationsData().then((data) => {
    calculationsData.value = data;
  });

  MochDataService.getCalculationsData().then((data) => {
    dropdownItemsParentCalculations.value = data.map((item) => item.name);
  });
});
</script>

<template>
  <Fluid>
    <div class="card">
      <div class="flex gap-4 justify-between">
        <div class="font-semibold text-[--primary-color] text-xl mb-4">Калькуляции</div>

        <div
          class="font-semibold hover:text-[--primary-color] hover:cursor-pointer text-xl mb-4"
          @click="router.push({ path: '/calculations/create' })"
        >
          создать новую калькуляцию +
        </div>
      </div>
      <!-- :paginator="true" -->
      <DataTable v-model:expandedRows="expandedRows" :value="calculationsData" :rows="10" :rowHover="true" dataKey="id">
        <template #empty> Нет данных для отображения </template>

        <template #loading> Загружается список... Пожалуйста подождите. </template>

        <Column expander style="width: 5rem" />

        <Column field="name" header="Название" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.name }}
          </template>
        </Column>

        <Column field="createdOn" header="Дата создания" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.createdOn }}
          </template>
        </Column>

        <template #expansion="slotProps">
          <!-- NOTE: план всегда вверху "sort((a, b) => b.type.localeCompare(a.type)" -->
          <DataTable showGridlines :value="slotProps.data.childrens.sort((a, b) => b.type.localeCompare(a.type))" class="shadow-md">
            <Column field="name" header="Название" sortable style="min-width: 12rem">
              <template #body="{ data }">
                <div
                  class="hover:text-[--primary-color] hover:cursor-pointer"
                  @click="router.push({ path: `/calculations/${data.id}`, query: { parentId: slotProps.data.id, type: data.type } })"
                >
                  {{ data.name }}
                </div>
              </template>
            </Column>

            <Column field="createdOn" header="Дата создания" sortable style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.createdOn }}
              </template>
            </Column>

            <Column field="type" header="Вид калькуляции" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.type === 'plant' ? 'План' : 'Факт' }}
              </template>
            </Column>

            <Column :exportable="false" style="min-width: 12rem">
              <template #body="{ data }">
                <div v-if="data.type === 'fact'">
                  <Button icon="pi pi-copy" class="mr-2" outlined rounded severity="success" />
                  <Button icon="pi pi-trash" outlined rounded severity="danger" />
                </div>
              </template>
            </Column>

            <template #footer>
              <div
                class="flex justify-center items-center text-[--primary-color] hover:cursor-pointer"
                @click="router.push({ path: '/calculations/create', query: { parentId: slotProps.data.id, type: 'fact' } })"
              >
                добавить калькуляцию +
              </div>
            </template>
          </DataTable>
        </template>
      </DataTable>
    </div>
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
