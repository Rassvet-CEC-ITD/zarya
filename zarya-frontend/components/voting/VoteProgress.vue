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
  <div class="vote-progress">
    <header class="vote-progress__header">
      <span>{{ $t('voting.labels.for') }}: {{ votesFor }}</span>
      <span>{{ $t('voting.labels.against') }}: {{ votesAgainst }}</span>
    </header>
    <progress class="vote-progress__bar" :value="voteProgress" max="100" />
  </div>
</template>

<style lang="scss" scoped>
.vote-progress {
  display: grid;
  gap: 0.5rem;

  &__header {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  &__bar {
    width: 100%;
    height: 8px;
    background-color: #f3f4f6;
    border-radius: 6px;
    overflow: hidden;
    border: none;
    appearance: none;

    &::-webkit-progress-bar {
      background-color: #f3f4f6;
      border-radius: 6px;
    }

    &::-webkit-progress-value {
      background-color: #10b981;
      border-radius: 6px;
      transition: width 0.3s ease;
    }

    &::-moz-progress-bar {
      background-color: #10b981;
      border-radius: 6px;
      transition: width 0.3s ease;
    }
  }
}
</style>
