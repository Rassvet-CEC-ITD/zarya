<script setup lang="ts">
import { useAccount } from '@wagmi/vue'
import { useMockVotes } from '~/composables/useMockVotes';
const { status } = useAccount()
const votes = useMockVotes();
const activeVotes = computed(() => votes.value.filter(v => v.status === 'active'));
const completedVotes = computed(() => votes.value.filter(v => v.status !== 'active'));
const selectedTab = ref<'active' | 'completed'>('active');
</script>

<template>
  <section class="voting" aria-labelledby="voting-title">
    <main v-if="status === 'connected'" class="voting__content">
      <h1 id="voting-title" class="voting__title">{{ $t('voting.title') }}</h1>

      <nav class="voting__tabs">
        <Button
          :class="{ 'voting__tab--active': selectedTab === 'active' }"
          class="voting__tab"
          variant="secondary"
          @click="selectedTab = 'active'"
          type="button"
        >
          {{ $t('voting.tabs.active') }} ({{ activeVotes.length }})
        </Button>
        <Button
          :class="{ 'voting__tab--active': selectedTab === 'completed' }"
          class="voting__tab"
          variant="secondary"
          @click="selectedTab = 'completed'"
          type="button"
        >
          {{ $t('voting.tabs.completed') }} ({{ completedVotes.length }})
        </Button>
      </nav>

      <section class="voting__list">
        <VoteCard 
          v-for="vote in selectedTab === 'active' ? activeVotes : completedVotes" 
          :key="vote.id" 
          :vote="vote"
          :is-completed="selectedTab === 'completed'"
        />
      </section>
    </main>
    <div v-else class="voting__placeholder">
      <p>Connect to the crypto wallet first!</p>
    </div>
  </section>
</template>

<style lang="scss">
@use "~/assets/scss/voting/index.scss";
</style>