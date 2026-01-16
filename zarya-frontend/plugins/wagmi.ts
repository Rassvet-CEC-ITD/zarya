import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { WagmiPlugin } from '@wagmi/vue'
import { defineNuxtPlugin } from 'nuxt/app'
import { hashFn } from '@wagmi/core/query';

import { config } from '~/wagmi'

const queryClient = new QueryClient({ 
  defaultOptions: { 
    queries: { 
      queryKeyHashFn: hashFn, 
    }, 
  }, 
})

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(WagmiPlugin, { config }).use(VueQueryPlugin, { queryClient })
})
