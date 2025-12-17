<script setup lang="ts">
const props = defineProps<{
  participantsVoted: number
  quorum: number
}>();

const quorumProgress = computed(() => 
  Math.min((props.participantsVoted / props.quorum) * 100, 100)
);
</script>

<template>
  <div class="quorum-progress">
    <p class="quorum-progress__label">
      {{ $t('voting.labels.quorum') }}: {{ participantsVoted }} / {{ quorum }}
    </p>
    <progress class="quorum-progress__bar" :value="quorumProgress" max="100" />
  </div>
</template>

<style lang="scss" scoped>
.quorum-progress {
  display: grid;
  gap: 0.5rem;

  &__label {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
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
      background-color: #3b82f6;
      border-radius: 6px;
      transition: width 0.3s ease;
    }

    &::-moz-progress-bar {
      background-color: #3b82f6;
      border-radius: 6px;
      transition: width 0.3s ease;
    }
  }
}
</style>
