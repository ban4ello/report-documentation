<script setup>
import Breadcrumb from 'primevue/breadcrumb';
import { useRouter } from 'vue-router';

const router = useRouter();

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
const redirect = (route) => {
  console.log(44444, route.query);

  router.push({ path: route.path, query: route.query });
};
</script>

<template>
  <Breadcrumb :model="props.items">
    <template #item="{ item }">
      <div v-if="item.route" @click="redirect(item.route)" class="cursor-pointer">
        <span class="text-primary font-semibold">{{ item.label }}</span>
      </div>
      <!-- <router-link v-if="item.route" :to="item.route">
        <span class="text-primary font-semibold">{{ item.label }}</span>
      </router-link> -->
    </template>
  </Breadcrumb>
</template>

<style lang="scss" scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
