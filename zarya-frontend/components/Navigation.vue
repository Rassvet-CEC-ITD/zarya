<script setup lang="ts">
import { useConnection } from '@wagmi/vue'

const { status } = useConnection()
</script>

<template>
  <nav class="navigation">
    <div class="navigation__container">
      <NuxtLink to="/" class="navigation__brand">
        <img src="~/assets/images/logo_round.png" alt="Dawn is near!" class="navigation__logo" />
        {{ $t('navigation.brand') }}
      </NuxtLink>
      
      <div v-if="status === 'connected'" class="navigation__links">
        <NuxtLink 
          to="/listing" 
          class="navigation__link"
        >
          {{ $t('navigation.proposals') }}
        </NuxtLink>
      </div>

      <div class="navigation__actions">
        <Account />
      </div>
    </div>
  </nav>
</template>

<style lang="scss">
@use "~/assets/scss/components/navigation.scss";
</style>
