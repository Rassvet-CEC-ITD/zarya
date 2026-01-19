<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CategoryVoting } from '../../types/vote';

const props = defineProps<{
  voting: CategoryVoting;
}>();

const { t } = useI18n();

// Calculate total votes
const totalVotes = computed(() => props.voting.forVotes + props.voting.againstVotes);

// Calculate percentages
const forPercentage = computed(() => {
  if (totalVotes.value === 0n) return 0;
  return Number((props.voting.forVotes * 100n) / totalVotes.value);
});

const againstPercentage = computed(() => {
  if (totalVotes.value === 0n) return 0;
  return Number((props.voting.againstVotes * 100n) / totalVotes.value);
});

// Calculate time remaining
const timeRemaining = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now >= props.voting.endTime) return 0n;
  return props.voting.endTime - now;
});

// Format time remaining
const formattedTimeRemaining = computed(() => {
  const seconds = Number(timeRemaining.value);
  if (seconds <= 0) return t('voting.status.finalized');
  
  const endDate = new Date(Number(props.voting.endTime) * 1000);
  const nowDate = new Date();
  const diff = endDate.getTime() - nowDate.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  
  if (days > 0) return t('voting.time.daysHoursMinutes', { days, hours, minutes });
  if (hours > 0) return t('voting.time.hoursMinutes', { hours, minutes });
  if (minutes > 0) return t('voting.time.minutesSeconds', { minutes, seconds: secs });
  return t('voting.time.seconds', { seconds: secs });
});

// Format voting status
const votingStatus = computed(() => {
  if (props.voting.finalized) {
    return props.voting.success ? t('voting.status.passed') : t('voting.status.rejected');
  }
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now >= props.voting.endTime) return t('voting.status.waitingExecution');
  if (now >= props.voting.startTime) return t('voting.status.active');
  return t('voting.status.scheduled');
});

const statusClass = computed(() => {
  if (props.voting.finalized) {
    return props.voting.success ? 'category-voting-stats__status--success' : 'category-voting-stats__status--failed';
  }
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now >= props.voting.startTime && now < props.voting.endTime) {
    return 'category-voting-stats__status--active';
  }
  return 'category-voting-stats__status--pending';
});
</script>

<template>
  <div class="category-voting-stats">
    <div class="category-voting-stats__header">
      <h3 class="category-voting-stats__title">{{ t('voting.category.statisticsTitle') }}</h3>
      <span :class="['category-voting-stats__status', statusClass]">
        {{ votingStatus }}
      </span>
    </div>

    <div class="category-voting-stats__content">
      <div class="category-voting-stats__category-showcase">
        <p class="category-voting-stats__category-label">{{ t('voting.labels.proposedCategory') }}</p>
        <h1 class="category-voting-stats__category-display">
          {{ voting.categoryName }}
        </h1>
        <p class="category-voting-stats__category-id">
          {{ t('voting.labels.categoryId') }}: {{ voting.category.toString() }}
        </p>
      </div>

      <div class="category-voting-stats__divider"></div>

      <div class="category-voting-stats__row">
        <span class="category-voting-stats__label">{{ t('voting.labels.for') }}:</span>
        <span class="category-voting-stats__value">{{ voting.forVotes.toString() }} ({{ forPercentage.toFixed(1) }}%)</span>
      </div>

      <div class="category-voting-stats__progress">
        <div class="category-voting-stats__progress-bar category-voting-stats__progress-bar--for" :style="{ width: `${forPercentage}%` }"></div>
      </div>

      <div class="category-voting-stats__row">
        <span class="category-voting-stats__label">{{ t('voting.labels.against') }}:</span>
        <span class="category-voting-stats__value">{{ voting.againstVotes.toString() }} ({{ againstPercentage.toFixed(1) }}%)</span>
      </div>

      <div class="category-voting-stats__progress">
        <div class="category-voting-stats__progress-bar category-voting-stats__progress-bar--against" :style="{ width: `${againstPercentage}%` }"></div>
      </div>

      <div class="category-voting-stats__row">
        <span class="category-voting-stats__label">{{ t('voting.labels.totalVotes') }}</span>
        <span class="category-voting-stats__value">{{ totalVotes.toString() }}</span>
      </div>

      <div v-if="!voting.finalized" class="category-voting-stats__row">
        <span class="category-voting-stats__label">{{ t('voting.labels.timeRemaining') }}</span>
        <span class="category-voting-stats__value">{{ formattedTimeRemaining }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/categoryVoting/stats.scss";
</style>
