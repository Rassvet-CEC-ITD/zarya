<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DecimalsVoting } from '../../types/vote';

const props = defineProps<{
  voting: DecimalsVoting;
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
    return props.voting.success ? 'decimals-voting-stats__status--success' : 'decimals-voting-stats__status--failed';
  }
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now >= props.voting.startTime && now < props.voting.endTime) {
    return 'decimals-voting-stats__status--active';
  }
  return 'decimals-voting-stats__status--pending';
});
</script>

<template>
  <div class="decimals-voting-stats">
    <div class="decimals-voting-stats__header">
      <h3 class="decimals-voting-stats__title">{{ t('voting.decimals.statisticsTitle') }}</h3>
      <span :class="['decimals-voting-stats__status', statusClass]">
        {{ votingStatus }}
      </span>
    </div>

    <div class="decimals-voting-stats__content">
      <div class="decimals-voting-stats__decimals-showcase">
        <p class="decimals-voting-stats__decimals-label">{{ t('voting.labels.proposedDecimals') }}</p>
        <h1 class="decimals-voting-stats__decimals-display">
          {{ voting.decimals }}
        </h1>
        <p class="decimals-voting-stats__decimals-hint">
          {{ t('voting.labels.decimalPlaces') }}
        </p>
      </div>

      <div class="decimals-voting-stats__divider"></div>

      <div class="decimals-voting-stats__row">
        <span class="decimals-voting-stats__label">{{ t('voting.labels.for') }}:</span>
        <span class="decimals-voting-stats__value">{{ voting.forVotes.toString() }} ({{ forPercentage.toFixed(1) }}%)</span>
      </div>

      <div class="decimals-voting-stats__progress">
        <div class="decimals-voting-stats__progress-bar decimals-voting-stats__progress-bar--for" :style="{ width: `${forPercentage}%` }"></div>
      </div>

      <div class="decimals-voting-stats__row">
        <span class="decimals-voting-stats__label">{{ t('voting.labels.against') }}:</span>
        <span class="decimals-voting-stats__value">{{ voting.againstVotes.toString() }} ({{ againstPercentage.toFixed(1) }}%)</span>
      </div>

      <div class="decimals-voting-stats__progress">
        <div class="decimals-voting-stats__progress-bar decimals-voting-stats__progress-bar--against" :style="{ width: `${againstPercentage}%` }"></div>
      </div>

      <div class="decimals-voting-stats__row">
        <span class="decimals-voting-stats__label">{{ t('voting.labels.totalVotes') }}</span>
        <span class="decimals-voting-stats__value">{{ totalVotes.toString() }}</span>
      </div>

      <div v-if="!voting.finalized" class="decimals-voting-stats__row">
        <span class="decimals-voting-stats__label">{{ t('voting.labels.timeRemaining') }}</span>
        <span class="decimals-voting-stats__value">{{ formattedTimeRemaining }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/decimalsVoting/stats.scss";
</style>
