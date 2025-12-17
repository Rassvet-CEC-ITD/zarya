<script setup lang="ts">
defineProps<{
  type: 'continuous' | 'categorical'
}>();
</script>

<template>
  <span class="vote-badge" :data-type="type">
    {{ $t(`voting.types.${type}`) }}
  </span>
</template>

<style lang="scss" scoped>
.vote-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border: 1px solid transparent;

  &[data-type="continuous"] {
    background-color: #dbeafe;
    color: #1e40af;
    border-color: #bfdbfe;
  }

  &[data-type="categorical"] {
    background-color: #fef3c7;
    color: #92400e;
    border-color: #fde68a;
  }
}
</style>
