<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useConnection } from '@wagmi/vue';
import { useI18n } from 'vue-i18n';

import { useVotingCache } from '../../composables/useVotingCache';
import { useCreateStatementVoting } from '../../composables/useVotingActions';
import { SuggestionType } from '../../types/vote';
import type { StatementVoting } from '../../types/vote';
import Button from '../Button.vue';

import StatementVotingBlock from './StatementVotingBlock.vue';

const { address } = useConnection();
const { t } = useI18n();
const { getVotingsByType, scanHistoricalEvents, isScanning, isScanned } = useVotingCache();

// Scan historical events on mount if not already scanned
if (!isScanned.value && !isScanning.value) {
  scanHistoricalEvents();
}

// Get all statement votings
const statementVotings = computed(() => {
  return getVotingsByType(SuggestionType.Statement) as StatementVoting[];
});

// Sort votings: active first, then by start time (newest first)
const sortedVotings = computed(() => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return [...statementVotings.value].sort((a, b) => {
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
  y: '',
  statement: '',
  duration: '604800' // 1 week in seconds
});

// Use voting actions composable
const { 
  createVoting, 
  isPending,
  isConfirming,
  isSuccess,
  error
} = useCreateStatementVoting();

// Handle form submission
const handleCreateVoting = () => {
  createVoting(
    formData.isCategorical,
    BigInt(formData.x),
    BigInt(formData.y),
    formData.statement,
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
      y: '',
      statement: '',
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
  <div class="statement-voting">
    <div class="statement-voting__header">
      <h2 class="statement-voting__title">{{ t('voting.statement.title') }}</h2>
      <Button 
        v-if="address"
        variant="primary"
        @click="showCreateForm = !showCreateForm"
        class="statement-voting__create-button"
      >
        {{ showCreateForm ? t('voting.buttons.cancel') : t('voting.buttons.createVoting') }}
      </Button>
    </div>

    <div v-if="showCreateForm" class="statement-voting__form">
      <h3 class="statement-voting__form-title">{{ t('voting.statement.createTitle') }}</h3>
      <form @submit.prevent="handleCreateVoting" class="statement-voting__form-content">
        <div class="statement-voting__form-group">
          <label class="statement-voting__label">
            <input
              v-model="formData.isCategorical"
              type="checkbox"
              class="statement-voting__checkbox"
            />
            {{ t('voting.form.isCategorical') }}
          </label>
        </div>

        <div class="statement-voting__form-row">
          <div class="statement-voting__form-group">
            <label class="statement-voting__label" for="x">
              {{ t('voting.form.x') }}
            </label>
            <input
              id="x"
              v-model="formData.x"
              type="number"
              required
              min="0"
              placeholder="0"
              class="statement-voting__input"
            />
          </div>

          <div class="statement-voting__form-group">
            <label class="statement-voting__label" for="y">
              {{ t('voting.form.y') }}
            </label>
            <input
              id="y"
              v-model="formData.y"
              type="number"
              required
              min="0"
              placeholder="0"
              class="statement-voting__input"
            />
          </div>
        </div>

        <div class="statement-voting__form-group">
          <label class="statement-voting__label" for="statement">
            {{ t('voting.form.statement') }}
          </label>
          <textarea
            id="statement"
            v-model="formData.statement"
            required
            rows="5"
            placeholder="Enter statement text..."
            class="statement-voting__textarea"
          ></textarea>
        </div>

        <div class="statement-voting__form-group">
          <label class="statement-voting__label" for="duration">
            {{ t('voting.form.duration') }}
          </label>
          <input
            id="duration"
            v-model="formData.duration"
            type="number"
            required
            min="60"
            placeholder="604800"
            class="statement-voting__input"
          />
          <span class="statement-voting__hint">
            (604800 {{ t('voting.form.durationHint') }})
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          :disabled="isPending || isConfirming"
          class="statement-voting__submit"
        >
          {{ isPending || isConfirming ? t('voting.buttons.creating') : t('voting.buttons.submit') }}
        </Button>
      </form>
    </div>

    <div class="statement-voting__filters">
      <Button
        @click="filterOption = 'all'"
        :variant="filterOption === 'all' ? 'primary' : 'secondary'"
      >
        {{ t('voting.statement.filters.all') }} ({{ statementVotings.length }})
      </Button>
      <Button
        @click="filterOption = 'active'"
        :variant="filterOption === 'active' ? 'primary' : 'secondary'"
      >
        {{ t('voting.statement.filters.active') }} ({{ activeCount }})
      </Button>
      <Button
        @click="filterOption = 'finalized'"
        :variant="filterOption === 'finalized' ? 'primary' : 'secondary'"
      >
        {{ t('voting.statement.filters.finalized') }} ({{ finalizedCount }})
      </Button>
    </div>

    <div class="statement-voting__list">
      <div v-if="filteredVotings.length === 0" class="statement-voting__empty">
        <p>{{ t('voting.messages.noVotingsFound') }}</p>
      </div>
      
      <StatementVotingBlock
        v-for="voting in filteredVotings"
        :key="voting.votingId.toString()"
        :voting="voting"
        class="statement-voting__item"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/statementVoting/index.scss";
</style>