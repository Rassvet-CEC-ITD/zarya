<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { StatementVoting } from '../../types/vote';

import StatementVotingActions from './StatementVotingActions.vue';
import StatementVotingStats from './StatementVotingStats.vue';

const props = defineProps<{
  voting: StatementVoting;
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
  <div class="statement-voting-block">
    <div class="statement-voting-block__header">
      <h3 class="statement-voting-block__title">
        {{ t('voting.statement.votingNumber') }}{{ voting.votingId.toString() }}
      </h3>
      <div class="statement-voting-block__info">
        <span class="statement-voting-block__info-item">
          <span class="statement-voting-block__label">{{ t('voting.labels.author') }}</span>
          <span class="statement-voting-block__value">{{ authorDisplay }}</span>
        </span>
        <span class="statement-voting-block__info-item">
          <span class="statement-voting-block__label">{{ t('voting.labels.type') }}</span>
          <span class="statement-voting-block__value">
            {{ voting.isCategorical ? t('voting.labels.categorical') : t('voting.labels.numerical') }}
          </span>
        </span>
      </div>
      <div class="statement-voting-block__coordinates">
        <span class="statement-voting-block__coordinate">
          <span class="statement-voting-block__label">{{ t('voting.labels.coordinates') }}</span>
          <span class="statement-voting-block__value">
            ({{ voting.x.toString() }}, {{ voting.y.toString() }})
          </span>
        </span>
      </div>
      <div class="statement-voting-block__statement">
        <span class="statement-voting-block__label">{{ t('voting.labels.statement') }}</span>
        <p class="statement-voting-block__statement-text">{{ voting.statement }}</p>
      </div>
      <div class="statement-voting-block__time">
        <span class="statement-voting-block__time-item">
          <span class="statement-voting-block__label">{{ t('voting.labels.start') }}</span>
          <span class="statement-voting-block__value">{{ startDate }}</span>
        </span>
        <span class="statement-voting-block__time-item">
          <span class="statement-voting-block__label">{{ t('voting.labels.end') }}</span>
          <span class="statement-voting-block__value">{{ endDate }}</span>
        </span>
      </div>
    </div>

    <div class="statement-voting-block__actions">
      <StatementVotingActions :voting="voting" />
    </div>

    <div class="statement-voting-block__stats">
      <StatementVotingStats :voting="voting" />
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/statementVoting/block.scss";
</style>
