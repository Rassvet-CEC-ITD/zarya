<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { NumericalValueVoting } from '../../types/vote';

const props = defineProps<{
  voting: NumericalValueVoting
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

// Check if voting is active
const isActive = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return !props.voting.finalized && now < props.voting.endTime;
});

// Compute status
const status = computed(() => {
  if (isActive.value) return 'active';
  if (!props.voting.finalized) return 'pending';
  return props.voting.forVotes > props.voting.againstVotes ? 'success' : 'failed';
});

// Calculate time remaining (only for active votings)
const timeRemaining = computed(() => {
  if (!isActive.value) return null;
  
  const now = BigInt(Math.floor(Date.now() / 1000));
  const remaining = props.voting.endTime - now;
  
  if (remaining <= 0n) return null;
  
  const seconds = Number(remaining);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (days > 0) {
    return t('voting.time.daysHoursMinutes', { days, hours, minutes });
  } else if (hours > 0) {
    return t('voting.time.hoursMinutes', { hours, minutes });
  } else if (minutes > 0) {
    return t('voting.time.minutesSeconds', { minutes, seconds: secs });
  } else {
    return t('voting.time.seconds', { seconds: secs });
  }
});
</script>

<template>
  <div class="numerical-value-voting-stats">
    <div class="numerical-value-voting-stats__header">
      <h4 class="numerical-value-voting-stats__title">{{ t('voting.numericalValue.statisticsTitle') }}</h4>
      <span 
        :class="[
          'numerical-value-voting-stats__status',
          `numerical-value-voting-stats__status--${status}`
        ]"
      >
        {{ t(`voting.status.${status}`) }}
      </span>
    </div>

    <div class="numerical-value-voting-stats__content">
      <!-- Value showcase -->
      <div v-if="voting.value !== undefined" class="numerical-value-voting-stats__value-showcase">
        <span class="numerical-value-voting-stats__value-label">{{ t('voting.labels.proposedNumericalValue') }}</span>
        <div class="numerical-value-voting-stats__value-display">
          {{ voting.value.toString() }}
        </div>
      </div>

      <div class="numerical-value-voting-stats__divider"></div>

      <!-- Vote counts -->
      <div class="numerical-value-voting-stats__row">
        <span class="numerical-value-voting-stats__label">{{ t('voting.labels.for') }}:</span>
        <span class="numerical-value-voting-stats__value">
          {{ voting.forVotes.toString() }}
          <span v-if="totalVotes > 0n">({{ forPercentage.toFixed(1) }}%)</span>
        </span>
      </div>

      <div class="numerical-value-voting-stats__progress">
        <div 
          class="numerical-value-voting-stats__progress-bar numerical-value-voting-stats__progress-bar--for"
          :style="{ width: `${forPercentage}%` }"
        ></div>
      </div>

      <div class="numerical-value-voting-stats__row">
        <span class="numerical-value-voting-stats__label">{{ t('voting.labels.against') }}:</span>
        <span class="numerical-value-voting-stats__value">
          {{ voting.againstVotes.toString() }}
          <span v-if="totalVotes > 0n">({{ againstPercentage.toFixed(1) }}%)</span>
        </span>
      </div>

      <div class="numerical-value-voting-stats__progress">
        <div 
          class="numerical-value-voting-stats__progress-bar numerical-value-voting-stats__progress-bar--against"
          :style="{ width: `${againstPercentage}%` }"
        ></div>
      </div>

      <div class="numerical-value-voting-stats__divider"></div>

      <!-- Total votes -->
      <div class="numerical-value-voting-stats__row">
        <span class="numerical-value-voting-stats__label">{{ t('voting.labels.totalVotes') }}</span>
        <span class="numerical-value-voting-stats__value">{{ totalVotes.toString() }}</span>
      </div>

      <!-- Time remaining (only for active votings) -->
      <div v-if="timeRemaining" class="numerical-value-voting-stats__row">
        <span class="numerical-value-voting-stats__label">{{ t('voting.labels.timeRemaining') }}</span>
        <span class="numerical-value-voting-stats__value">{{ timeRemaining }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/numericalValueVoting/stats.scss";
</style>
