<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ThemeVoting } from '../../types/vote';

import ThemeVotingActions from './ThemeVotingActions.vue';
import ThemeVotingStats from './ThemeVotingStats.vue';

const props = defineProps<{
  voting: ThemeVoting;
}>();

const { t } = useI18n();

// Format author address
const authorDisplay = computed(() => {
  return props.voting.author.slice(0, 6) + '...' + props.voting.author.slice(-4);
});

// Format dates
const formatDate = (timestamp: bigint) => {
  return new Date(Number(timestamp) * 1000).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const startDate = computed(() => formatDate(props.voting.startTime));
const endDate = computed(() => formatDate(props.voting.endTime));
</script>

<template>
  <div class="theme-voting-block">
    <div class="theme-voting-block__header">
      <h3 class="theme-voting-block__title">
        {{ t('voting.theme.votingNumber') }}{{ voting.votingId.toString() }}
      </h3>
      <div class="theme-voting-block__info">
        <span class="theme-voting-block__info-item">
          <span class="theme-voting-block__label">{{ t('voting.labels.author') }}</span>
          <span class="theme-voting-block__value">{{ authorDisplay }}</span>
        </span>
        <span class="theme-voting-block__info-item">
          <span class="theme-voting-block__label">{{ t('voting.labels.type') }}</span>
          <span class="theme-voting-block__value">
            {{ voting.isCategorical ? t('voting.labels.categorical') : t('voting.labels.numerical') }}
          </span>
        </span>
      </div>
      <div class="theme-voting-block__coordinates">
        <span class="theme-voting-block__coordinate">
          <span class="theme-voting-block__label">{{ t('voting.labels.xCoordinate') }}</span>
          <span class="theme-voting-block__value">{{ voting.x.toString() }}</span>
        </span>
      </div>
      <div class="theme-voting-block__theme">
        <span class="theme-voting-block__label">{{ t('voting.labels.theme') }}</span>
        <p class="theme-voting-block__theme-text">{{ voting.theme }}</p>
      </div>
      <div class="theme-voting-block__time">
        <span class="theme-voting-block__time-item">
          <span class="theme-voting-block__label">{{ t('voting.labels.start') }}</span>
          <span class="theme-voting-block__value">{{ startDate }}</span>
        </span>
        <span class="theme-voting-block__time-item">
          <span class="theme-voting-block__label">{{ t('voting.labels.end') }}</span>
          <span class="theme-voting-block__value">{{ endDate }}</span>
        </span>
      </div>
    </div>

    <div class="theme-voting-block__actions">
      <ThemeVotingActions :voting="voting" />
    </div>

    <div class="theme-voting-block__stats">
      <ThemeVotingStats :voting="voting" />
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/themeVoting/block.scss";
</style>
