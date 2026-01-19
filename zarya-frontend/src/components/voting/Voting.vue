<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from '../Button.vue';

import CategoricalValueVoting from '../categoricalValueVoting/CategoricalValueVoting.vue';
import CategoryVoting from '../categoryVoting/CategoryVoting.vue';
import DecimalsVoting from '../decimalsVoting/DecimalsVoting.vue';
import MembershipVoting from '../membershipVoting/MembershipVoting.vue';
import MembershipRevocationVoting from '../membershipRevocationVoting/MembershipRevocationVoting.vue';
import NumericalValueVoting from '../numericalValueVoting/NumericalValueVoting.vue';
import StatementVoting from '../statementVoting/StatementVoting.vue';
import ThemeVoting from '../themeVoting/ThemeVoting.vue';

const { t } = useI18n();
const activeTab = ref<string>('categorical-value');

const tabs = computed(() => [
  { id: 'categorical-value', label: t('voting.votingTabs.categoricalValue') },
  { id: 'numerical-value', label: t('voting.votingTabs.numericalValue') },
  { id: 'membership', label: t('voting.votingTabs.membership') },
  { id: 'membership-revocation', label: t('voting.votingTabs.membershipRevocation') },
  { id: 'category', label: t('voting.votingTabs.category') },
  { id: 'decimals', label: t('voting.votingTabs.decimals') },
  { id: 'theme', label: t('voting.votingTabs.theme') },
  { id: 'statement', label: t('voting.votingTabs.statement') }
]);

const setActiveTab = (tabId: string) => {
  activeTab.value = tabId;
};
</script>

<template>
  <div class="voting">
    <div class="voting__header">
      <h1 class="voting__title">{{ t('voting.page.title') }}</h1>
      <p class="voting__description">
        {{ t('voting.page.description') }}
      </p>
    </div>

    <div class="voting__tabs">
      <Button
        v-for="tab in tabs"
        :key="tab.id"
        @click="setActiveTab(tab.id)"
        :variant="activeTab === tab.id ? 'primary' : 'secondary'"
      >
        {{ tab.label }}
      </Button>
    </div>

    <div class="voting__content">
      <div v-show="activeTab === 'categorical-value'" class="voting__panel">
        <CategoricalValueVoting />
      </div>

      <div v-show="activeTab === 'numerical-value'" class="voting__panel">
        <NumericalValueVoting />
      </div>

      <div v-show="activeTab === 'membership'" class="voting__panel">
        <MembershipVoting />
      </div>

      <div v-show="activeTab === 'membership-revocation'" class="voting__panel">
        <MembershipRevocationVoting />
      </div>

      <div v-show="activeTab === 'category'" class="voting__panel">
        <CategoryVoting />
      </div>

      <div v-show="activeTab === 'decimals'" class="voting__panel">
        <DecimalsVoting />
      </div>

      <div v-show="activeTab === 'theme'" class="voting__panel">
        <ThemeVoting />
      </div>

      <div v-show="activeTab === 'statement'" class="voting__panel">
        <StatementVoting />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/voting/index.scss";
</style>