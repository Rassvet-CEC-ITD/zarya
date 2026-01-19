<script setup lang="ts">
import { ref } from 'vue';
import Button from '../Button.vue';

const emit = defineEmits<{
  loginSuccess: [sessionId: string];
}>();

const props = defineProps<{
  apiBaseUrl: string;
}>();

const username = ref('oleg');
const password = ref('rassvet');
const isLoading = ref(false);
const error = ref('');

async function handleLogin() {
  error.value = '';
  isLoading.value = true;

  try {
    // Create form data for Spring Security login
    const formData = new URLSearchParams();
    formData.append('username', username.value);
    formData.append('password', password.value);

    const response = await fetch(`${props.apiBaseUrl}/login/try`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      credentials: 'include', // Important for cookies
    });

    if (response.ok) {
      // Extract session cookie
      const cookies = document.cookie;
      const sessionMatch = cookies.match(/JSESSIONID=([^;]+)/);
      const sessionId = sessionMatch ? sessionMatch[1] : '';
      
      emit('loginSuccess', sessionId);
      error.value = '';
    } else {
      error.value = 'Login failed. Please check your credentials.';
    }
  } catch (err) {
    error.value = `Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="login-form">
    <h3 class="login-form__title">API Login</h3>
    <form class="login-form__form" @submit.prevent="handleLogin">
      <div class="login-form__form-group">
        <label for="username" class="login-form__label">Username:</label>
        <input
          id="username"
          v-model="username"
          type="text"
          required
          :disabled="isLoading"
          class="login-form__input"
        />
      </div>
      
      <div class="login-form__form-group">
        <label for="password" class="login-form__label">Password:</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          :disabled="isLoading"
          class="login-form__input"
        />
      </div>

      <Button 
        type="submit" 
        :disabled="isLoading" 
        :loading="isLoading"
        variant="primary"
      >
        Login
      </Button>

      <div v-if="error" class="login-form__error">{{ error }}</div>
    </form>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/scss/data/login-form.scss';
</style>
