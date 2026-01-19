<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from '../Button.vue';
import LoginForm from './LoginForm.vue';
import ReportDownloader from './ReportDownloader.vue';
import { ZARYA_API_BASE_URL } from '../../zarya';

// API configuration - adjust this to match your backend URL
const API_BASE_URL = ref(ZARYA_API_BASE_URL);
const isAuthenticated = ref(false);
const sessionId = ref('');

function handleLoginSuccess(session: string) {
  sessionId.value = session;
  isAuthenticated.value = true;
}

function handleLogout() {
  fetch(`${API_BASE_URL.value}/logout`, {
    method: 'POST',
    credentials: 'include',
  }).finally(() => {
    isAuthenticated.value = false;
    sessionId.value = '';
  });
}
</script>

<template>
  <div class="data-page">
    <div class="data-page__container">
      <h1 class="data-page__title">Zarya API Data Explorer</h1>
      <p class="data-page__subtitle">Access party data, statistics, and reports through the REST API</p>

      <div class="data-page__status-bar">
        <div class="api-url">
          <label class="api-url__label">API URL:</label>
          <input
            v-model="API_BASE_URL"
            type="text"
            placeholder="http://localhost:8080"
            :disabled="isAuthenticated"
            class="api-url__input"
            :class="{ 'api-url__input--disabled': isAuthenticated }"
          />
          <div class="auth-status">
            <span class="auth-status__label">
              {{ isAuthenticated ? 'Authenticated' : 'Not Authenticated' }}
            </span>
            <Button
              v-if="isAuthenticated" 
              @click="handleLogout" 
              variant="cancel"
              size="small"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <LoginForm
        v-if="!isAuthenticated"
        :api-base-url="API_BASE_URL"
        @login-success="handleLoginSuccess"
      />

      <template v-if="isAuthenticated">
        <ReportDownloader
          :api-base-url="API_BASE_URL"
          :is-authenticated="isAuthenticated"
        />
      </template>

      <div v-else class="data-page__info-panel">
        <h3 class="info-panel__title">📌 Getting Started</h3>
        <ul class="info-panel__list">
          <li class="info-panel__list-item">Login with your credentials (default: oleg / rassvet)</li>
          <li class="info-panel__list-item">Explore different data types: Cells, Themes, Statements, Organs</li>
          <li class="info-panel__list-item">Navigate through paginated results</li>
          <li class="info-panel__list-item">Download comprehensive PDF reports</li>
        </ul>
        
        <h3 class="info-panel__title">🔒 Authentication</h3>
        <p class="info-panel__text">
          This interface uses Spring Security session-based authentication with CORS enabled.
          Your session cookie will be automatically managed by the browser.
        </p>

        <h3 class="info-panel__title">📊 Available Endpoints</h3>
        <ul class="info-panel__list">
          <li class="info-panel__list-item"><code class="info-panel__code">GET /auth/data/cells/categorical</code> - Categorical cells data</li>
          <li class="info-panel__list-item"><code class="info-panel__code">GET /auth/data/cells/numerical</code> - Numerical cells data</li>
          <li class="info-panel__list-item"><code class="info-panel__code">GET /auth/data/themes</code> - Party themes</li>
          <li class="info-panel__list-item"><code class="info-panel__code">GET /auth/data/statements</code> - Party statements</li>
          <li class="info-panel__list-item"><code class="info-panel__code">GET /auth/data/organs</code> - Party organs structure</li>
          <li class="info-panel__list-item"><code class="info-panel__code">GET /auth/report</code> - Generate PDF report</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../assets/scss/data/index.scss';
</style>