<script setup lang="ts">
import CategoricalValueVoting from '~/components/categoricalValueVoting/index.vue'

const activeTab = ref<string>('categorical-value')

const tabs = [
  { id: 'categorical-value', label: 'Категориальные значения' },
  { id: 'numerical-value', label: 'Численные значения' },
  { id: 'membership', label: 'Членство' },
  { id: 'membership-revocation', label: 'Исключение' },
  { id: 'category', label: 'Категории' },
  { id: 'decimals', label: 'Точность' },
  { id: 'theme', label: 'Темы' },
  { id: 'statement', label: 'Утверждения' }
]

const setActiveTab = (tabId: string) => {
  activeTab.value = tabId
}
</script>

<template>
  <div class="voting">
    <div class="voting__header">
      <h1 class="voting__title">Голосования</h1>
      <p class="voting__description">
        Просматривайте и участвуйте в различных типах голосований
      </p>
    </div>

    <div class="voting__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="setActiveTab(tab.id)"
        :class="[
          'voting__tab',
          { 'voting__tab--active': activeTab === tab.id }
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="voting__content">
      <div v-show="activeTab === 'categorical-value'" class="voting__panel">
        <CategoricalValueVoting />
      </div>

      <div v-show="activeTab === 'numerical-value'" class="voting__panel">
        <div class="voting__placeholder">
          <p>Голосования за численные значения будут доступны здесь</p>
        </div>
      </div>

      <div v-show="activeTab === 'membership'" class="voting__panel">
        <div class="voting__placeholder">
          <p>Голосования за членство будут доступны здесь</p>
        </div>
      </div>

      <div v-show="activeTab === 'membership-revocation'" class="voting__panel">
        <div class="voting__placeholder">
          <p>Голосования за исключение будут доступны здесь</p>
        </div>
      </div>

      <div v-show="activeTab === 'category'" class="voting__panel">
        <div class="voting__placeholder">
          <p>Голосования за категории будут доступны здесь</p>
        </div>
      </div>

      <div v-show="activeTab === 'decimals'" class="voting__panel">
        <div class="voting__placeholder">
          <p>Голосования за точность будут доступны здесь</p>
        </div>
      </div>

      <div v-show="activeTab === 'theme'" class="voting__panel">
        <div class="voting__placeholder">
          <p>Голосования за темы будут доступны здесь</p>
        </div>
      </div>

      <div v-show="activeTab === 'statement'" class="voting__panel">
        <div class="voting__placeholder">
          <p>Голосования за утверждения будут доступны здесь</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "~/assets/scss/voting/index.scss";
</style>