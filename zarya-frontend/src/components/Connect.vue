<script setup lang="ts">
import { useChainId, useConnect, useConnection, useConnectors } from '@wagmi/vue'
import Button from './Button.vue'

const chainId = useChainId();
const connect = useConnect();
const connection = useConnection();
const connectors = useConnectors();
</script>

<template>
  <div class="connect">
    <Button
      v-for="connector in connectors" 
      :key="connector.id"
      variant="secondary"
      size="small"
      :disabled="connection.isConnecting.value"
      @click="connect.mutate({ connector, chainId })"
    >
      {{ connector.name }}
    </Button>
    <span v-if="connect.isError" class="connect__error">{{ connect.error?.value }}</span>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/scss/components/buttons.scss';

.connect {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &__error {
    font-size: 0.75rem;
    color: #ef4444;
    font-weight: 500;
  }
}
</style>
