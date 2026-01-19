<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useConnection } from '@wagmi/vue';
import { useI18n } from 'vue-i18n';

import { useVotingCache } from '../../composables/useVotingCache';
import { useCreateCategoryVoting } from '../../composables/useVotingActions';
import { usePartyOrgan, PartyOrganType, Region, getLocalizedOrganTypeOptions, getLocalizedRegionOptions } from '../../composables/usePartyOrgan';
import { SuggestionType } from '../../types/vote';
import type { CategoryVoting } from '../../types/vote';
import Button from '../Button.vue';

import CategoryVotingBlock from './CategoryVotingBlock.vue';

const { address } = useConnection();
const { t } = useI18n();
const { getVotingsByType, scanHistoricalEvents, isScanning, isScanned } = useVotingCache();

// Scan historical events on mount if not already scanned
if (!isScanned.value && !isScanning.value) {
  scanHistoricalEvents();
}

// Get all category votings
const categoryVotings = computed(() => {
  return getVotingsByType(SuggestionType.Category) as CategoryVoting[];
});

// Sort votings: active first, then by start time (newest first)
const sortedVotings = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return [...categoryVotings.value].sort((a, b) => {
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
  category: '',
  categoryName: '',
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
} = useCreateCategoryVoting();

// Handle form submission
const handleCreateVoting = () => {
  createVoting(
    organHash.value,
    BigInt(formData.x),
    BigInt(formData.y),
    BigInt(formData.category),
    formData.categoryName,
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
      category: '',
      categoryName: '',
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
  <div class="category-voting">
    <div class="category-voting__header">
      <h2 class="category-voting__title">{{ t('voting.category.title') }}</h2>
      <Button 
        v-if="address"
        variant="primary"
        @click="showCreateForm = !showCreateForm"
        class="category-voting__create-button"
      >
        {{ showCreateForm ? t('voting.buttons.cancel') : t('voting.buttons.createVoting') }}
      </Button>
    </div>

    <div v-if="showCreateForm" class="category-voting__form">
      <h3 class="category-voting__form-title">{{ t('voting.category.createTitle') }}</h3>
      <form @submit.prevent="handleCreateVoting" class="category-voting__form-content">
        <div class="category-voting__form-group">
          <label class="category-voting__label" for="organType">
            {{ t('voting.form.organType') }}
          </label>
          <select
            id="organType"
            v-model.number="formData.organType"
            required
            class="category-voting__input"
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

        <div class="category-voting__form-row">
          <div class="category-voting__form-group">
            <label class="category-voting__label" for="region">
              {{ t('voting.form.region') }}
            </label>
            <select
              id="region"
              v-model.number="formData.region"
              required
              class="category-voting__input"
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
            class="category-voting__form-group"
          >
            <label class="category-voting__label" for="organNumber">
              {{ t('voting.form.organNumber') }}
            </label>
            <input
              id="organNumber"
              v-model="formData.organNumber"
              type="number"
              required
              min="0"
              placeholder="0"
              class="category-voting__input"
            />
          </div>
        </div>

        <div class="category-voting__form-group">
          <label class="category-voting__label">
            {{ t('voting.form.organIdentifier') }} <strong>{{ identifier }}</strong>
          </label>
          <small class="category-voting__hint">
            {{ t('voting.form.hash') }} <code style="font-size: 0.8em;">{{ organHash }}</code>
          </small>
        </div>

        <div class="category-voting__form-row">
          <div class="category-voting__form-group">
            <label class="category-voting__label" for="x">
              {{ t('voting.form.x') }}
            </label>
            <input
              id="x"
              v-model="formData.x"
              type="number"
              required
              min="0"
              placeholder="0"
              class="category-voting__input"
            />
          </div>

          <div class="category-voting__form-group">
            <label class="category-voting__label" for="y">
              {{ t('voting.form.y') }}
            </label>
            <input
              id="y"
              v-model="formData.y"
              type="number"
              required
              min="0"
              placeholder="0"
              class="category-voting__input"
            />
          </div>
        </div>

        <div class="category-voting__form-group">
          <label class="category-voting__label" for="category">
            {{ t('voting.form.category') }}
          </label>
          <input
            id="category"
            v-model="formData.category"
            type="number"
            required
            min="0"
            placeholder="0"
            class="category-voting__input"
          />
        </div>

        <div class="category-voting__form-group">
          <label class="category-voting__label" for="categoryName">
            {{ t('voting.form.categoryName') }}
          </label>
          <input
            id="categoryName"
            v-model="formData.categoryName"
            type="text"
            required
            :placeholder="t('voting.form.categoryNamePlaceholder')"
            class="category-voting__input"
          />
        </div>

        <div class="category-voting__form-group">
          <label class="category-voting__label" for="duration">
            {{ t('voting.form.duration') }}
          </label>
          <input
            id="duration"
            v-model="formData.duration"
            type="number"
            required
            min="60"
            placeholder="604800"
            class="category-voting__input"
          />
          <span class="category-voting__hint">
            (604800 {{ t('voting.form.durationHint') }})
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          :disabled="isPending || isConfirming"
          class="category-voting__submit"
        >
          {{ isPending || isConfirming ? t('voting.buttons.creating') : t('voting.buttons.submit') }}
        </Button>
      </form>
    </div>

    <div class="category-voting__filters">
      <Button
        @click="filterOption = 'all'"
        :variant="filterOption === 'all' ? 'primary' : 'secondary'"
      >
        {{ t('voting.category.filters.all') }} ({{ categoryVotings.length }})
      </Button>
      <Button
        @click="filterOption = 'active'"
        :variant="filterOption === 'active' ? 'primary' : 'secondary'"
      >
        {{ t('voting.category.filters.active') }} ({{ activeCount }})
      </Button>
      <Button
        @click="filterOption = 'finalized'"
        :variant="filterOption === 'finalized' ? 'primary' : 'secondary'"
      >
        {{ t('voting.category.filters.finalized') }} ({{ finalizedCount }})
      </Button>
    </div>

    <div class="category-voting__list">
      <div v-if="filteredVotings.length === 0" class="category-voting__empty">
        <p>{{ t('voting.messages.noVotingsFound') }}</p>
      </div>
      
      <CategoryVotingBlock
        v-for="voting in filteredVotings"
        :key="voting.votingId.toString()"
        :voting="voting"
        class="category-voting__item"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/categoryVoting/index.scss";
</style>