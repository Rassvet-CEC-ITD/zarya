<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useConnection } from '@wagmi/vue';
import { useI18n } from 'vue-i18n';

import { useVotingCache } from '../../composables/useVotingCache';
import { useCreateCategoricalValueVoting } from '../../composables/useVotingActions';
import { usePartyOrgan, PartyOrganType, Region, getLocalizedOrganTypeOptions, getLocalizedRegionOptions } from '../../composables/usePartyOrgan';
import { SuggestionType } from '../../types/vote';
import type { CategoricalValueVoting } from '../../types/vote';
import Button from '../Button.vue';

import CategoricalValueVotingBlock from './CategoricalValueVotingBlock.vue';

const { address } = useConnection();
const { t } = useI18n();
const { getVotingsByType, scanHistoricalEvents, isScanning, isScanned } = useVotingCache();

// Scan historical events on mount if not already scanned
if (!isScanned.value && !isScanning.value) {
  scanHistoricalEvents();
}

// Get all categorical value votings
const categoricalValueVotings = computed(() => {
  return getVotingsByType(SuggestionType.CategoricalValue) as CategoricalValueVoting[];
});

// Sort votings: active first, then by start time (newest first)
const sortedVotings = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return [...categoricalValueVotings.value].sort((a, b) => {
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
} = useCreateCategoricalValueVoting();

// Handle form submission
const handleCreateVoting = () => {
  createVoting(
    organHash.value,
    BigInt(formData.x),
    BigInt(formData.y),
    BigInt(formData.value),
    address.value || '',
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
  <div class="categorical-value-voting">
    <div class="categorical-value-voting__header">
      <h2 class="categorical-value-voting__title">{{ t('voting.categoricalValue.title') }}</h2>
      <Button 
        v-if="address"
        variant="primary"
        @click="showCreateForm = !showCreateForm"
        class="categorical-value-voting__create-button"
      >
        {{ showCreateForm ? t('voting.buttons.cancel') : t('voting.buttons.createVoting') }}
      </Button>
    </div>

    <div v-if="showCreateForm" class="categorical-value-voting__form">
      <h3 class="categorical-value-voting__form-title">{{ t('voting.categoricalValue.createTitle') }}</h3>
      <form @submit.prevent="handleCreateVoting" class="categorical-value-voting__form-content">
        <div class="categorical-value-voting__form-group">
          <label class="categorical-value-voting__label" for="organType">
            {{ t('voting.form.organType') }}
          </label>
          <select
            id="organType"
            v-model.number="formData.organType"
            required
            class="categorical-value-voting__input"
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

        <div class="categorical-value-voting__form-row">
          <div class="categorical-value-voting__form-group">
            <label class="categorical-value-voting__label" for="region">
              {{ t('voting.form.region') }}
            </label>
            <select
              id="region"
              v-model.number="formData.region"
              required
              class="categorical-value-voting__input"
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
            class="categorical-value-voting__form-group"
          >
            <label class="categorical-value-voting__label" for="organNumber">
              {{ t('voting.form.organNumber') }}
            </label>
            <input
              id="organNumber"
              v-model="formData.organNumber"
              type="number"
              required
              min="0"
              placeholder="0"
              class="categorical-value-voting__input"
            />
          </div>
        </div>

        <div class="categorical-value-voting__form-group">
          <label class="categorical-value-voting__label">
            {{ t('voting.form.organIdentifier') }} <strong>{{ identifier }}</strong>
          </label>
          <small class="categorical-value-voting__hint">
            {{ t('voting.form.hash') }} <code style="font-size: 0.8em;">{{ organHash }}</code>
          </small>
        </div>

        <div class="categorical-value-voting__form-row">
          <div class="categorical-value-voting__form-group">
            <label class="categorical-value-voting__label" for="x">
              {{ t('voting.form.x') }}
            </label>
            <input
              id="x"
              v-model="formData.x"
              type="number"
              required
              min="0"
              placeholder="0"
              class="categorical-value-voting__input"
            />
          </div>

          <div class="categorical-value-voting__form-group">
            <label class="categorical-value-voting__label" for="y">
              {{ t('voting.form.y') }}
            </label>
            <input
              id="y"
              v-model="formData.y"
              type="number"
              required
              min="0"
              placeholder="0"
              class="categorical-value-voting__input"
            />
          </div>
        </div>

        <div class="categorical-value-voting__form-group">
          <label class="categorical-value-voting__label" for="value">
            {{ t('voting.form.value') }}
          </label>
          <input
            id="value"
            v-model="formData.value"
            type="number"
            required
            min="0"
            placeholder="0"
            class="categorical-value-voting__input"
          />
        </div>

        <div class="categorical-value-voting__form-group">
          <label class="categorical-value-voting__label" for="duration">
            {{ t('voting.form.duration') }}
          </label>
          <input
            id="duration"
            v-model="formData.duration"
            type="number"
            required
            min="60"
            placeholder="604800"
            class="categorical-value-voting__input"
          />
          <span class="categorical-value-voting__hint">
            (604800 {{ t('voting.form.durationHint') }})
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          :disabled="isPending || isConfirming"
          class="categorical-value-voting__submit"
        >
          {{ isPending || isConfirming ? t('voting.buttons.creating') : t('voting.buttons.submit') }}
        </Button>
      </form>
    </div>

    <div class="categorical-value-voting__filters">
      <Button
        @click="filterOption = 'all'"
        :variant="filterOption === 'all' ? 'primary' : 'secondary'"
      >
        {{ t('voting.categoricalValue.filters.all') }} ({{ categoricalValueVotings.length }})
      </Button>
      <Button
        @click="filterOption = 'active'"
        :variant="filterOption === 'active' ? 'primary' : 'secondary'"
      >
        {{ t('voting.categoricalValue.filters.active') }} ({{ activeCount }})
      </Button>
      <Button
        @click="filterOption = 'finalized'"
        :variant="filterOption === 'finalized' ? 'primary' : 'secondary'"
      >
        {{ t('voting.categoricalValue.filters.finalized') }} ({{ finalizedCount }})
      </Button>
    </div>

    <div class="categorical-value-voting__list">
      <div v-if="filteredVotings.length === 0" class="categorical-value-voting__empty">
        <p>{{ t('voting.messages.noVotingsFound') }}</p>
      </div>
      
      <CategoricalValueVotingBlock
        v-for="voting in filteredVotings"
        :key="voting.votingId.toString()"
        :voting="voting"
        class="categorical-value-voting__item"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/categoricalValueVoting/index.scss";
</style>