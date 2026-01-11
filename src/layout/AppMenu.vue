<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const mode = import.meta.env.MODE;

const model = ref([
  {
    label: 'Анализ',
    items: [{ label: 'Анализ', icon: 'pi-receipt', to: '/' }]
  },
  {
    label: 'Калькуляции',
    items: [{ label: 'Калькуляции', icon: 'pi-receipt', to: '/calculations' }]
  },
  {
    label: 'Сотрудники',
    items: [{ label: 'Сотрудники', icon: 'pi-users', to: '/workers' }]
  }
]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <app-menu-item v-if="item.permission === 'admin' && mode === 'development'" :item="item" :index="i"></app-menu-item>
      <app-menu-item v-else-if="item.permission !== 'admin'" :item="item" :index="i"></app-menu-item>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
