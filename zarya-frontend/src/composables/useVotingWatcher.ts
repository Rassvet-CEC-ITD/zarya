import type { Log } from 'viem';
import { useWatchContractEvent } from '@wagmi/vue';

import type { 
  Voting
} from '../types/vote';
import type {
  VotingCreatedEventArgs,
  MembershipVotingCreatedEventArgs,
  MembershipRevocationVotingCreatedEventArgs,
  CategoryVotingCreatedEventArgs,
  DecimalsVotingCreatedEventArgs,
  ThemeVotingCreatedEventArgs,
  StatementVotingCreatedEventArgs,
  CategoricalValueVotingCreatedEventArgs,
  NumericalValueVotingCreatedEventArgs,
  VoteCastedEventArgs,
  VotingFinalizedEventArgs
} from '../types/contract-events';

import { ZARYA_CONTRACT_CONFIG } from '../zarya';
import { SuggestionType } from '../types/vote';

/**
 * Composable for watching real-time contract events
 */
export function useVotingWatcher(votingCache: Map<string, Voting>) {
  
  // Listen to VotingCreated events
  useWatchContractEvent({
    ...ZARYA_CONTRACT_CONFIG,
    eventName: 'VotingCreated',
    poll: true,
    pollingInterval: 4_000,
    onLogs(logs: Log[]) {
      logs.forEach((log: any) => {
        const args = log.args as VotingCreatedEventArgs;
        
        // Initialize base voting object
        const baseVoting = {
          votingId: BigInt(args.votingId),
          author: args.author,
          startTime: BigInt(args.startTime),
          endTime: BigInt(args.endTime),
          suggestionType: Number(args.suggestionType) as SuggestionType,
          forVotes: 0n,
          againstVotes: 0n,
          finalized: false
        };
        
        // Store with partial data (will be enriched by type-specific events)
        votingCache.set(args.votingId.toString(), baseVoting as any);
      });
    },
    onError(error) {
      console.error('[VotingWatcher] Error watching VotingCreated events:', error);
    }
  });

  // Listen to MembershipVotingCreated
  useWatchContractEvent({
    ...ZARYA_CONTRACT_CONFIG,
    eventName: 'MembershipVotingCreated',
    poll: true,
    pollingInterval: 4_000,
    onLogs(logs: Log[]) {
      logs.forEach((log: any) => {
        const args = log.args as MembershipVotingCreatedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          Object.assign(existing, { organ: args.organ, member: args.member });
        }
      });
    },
    onError(error) {
      console.error('[VotingWatcher] Error watching MembershipVotingCreated events:', error);
    }
  });

  // Listen to MembershipRevocationVotingCreated
  useWatchContractEvent({
    ...ZARYA_CONTRACT_CONFIG,
    eventName: 'MembershipRevocationVotingCreated',
    poll: true,
    pollingInterval: 4_000,
    onLogs(logs: Log[]) {
      logs.forEach((log: any) => {
        const args = log.args as MembershipRevocationVotingCreatedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          Object.assign(existing, { organ: args.organ, member: args.member });
        }
      });
    },
    onError(error) {
      console.error('[VotingWatcher] Error watching MembershipRevocationVotingCreated events:', error);
    }
  });

  // Listen to CategoryVotingCreated
  useWatchContractEvent({
    ...ZARYA_CONTRACT_CONFIG,
    eventName: 'CategoryVotingCreated',
    poll: true,
    pollingInterval: 4_000,
    onLogs(logs: Log[]) {
      logs.forEach((log: any) => {
        const args = log.args as CategoryVotingCreatedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          Object.assign(existing, { 
            organ: args.organ, 
            x: BigInt(args.x), 
            y: BigInt(args.y), 
            category: BigInt(args.category), 
            categoryName: args.categoryName 
          });
        }
      });
    },
    onError(error) {
      console.error('[VotingWatcher] Error watching CategoryVotingCreated events:', error);
    }
  });

  // Listen to DecimalsVotingCreated
  useWatchContractEvent({
    ...ZARYA_CONTRACT_CONFIG,
    eventName: 'DecimalsVotingCreated',
    poll: true,
    pollingInterval: 4_000,
    onLogs(logs: Log[]) {
      logs.forEach((log: any) => {
        const args = log.args as DecimalsVotingCreatedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          Object.assign(existing, { 
            organ: args.organ, 
            x: BigInt(args.x), 
            y: BigInt(args.y), 
            decimals: args.decimals // Already a number (uint8)
          });
        }
      });
    },
    onError(error) {
      console.error('[VotingWatcher] Error watching DecimalsVotingCreated events:', error);
    }
  });

  // Listen to ThemeVotingCreated
  useWatchContractEvent({
    ...ZARYA_CONTRACT_CONFIG,
    eventName: 'ThemeVotingCreated',
    poll: true,
    pollingInterval: 4_000,
    onLogs(logs: Log[]) {
      logs.forEach((log: any) => {
        const args = log.args as ThemeVotingCreatedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          Object.assign(existing, { 
            isCategorical: args.isCategorical, 
            x: BigInt(args.x), 
            theme: args.theme 
          });
        }
      });
    },
    onError(error) {
      console.error('[VotingWatcher] Error watching ThemeVotingCreated events:', error);
    }
  });

  // Listen to StatementVotingCreated
  useWatchContractEvent({
    ...ZARYA_CONTRACT_CONFIG,
    eventName: 'StatementVotingCreated',
    poll: true,
    pollingInterval: 4_000,
    onLogs(logs: Log[]) {
      logs.forEach((log: any) => {
        const args = log.args as StatementVotingCreatedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          Object.assign(existing, { 
            isCategorical: args.isCategorical, 
            x: BigInt(args.x), 
            y: BigInt(args.y), 
            statement: args.statement 
          });
        }
      });
    },
    onError(error) {
      console.error('[VotingWatcher] Error watching StatementVotingCreated events:', error);
    }
  });

  // Listen to CategoricalValueVotingCreated
  useWatchContractEvent({
    ...ZARYA_CONTRACT_CONFIG,
    eventName: 'CategoricalValueVotingCreated',
    poll: true,
    pollingInterval: 4_000,
    onLogs(logs: Log[]) {
      logs.forEach((log: any) => {
        const args = log.args as CategoricalValueVotingCreatedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          Object.assign(existing, { 
            organ: args.organ, 
            x: BigInt(args.x), 
            y: BigInt(args.y), 
            value: BigInt(args.value), 
            valueAuthor: args.author 
          });
        }
      });
    },
    onError(error) {
      console.error('[VotingWatcher] Error watching CategoricalValueVotingCreated events:', error);
    }
  });

  // Listen to NumericalValueVotingCreated
  useWatchContractEvent({
    ...ZARYA_CONTRACT_CONFIG,
    eventName: 'NumericalValueVotingCreated',
    poll: true,
    pollingInterval: 4_000,
    onLogs(logs: Log[]) {
      logs.forEach((log: any) => {
        const args = log.args as NumericalValueVotingCreatedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          Object.assign(existing, { 
            organ: args.organ, 
            x: BigInt(args.x), 
            y: BigInt(args.y), 
            value: BigInt(args.value), 
            valueAuthor: args.author 
          });
        }
      });
    },
    onError(error) {
      console.error('[VotingWatcher] Error watching NumericalValueVotingCreated events:', error);
    }
  });

  // Listen to VoteCasted for real-time vote count updates
  useWatchContractEvent({
    ...ZARYA_CONTRACT_CONFIG,
    eventName: 'VoteCasted',
    poll: true,
    pollingInterval: 4_000,
    onLogs(logs: Log[]) {
      logs.forEach((log: any) => {
        const args = log.args as VoteCastedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          existing.forVotes = BigInt(args.forVotes);
          existing.againstVotes = BigInt(args.againstVotes);
        }
      });
    },
    onError(error) {
      console.error('[VotingWatcher] Error watching VoteCasted events:', error);
    }
  });

  // Listen to VotingFinalized
  useWatchContractEvent({
    ...ZARYA_CONTRACT_CONFIG,
    eventName: 'VotingFinalized',
    poll: true,
    pollingInterval: 4_000,
    onLogs(logs: Log[]) {
      logs.forEach((log: any) => {
        const args = log.args as VotingFinalizedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          existing.finalized = true;
          existing.success = Boolean(args.success);
          existing.forVotes = BigInt(args.forVotes);
          existing.againstVotes = BigInt(args.againstVotes);
        }
      });
    },
    onError(error) {
      console.error('[VotingWatcher] Error watching VotingFinalized events:', error);
    }
  });
}
