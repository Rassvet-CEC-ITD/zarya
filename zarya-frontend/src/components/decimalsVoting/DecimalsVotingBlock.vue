<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DecimalsVoting } from '../../types/vote';
import { decodeOrganHash } from '../../composables/usePartyOrgan';

import DecimalsVotingActions from './DecimalsVotingActions.vue';
import DecimalsVotingStats from './DecimalsVotingStats.vue';

const props = defineProps<{
  voting: DecimalsVoting;
}>();

const { t } = useI18n();

// Decode organ hash to human-readable identifier
const organDisplay = computed(() => {
  return decodeOrganHash(props.voting.organ, t);
});

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
  <div class="decimals-voting-block">
    <div class="decimals-voting-block__header">
      <h3 class="decimals-voting-block__title">
        {{ t('voting.decimals.votingNumber') }}{{ voting.votingId.toString() }}
      </h3>
      <div class="decimals-voting-block__info">
        <span class="decimals-voting-block__info-item">
          <span class="decimals-voting-block__label">{{ t('voting.labels.organ') }}</span>
          <span class="decimals-voting-block__value">{{ organDisplay }}</span>
        </span>
        <span class="decimals-voting-block__info-item">
          <span class="decimals-voting-block__label">{{ t('voting.labels.author') }}</span>
          <span class="decimals-voting-block__value">{{ authorDisplay }}</span>
        </span>
      </div>
      <div class="decimals-voting-block__coordinates">
        <span class="decimals-voting-block__coordinate">
          <span class="decimals-voting-block__label">{{ t('voting.labels.coordinates') }}</span>
          <span class="decimals-voting-block__value">
            ({{ voting.x.toString() }}, {{ voting.y.toString() }})
          </span>
        </span>
      </div>
      <div class="decimals-voting-block__time">
        <span class="decimals-voting-block__time-item">
          <span class="decimals-voting-block__label">{{ t('voting.labels.start') }}</span>
          <span class="decimals-voting-block__value">{{ startDate }}</span>
        </span>
        <span class="decimals-voting-block__time-item">
          <span class="decimals-voting-block__label">{{ t('voting.labels.end') }}</span>
          <span class="decimals-voting-block__value">{{ endDate }}</span>
        </span>
      </div>
    </div>

    <div class="decimals-voting-block__actions">
      <DecimalsVotingActions :voting="voting" :organ="voting.organ" />
    </div>

    <div class="decimals-voting-block__stats">
      <DecimalsVotingStats :voting="voting" />
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/decimalsVoting/block.scss";
</style>
