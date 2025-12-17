<script setup lang="ts">
import { useAccount } from '@wagmi/vue'
import { useMockVotes } from '~/composables/useMockVotes';
import VoteBadge from '~/components/listing/VoteBadge.vue';
import StatusBadge from '~/components/listing/StatusBadge.vue';
import VoteValue from '~/components/listing/VoteValue.vue';

const { status } = useAccount()
const votes = useMockVotes();
</script>

<template>
  <section class="listing" aria-labelledby="listing-title">
    <main class="listing__content">
      <h1 id="listing-title" class="listing__title">{{ $t('listing.title') }}</h1>
      <ul class="listing__list" :aria-label="$t('listing.title')">
        <li v-for="vote in votes" :key="vote.id" class="listing__item">
          <header class="listing__item-header">
            <VoteBadge :type="vote.type" />
            <StatusBadge :status="vote.status" />
          </header>
          <h2 class="listing__item-title">{{ vote.row }}</h2>
          <p class="listing__item-desc">{{ vote.column }}</p>
          <footer class="listing__item-meta">
            <strong class="listing__item-organ">{{ vote.organ }}</strong>
            <VoteValue :vote="vote" />
          </footer>
        </li>
      </ul>
      <Button v-if="status === 'connected'" to="/voting" variant="primary">{{ $t('listing.viewAllVotes') }}</Button>
    </main>
  </section>
</template>

<style lang="scss">
@use "~/assets/scss/listing/index.scss";
</style>
