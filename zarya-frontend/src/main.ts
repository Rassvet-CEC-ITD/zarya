import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { WagmiPlugin } from '@wagmi/vue';
import { Buffer } from 'buffer';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';

import enLocale from './locales/en.json';
import ruLocale from './locales/ru.json';

// `@coinbase-wallet/sdk` uses `Buffer`
globalThis.Buffer = Buffer;

import App from './App.vue';
import { router } from './routing';
import { config } from './wagmi';

const queryClient = new QueryClient();

const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'en',
  messages: {
    en: enLocale,
    ru: ruLocale,
  }
});

createApp(App)
  .use(i18n)
  .use(WagmiPlugin, { config })
  .use(VueQueryPlugin, { queryClient })
  .use(router)
  .mount('#app');
