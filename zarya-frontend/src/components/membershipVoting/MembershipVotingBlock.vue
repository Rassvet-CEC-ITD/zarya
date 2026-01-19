<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MembershipVoting } from '../../types/vote';
import { decodeOrganHash } from '../../composables/usePartyOrgan';
import MembershipVotingActions from './MembershipVotingActions.vue';
import MembershipVotingStats from './MembershipVotingStats.vue';

const props = defineProps<{
  voting: MembershipVoting
}>();

const { t } = useI18n();

// Decode organ hash to get organ type, region and number
const organInfo = computed(() => decodeOrganHash(props.voting.organ, t));

// Format timestamps
const startDate = computed(() => new Date(Number(props.voting.startTime) * 1000).toLocaleString());
const endDate = computed(() => new Date(Number(props.voting.endTime) * 1000).toLocaleString());

// Shorten address for display
const shortAddress = computed(() => {
  const addr = props.voting.member;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
});

// Shorten author address
const shortAuthor = computed(() => {
  const addr = props.voting.author;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
});
</script>

<template>
  <div class="membership-voting-block">
    <div class="membership-voting-block__header">
      <h3 class="membership-voting-block__title">
        {{ t('voting.membership.votingNumber') }}{{ voting.votingId }}
      </h3>
      
      <div class="membership-voting-block__info">
        <div class="membership-voting-block__info-item">
          <span class="membership-voting-block__label">{{ t('voting.labels.organ') }}</span>
          <span class="membership-voting-block__value">{{ organInfo }}</span>
        </div>

        <div class="membership-voting-block__info-item">
          <span class="membership-voting-block__label">{{ t('voting.labels.author') }}</span>
          <span class="membership-voting-block__value">{{ shortAuthor }}</span>
        </div>
      </div>

      <div class="membership-voting-block__member">
        <div class="membership-voting-block__member-item">
          <span class="membership-voting-block__label">{{ t('voting.labels.newMember') }}</span>
          <span class="membership-voting-block__value">{{ shortAddress }}</span>
        </div>
      </div>

      <div class="membership-voting-block__time">
        <div class="membership-voting-block__time-item">
          <span class="membership-voting-block__label">{{ t('voting.labels.start') }}</span>
          <span class="membership-voting-block__value">{{ startDate }}</span>
        </div>
        <div class="membership-voting-block__time-item">
          <span class="membership-voting-block__label">{{ t('voting.labels.end') }}</span>
          <span class="membership-voting-block__value">{{ endDate }}</span>
        </div>
      </div>
    </div>

    <MembershipVotingActions 
      :voting="voting"
      class="membership-voting-block__actions"
    />

    <MembershipVotingStats 
      :voting="voting"
      class="membership-voting-block__stats"
    />
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/membershipVoting/block.scss";
</style>
