<script setup>
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
</script>

<template>
  <div>
    <Navigation />
    <NuxtPage />
    <VueQueryDevtools />
  </div>
</template>

<style>
html, body, #__nuxt { height: 100%; margin: 0; }
</style>