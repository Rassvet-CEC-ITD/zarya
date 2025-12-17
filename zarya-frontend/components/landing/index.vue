<script setup lang="ts">

</script>

<template>
  <main class="landing">
    <div class="landing__center">
      <img class="landing__logo" src="~/assets/images/logo.png" alt="Dawn is near!" />
      <Button href="/listing" variant="primary">Getting started</Button>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/scss/components/buttons.scss';

.landing {
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 2rem 1.5rem;
  text-align: center;
  background-color: #f9fafb;

  &__center {
    width: 100%;
    max-width: 640px;
  }

  &__logo {
    width: 100%;
    max-width: 500px;
    height: auto;
    display: block;
    margin: 0 auto 2rem;
  }
}
</style>
