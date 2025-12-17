<script setup lang="ts">
import type { CategoricalVote, Vote } from '~/types/vote';

defineProps<{ vote: Vote }>();
</script>

<template>
  <section class="vote-card__distribution">
    <h3 class="vote-card__distribution-title">{{ $t('voting.labels.currentDistribution') }}</h3>
    <ul class="vote-card__categories">
      <li v-for="(percent, category) in (vote as CategoricalVote).currentDistribution" :key="category" class="vote-card__category">
        <span class="vote-card__category-name">{{ category }}</span>
        <meter class="vote-card__category-meter" :value="percent * 100" min="0" max="100">
          <span class="vote-card__category-fill" :style="{ width: `${percent * 100}%` }"></span>
        </meter>
        <span class="vote-card__category-percent">{{ (percent * 100).toFixed(0) }}%</span>
      </li>
    </ul>
  </section>
</template>
