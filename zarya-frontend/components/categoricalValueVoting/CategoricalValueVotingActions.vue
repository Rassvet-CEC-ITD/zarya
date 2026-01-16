<script setup lang="ts">
import type { CategoricalValueVoting } from '~/types/vote';
import { useConnection } from '@wagmi/vue';
import { useCastVote, useExecuteVoting } from '~/composables/useVotingActions';

const props = defineProps<{
  voting: CategoricalValueVoting;
  organ: string; // bytes32 encoded organ
}>();

const { address } = useConnection();

// Cast vote
const { 
  castVote, 
  isPending: isCastPending, 
  isConfirming: isConfirmingCast, 
  isSuccess: isCastSuccess 
} = useCastVote();

// Execute voting
const { 
  executeVoting, 
  isPending: isExecutePending, 
  isConfirming: isConfirmingExecute, 
  isSuccess: isExecuteSuccess 
} = useExecuteVoting();

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
</script>

<template>
  <div class="categorical-value-voting-actions">
    <div v-if="isActive" class="categorical-value-voting-actions__vote-buttons">
      <Button
        variant="success"
        :disabled="!address || isCastPending || isConfirmingCast"
        @click="handleVote(true)"
        class="categorical-value-voting-actions__button"
      >
        {{ isCastPending || isConfirmingCast ? 'Голосую...' : 'Проголосовать За' }}
      </Button>
      <Button
        variant="warning"
        :disabled="!address || isCastPending || isConfirmingCast"
        @click="handleVote(false)"
        class="categorical-value-voting-actions__button"
      >
        {{ isCastPending || isConfirmingCast ? 'Голосую...' : 'Проголосовать Против' }}
      </Button>
    </div>

    <div v-if="canExecute" class="categorical-value-voting-actions__execute">
      <Button
        variant="primary"
        :disabled="!address || isExecutePending || isConfirmingExecute"
        @click="handleExecute"
        class="categorical-value-voting-actions__button"
      >
        {{ isExecutePending || isConfirmingExecute ? 'Выполняю...' : 'Завершить Голосование' }}
      </Button>
    </div>

    <div v-if="voting.finalized" class="categorical-value-voting-actions__finalized">
      <p class="categorical-value-voting-actions__status">
        Голосование завершено: 
        <span :class="['categorical-value-voting-actions__result', voting.success ? 'categorical-value-voting-actions__result--success' : 'categorical-value-voting-actions__result--failed']">
          {{ voting.success ? 'Принято' : 'Отклонено' }}
        </span>
      </p>
    </div>

    <div v-if="isCastSuccess" class="categorical-value-voting-actions__feedback">
      <p class="categorical-value-voting-actions__success">Ваш голос зарегистрирован!</p>
    </div>

    <div v-if="isExecuteSuccess" class="categorical-value-voting-actions__feedback">
      <p class="categorical-value-voting-actions__success">Голосование успешно завершено!</p>
    </div>
  </div>
</template>

<style lang="scss">
@use "~/assets/scss/categoricalValueVoting/actions.scss";
</style>