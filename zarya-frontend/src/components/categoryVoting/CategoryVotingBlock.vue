<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CategoryVoting } from '../../types/vote';
import { decodeOrganHash } from '../../composables/usePartyOrgan';

import CategoryVotingActions from './CategoryVotingActions.vue';
import CategoryVotingStats from './CategoryVotingStats.vue';

const props = defineProps<{
  voting: CategoryVoting;
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
  <div class="category-voting-block">
    <div class="category-voting-block__header">
      <h3 class="category-voting-block__title">
        {{ t('voting.category.votingNumber') }}{{ voting.votingId.toString() }}
      </h3>
      <div class="category-voting-block__info">
        <span class="category-voting-block__info-item">
          <span class="category-voting-block__label">{{ t('voting.labels.organ') }}</span>
          <span class="category-voting-block__value">{{ organDisplay }}</span>
        </span>
        <span class="category-voting-block__info-item">
          <span class="category-voting-block__label">{{ t('voting.labels.author') }}</span>
          <span class="category-voting-block__value">{{ authorDisplay }}</span>
        </span>
      </div>
      <div class="category-voting-block__coordinates">
        <span class="category-voting-block__coordinate">
          <span class="category-voting-block__label">{{ t('voting.labels.coordinates') }}</span>
          <span class="category-voting-block__value">
            ({{ voting.x.toString() }}, {{ voting.y.toString() }})
          </span>
        </span>
      </div>
      <div class="category-voting-block__time">
        <span class="category-voting-block__time-item">
          <span class="category-voting-block__label">{{ t('voting.labels.start') }}</span>
          <span class="category-voting-block__value">{{ startDate }}</span>
        </span>
        <span class="category-voting-block__time-item">
          <span class="category-voting-block__label">{{ t('voting.labels.end') }}</span>
          <span class="category-voting-block__value">{{ endDate }}</span>
        </span>
      </div>
    </div>

    <div class="category-voting-block__actions">
      <CategoryVotingActions :voting="voting" :organ="voting.organ" />
    </div>

    <div class="category-voting-block__stats">
      <CategoryVotingStats :voting="voting" />
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/categoryVoting/block.scss";
</style>
