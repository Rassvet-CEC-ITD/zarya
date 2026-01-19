<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { StatementVoting } from '../../types/vote';

const props = defineProps<{
  voting: StatementVoting;
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
    return props.voting.success ? 'statement-voting-stats__status--success' : 'statement-voting-stats__status--failed';
  }
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now >= props.voting.startTime && now < props.voting.endTime) {
    return 'statement-voting-stats__status--active';
  }
  return 'statement-voting-stats__status--pending';
});
</script>

<template>
  <div class="statement-voting-stats">
    <div class="statement-voting-stats__header">
      <h3 class="statement-voting-stats__title">{{ t('voting.statement.statisticsTitle') }}</h3>
      <span :class="['statement-voting-stats__status', statusClass]">
        {{ votingStatus }}
      </span>
    </div>

    <div class="statement-voting-stats__content">
      <div class="statement-voting-stats__row">
        <span class="statement-voting-stats__label">{{ t('voting.labels.for') }}:</span>
        <div class="statement-voting-stats__value">
          <span class="statement-voting-stats__count statement-voting-stats__count--for">
            {{ voting.forVotes.toString() }}
          </span>
          <span class="statement-voting-stats__percentage">
            ({{ forPercentage.toFixed(1) }}%)
          </span>
        </div>
      </div>

      <div class="statement-voting-stats__progress-bar">
        <div 
          class="statement-voting-stats__progress-fill statement-voting-stats__progress-fill--for"
          :style="{ width: `${forPercentage}%` }"
        />
      </div>

      <div class="statement-voting-stats__row">
        <span class="statement-voting-stats__label">{{ t('voting.labels.against') }}:</span>
        <div class="statement-voting-stats__value">
          <span class="statement-voting-stats__count statement-voting-stats__count--against">
            {{ voting.againstVotes.toString() }}
          </span>
          <span class="statement-voting-stats__percentage">
            ({{ againstPercentage.toFixed(1) }}%)
          </span>
        </div>
      </div>

      <div class="statement-voting-stats__progress-bar">
        <div 
          class="statement-voting-stats__progress-fill statement-voting-stats__progress-fill--against"
          :style="{ width: `${againstPercentage}%` }"
        />
      </div>

      <div class="statement-voting-stats__row">
        <span class="statement-voting-stats__label">{{ t('voting.labels.totalVotes') }}</span>
        <span class="statement-voting-stats__value statement-voting-stats__value--bold">
          {{ totalVotes.toString() }}
        </span>
      </div>

      <div v-if="!voting.finalized" class="statement-voting-stats__row">
        <span class="statement-voting-stats__label">{{ t('voting.labels.timeRemaining') }}</span>
        <span class="statement-voting-stats__value statement-voting-stats__value--time">
          {{ formattedTimeRemaining }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/statementVoting/stats.scss";
</style>
