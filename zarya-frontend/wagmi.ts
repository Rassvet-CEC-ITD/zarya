import { cookieStorage, createConfig, createStorage, http } from '@wagmi/vue'
import { sepolia } from '@wagmi/vue/chains'
import { metaMask } from '@wagmi/vue/connectors'

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/LPbs7XAJjMz8jCyEszYGq8sL61VuBuFf')
  },
})

declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}
