<script setup>
import { ref } from 'vue';

const emit = defineEmits(['customClick']);

const props = defineProps({
  title: {
    type: String,
    default: 'Привет',
    required: true
  },
  number: {
    type: Number,
    default: 100
  }
});

const handler = () => {
  emit('customClick', 'str')
  counter.value++
  console.log(counter)
}

const myVar = ref('тест')

let counter = ref(0)


</script>

<template>
  <div>
    <h1> ТЕСТ </h1>
    <p>{{ counter }}</p>
    <header>{{ props.title }}</header>
    <slot name='footer' />
    <div>{{ props.number }}</div>
    <button @click="handler">Кнопка</button>
    <slot />

  </div>
</template>

<style scoped lang="scss"></style>