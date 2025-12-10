<script setup>
import Breadcrumb from 'primevue/breadcrumb';

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
});

// const home = ref({ icon: 'pi pi-home', to: '/' });
// const items = ref([
//   { label: 'Категория', to: '/category' },
//   { label: 'Товар', to: '/category/product' }
// ]);
</script>

<template>
  <Breadcrumb :model="props.items" />
</template>
