<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CategoricalValueVoting } from '../../types/vote';
import { decodeOrganHash } from '../../composables/usePartyOrgan';

import CategoricalValueVotingActions from './CategoricalValueVotingActions.vue';
import CategoricalValueVotingStats from './CategoricalValueVotingStats.vue';

const props = defineProps<{
  voting: CategoricalValueVoting;
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
  <div class="categorical-value-voting-block">
    <div class="categorical-value-voting-block__header">
      <h3 class="categorical-value-voting-block__title">
        {{ t('voting.categoricalValue.votingNumber') }}{{ voting.votingId.toString() }}
      </h3>
      <div class="categorical-value-voting-block__info">
        <span class="categorical-value-voting-block__info-item">
          <span class="categorical-value-voting-block__label">{{ t('voting.labels.organ') }}</span>
          <span class="categorical-value-voting-block__value">{{ organDisplay }}</span>
        </span>
        <span class="categorical-value-voting-block__info-item">
          <span class="categorical-value-voting-block__label">{{ t('voting.labels.author') }}</span>
          <span class="categorical-value-voting-block__value">{{ authorDisplay }}</span>
        </span>
      </div>
      <div class="categorical-value-voting-block__coordinates">
        <span class="categorical-value-voting-block__coordinate">
          <span class="categorical-value-voting-block__label">{{ t('voting.labels.coordinates') }}</span>
          <span class="categorical-value-voting-block__value">
            ({{ voting.x.toString() }}, {{ voting.y.toString() }})
          </span>
        </span>
      </div>
      <div class="categorical-value-voting-block__time">
        <span class="categorical-value-voting-block__time-item">
          <span class="categorical-value-voting-block__label">{{ t('voting.labels.start') }}</span>
          <span class="categorical-value-voting-block__value">{{ startDate }}</span>
        </span>
        <span class="categorical-value-voting-block__time-item">
          <span class="categorical-value-voting-block__label">{{ t('voting.labels.end') }}</span>
          <span class="categorical-value-voting-block__value">{{ endDate }}</span>
        </span>
      </div>
    </div>

    <div class="categorical-value-voting-block__actions">
      <CategoricalValueVotingActions :voting="voting" :organ="voting.organ" />
    </div>

    <div class="categorical-value-voting-block__stats">
      <CategoricalValueVotingStats :voting="voting" />
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/categoricalValueVoting/block.scss";
</style>