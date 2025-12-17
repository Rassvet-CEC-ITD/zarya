<script setup lang="ts">
const props = defineProps<{
  votesFor: number
  votesAgainst: number
}>();

const voteProgress = computed(() => {
  const total = props.votesFor + props.votesAgainst;
  return total > 0 ? (props.votesFor / total) * 100 : 0;
});
</script>

<template>
  <div class="vote-result">
    <span>{{ $t('voting.labels.for') }}: {{ votesFor }} ({{ voteProgress.toFixed(0) }}%)</span>
    <span>{{ $t('voting.labels.against') }}: {{ votesAgainst }}</span>
  </div>
</template>

<style lang="scss" scoped>
.vote-result {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}
</style>
