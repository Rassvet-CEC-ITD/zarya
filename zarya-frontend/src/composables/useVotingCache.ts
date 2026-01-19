import { reactive, computed } from 'vue';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

import type { 
  Voting, 
  SuggestionType
} from '../types/vote';

import { useVotingWatcher } from './useVotingWatcher';
import { useVotingScanner } from './useVotingScanner';
import { NODE_URL } from '../wagmi';

/**
 * Voting cache state - reactive store of all votings
 */
const votingCache = reactive<Map<string, Voting>>(new Map());

/**
 * Viem public client for scanning operations
 */
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(NODE_URL)
});

/**
 * Main composable for voting cache with event listeners
 */
export function useVotingCache() {
  // Initialize watchers for real-time events
  useVotingWatcher(votingCache);

  // Initialize scanner for historical events
  const { scanHistoricalEvents: scan, isScanning, isScanned } = useVotingScanner(votingCache);

  /**
   * Scan historical events from the blockchain
   * @param daysBack - Number of days back from latest block to scan (undefined = scan all history)
   */
  const scanHistoricalEvents = (daysBack?: number) => {
    return scan(publicClient, daysBack);
  };

  // Get all votings as array
  const allVotings = computed(() => Array.from(votingCache.values()));

  // Get active votings
  const activeVotings = computed(() => 
    allVotings.value.filter((v: any) => !v.finalized && BigInt(Date.now() / 1000) < v.endTime)
  );

  // Get finalized votings
  const finalizedVotings = computed(() => 
    allVotings.value.filter((v: any) => v.finalized)
  );

  // Get voting by ID
  const getVoting = (votingId: bigint | string): Voting | undefined => {
    return votingCache.get(votingId.toString());
  };

  // Get votings by suggestion type
  const getVotingsByType = (type: SuggestionType) => {
    return allVotings.value.filter((v: any) => v.suggestionType === type);
  };

  // Get votings by author
  const getVotingsByAuthor = (author: string) => {
    return allVotings.value.filter((v: any) => v.author.toLowerCase() === author.toLowerCase());
  };

  // Clear cache (useful for testing or reinitialization)
  const clearCache = () => {
    votingCache.clear();
  };

  return {
    allVotings,
    activeVotings,
    finalizedVotings,
    getVoting,
    getVotingsByType,
    getVotingsByAuthor,
    clearCache,
    scanHistoricalEvents,
    isScanning: computed(() => isScanning.value),
    isScanned: computed(() => isScanned.value),
    cacheSize: computed(() => votingCache.size)
  };
}