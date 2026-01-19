<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useConnection } from '@wagmi/vue';
import { useI18n } from 'vue-i18n';

import { useVotingCache } from '../../composables/useVotingCache';
import { useCreateMembershipRevocationVoting } from '../../composables/useVotingActions';
import { usePartyOrgan, PartyOrganType, Region, getLocalizedOrganTypeOptions, getLocalizedRegionOptions } from '../../composables/usePartyOrgan';
import { SuggestionType } from '../../types/vote';
import type { MembershipRevocationVoting } from '../../types/vote';
import Button from '../Button.vue';

import MembershipRevocationVotingBlock from './MembershipRevocationVotingBlock.vue';

const { address } = useConnection();
const { t } = useI18n();
const { getVotingsByType, scanHistoricalEvents, isScanning, isScanned } = useVotingCache();

// Scan historical events on mount if not already scanned
if (!isScanned.value && !isScanning.value) {
  scanHistoricalEvents();
}

// Get all membership revocation votings
const membershipRevocationVotings = computed(() => {
  return getVotingsByType(SuggestionType.MembershipRevocation) as MembershipRevocationVoting[];
});

// Sort votings: active first, then by start time (newest first)
const sortedVotings = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return [...membershipRevocationVotings.value].sort((a, b) => {
    const aActive = !a.finalized && now < a.endTime;
    const bActive = !b.finalized && now < b.endTime;
    
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    
    return Number(b.startTime - a.startTime);
  });
});

// Form state
const showCreateForm = ref(false);
const formData = reactive({
  organType: PartyOrganType.Chairperson,
  region: Region.FEDERAL,
  organNumber: 0,
  member: '',
  duration: '604800' // 1 week in seconds
});

// Use party organ composable
const { identifier, organHash } = usePartyOrgan(
  computed(() => formData.organType),
  computed(() => formData.region),
  computed(() => formData.organNumber)
);

// Organ type options - using localized function
const organTypeOptions = computed(() => getLocalizedOrganTypeOptions(t));

// Region options - using localized function
const regionOptions = computed(() => getLocalizedRegionOptions(t));

// Use voting actions composable
const { 
  createVoting, 
  isPending,
  isConfirming,
  isSuccess,
  error
} = useCreateMembershipRevocationVoting();

// Handle form submission
const handleCreateVoting = () => {
  createVoting(
    organHash.value,
    formData.member,
    BigInt(formData.duration)
  );
};

// Watch for write errors
watch(error, (err) => {
  if (err) {
    console.error('Transaction error:', err);
  }
});

// Reset form on success
watch(isSuccess, (newVal) => {
  if (newVal) {
    Object.assign(formData, {
      organType: PartyOrganType.Chairperson,
      region: Region.FEDERAL,
      organNumber: 0,
      member: '',
      duration: '604800'
    });
    showCreateForm.value = false;
  }
});

// Filter options
const filterOption = ref<'all' | 'active' | 'finalized'>('all');

const filteredVotings = computed(() => {
  switch (filterOption.value) {
    case 'active':
      const now = BigInt(Math.floor(Date.now() / 1000));
      return sortedVotings.value.filter(v => !v.finalized && now < v.endTime);
    case 'finalized':
      return sortedVotings.value.filter(v => v.finalized);
    default:
      return sortedVotings.value;
  }
});

// Counts for filter buttons
const activeCount = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return sortedVotings.value.filter(v => !v.finalized && now < v.endTime).length;
});

const finalizedCount = computed(() => {
  return sortedVotings.value.filter(v => v.finalized).length;
});
</script>

<template>
  <div class="membership-revocation-voting">
    <div class="membership-revocation-voting__header">
      <h2 class="membership-revocation-voting__title">{{ t('voting.membershipRevocation.title') }}</h2>
      <Button 
        v-if="address"
        variant="primary"
        @click="showCreateForm = !showCreateForm"
        class="membership-revocation-voting__create-button"
      >
        {{ showCreateForm ? t('voting.buttons.cancel') : t('voting.buttons.createVoting') }}
      </Button>
    </div>

    <div v-if="showCreateForm" class="membership-revocation-voting__form">
      <h3 class="membership-revocation-voting__form-title">{{ t('voting.membershipRevocation.createTitle') }}</h3>
      <form @submit.prevent="handleCreateVoting" class="membership-revocation-voting__form-content">
        <div class="membership-revocation-voting__form-group">
          <label class="membership-revocation-voting__label" for="organType">
            {{ t('voting.form.organType') }}
          </label>
          <select
            id="organType"
            v-model.number="formData.organType"
            required
            class="membership-revocation-voting__input"
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

        <div class="membership-revocation-voting__form-row">
          <div class="membership-revocation-voting__form-group">
            <label class="membership-revocation-voting__label" for="region">
              {{ t('voting.form.region') }}
            </label>
            <select
              id="region"
              v-model.number="formData.region"
              required
              class="membership-revocation-voting__input"
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
            v-if="formData.organType === PartyOrganType.LocalSoviet || formData.organType === PartyOrganType.LocalGeneralAssembly"
            class="membership-revocation-voting__form-group"
          >
            <label class="membership-revocation-voting__label" for="organNumber">
              {{ t('voting.form.organNumber') }}
            </label>
            <input
              id="organNumber"
              v-model="formData.organNumber"
              type="number"
              required
              min="0"
              placeholder="0"
              class="membership-revocation-voting__input"
            />
          </div>
        </div>

        <div class="membership-revocation-voting__form-group">
          <label class="membership-revocation-voting__label">
            {{ t('voting.form.organIdentifier') }} <strong>{{ identifier }}</strong>
          </label>
          <small class="membership-revocation-voting__hint">
            {{ t('voting.form.hash') }} <code style="font-size: 0.8em;">{{ organHash }}</code>
          </small>
        </div>

        <div class="membership-revocation-voting__form-group">
          <label class="membership-revocation-voting__label" for="member">
            {{ t('voting.form.memberAddress') }}
          </label>
          <input
            id="member"
            v-model="formData.member"
            type="text"
            required
            :placeholder="t('voting.form.memberAddressPlaceholder')"
            pattern="^0x[a-fA-F0-9]{40}$"
            class="membership-revocation-voting__input"
          />
          <span class="membership-revocation-voting__hint">
            {{ t('voting.form.memberAddressHint') }}
          </span>
        </div>

        <div class="membership-revocation-voting__form-group">
          <label class="membership-revocation-voting__label" for="duration">
            {{ t('voting.form.duration') }}
          </label>
          <input
            id="duration"
            v-model="formData.duration"
            type="number"
            required
            min="60"
            placeholder="604800"
            class="membership-revocation-voting__input"
          />
          <span class="membership-revocation-voting__hint">
            (604800 {{ t('voting.form.durationHint') }})
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          :disabled="isPending || isConfirming"
          class="membership-revocation-voting__submit"
        >
          {{ isPending || isConfirming ? t('voting.buttons.creating') : t('voting.buttons.submit') }}
        </Button>
      </form>
    </div>

    <div class="membership-revocation-voting__filters">
      <Button
        @click="filterOption = 'all'"
        :variant="filterOption === 'all' ? 'primary' : 'secondary'"
      >
        {{ t('voting.membershipRevocation.filters.all') }} ({{ membershipRevocationVotings.length }})
      </Button>
      <Button
        @click="filterOption = 'active'"
        :variant="filterOption === 'active' ? 'primary' : 'secondary'"
      >
        {{ t('voting.membershipRevocation.filters.active') }} ({{ activeCount }})
      </Button>
      <Button
        @click="filterOption = 'finalized'"
        :variant="filterOption === 'finalized' ? 'primary' : 'secondary'"
      >
        {{ t('voting.membershipRevocation.filters.finalized') }} ({{ finalizedCount }})
      </Button>
    </div>

    <div class="membership-revocation-voting__list">
      <div v-if="filteredVotings.length === 0" class="membership-revocation-voting__empty">
        <p>{{ t('voting.messages.noVotingsFound') }}</p>
      </div>
      
      <MembershipRevocationVotingBlock
        v-for="voting in filteredVotings"
        :key="voting.votingId.toString()"
        :voting="voting"
        class="membership-revocation-voting__item"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/membershipRevocationVoting/index.scss";
</style>