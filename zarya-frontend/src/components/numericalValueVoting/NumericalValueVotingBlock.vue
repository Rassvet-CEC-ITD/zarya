<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { NumericalValueVoting } from '../../types/vote';
import { decodeOrganHash } from '../../composables/usePartyOrgan';
import NumericalValueVotingActions from './NumericalValueVotingActions.vue';
import NumericalValueVotingStats from './NumericalValueVotingStats.vue';

const props = defineProps<{
  voting: NumericalValueVoting
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
  <div class="numerical-value-voting-block">
    <div class="numerical-value-voting-block__header">
      <h3 class="numerical-value-voting-block__title">
        {{ t('voting.numericalValue.votingNumber') }}{{ voting.votingId.toString() }}
      </h3>
      <div class="numerical-value-voting-block__info">
        <span class="numerical-value-voting-block__info-item">
          <span class="numerical-value-voting-block__label">{{ t('voting.labels.organ') }}</span>
          <span class="numerical-value-voting-block__value">{{ organDisplay }}</span>
        </span>
        <span class="numerical-value-voting-block__info-item">
          <span class="numerical-value-voting-block__label">{{ t('voting.labels.author') }}</span>
          <span class="numerical-value-voting-block__value">{{ authorDisplay }}</span>
        </span>
      </div>
      <div class="numerical-value-voting-block__coordinates">
        <span class="numerical-value-voting-block__coordinate">
          <span class="numerical-value-voting-block__label">{{ t('voting.labels.coordinates') }}</span>
          <span class="numerical-value-voting-block__value">
            ({{ voting.x.toString() }}, {{ voting.y.toString() }})
          </span>
        </span>
      </div>
      <div class="numerical-value-voting-block__time">
        <span class="numerical-value-voting-block__time-item">
          <span class="numerical-value-voting-block__label">{{ t('voting.labels.start') }}</span>
          <span class="numerical-value-voting-block__value">{{ startDate }}</span>
        </span>
        <span class="numerical-value-voting-block__time-item">
          <span class="numerical-value-voting-block__label">{{ t('voting.labels.end') }}</span>
          <span class="numerical-value-voting-block__value">{{ endDate }}</span>
        </span>
      </div>
    </div>

    <div class="numerical-value-voting-block__actions">
      <NumericalValueVotingActions :voting="voting" :organ="voting.organ" />
    </div>

    <div class="numerical-value-voting-block__stats">
      <NumericalValueVotingStats :voting="voting" />
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/numericalValueVoting/block.scss";
</style>
