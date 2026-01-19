<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useConnection } from '@wagmi/vue';
import { useI18n } from 'vue-i18n';

import { useVotingCache } from '../../composables/useVotingCache';
import { useCreateThemeVoting } from '../../composables/useVotingActions';
import { SuggestionType } from '../../types/vote';
import type { ThemeVoting } from '../../types/vote';
import Button from '../Button.vue';

import ThemeVotingBlock from './ThemeVotingBlock.vue';

const { address } = useConnection();
const { t } = useI18n();
const { getVotingsByType, scanHistoricalEvents, isScanning, isScanned } = useVotingCache();

// Scan historical events on mount if not already scanned
if (!isScanned.value && !isScanning.value) {
  scanHistoricalEvents();
}

// Get all theme votings
const themeVotings = computed(() => {
  return getVotingsByType(SuggestionType.Theme) as ThemeVoting[];
});

// Sort votings: active first, then by start time (newest first)
const sortedVotings = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return [...themeVotings.value].sort((a, b) => {
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
  isCategorical: true,
  x: '',
  theme: '',
  duration: '604800' // 1 week in seconds
});

// Use voting actions composable
const { 
  createVoting, 
  isPending,
  isConfirming,
  isSuccess,
  error
} = useCreateThemeVoting();

// Handle form submission
const handleCreateVoting = () => {
  createVoting(
    formData.isCategorical,
    BigInt(formData.x),
    formData.theme,
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
      isCategorical: true,
      x: '',
      theme: '',
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
  <div class="theme-voting">
    <div class="theme-voting__header">
      <h2 class="theme-voting__title">{{ t('voting.theme.title') }}</h2>
      <Button 
        v-if="address"
        variant="primary"
        @click="showCreateForm = !showCreateForm"
        class="theme-voting__create-button"
      >
        {{ showCreateForm ? t('voting.buttons.cancel') : t('voting.buttons.createVoting') }}
      </Button>
    </div>

    <div v-if="showCreateForm" class="theme-voting__form">
      <h3 class="theme-voting__form-title">{{ t('voting.theme.createTitle') }}</h3>
      <form @submit.prevent="handleCreateVoting" class="theme-voting__form-content">
        <div class="theme-voting__form-group">
          <label class="theme-voting__label">
            <input
              v-model="formData.isCategorical"
              type="checkbox"
              class="theme-voting__checkbox"
            />
            {{ t('voting.form.isCategorical') }}
          </label>
        </div>

        <div class="theme-voting__form-group">
          <label class="theme-voting__label" for="x">
            {{ t('voting.form.x') }}
          </label>
          <input
            id="x"
            v-model="formData.x"
            type="number"
            required
            min="0"
            placeholder="0"
            class="theme-voting__input"
          />
        </div>

        <div class="theme-voting__form-group">
          <label class="theme-voting__label" for="theme">
            {{ t('voting.form.theme') }}
          </label>
          <textarea
            id="theme"
            v-model="formData.theme"
            required
            rows="5"
            placeholder="Enter theme text..."
            class="theme-voting__textarea"
          ></textarea>
        </div>

        <div class="theme-voting__form-group">
          <label class="theme-voting__label" for="duration">
            {{ t('voting.form.duration') }}
          </label>
          <input
            id="duration"
            v-model="formData.duration"
            type="number"
            required
            min="60"
            placeholder="604800"
            class="theme-voting__input"
          />
          <span class="theme-voting__hint">
            (604800 {{ t('voting.form.durationHint') }})
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          :disabled="isPending || isConfirming"
          class="theme-voting__submit"
        >
          {{ isPending || isConfirming ? t('voting.buttons.creating') : t('voting.buttons.submit') }}
        </Button>
      </form>
    </div>

    <div class="theme-voting__filters">
      <Button
        @click="filterOption = 'all'"
        :variant="filterOption === 'all' ? 'primary' : 'secondary'"
      >
        {{ t('voting.theme.filters.all') }} ({{ themeVotings.length }})
      </Button>
      <Button
        @click="filterOption = 'active'"
        :variant="filterOption === 'active' ? 'primary' : 'secondary'"
      >
        {{ t('voting.theme.filters.active') }} ({{ activeCount }})
      </Button>
      <Button
        @click="filterOption = 'finalized'"
        :variant="filterOption === 'finalized' ? 'primary' : 'secondary'"
      >
        {{ t('voting.theme.filters.finalized') }} ({{ finalizedCount }})
      </Button>
    </div>

    <div class="theme-voting__list">
      <div v-if="filteredVotings.length === 0" class="theme-voting__empty">
        <p>{{ t('voting.messages.noVotingsFound') }}</p>
      </div>
      
      <ThemeVotingBlock
        v-for="voting in filteredVotings"
        :key="voting.votingId.toString()"
        :voting="voting"
        class="theme-voting__item"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/themeVoting/index.scss";
</style>