<script setup lang="ts">
import type { CategoricalValueVoting } from '~/types/vote';

const props = defineProps<{
  voting: CategoricalValueVoting;
}>();

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
  if (seconds <= 0) return 'Голосование завершено';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (days > 0) return `${days}д ${hours}ч ${minutes}м`;
  if (hours > 0) return `${hours}ч ${minutes}м`;
  if (minutes > 0) return `${minutes}м ${secs}с`;
  return `${secs}с`;
});

// Format voting status
const votingStatus = computed(() => {
  if (props.voting.finalized) {
    return props.voting.success ? 'Принято' : 'Отклонено';
  }
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now >= props.voting.endTime) return 'Ожидает завершения';
  if (now >= props.voting.startTime) return 'Активно';
  return 'Запланировано';
});

const statusClass = computed(() => {
  if (props.voting.finalized) {
    return props.voting.success ? 'categorical-value-voting-stats__status--success' : 'categorical-value-voting-stats__status--failed';
  }
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now >= props.voting.startTime && now < props.voting.endTime) {
    return 'categorical-value-voting-stats__status--active';
  }
  return 'categorical-value-voting-stats__status--pending';
});
</script>

<template>
  <div class="categorical-value-voting-stats">
    <div class="categorical-value-voting-stats__header">
      <h3 class="categorical-value-voting-stats__title">Статистика голосования</h3>
      <span :class="['categorical-value-voting-stats__status', statusClass]">
        {{ votingStatus }}
      </span>
    </div>

    <div class="categorical-value-voting-stats__content">
      <div class="categorical-value-voting-stats__row">
        <span class="categorical-value-voting-stats__label">За:</span>
        <div class="categorical-value-voting-stats__value">
          <span class="categorical-value-voting-stats__count categorical-value-voting-stats__count--for">
            {{ voting.forVotes.toString() }}
          </span>
          <span class="categorical-value-voting-stats__percentage">
            ({{ forPercentage.toFixed(1) }}%)
          </span>
        </div>
      </div>

      <div class="categorical-value-voting-stats__progress-bar">
        <div 
          class="categorical-value-voting-stats__progress-fill categorical-value-voting-stats__progress-fill--for"
          :style="{ width: `${forPercentage}%` }"
        />
      </div>

      <div class="categorical-value-voting-stats__row">
        <span class="categorical-value-voting-stats__label">Против:</span>
        <div class="categorical-value-voting-stats__value">
          <span class="categorical-value-voting-stats__count categorical-value-voting-stats__count--against">
            {{ voting.againstVotes.toString() }}
          </span>
          <span class="categorical-value-voting-stats__percentage">
            ({{ againstPercentage.toFixed(1) }}%)
          </span>
        </div>
      </div>

      <div class="categorical-value-voting-stats__progress-bar">
        <div 
          class="categorical-value-voting-stats__progress-fill categorical-value-voting-stats__progress-fill--against"
          :style="{ width: `${againstPercentage}%` }"
        />
      </div>

      <div class="categorical-value-voting-stats__row">
        <span class="categorical-value-voting-stats__label">Всего голосов:</span>
        <span class="categorical-value-voting-stats__value categorical-value-voting-stats__value--bold">
          {{ totalVotes.toString() }}
        </span>
      </div>

      <div v-if="!voting.finalized" class="categorical-value-voting-stats__row">
        <span class="categorical-value-voting-stats__label">Времени до конца:</span>
        <span class="categorical-value-voting-stats__value categorical-value-voting-stats__value--time">
          {{ formattedTimeRemaining }}
        </span>
      </div>

      <div class="categorical-value-voting-stats__meta">
        <div class="categorical-value-voting-stats__row categorical-value-voting-stats__row--small">
          <span class="categorical-value-voting-stats__label">Значение:</span>
          <span class="categorical-value-voting-stats__value">{{ voting.value.toString() }}</span>
        </div>
        <div class="categorical-value-voting-stats__row categorical-value-voting-stats__row--small">
          <span class="categorical-value-voting-stats__label">Автор значения:</span>
          <span class="categorical-value-voting-stats__value categorical-value-voting-stats__value--address">
            {{ voting.valueAuthor.slice(0, 6) }}...{{ voting.valueAuthor.slice(-4) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "~/assets/scss/categoricalValueVoting/stats.scss";
</style>