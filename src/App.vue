<script setup></script>

<template>
  <!-- path, not fullPath: query-only updates (search on Калькуляции) must not remount the page and drop input focus -->
  <router-view :key="$route.path" />
</template>

<style scoped></style>
