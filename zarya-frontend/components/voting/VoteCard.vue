<script setup lang="ts">
import type { Vote } from '~/types/vote';
import VoteBadge from '~/components/listing/VoteBadge.vue';
import StatusBadge from '~/components/listing/StatusBadge.vue';
import VoteValue from '~/components/listing/VoteValue.vue';
import VotingContinuousStats from '~/components/voting/VotingContinuousStats.vue';
import VotingCategoricalDistribution from '~/components/voting/VotingCategoricalDistribution.vue';
import VoteProgress from '~/components/voting/VoteProgress.vue';
import QuorumProgress from '~/components/voting/QuorumProgress.vue';
import VoteResult from '~/components/voting/VoteResult.vue';
import VotingModal from '~/components/voting/VotingModal.vue';

const props = defineProps<{
  vote: Vote;
  isCompleted?: boolean;
}>();

const { locale } = useI18n();
const isModalOpen = ref(false);

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const intervalQueue = {};

const openModal = () => {
  if (!props.isCompleted) {
    isModalOpen.value = true;
  }
};

const closeModal = () => {
  isModalOpen.value = false;
};
</script>

<template>
  <article :class="['vote-card', { 'vote-card--completed': isCompleted }]" @click="openModal">
    <header class="vote-card__header">
      <VoteBadge :type="vote.type" />
      <StatusBadge :status="vote.status" />
    </header>

    <h2 class="vote-card__title">{{ vote.row }}</h2>
    <p class="vote-card__subtitle">{{ vote.column }}</p>

    <div class="vote-card__proposal">
      <span class="vote-card__proposal-label">
        {{ isCompleted ? $t('voting.labels.value') : $t('voting.labels.proposedValue') }}
      </span>
      <VoteValue :vote="vote" class="vote-card__proposal-value" />
    </div>

    <VotingContinuousStats v-if="vote.type === 'continuous' && !isCompleted" :vote="vote" />
    <VotingCategoricalDistribution v-if="vote.type === 'categorical' && !isCompleted" :vote="vote" />

    <footer class="vote-card__meta">
      <span class="vote-card__meta-organ">{{ vote.organ }}</span>
      <time class="vote-card__meta-date" :datetime="vote.timestamp.toISOString()">
        {{ formatDate(vote.timestamp) }}
      </time>
    </footer>

    <template v-if="!isCompleted">
      <VoteProgress :votes-for="vote.votesFor" :votes-against="vote.votesAgainst" />
      <QuorumProgress :participants-voted="vote.participantsVoted" :quorum="vote.quorum" />
    </template>

    <VoteResult v-else :votes-for="vote.votesFor" :votes-against="vote.votesAgainst" />
  </article>

  <VotingModal v-if="!isCompleted" :vote="vote" :is-open="isModalOpen" @close="closeModal" />
</template>

<style lang="scss">
@use "~/assets/scss/voting/VoteCard.scss";
</style>
