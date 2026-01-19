<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useConnection } from '@wagmi/vue';
import { useI18n } from 'vue-i18n';
import type { NumericalValueVoting } from '../../types/vote';
import { useCastVote, useExecuteVoting } from '../../composables/useVotingActions';
import Button from '../Button.vue';
import Toast from '../Toast.vue';

const props = defineProps<{
  voting: NumericalValueVoting;
  organ: string; // bytes32 encoded organ
}>();

const { address } = useConnection();
const { t } = useI18n();

// Toast state
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');

// Vote composable
const voteComposable = useCastVote();

// Execute composable
const executeComposable = useExecuteVoting();

// Check if voting is active
const isActive = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return !props.voting.finalized && now < props.voting.endTime;
});

// Check if voting has ended but not finalized
const hasEnded = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return !props.voting.finalized && now >= props.voting.endTime;
});

// Handle vote for
const handleVoteFor = () => {
  voteComposable.castVote(props.voting.votingId, true, props.voting.organ);
};

// Handle vote against
const handleVoteAgainst = () => {
  voteComposable.castVote(props.voting.votingId, false, props.voting.organ);
};

// Handle execute
const handleExecute = () => {
  executeComposable.executeVoting(props.voting.votingId, 0n, 0n);
};

// Watch for vote success
watch(voteComposable.isSuccess, (success) => {
  if (success) {
    toastMessage.value = t('voting.messages.voteSuccess');
    toastType.value = 'success';
    showToast.value = true;
  }
});

// Watch for vote error
watch(voteComposable.error, (error) => {
  if (error) {
    toastMessage.value = `${t('voting.messages.votingError')} ${error.message || t('voting.messages.unknownError')}`;
    toastType.value = 'error';
    showToast.value = true;
  }
});

// Watch for execute success
watch(executeComposable.isSuccess, (success) => {
  if (success) {
    toastMessage.value = t('voting.messages.executeSuccess');
    toastType.value = 'success';
    showToast.value = true;
  }
});

// Watch for execute error
watch(executeComposable.error, (error) => {
  if (error) {
    toastMessage.value = `${t('voting.messages.executeError')} ${error.message || t('voting.messages.unknownError')}`;
    toastType.value = 'error';
    showToast.value = true;
  }
});

// Compute result status
const resultStatus = computed(() => {
  if (!props.voting.finalized) return null;
  const totalVotes = props.voting.forVotes + props.voting.againstVotes;
  if (totalVotes === 0n) return 'failed';
  return props.voting.forVotes > props.voting.againstVotes ? 'success' : 'failed';
});
</script>

<template>
  <div class="numerical-value-voting-actions">
    <Toast 
      v-if="showToast"
      :type="toastType"
      :message="toastMessage"
      @close="showToast = false"
    />
    
    <div v-if="isActive" class="numerical-value-voting-actions__vote-buttons">
      <Button
        variant="success"
        :disabled="!address || voteComposable.isPending.value || voteComposable.isConfirming.value"
        @click="handleVoteFor"
        class="numerical-value-voting-actions__button"
      >
        {{ voteComposable.isPending.value || voteComposable.isConfirming.value ? t('voting.buttons.voting') : t('voting.buttons.voteFor') }}
      </Button>
      <Button
        variant="warning"
        :disabled="!address || voteComposable.isPending.value || voteComposable.isConfirming.value"
        @click="handleVoteAgainst"
        class="numerical-value-voting-actions__button"
      >
        {{ voteComposable.isPending.value || voteComposable.isConfirming.value ? t('voting.buttons.voting') : t('voting.buttons.voteAgainst') }}
      </Button>
    </div>

    <div v-if="hasEnded" class="numerical-value-voting-actions__execute">
      <Button
        variant="primary"
        :disabled="!address || executeComposable.isPending.value || executeComposable.isConfirming.value"
        @click="handleExecute"
        class="numerical-value-voting-actions__button"
      >
        {{ executeComposable.isPending.value || executeComposable.isConfirming.value ? t('voting.buttons.executing') : t('voting.buttons.execute') }}
      </Button>
    </div>

    <div v-if="props.voting.finalized" class="numerical-value-voting-actions__finalized">
      <p class="numerical-value-voting-actions__status">
        {{ t('voting.messages.votingFinalized') }} 
        <span :class="['numerical-value-voting-actions__result', resultStatus === 'success' ? 'numerical-value-voting-actions__result--success' : 'numerical-value-voting-actions__result--failed']">
          {{ resultStatus === 'success' ? t('voting.status.passed') : t('voting.status.rejected') }}
        </span>
      </p>
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/numericalValueVoting/actions.scss";
</style>
