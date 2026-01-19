<script setup lang="ts">
import { useConnection, useDisconnect } from '@wagmi/vue'
import Button from './Button.vue'
import Connect from './Connect.vue'

const { address, isConnected } = useConnection()
const disconnect = useDisconnect()

const formatAddress = (addr: string | undefined) => {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
</script>

<template>
  <div v-if="isConnected" class="account">
    <span class="account__address">{{ formatAddress(address) }}</span>
    <Button variant="secondary" size="small" @click="disconnect.mutate()">
      Disconnect
    </Button>
  </div>
  <Connect v-else />
</template>

<style scoped lang="scss">
@use '../assets/scss/components/buttons.scss';

.account {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &__address {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
    padding: 0.5rem 0.75rem;
    background-color: #f9fafb;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
  }
}
</style>
