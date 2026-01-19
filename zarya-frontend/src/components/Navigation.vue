<script setup lang="ts">
import { useConnection } from '@wagmi/vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import Button from './Button.vue'
import Account from './Account.vue'
import logoRound from '../assets/images/logo_round.png';

const { isConnected } = useConnection()
const { t, locale } = useI18n()

const toggleLanguage = () => {
  locale.value = locale.value === 'en' ? 'ru' : 'en'
}
</script>

<template>
  <nav class="navigation">
    <div class="navigation__container">
      <RouterLink to="/" class="navigation__brand">
        <img :src="logoRound" alt="Dawn is near!" class="navigation__logo" />
        {{ t('navigation.brand') }}
      </RouterLink>
      
      <div v-if="isConnected" class="navigation__links">
        <RouterLink 
          to="/voting" 
          class="navigation__link"
        >
          {{ t('navigation.voting') }}
        </RouterLink>
        <RouterLink 
          to="/data" 
          class="navigation__link"
        >
          {{ t('navigation.data') }}
        </RouterLink>
      </div>

      <div class="navigation__actions">
        <Button
          @click="toggleLanguage" 
          variant="secondary"
          size="small"
          :title="`Switch to ${locale === 'en' ? 'Russian' : 'English'}`"
        >
          {{ locale.toUpperCase() }}
        </Button>
        <Account />
      </div>
    </div>
  </nav>
</template>

<style lang="scss">
@use "../assets/scss/components/navigation.scss";
</style>
