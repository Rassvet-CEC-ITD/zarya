import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  components: [{ path: '~/components', pathPrefix: false }],
  devtools: { enabled: true },
  modules: ['@wagmi/vue/nuxt', '@nuxtjs/i18n'],
  compatibilityDate: '2026-01-15',
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ru', name: 'Русский', file: 'ru.json' }
    ]
  },
  nitro: {
    routeRules: {
      '/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
          'Access-Control-Allow-Headers': '*'
        }
      }
    }
  },
  vite: {
    server: {
      cors: true
    }
  }
});
