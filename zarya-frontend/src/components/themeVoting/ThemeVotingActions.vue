<script setup lang="ts">
import { computed, ref, watch, reactive } from 'vue';
import { useConnection } from '@wagmi/vue';
import { useI18n } from 'vue-i18n';

import type { ThemeVoting } from '../../types/vote';
import { useCastVote, useExecuteVoting } from '../../composables/useVotingActions';
import { usePartyOrgan, PartyOrganType, Region, getLocalizedOrganTypeOptions, getLocalizedRegionOptions } from '../../composables/usePartyOrgan';
import Button from '../Button.vue';
import Toast from '../Toast.vue';

const props = defineProps<{
  voting: ThemeVoting;
}>();

const { address } = useConnection();
const { t } = useI18n();

// Organ selection state
const organSelection = reactive({
  organType: PartyOrganType.Chairperson,
  region: Region.FEDERAL,
  organNumber: 0
});

// Use party organ composable
const { identifier, organHash } = usePartyOrgan(
  computed(() => organSelection.organType),
  computed(() => organSelection.region),
  computed(() => organSelection.organNumber)
);

// Organ type options - using localized function
const organTypeOptions = computed(() => getLocalizedOrganTypeOptions(t));

// Region options - using localized function
const regionOptions = computed(() => getLocalizedRegionOptions(t));

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
  console.log('handleVote called', { address: address.value, support, votingId: props.voting.votingId, organ: organHash.value });
  if (!address.value) {
    console.warn('No wallet address connected');
    return;
  }
  // Pass the selected organ hash
  castVote(props.voting.votingId, support, organHash.value);
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
  <div class="theme-voting-actions">
    <Toast 
      v-if="showToast"
      :type="toastType"
      :message="toastMessage"
      @close="showToast = false"
    />
    
    <div v-if="isActive" class="theme-voting-actions__voting-section">
      <div class="theme-voting-actions__organ-selector">
        <h4 class="theme-voting-actions__organ-title">{{ t('voting.labels.selectOrgan') }}</h4>
        
        <div class="theme-voting-actions__organ-form">
          <div class="theme-voting-actions__form-group">
            <label class="theme-voting-actions__label" for="organType">
              {{ t('voting.form.organType') }}
            </label>
            <select
              id="organType"
              v-model.number="organSelection.organType"
              class="theme-voting-actions__select"
            >
              <option 
                v-for="option in organTypeOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="theme-voting-actions__form-row">
            <div class="theme-voting-actions__form-group">
              <label class="theme-voting-actions__label" for="region">
                {{ t('voting.form.region') }}
              </label>
              <select
                id="region"
                v-model.number="organSelection.region"
                class="theme-voting-actions__select"
              >
                <option 
                  v-for="option in regionOptions" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div 
              v-if="organSelection.organType === PartyOrganType.LocalSoviet || organSelection.organType === PartyOrganType.LocalGeneralAssembly"
              class="theme-voting-actions__form-group"
            >
              <label class="theme-voting-actions__label" for="organNumber">
                {{ t('voting.form.organNumber') }}
              </label>
              <input
                id="organNumber"
                v-model.number="organSelection.organNumber"
                type="number"
                min="0"
                placeholder="0"
                class="theme-voting-actions__input"
              />
            </div>
          </div>

          <div class="theme-voting-actions__organ-info">
            <span class="theme-voting-actions__label">{{ t('voting.form.organIdentifier') }}</span>
            <strong class="theme-voting-actions__identifier">{{ identifier }}</strong>
          </div>
        </div>
      </div>

      <div class="theme-voting-actions__vote-buttons">
        <Button
          variant="success"
          :disabled="!address || isCastPending || isConfirmingCast"
          @click="handleVote(true)"
          class="theme-voting-actions__button"
        >
          {{ isCastPending || isConfirmingCast ? t('voting.buttons.voting') : t('voting.buttons.voteFor') }}
        </Button>
        <Button
          variant="warning"
          :disabled="!address || isCastPending || isConfirmingCast"
          @click="handleVote(false)"
          class="theme-voting-actions__button"
        >
          {{ isCastPending || isConfirmingCast ? t('voting.buttons.voting') : t('voting.buttons.voteAgainst') }}
        </Button>
      </div>
    </div>

    <div v-if="canExecute" class="theme-voting-actions__execute">
      <Button
        variant="primary"
        :disabled="!address || isExecutePending || isConfirmingExecute"
        @click="handleExecute"
        class="theme-voting-actions__button"
      >
        {{ isExecutePending || isConfirmingExecute ? t('voting.buttons.executing') : t('voting.buttons.execute') }}
      </Button>
    </div>

    <div v-if="voting.finalized" class="theme-voting-actions__finalized">
      <p class="theme-voting-actions__status">
        {{ t('voting.messages.votingFinalized') }} 
        <span :class="['theme-voting-actions__result', voting.success ? 'theme-voting-actions__result--success' : 'theme-voting-actions__result--failed']">
          {{ voting.success ? t('voting.status.passed') : t('voting.status.rejected') }}
        </span>
      </p>
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/themeVoting/actions.scss";
</style>
