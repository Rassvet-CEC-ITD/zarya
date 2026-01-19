<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useConnection } from '@wagmi/vue';
import { useI18n } from 'vue-i18n';

import { useVotingCache } from '../../composables/useVotingCache';
import { useCreateNumericalValueVoting } from '../../composables/useVotingActions';
import { usePartyOrgan, PartyOrganType, Region, getLocalizedOrganTypeOptions, getLocalizedRegionOptions } from '../../composables/usePartyOrgan';
import { SuggestionType } from '../../types/vote';
import type { NumericalValueVoting } from '../../types/vote';
import Button from '../Button.vue';

import NumericalValueVotingBlock from './NumericalValueVotingBlock.vue';

const { address } = useConnection();
const { t } = useI18n();
const { getVotingsByType, scanHistoricalEvents, isScanning, isScanned } = useVotingCache();

// Scan historical events on mount if not already scanned
if (!isScanned.value && !isScanning.value) {
  scanHistoricalEvents();
}

// Get all numerical value votings
const numericalValueVotings = computed(() => {
  return getVotingsByType(SuggestionType.NumericalValue) as NumericalValueVoting[];
});

// Sort votings: active first, then by start time (newest first)
const sortedVotings = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return [...numericalValueVotings.value].sort((a, b) => {
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
  x: '',
  y: '',
  value: '',
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
} = useCreateNumericalValueVoting();

// Handle form submission
const handleCreateVoting = () => {
  if (!address.value) return;
  createVoting(
    organHash.value,
    BigInt(formData.x),
    BigInt(formData.y),
    BigInt(formData.value),
    address.value,
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
      x: '',
      y: '',
      value: '',
      duration: '604800'
    });
    showCreateForm.value = false;
  }
});

// Show local organs number input only for local organs
const showOrganNumber = computed(() => {
  return formData.organType === PartyOrganType.LocalSoviet || 
         formData.organType === PartyOrganType.LocalGeneralAssembly;
});

// Filter state
const activeFilter = ref<'all' | 'active' | 'finalized'>('all');

// Filtered votings based on active filter
const filteredVotings = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  
  if (activeFilter.value === 'all') {
    return sortedVotings.value;
  } else if (activeFilter.value === 'active') {
    return sortedVotings.value.filter(voting => !voting.finalized && now < voting.endTime);
  } else {
    return sortedVotings.value.filter(voting => voting.finalized || now >= voting.endTime);
  }
});

// Counts for filter buttons
const activeCount = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return sortedVotings.value.filter(v => !v.finalized && now < v.endTime).length;
});

const finalizedCount = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return sortedVotings.value.filter(v => v.finalized || now >= v.endTime).length;
});
</script>

<template>
  <div class="numerical-value-voting">
    <div class="numerical-value-voting__header">
      <h2 class="numerical-value-voting__title">{{ t('voting.numericalValue.title') }}</h2>
      <Button 
        @click="showCreateForm = !showCreateForm"
        class="numerical-value-voting__create-button"
      >
        {{ showCreateForm ? t('voting.buttons.cancel') : t('voting.buttons.createVoting') }}
      </Button>
    </div>

    <!-- Create Form -->
    <div v-if="showCreateForm" class="numerical-value-voting__form">
      <h3 class="numerical-value-voting__form-title">{{ t('voting.numericalValue.createTitle') }}</h3>
      
      <form @submit.prevent="handleCreateVoting" class="numerical-value-voting__form-content">
        <div class="numerical-value-voting__form-row">
          <div class="numerical-value-voting__form-group">
            <label class="numerical-value-voting__label">{{ t('voting.form.organType') }}</label>
            <select 
              v-model="formData.organType" 
              class="numerical-value-voting__input"
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

          <div class="numerical-value-voting__form-group">
            <label class="numerical-value-voting__label">{{ t('voting.form.region') }}</label>
            <select 
              v-model="formData.region" 
              class="numerical-value-voting__input"
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

          <div v-if="showOrganNumber" class="numerical-value-voting__form-group">
            <label class="numerical-value-voting__label">{{ t('voting.form.organNumber') }}</label>
            <input 
              v-model.number="formData.organNumber" 
              type="number"
              min="0"
              class="numerical-value-voting__input"
            />
          </div>
        </div>

        <div class="numerical-value-voting__form-group">
          <label class="numerical-value-voting__label">
            {{ t('voting.form.organIdentifier') }} <strong>{{ identifier }}</strong>
          </label>
          <small class="numerical-value-voting__hint">
            {{ t('voting.form.hash') }} <code style="font-size: 0.8em;">{{ organHash }}</code>
          </small>
        </div>

        <div class="numerical-value-voting__form-row">
          <div class="numerical-value-voting__form-group">
            <label class="numerical-value-voting__label">{{ t('voting.form.x') }}</label>
            <input 
              v-model="formData.x" 
              type="number"
              class="numerical-value-voting__input"
              required
            />
          </div>

          <div class="numerical-value-voting__form-group">
            <label class="numerical-value-voting__label">{{ t('voting.form.y') }}</label>
            <input 
              v-model="formData.y" 
              type="number"
              class="numerical-value-voting__input"
              required
            />
          </div>
        </div>

        <div class="numerical-value-voting__form-group">
          <label class="numerical-value-voting__label">{{ t('voting.form.numericalValue') }}</label>
          <input 
            v-model="formData.value" 
            type="number"
            class="numerical-value-voting__input"
            required
          />
          <span class="numerical-value-voting__hint">{{ t('voting.form.numericalValueHint') }}</span>
        </div>

        <div class="numerical-value-voting__form-group">
          <label class="numerical-value-voting__label">{{ t('voting.form.duration') }}</label>
          <input 
            v-model="formData.duration" 
            type="number"
            min="1"
            class="numerical-value-voting__input"
          />
          <span class="numerical-value-voting__hint">{{ t('voting.form.durationHint') }}</span>
        </div>

        <Button 
          type="submit" 
          :disabled="isPending || isConfirming || !address"
          class="numerical-value-voting__submit"
        >
          {{ isPending || isConfirming ? t('voting.buttons.creating') : t('voting.buttons.submit') }}
        </Button>
      </form>
    </div>

    <!-- Filters -->
    <div class="numerical-value-voting__filters">
      <Button
        @click="activeFilter = 'all'"
        :variant="activeFilter === 'all' ? 'primary' : 'secondary'"
      >
        {{ t('voting.numericalValue.filters.all') }} ({{ numericalValueVotings.length }})
      </Button>
      <Button
        @click="activeFilter = 'active'"
        :variant="activeFilter === 'active' ? 'primary' : 'secondary'"
      >
        {{ t('voting.numericalValue.filters.active') }} ({{ activeCount }})
      </Button>
      <Button
        @click="activeFilter = 'finalized'"
        :variant="activeFilter === 'finalized' ? 'primary' : 'secondary'"
      >
        {{ t('voting.numericalValue.filters.finalized') }} ({{ finalizedCount }})
      </Button>
    </div>

    <!-- Votings List -->
    <div v-if="filteredVotings.length > 0" class="numerical-value-voting__list">
      <div 
        v-for="voting in filteredVotings" 
        :key="voting.votingId.toString()"
        class="numerical-value-voting__item"
      >
        <NumericalValueVotingBlock :voting="voting" />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="numerical-value-voting__empty">
      <p>{{ t('voting.messages.noVotingsFound') }}</p>
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/numericalValueVoting/index.scss";
</style>