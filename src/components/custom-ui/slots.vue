<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
});

const test = 'qwerty';
</script>

<template>
  <div class="wrap">
    <div class="header">
      <slot name="header"></slot>
      <slot />
    </div>

    <div class="body">
      <h1>это body</h1>
      <slot name="footer" :prop="test" atr1="ndhdhc" atr2="mcmndnccndd"></slot>

      <slot name="body"></slot>
    </div>

    <div class="footer">
      <ul>
        <li v-for="item in items" :key="item">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
