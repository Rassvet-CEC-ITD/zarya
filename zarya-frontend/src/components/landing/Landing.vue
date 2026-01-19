<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from '../Button.vue';
import { useVotingCache } from '../../composables/useVotingCache';
import { DAYS_TO_SCAN } from '../../zarya.ts';
import logoEn from '../../assets/images/logo_en.png';
import logoRu from '../../assets/images/logo_ru.png';

const { t, locale } = useI18n();
const { scanHistoricalEvents, isScanning, isScanned } = useVotingCache();

const logoSrc = computed(() => locale.value === 'en' ? logoEn : logoRu);

// Scan historical events when landing page mounts
onMounted(() => {
  if (!isScanned.value && !isScanning.value) {
    scanHistoricalEvents(DAYS_TO_SCAN);
  }
});
</script>

<template>
  <main class="landing">
    <div class="landing__center">
      <img class="landing__logo" :src="logoSrc" alt="Dawn is near!" />
      <Button to="/voting" variant="primary">{{ t('landing.gettingStarted') }}</Button>
    </div>
  </main>
</template>

<style lang="scss">
@use '../../assets/scss/components/landing.scss';
</style>
