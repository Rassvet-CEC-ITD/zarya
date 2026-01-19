import type { PublicClient } from 'viem';
import { ref, computed } from 'vue';
import { getContractEvents } from 'viem/actions';

import type { 
  Voting, 
  SuggestionType
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

import { ZARYA_CONTRACT_CONFIG, BLOCKS_PER_DAY } from '../zarya';

/**
 * Track if historical events have been scanned
 */
const isScanned = ref(false);
const isScanning = ref(false);

/**
 * Composable for scanning historical contract events
 */
export function useVotingScanner(votingCache: Map<string, Voting>) {

  /**
   * Scan historical events from the contract
   * @param publicClient - Viem public client
   * @param daysBack - Number of days back from latest block to scan (default: scan all history from block 0)
   */
  const scanHistoricalEvents = async (publicClient: PublicClient | undefined, daysBack?: number) => {
    if (isScanning.value || isScanned.value || !publicClient) return;
    
    isScanning.value = true;
    
    try {
      // Calculate fromBlock based on daysBack parameter
      let fromBlock: bigint = 0n;
      
      if (daysBack !== undefined) {
        const latestBlock = await publicClient.getBlockNumber();
        const blocksBack = BigInt(daysBack * Number(BLOCKS_PER_DAY));
        fromBlock = latestBlock > blocksBack ? latestBlock - blocksBack : 0n;
        
        console.log(`[VotingScanner] Scanning from ${daysBack} days back (block ${fromBlock}) to latest (block ${latestBlock}) - ${latestBlock - fromBlock} blocks`);
      } else {
        console.log(`[VotingScanner] Scanning all history from block 0`);
      }
      
      // Get all VotingCreated events
      const votingCreatedEvents = await getContractEvents(publicClient, {
        ...ZARYA_CONTRACT_CONFIG,
        eventName: 'VotingCreated',
        fromBlock,
        toBlock: 'latest'
      });

      // Process base voting events
      for (const log of votingCreatedEvents) {
        const args = (log as any).args as VotingCreatedEventArgs;
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
        votingCache.set(args.votingId.toString(), baseVoting as any);
      }

      // Get all type-specific events and enrich votings
      const [
        membershipEvents,
        membershipRevocationEvents,
        categoryEvents,
        decimalsEvents,
        themeEvents,
        statementEvents,
        categoricalValueEvents,
        numericalValueEvents,
        voteCastedEvents,
        votingFinalizedEvents
      ] = await Promise.all([
        getContractEvents(publicClient, { ...ZARYA_CONTRACT_CONFIG, eventName: 'MembershipVotingCreated', fromBlock, toBlock: 'latest' }),
        getContractEvents(publicClient, { ...ZARYA_CONTRACT_CONFIG, eventName: 'MembershipRevocationVotingCreated', fromBlock, toBlock: 'latest' }),
        getContractEvents(publicClient, { ...ZARYA_CONTRACT_CONFIG, eventName: 'CategoryVotingCreated', fromBlock, toBlock: 'latest' }),
        getContractEvents(publicClient, { ...ZARYA_CONTRACT_CONFIG, eventName: 'DecimalsVotingCreated', fromBlock, toBlock: 'latest' }),
        getContractEvents(publicClient, { ...ZARYA_CONTRACT_CONFIG, eventName: 'ThemeVotingCreated', fromBlock, toBlock: 'latest' }),
        getContractEvents(publicClient, { ...ZARYA_CONTRACT_CONFIG, eventName: 'StatementVotingCreated', fromBlock, toBlock: 'latest' }),
        getContractEvents(publicClient, { ...ZARYA_CONTRACT_CONFIG, eventName: 'CategoricalValueVotingCreated', fromBlock, toBlock: 'latest' }),
        getContractEvents(publicClient, { ...ZARYA_CONTRACT_CONFIG, eventName: 'NumericalValueVotingCreated', fromBlock, toBlock: 'latest' }),
        getContractEvents(publicClient, { ...ZARYA_CONTRACT_CONFIG, eventName: 'VoteCasted', fromBlock, toBlock: 'latest' }),
        getContractEvents(publicClient, { ...ZARYA_CONTRACT_CONFIG, eventName: 'VotingFinalized', fromBlock, toBlock: 'latest' })
      ]);

      // Process membership events
      for (const log of membershipEvents) {
        const args = (log as any).args as MembershipVotingCreatedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          Object.assign(existing, { organ: args.organ, member: args.member });
        }
      }

      // Process membership revocation events
      for (const log of membershipRevocationEvents) {
        const args = (log as any).args as MembershipRevocationVotingCreatedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          Object.assign(existing, { organ: args.organ, member: args.member });
        }
      }

      // Process category events
      for (const log of categoryEvents) {
        const args = (log as any).args as CategoryVotingCreatedEventArgs;
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
      }

      // Process decimals events
      for (const log of decimalsEvents) {
        const args = (log as any).args as DecimalsVotingCreatedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          Object.assign(existing, { 
            organ: args.organ, 
            x: BigInt(args.x), 
            y: BigInt(args.y), 
            decimals: args.decimals 
          });
        }
      }

      // Process theme events
      for (const log of themeEvents) {
        const args = (log as any).args as ThemeVotingCreatedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          Object.assign(existing, { 
            isCategorical: args.isCategorical, 
            x: BigInt(args.x), 
            theme: args.theme 
          });
        }
      }

      // Process statement events
      for (const log of statementEvents) {
        const args = (log as any).args as StatementVotingCreatedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          Object.assign(existing, { 
            isCategorical: args.isCategorical, 
            x: BigInt(args.x), 
            y: BigInt(args.y), 
            statement: args.statement 
          });
        }
      }

      // Process categorical value events
      for (const log of categoricalValueEvents) {
        const args = (log as any).args as CategoricalValueVotingCreatedEventArgs;
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
      }

      // Process numerical value events
      for (const log of numericalValueEvents) {
        const args = (log as any).args as NumericalValueVotingCreatedEventArgs;
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
      }

      // Process vote casted events
      for (const log of voteCastedEvents) {
        const args = (log as any).args as VoteCastedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          existing.forVotes = BigInt(args.forVotes);
          existing.againstVotes = BigInt(args.againstVotes);
        }
      }

      // Process voting finalized events
      for (const log of votingFinalizedEvents) {
        const args = (log as any).args as VotingFinalizedEventArgs;
        const existing = votingCache.get(args.votingId.toString());
        if (existing) {
          existing.finalized = true;
          existing.success = Boolean(args.success);
          existing.forVotes = BigInt(args.forVotes);
          existing.againstVotes = BigInt(args.againstVotes);
        }
      }

      isScanned.value = true;
      console.log(`[VotingScanner] Scanned ${votingCache.size} historical votings`);
    } catch (error) {
      console.error('[VotingScanner] Error scanning historical events:', error);
    } finally {
      isScanning.value = false;
    }
  };

  return {
    scanHistoricalEvents,
    isScanning: computed(() => isScanning.value),
    isScanned: computed(() => isScanned.value)
  };
}
