<script setup>
import { computed } from 'vue';
import { truncateDecimal, formatNumber } from '@/utils/helper';

const props = defineProps({
  specificationData: {
    type: Object,
    required: true
  },
  dropdownItemsUnitOfMeasurement: {
    type: Array,
    default: () => ['тн', 'кг', 'шт', 'м']
  },
  computedStyleClass: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['add', 'delete', 'copy', 'cell-edit-complete']);

const totalSpecificationItems = computed(
  () =>
    props.specificationData.table.reduce((acc, item) => {
      return acc + Number(item.quantity * item.valuePerUnit);
    }, 0) || 0
);

const onCellEditComplete = (event) => {
  emit('cell-edit-complete', event);
};
</script>

<template>
  <div class="specification card h-full flex flex-col gap-4">
    <Accordion :value="['0']" multiple>
      <AccordionPanel value="0">
        <AccordionHeader>
          <div class="font-semibold text-xl" :class="computedStyleClass">Спецификация</div>
        </AccordionHeader>

        <AccordionContent>
          <DataTable
            :value="specificationData.table"
            editMode="cell"
            @cell-edit-complete="onCellEditComplete"
            showGridlines
          >
            <template #empty> Нет данных для отображения </template>

            <Column field="name" header="Наименование изделия" style="width: 25%">
              <template #body="{ data }">
                {{ data.name }}
              </template>

              <template #editor="{ data }">
                <InputText v-model="data.name" type="text" />
              </template>
            </Column>

            <Column field="quantity" header="Количество, шт" style="width: 25%">
              <template #body="{ data }">
                {{ data.quantity }}
              </template>

              <template #editor="{ data }">
                <InputText v-model="data.quantity" type="number" />
              </template>
            </Column>

            <Column field="unitOfMeasurement" header="Единица измерения" style="width: 25%">
              <template #body="{ data }">
                {{ data.unitOfMeasurement }}
              </template>

              <template #editor="{ data }">
                <Select
                  id="unitOfMeasurement"
                  v-model="data.unitOfMeasurement"
                  :options="dropdownItemsUnitOfMeasurement"
                  class="w-full"
                ></Select>
              </template>
            </Column>

            <Column field="valuePerUnit" header="Значение за одну единицу" style="width: 25%">
              <template #body="{ data }">
                {{ data.valuePerUnit }}
              </template>

              <template #editor="{ data }">
                <InputText v-model="data.valuePerUnit" type="number" />
              </template>
            </Column>

            <Column field="totalWeight" header="Общий вес" style="width: 25%">
              <template #body="{ data }">
                {{ truncateDecimal(data.quantity * data.valuePerUnit, 5) }}
              </template>
            </Column>

            <Column :exportable="false" style="min-width: 12rem">
              <template #body="slotProps">
                <Button
                  icon="pi pi-copy"
                  class="mr-2"
                  outlined
                  rounded
                  severity="success"
                  @click="$emit('copy', slotProps.data)"
                />
                <Button
                  icon="pi pi-trash"
                  outlined
                  rounded
                  severity="danger"
                  @click="$emit('delete', slotProps.data)"
                />
              </template>
            </Column>

            <template #footer>
              <div
                class="flex justify-center items-center hover:cursor-pointer"
                :class="computedStyleClass"
                @click="$emit('add')"
              >
                добавить строку +
              </div>

              <div class="flex justify-end gap-4 w-full">
                <div class="flex items-center">
                  Итого: &nbsp;<span class="font-bold text-lg"> {{ formatNumber(truncateDecimal(totalSpecificationItems, 4)) }}</span>
                </div>
              </div>
            </template>
          </DataTable>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <div>
      <label for="specificationData" :class="computedStyleClass">Заметки:</label>
      <Textarea v-model="specificationData.notes" />
    </div>
  </div>
</template>

