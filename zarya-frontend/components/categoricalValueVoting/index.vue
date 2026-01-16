<script setup lang="ts">
import { useVotingCache } from '~/composables/useVotingCache';
import { useCreateCategoricalValueVoting } from '~/composables/useVotingActions';
import { useConnection } from '@wagmi/vue';
import { SuggestionType } from '~/types/vote';
import type { CategoricalValueVoting } from '~/types/vote';
import CategoricalValueVotingBlock from './CategoricalValueVotingBlock.vue';

const { address } = useConnection();
const { getVotingsByType } = useVotingCache();

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
  organ: '',
  x: '',
  y: '',
  value: '',
  valueAuthor: '',
  duration: '604800' // 1 week in seconds
});

const { 
  createVoting, 
  isPending, 
  isConfirming, 
  isSuccess 
} = useCreateCategoricalValueVoting();

// Handle form submission
const handleCreateVoting = () => {
  console.log('handleCreateVoting called', { address: address.value, formData });
  if (!address.value) {
    console.warn('No wallet address connected');
    return;
  }
  
  try {
    createVoting(
      formData.organ,
      BigInt(formData.x),
      BigInt(formData.y),
      BigInt(formData.value),
      formData.valueAuthor,
      BigInt(formData.duration)
    );
  } catch (error) {
    console.error('Error creating voting:', error);
  }
};

// Reset form on success
watch(isSuccess, (newVal) => {
  if (newVal) {
    Object.assign(formData, {
      organ: '',
      x: '',
      y: '',
      value: '',
      valueAuthor: '',
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
</script>

<template>
  <div class="categorical-value-voting">
    <div class="categorical-value-voting__header">
      <h2 class="categorical-value-voting__title">Голосования за категориальные значения</h2>
      <Button 
        v-if="address"
        variant="primary"
        @click="showCreateForm = !showCreateForm"
        class="categorical-value-voting__create-button"
      >
        {{ showCreateForm ? 'Отменить' : 'Создать голосование' }}
      </Button>
    </div>

    <div v-if="showCreateForm" class="categorical-value-voting__form">
      <h3 class="categorical-value-voting__form-title">Создать новое голосование</h3>
      <form @submit.prevent="handleCreateVoting" class="categorical-value-voting__form-content">
        <div class="categorical-value-voting__form-group">
          <label class="categorical-value-voting__label" for="organ">
            Орган (bytes32):
          </label>
          <input
            id="organ"
            v-model="formData.organ"
            type="text"
            required
            placeholder="0x..."
            class="categorical-value-voting__input"
          />
        </div>

        <div class="categorical-value-voting__form-row">
          <div class="categorical-value-voting__form-group">
            <label class="categorical-value-voting__label" for="x">
              Координата X:
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
              Координата Y:
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
            Значение:
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
          <label class="categorical-value-voting__label" for="valueAuthor">
            Автор значения (адрес):
          </label>
          <input
            id="valueAuthor"
            v-model="formData.valueAuthor"
            type="text"
            required
            placeholder="0x..."
            class="categorical-value-voting__input"
          />
        </div>

        <div class="categorical-value-voting__form-group">
          <label class="categorical-value-voting__label" for="duration">
            Длительность (секунды):
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
            (по умолчанию: 1 неделя = 604800 секунд)
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          :disabled="isPending || isConfirming"
          class="categorical-value-voting__submit"
        >
          {{ isPending || isConfirming ? 'Создаю...' : 'Создать голосование' }}
        </Button>
      </form>
    </div>

    <div class="categorical-value-voting__filters">
      <button
        @click="filterOption = 'all'"
        :class="['categorical-value-voting__filter-button', { 'categorical-value-voting__filter-button--active': filterOption === 'all' }]"
      >
        Все ({{ categoricalValueVotings.length }})
      </button>
      <button
        @click="filterOption = 'active'"
        :class="['categorical-value-voting__filter-button', { 'categorical-value-voting__filter-button--active': filterOption === 'active' }]"
      >
        Активные
      </button>
      <button
        @click="filterOption = 'finalized'"
        :class="['categorical-value-voting__filter-button', { 'categorical-value-voting__filter-button--active': filterOption === 'finalized' }]"
      >
        Завершенные
      </button>
    </div>

    <div class="categorical-value-voting__list">
      <div v-if="filteredVotings.length === 0" class="categorical-value-voting__empty">
        <p>Голосований не найдено</p>
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
@use "~/assets/scss/categoricalValueVoting/index.scss";
</style>