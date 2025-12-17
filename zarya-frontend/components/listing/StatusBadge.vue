<script setup lang="ts">
defineProps<{
  status: 'active' | 'passed' | 'rejected'
}>();
</script>

<template>
  <span class="status-badge" :data-status="status">
    {{ $t(`voting.status.${status}`) }}
  </span>
</template>

<style lang="scss" scoped>
.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border: 1px solid transparent;

  &[data-status="active"] {
    background-color: #d1fae5;
    color: #065f46;
    border-color: #a7f3d0;
  }

  &[data-status="passed"] {
    background-color: #dbeafe;
    color: #1e40af;
    border-color: #bfdbfe;
  }

  &[data-status="rejected"] {
    background-color: #fee2e2;
    color: #991b1b;
    border-color: #fecaca;
  }
}
</style>
