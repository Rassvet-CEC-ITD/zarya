<script setup lang="ts">
import { ref } from 'vue';
import Button from '../Button.vue';

const props = defineProps<{
  apiBaseUrl: string;
  isAuthenticated: boolean;
}>();

const isDownloading = ref(false);
const error = ref('');
const success = ref('');

async function downloadReport() {
  if (!props.isAuthenticated) {
    error.value = 'Please login first';
    return;
  }

  isDownloading.value = true;
  error.value = '';
  success.value = '';

  try {
    const response = await fetch(`${props.apiBaseUrl}/auth/report`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/pdf',
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zarya-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      success.value = 'Report downloaded successfully!';
      setTimeout(() => {
        success.value = '';
      }, 3000);
    } else if (response.status === 401 || response.status === 403) {
      error.value = 'Authentication required. Please login again.';
    } else {
      error.value = `Error: ${response.status} ${response.statusText}`;
    }
  } catch (err) {
    error.value = `Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`;
  } finally {
    isDownloading.value = false;
  }
}
</script>

<template>
  <div class="report-downloader">
    <h3 class="report-downloader__title">General Report</h3>
    <p class="report-downloader__description">Download a comprehensive PDF report of party opinions and statistics.</p>
    
    <Button
      @click="downloadReport"
      :disabled="isDownloading || !isAuthenticated"
      :loading="isDownloading"
      variant="primary"
    >
      <span v-if="!isDownloading">📄 Download PDF Report</span>
    </Button>

    <div v-if="success" class="report-downloader__success">{{ success }}</div>
    <div v-if="error" class="report-downloader__error">{{ error }}</div>
    
    <div v-if="!isAuthenticated" class="report-downloader__warning">
      ⚠️ Please login to download reports
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/scss/data/report-downloader.scss';
</style>
