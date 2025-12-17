<script setup lang="ts">
import type { ContinuousVote, Vote } from '~/types/vote';

defineProps<{ vote: Vote }>();
</script>

<template>
  <section class="vote-card__stats">
    <dl class="vote-card__stat">
      <dt class="vote-card__stat-term">{{ $t('voting.labels.currentMean') }}</dt>
      <dd class="vote-card__stat-value">
        {{ (vote as ContinuousVote).currentMean?.toFixed(2) }}{{ (vote as ContinuousVote).unit ? ' ' + (vote as ContinuousVote).unit : '' }}
      </dd>
    </dl>
    <dl class="vote-card__stat">
      <dt class="vote-card__stat-term">{{ $t('voting.labels.confidenceInterval') }}</dt>
      <dd class="vote-card__stat-value">
        [{{ (vote as ContinuousVote).confidenceInterval?.[0] }}, {{ (vote as ContinuousVote).confidenceInterval?.[1] }}]
      </dd>
    </dl>
    <dl class="vote-card__stat">
      <dt class="vote-card__stat-term">{{ $t('voting.labels.sampleSize') }}</dt>
      <dd class="vote-card__stat-value">{{ (vote as ContinuousVote).currentSample.length }}</dd>
    </dl>
  </section>
</template>
