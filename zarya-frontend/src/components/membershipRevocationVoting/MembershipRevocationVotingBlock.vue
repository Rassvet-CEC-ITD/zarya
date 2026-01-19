<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MembershipRevocationVoting } from '../../types/vote';
import { decodeOrganHash } from '../../composables/usePartyOrgan';

import MembershipRevocationVotingActions from './MembershipRevocationVotingActions.vue';
import MembershipRevocationVotingStats from './MembershipRevocationVotingStats.vue';

const props = defineProps<{
  voting: MembershipRevocationVoting;
}>();

const { t } = useI18n();

// Decode organ hash to human-readable identifier
const organDisplay = computed(() => {
  return decodeOrganHash(props.voting.organ, t);
});

// Format author address
const authorDisplay = computed(() => {
  return props.voting.author.slice(0, 6) + '...' + props.voting.author.slice(-4);
});

// Format member address
const memberDisplay = computed(() => {
  return props.voting.member.slice(0, 6) + '...' + props.voting.member.slice(-4);
});

// Format dates
const formatDate = (timestamp: bigint) => {
  return new Date(Number(timestamp) * 1000).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const startDate = computed(() => formatDate(props.voting.startTime));
const endDate = computed(() => formatDate(props.voting.endTime));
</script>

<template>
  <div class="membership-revocation-voting-block">
    <div class="membership-revocation-voting-block__header">
      <h3 class="membership-revocation-voting-block__title">
        {{ t('voting.membershipRevocation.votingNumber') }}{{ voting.votingId.toString() }}
      </h3>
      <div class="membership-revocation-voting-block__info">
        <span class="membership-revocation-voting-block__info-item">
          <span class="membership-revocation-voting-block__label">{{ t('voting.labels.organ') }}</span>
          <span class="membership-revocation-voting-block__value">{{ organDisplay }}</span>
        </span>
        <span class="membership-revocation-voting-block__info-item">
          <span class="membership-revocation-voting-block__label">{{ t('voting.labels.author') }}</span>
          <span class="membership-revocation-voting-block__value">{{ authorDisplay }}</span>
        </span>
      </div>
      <div class="membership-revocation-voting-block__member">
        <span class="membership-revocation-voting-block__member-item">
          <span class="membership-revocation-voting-block__label">{{ t('voting.labels.memberToRevoke') }}</span>
          <span class="membership-revocation-voting-block__value">{{ memberDisplay }}</span>
        </span>
      </div>
      <div class="membership-revocation-voting-block__time">
        <span class="membership-revocation-voting-block__time-item">
          <span class="membership-revocation-voting-block__label">{{ t('voting.labels.start') }}</span>
          <span class="membership-revocation-voting-block__value">{{ startDate }}</span>
        </span>
        <span class="membership-revocation-voting-block__time-item">
          <span class="membership-revocation-voting-block__label">{{ t('voting.labels.end') }}</span>
          <span class="membership-revocation-voting-block__value">{{ endDate }}</span>
        </span>
      </div>
    </div>

    <div class="membership-revocation-voting-block__actions">
      <MembershipRevocationVotingActions :voting="voting" :organ="voting.organ" />
    </div>

    <div class="membership-revocation-voting-block__stats">
      <MembershipRevocationVotingStats :voting="voting" />
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/membershipRevocationVoting/block.scss";
</style>
