<script setup lang="ts">
import type { Vote } from '~/types/vote';

const props = defineProps<{
  vote: Vote
}>();

const formattedValue = computed(() => {
  if (props.vote.type === 'continuous') {
    return `${props.vote.proposedValue}${props.vote.unit ? ' ' + props.vote.unit : ''}`;
  }
  return props.vote.proposedValue;
})
</script>

<template>
  <span class="vote-value">{{ formattedValue }}</span>
</template>

<style lang="scss" scoped>
.vote-value {
  color: #111827;
  font-weight: 600;
  font-size: 1rem;
}
</style>
