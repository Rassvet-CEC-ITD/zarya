<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useConnection } from '@wagmi/vue';
import { useI18n } from 'vue-i18n';

import type { DecimalsVoting } from '../../types/vote';
import { useCastVote, useExecuteVoting } from '../../composables/useVotingActions';
import Button from '../Button.vue';
import Toast from '../Toast.vue';

const props = defineProps<{
  voting: DecimalsVoting;
  organ: string; // bytes32 encoded organ
}>();

const { address } = useConnection();
const { t } = useI18n();

// Cast vote
const { 
  castVote, 
  isPending: isCastPending, 
  isConfirming: isConfirmingCast, 
  isSuccess: isCastSuccess,
  error: castError
} = useCastVote();

// Execute voting
const { 
  executeVoting, 
  isPending: isExecutePending, 
  isConfirming: isConfirmingExecute, 
  isSuccess: isExecuteSuccess,
  error: executeError
} = useExecuteVoting();

// Toast state
const toastMessage = ref('');
const toastType = ref<'error' | 'success'>('error');
const showToast = ref(false);

// Check if voting is active
const isActive = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return now >= props.voting.startTime && now < props.voting.endTime && !props.voting.finalized;
});

// Check if can execute (voting ended but not finalized)
const canExecute = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return now >= props.voting.endTime && !props.voting.finalized;
});

const handleVote = (support: boolean) => {
  console.log('handleVote called', { address: address.value, support, votingId: props.voting.votingId, organ: props.organ });
  if (!address.value) {
    console.warn('No wallet address connected');
    return;
  }
  castVote(props.voting.votingId, support, props.organ);
};

const handleExecute = () => {
  // Default quorum and approval values - could be made configurable
  const minimumQuorum = 10n;
  const minimumApprovalPercentage = 50n;
  executeVoting(props.voting.votingId, minimumQuorum, minimumApprovalPercentage);
};

// Watch for errors and success
watch(castError, (err) => {
  if (err) {
    console.error('Cast vote error:', err);
    toastMessage.value = `${t('voting.messages.votingError')} ${err.message || t('voting.messages.unknownError')}`;
    toastType.value = 'error';
    showToast.value = true;
  }
});

watch(executeError, (err) => {
  if (err) {
    console.error('Execute voting error:', err);
    toastMessage.value = `${t('voting.messages.executeError')} ${err.message || t('voting.messages.unknownError')}`;
    toastType.value = 'error';
    showToast.value = true;
  }
});

watch(isCastSuccess, (success) => {
  if (success) {
    toastMessage.value = t('voting.messages.voteSuccess');
    toastType.value = 'success';
    showToast.value = true;
  }
});

watch(isExecuteSuccess, (success) => {
  if (success) {
    toastMessage.value = t('voting.messages.executeSuccess');
    toastType.value = 'success';
    showToast.value = true;
  }
});
</script>

<template>
  <div class="decimals-voting-actions">
    <div v-if="isActive && address" class="decimals-voting-actions__vote">
      <Button
        @click="handleVote(true)"
        variant="primary"
        :disabled="isCastPending || isConfirmingCast"
        class="decimals-voting-actions__button decimals-voting-actions__button--for"
      >
        {{ isCastPending || isConfirmingCast ? t('voting.buttons.voting') : t('voting.buttons.voteFor') }}
      </Button>
      <Button
        @click="handleVote(false)"
        variant="secondary"
        :disabled="isCastPending || isConfirmingCast"
        class="decimals-voting-actions__button decimals-voting-actions__button--against"
      >
        {{ isCastPending || isConfirmingCast ? t('voting.buttons.voting') : t('voting.buttons.voteAgainst') }}
      </Button>
    </div>

    <div v-if="canExecute" class="decimals-voting-actions__execute">
      <Button
        @click="handleExecute"
        variant="primary"
        :disabled="isExecutePending || isConfirmingExecute"
        class="decimals-voting-actions__button decimals-voting-actions__button--execute"
      >
        {{ isExecutePending || isConfirmingExecute ? t('voting.buttons.executing') : t('voting.buttons.execute') }}
      </Button>
    </div>

    <Toast
      v-if="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/decimalsVoting/actions.scss";
</style>
