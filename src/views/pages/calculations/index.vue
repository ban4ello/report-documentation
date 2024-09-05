<script setup>
/*
  TODO:
  - Запоминать какой выпадающий список был выбран чтобы когда возвращаеься на страницу - список быд открыт в том же месте
*/

import { onBeforeMount, ref } from 'vue';
import { MochDataService } from '@/service/MochDataService';
import ApiService from '@/service/ApiService';
// import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
const router = useRouter();
// const toast = useToast();
const dropdownItemsParentCalculations = ref([]);
const expandedRows = ref([]);
const calculationPlanId = ref(null);

let calculationsData = ref([]);

onBeforeMount(() => {
  MochDataService.getCalculationsData().then((data) => {
    dropdownItemsParentCalculations.value = data.map((item) => item.name);
  });

  ApiService.getParentCalculations().then((res) => {
    console.log('getParentCalculations', res.data);

    const camelize = (s) => s.replace(/_./g, (x) => x[1].toUpperCase());
    const camelizeData = res.data.map((item) => {
      return Object.keys(item).reduce((acc, key) => {
        acc[camelize(key)] = item[key];

        return acc;
      }, {});
    });

    calculationsData.value = camelizeData;
  });
});

const expandRow = (row) => {
  ApiService.getParentCalculationChildren(row.data.id).then((res) => {
    console.log('getParentCalculationChildren', res.data);
    const updatedData = JSON.parse(JSON.stringify(calculationsData.value));
    calculationPlanId.value = res.data.filter((item) => item.calculation_type === 'plan')[0].id;
    console.log(999, calculationPlanId.value);

    const camelize = (s) => s.replace(/_./g, (x) => x[1].toUpperCase());
    const camelizeData = res.data.map((item) => {
      return Object.keys(item).reduce((acc, key) => {
        acc[camelize(key)] = item[key];

        return acc;
      }, {});
    });

    calculationsData.value = updatedData.map((item) => {
      if (Number(item.id) === Number(row.data.id)) {
        item.childrens = camelizeData;
      }

      return item;
    });
  });
};
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
          создать новую калькуляцию-план +
        </div>
      </div>
      <!-- :paginator="true" -->
      <DataTable
        v-model:expandedRows="expandedRows"
        :value="calculationsData"
        :rows="10"
        :rowHover="true"
        dataKey="title"
        @row-expand="expandRow"
      >
        <template #empty> Нет данных для отображения </template>

        <template #loading> Загружается список... Пожалуйста подождите. </template>

        <Column expander style="width: 5rem" />

        <Column field="title" header="Название" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.title }}
          </template>
        </Column>

        <Column field="dateOfCreation" header="Дата создания" style="min-width: 12rem">
          <template #body="{ data }">
            {{ new Date(data.dateOfCreation).toLocaleDateString() }}
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
                <div v-if="data.type === 'fact'">
                  <Button icon="pi pi-copy" class="mr-2" outlined rounded severity="success" />
                  <Button icon="pi pi-trash" outlined rounded severity="danger" />
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
