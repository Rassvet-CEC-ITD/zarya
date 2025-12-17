<script setup lang="ts">
import type { Vote } from '~/types/vote'

const props = defineProps<{
  vote: Vote
  isOpen: boolean
}>();

const emit = defineEmits<{
  close: []
}>();

const { locale } = useI18n();

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close');
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-backdrop" @click="handleBackdropClick">
        <div class="modal-content" role="dialog" aria-modal="true">
          <Button
            class="modal-close"
            variant="secondary"
            @click="emit('close')"
            type="button"
            aria-label="Close"
          >
            ✕
          </Button>

          <header class="modal-header">
            <VoteBadge :type="vote.type" />
            <StatusBadge :status="vote.status" />
          </header>

          <h2 class="modal-title">{{ vote.row }}</h2>
          <p class="modal-subtitle">{{ vote.column }}</p>

          <div class="modal-proposal">
            <span class="modal-proposal-label">{{ $t('voting.labels.proposedValue') }}</span>
            <VoteValue :vote="vote" class="modal-proposal-value" />
          </div>

          <div class="modal-meta">
            <span class="modal-meta-organ">{{ vote.organ }}</span>
            <time class="modal-meta-date" :datetime="vote.timestamp.toISOString()">
              {{ formatDate(vote.timestamp) }}
            </time>
          </div>

          <footer class="modal-actions">
            <Button variant="success" type="button">
              {{ $t('voting.buttons.voteFor') }}
            </Button>
            <Button variant="cancel" type="button">
              {{ $t('voting.buttons.voteAgainst') }}
            </Button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss">
@use "~/assets/scss/voting/VotingModal.scss";
</style>
