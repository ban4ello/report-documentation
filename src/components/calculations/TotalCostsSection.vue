<script setup>
import { formatNumber } from '@/utils/helper';

defineProps({
  consumablesData: {
    type: Array,
    required: true
  },
  hardwareData: {
    type: Array,
    required: true
  },
  metalData: {
    type: Array,
    required: true
  },
  totalConsumables: {
    type: Number,
    default: 0
  },
  totalHardware: {
    type: Number,
    default: 0
  },
  totalMetal: {
    type: Number,
    default: 0
  },
  expandAccordionTotalCosts: {
    type: Array,
    default: () => []
  },
  computedStyleClass: {
    type: Object,
    default: () => ({})
  },
  isMetalEnabled: {
    type: Boolean,
    default: false
  },
  isHardwareEnabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(['upload', 'remove-file', 'update:isMetalEnabled', 'update:isHardwareEnabled']);
</script>

<template>
  <div class="card total-costs">
    <div class="flex flex-row justify-between gap-2">
      <div class="font-semibold text-xl" :class="computedStyleClass">Общие затраты</div>
    </div>

    <Accordion multiple :value="expandAccordionTotalCosts">
      <AccordionPanel value="0">
        <AccordionHeader>
          <div class="flex gap-6 items-center justify-between w-full">
            <div class="flex gap-6 items-center gap-2 w-full">
              <span> Расходники </span>

              <FileUpload
                ref="consumablesDataFileupload"
                mode="basic"
                accept=".xlsx"
                chooseLabel="Выберите файл"
                customUpload
                auto
                @uploader="(e) => $emit('upload', { event: e, tableName: 'consumablesDataRes', accordionIndex: 0 })"
              />

              <Button
                class="max-w-[150px]"
                label="Удалить файл"
                severity="danger"
                v-if="consumablesData.length > 0"
                @click.stop="$emit('remove-file', 'consumablesData')"
              />

              <span @click.stop="$emit('paste-from-buffer', 'consumablesData')" class="text-sm cursor-pointer underline color-blue-500">
                Вставить из буфера
              </span>
            </div>

            <div v-if="totalConsumables" class="flex justify-end items-center font-bold w-full mr-4">
              Итого: &nbsp;<span class="text-lg">{{ formatNumber(totalConsumables) }}</span>
            </div>
          </div>
        </AccordionHeader>

        <AccordionContent>
          <DataTable :value="consumablesData" dataKey="order" :rowHover="true" showGridlines>
            <template #empty> Нет данных для отображения </template>

            <Column field="order" header="№ п/п" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.order }}
              </template>
            </Column>

            <Column field="name" header="Наименование" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.name }}
              </template>
            </Column>

            <Column field="unitOfMeasurement" header="ед.изм." style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.unitOfMeasurement }}
              </template>
            </Column>

            <Column field="quantity" header="К-во" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.quantity }}
              </template>
            </Column>

            <Column field="taxPrice" header="цена НДС" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.taxPrice }}
              </template>
            </Column>

            <Column field="price" header="Стоимость" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.price }}
              </template>
            </Column>

            <template #footer>
              <div class="flex justify-end items-center font-bold w-full">
                Итого: &nbsp;<span class="text-lg">{{ formatNumber(totalConsumables) }}</span>
              </div>
            </template>
          </DataTable>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="1">
        <AccordionHeader>
          <div class="flex gap-6 items-center justify-between w-full">
            <div class="flex gap-6 items-center gap-2 w-full">
              <span> Метизы </span>

              <FileUpload
                ref="hardwareDataFileupload"
                mode="basic"
                accept=".xlsx"
                chooseLabel="Выберите файл"
                customUpload
                auto
                @uploader="(e) => $emit('upload', { event: e, tableName: 'hardwareDataRes', accordionIndex: 1 })"
              />
              <Button
                class="max-w-[150px]"
                label="Удалить файл"
                severity="danger"
                v-if="hardwareData.length > 0"
                @click.stop="$emit('remove-file', 'hardwareData')"
              />

              <span @click.stop="$emit('paste-from-buffer', 'hardwareData')" class="text-sm cursor-pointer underline color-blue-500">
                Вставить из буфера
              </span>
            </div>

            <div v-if="totalHardware" class="flex justify-between gap-2 items-center font-bold w-full mr-4">
              <div class="flex items-center gap-2" @click.stop>
                <Checkbox
                  :modelValue="isHardwareEnabled"
                  :value="isHardwareEnabled"
                  :binary="true"
                  @update:modelValue="$emit('update:isHardwareEnabled', $event)"
                />
                <label class="font-semibold items-center text-md">Исключить из подсчета</label>
              </div>

              <div>
                Итого: &nbsp;<span class="text-lg">{{ formatNumber(totalHardware) }}</span>
              </div>
            </div>
          </div>
        </AccordionHeader>

        <AccordionContent>
          <DataTable :value="hardwareData" dataKey="order" :rowHover="true" showGridlines>
            <template #empty> Нет данных для отображения </template>

            <Column field="order" header="№ п/п" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.order }}
              </template>
            </Column>

            <Column field="name" header="Наименование" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.name }}
              </template>
            </Column>

            <Column field="unitOfMeasurement" header="ед.изм." style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.unitOfMeasurement }}
              </template>
            </Column>

            <Column field="quantity" header="К-во" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.quantity }}
              </template>
            </Column>

            <Column field="taxPrice" header="цена НДС" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.taxPrice }}
              </template>
            </Column>

            <Column field="price" header="Стоимость" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.price }}
              </template>
            </Column>

            <template #footer>
              <div class="flex justify-end items-center font-bold w-full">
                Итого: &nbsp;<span class="text-lg">{{ formatNumber(totalHardware) }}</span>
              </div>
            </template>
          </DataTable>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="2">
        <AccordionHeader>
          <div class="flex gap-6 items-center justify-between w-full">
            <div class="flex gap-6 items-center gap-2 w-full">
              <span> Металл </span>

              <FileUpload
                ref="metalDataFileupload"
                mode="basic"
                accept=".xlsx"
                chooseLabel="Выберите файл"
                customUpload
                auto
                @uploader="(e) => $emit('upload', { event: e, tableName: 'metalDataRes', accordionIndex: 2 })"
              />
              <Button
                class="max-w-[150px]"
                label="Удалить файл"
                severity="danger"
                v-if="metalData.length > 0"
                @click.stop="$emit('remove-file', 'metalData')"
              />

              <span @click.stop="$emit('paste-from-buffer', 'metalData')" class="text-sm cursor-pointer underline color-blue-500">
                Вставить из буфера
              </span>
            </div>

            <div v-if="totalMetal" class="flex justify-between gap-2 items-center font-bold w-full mr-4">
              <div class="flex items-center gap-2" @click.stop>
                <Checkbox
                  :modelValue="isMetalEnabled"
                  :value="isMetalEnabled"
                  :binary="true"
                  @update:modelValue="$emit('update:isMetalEnabled', $event)"
                />
                <label class="font-semibold items-center text-md">Исключить из подсчета</label>
              </div>

              <div>
                Итого: &nbsp;<span class="text-lg">{{ formatNumber(totalMetal) }}</span>
              </div>
            </div>
          </div>
        </AccordionHeader>

        <AccordionContent>
          <DataTable :value="metalData" dataKey="order" :rowHover="true" showGridlines>
            <template #empty> Нет данных для отображения </template>

            <Column field="order" header="№ п/п" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.order }}
              </template>
            </Column>

            <Column field="name" header="Наименование" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.name }}
              </template>
            </Column>

            <Column field="unitOfMeasurement" header="ед.изм." style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.unitOfMeasurement }}
              </template>
            </Column>

            <Column field="quantity" header="К-во" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.quantity }}
              </template>
            </Column>

            <Column field="taxPrice" header="цена НДС" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.taxPrice }}
              </template>
            </Column>

            <Column field="price" header="Стоимость" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.price }}
              </template>
            </Column>

            <template #footer>
              <div class="flex justify-end items-center font-bold w-full">
                Итого: &nbsp;<span class="text-lg">{{ formatNumber(totalMetal) }}</span>
              </div>
            </template>
          </DataTable>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<style scoped lang="scss">
.color-blue-500 {
  color: #3b82f6;
}
</style>
