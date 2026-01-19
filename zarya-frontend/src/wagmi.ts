import { createConfig, createStorage, http } from '@wagmi/vue';
import { sepolia } from '@wagmi/vue/chains';
import { metaMask } from '@wagmi/vue/connectors';

export const NODE_URL: string = 'https://eth-sepolia.g.alchemy.com/v2/LPbs7XAJjMz8jCyEszYGq8sL61VuBuFf';

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(
      {
        logging: { developerMode: true, sdk: true },
        dappMetadata: { 
          name: 'Zarya - Decentralized Autonomous Intraparty Organization', 
          // url: 'https://example.com', 
          // iconUrl: 'https://example.com/favicon.ico', 
        }
      }
    ),
  ],
  storage: createStorage({ storage: localStorage, key: 'vite-vue' }),
  transports: {
    [sepolia.id]: http(NODE_URL)
  },
});

declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}
