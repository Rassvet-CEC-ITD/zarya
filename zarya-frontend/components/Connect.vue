<script setup lang="ts">
import { useChainId, useConnect } from '@wagmi/vue'

const chainId = useChainId()
const { connect, connectors, error, status } = useConnect()
</script>

<template>
  <div class="connect">
    <Button
      v-for="connector in connectors" 
      :key="connector.id"
      variant="secondary"
      size="small"
      :disabled="status === 'pending'"
      @click="connect({ connector, chainId })"
    >
      {{ connector.name }}
    </Button>
    <span v-if="error" class="connect__error">{{ error?.message }}</span>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/components/buttons.scss';

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
