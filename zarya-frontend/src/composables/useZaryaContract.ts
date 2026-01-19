import { useReadContract } from '@wagmi/vue';
import { computed, type Ref } from 'vue';

import type { VoteResults } from '../types/contract';
import { ZARYA_CONTRACT_CONFIG } from '../zarya';

/**
 * Read voting results from contract
 */
export function useVotingResults(votingId: Ref<bigint | undefined>) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getVotingResults',
    args: computed(() => votingId.value ? [votingId.value] as const : undefined),
    query: {
      enabled: computed(() => !!votingId.value)
    }
  });
}

/**
 * Check if voting is active
 */
export function useIsVotingActive(votingId: Ref<bigint | undefined>) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'isVotingActive',
    args: computed(() => votingId.value ? [votingId.value] as const : undefined),
    query: {
      enabled: computed(() => !!votingId.value)
    }
  });
}

/**
 * Check if voting is finalized
 */
export function useIsVotingFinalized(votingId: Ref<bigint | undefined>) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'isVotingFinalized',
    args: computed(() => votingId.value ? [votingId.value] as const : undefined),
    query: {
      enabled: computed(() => !!votingId.value)
    }
  });
}

/**
 * Check if a member has voted
 */
export function useHasVoted(
  votingId: Ref<bigint | undefined>,
  member: Ref<string | undefined>
) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'hasVoted',
    args: computed(() => 
      votingId.value && member.value 
        ? [votingId.value, member.value as `0x${string}`] as const
        : undefined
    ),
    query: {
      enabled: computed(() => !!votingId.value && !!member.value)
    }
  });
}

/**
 * Get theme for a matrix row
 */
export function useTheme(isCategorical: Ref<boolean>, x: Ref<bigint | undefined>) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getTheme',
    args: computed(() => x.value !== undefined ? [isCategorical.value, x.value] as const : undefined),
    query: {
      enabled: computed(() => x.value !== undefined)
    }
  });
}

/**
 * Get statement for a matrix cell
 */
export function useStatement(isCategorical: Ref<boolean>, y: Ref<bigint | undefined>) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getStatement',
    args: computed(() => y.value !== undefined ? [isCategorical.value, y.value] as const : undefined),
    query: {
      enabled: computed(() => y.value !== undefined)
    }
  });
}

/**
 * Get categorical cell info (organ, categories, sample length)
 */
export function useCategoricalCellInfo(x: Ref<bigint | undefined>, y: Ref<bigint | undefined>) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getCategoricalCellInfo',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined 
        ? [x.value, y.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => x.value !== undefined && y.value !== undefined)
    }
  }) as ReturnType<typeof useReadContract<typeof ZARYA_CONTRACT_CONFIG['abi'], 'getCategoricalCellInfo', readonly [bigint, bigint]>>;
}

/**
 * Get numerical cell info (organ, decimals, sample length)
 */
export function useNumericalCellInfo(x: Ref<bigint | undefined>, y: Ref<bigint | undefined>) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getNumericalCellInfo',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined 
        ? [x.value, y.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => x.value !== undefined && y.value !== undefined)
    }
  }) as ReturnType<typeof useReadContract<typeof ZARYA_CONTRACT_CONFIG['abi'], 'getNumericalCellInfo', readonly [bigint, bigint]>>;
}

/**
 * Get voting status (active, finalized, success)
 */
export function useVotingStatus(votingId: Ref<bigint | undefined>) {
  const { data: isActive, ...activeQuery } = useIsVotingActive(votingId);
  const { data: isFinalized, ...finalizedQuery } = useIsVotingFinalized(votingId);
  const { data: results, ...resultsQuery } = useVotingResults(votingId);

  const statusLabel = computed(() => {
    if (!isFinalized.value && isActive.value) return 'active';
    if (isFinalized.value && results.value) {
      const voteResults = results.value as VoteResults;
      return voteResults.forVotes > voteResults.againstVotes ? 'passed' : 'rejected';
    }
    return 'pending';
  });

  return {
    isActive,
    isFinalized,
    results,
    statusLabel,
    isLoading: computed(() => 
      activeQuery.isLoading || finalizedQuery.isLoading || resultsQuery.isLoading
    ),
    error: computed(() => 
      activeQuery.error || finalizedQuery.error || resultsQuery.error
    )
  };
}

// ============ Matrix Read Functions ============

/**
 * Get organ for categorical cell
 */
export function useCategoricalCellOrgan(x: Ref<bigint | undefined>, y: Ref<bigint | undefined>) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getCategoricalCellOrgan',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined 
        ? [x.value, y.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => x.value !== undefined && y.value !== undefined)
    }
  });
}

/**
 * Get organ for numerical cell
 */
export function useNumericalCellOrgan(x: Ref<bigint | undefined>, y: Ref<bigint | undefined>) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getNumericalCellOrgan',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined 
        ? [x.value, y.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => x.value !== undefined && y.value !== undefined)
    }
  });
}

/**
 * Get allowed categories for a cell
 */
export function useAllowedCategories(x: Ref<bigint | undefined>, y: Ref<bigint | undefined>) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getAllowedCategories',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined 
        ? [x.value, y.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => x.value !== undefined && y.value !== undefined)
    }
  });
}

/**
 * Get category name
 */
export function useCategoryName(
  x: Ref<bigint | undefined>, 
  y: Ref<bigint | undefined>,
  category: Ref<bigint | undefined>
) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getCategoryName',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined && category.value !== undefined
        ? [x.value, y.value, category.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => 
        x.value !== undefined && y.value !== undefined && category.value !== undefined
      )
    }
  });
}

/**
 * Check if category is allowed
 */
export function useIsCategoryAllowed(
  x: Ref<bigint | undefined>, 
  y: Ref<bigint | undefined>,
  category: Ref<bigint | undefined>
) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'isCategoryAllowed',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined && category.value !== undefined
        ? [x.value, y.value, category.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => 
        x.value !== undefined && y.value !== undefined && category.value !== undefined
      )
    }
  });
}

/**
 * Get latest categorical value
 */
export function useCategoricalLatestValue(x: Ref<bigint | undefined>, y: Ref<bigint | undefined>) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getCategoricalLatestValue',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined 
        ? [x.value, y.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => x.value !== undefined && y.value !== undefined)
    }
  });
}

/**
 * Get latest numerical value
 */
export function useNumericalLatestValue(x: Ref<bigint | undefined>, y: Ref<bigint | undefined>) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getNumericalLatestValue',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined 
        ? [x.value, y.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => x.value !== undefined && y.value !== undefined)
    }
  });
}

/**
 * Get categorical value at specific index
 */
export function useCategoricalValueAt(
  x: Ref<bigint | undefined>, 
  y: Ref<bigint | undefined>,
  index: Ref<bigint | undefined>
) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getCategoricalValueAt',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined && index.value !== undefined
        ? [x.value, y.value, index.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => 
        x.value !== undefined && y.value !== undefined && index.value !== undefined
      )
    }
  });
}

/**
 * Get numerical value at specific index
 */
export function useNumericalValueAt(
  x: Ref<bigint | undefined>, 
  y: Ref<bigint | undefined>,
  index: Ref<bigint | undefined>
) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getNumericalValueAt',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined && index.value !== undefined
        ? [x.value, y.value, index.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => 
        x.value !== undefined && y.value !== undefined && index.value !== undefined
      )
    }
  });
}

/**
 * Get categorical value at timestamp
 */
export function useCategoricalValueAtTimestamp(
  x: Ref<bigint | undefined>, 
  y: Ref<bigint | undefined>,
  timestamp: Ref<number | undefined>
) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getCategoricalValueAtTimestamp',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined && timestamp.value !== undefined
        ? [x.value, y.value, timestamp.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => 
        x.value !== undefined && y.value !== undefined && timestamp.value !== undefined
      )
    }
  });
}

/**
 * Get numerical value at timestamp
 */
export function useNumericalValueAtTimestamp(
  x: Ref<bigint | undefined>, 
  y: Ref<bigint | undefined>,
  timestamp: Ref<number | undefined>
) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getNumericalValueAtTimestamp',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined && timestamp.value !== undefined
        ? [x.value, y.value, timestamp.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => 
        x.value !== undefined && y.value !== undefined && timestamp.value !== undefined
      )
    }
  });
}

/**
 * Get categorical history with pagination
 */
export function useCategoricalHistory(
  x: Ref<bigint | undefined>, 
  y: Ref<bigint | undefined>,
  offset: Ref<bigint | undefined>,
  limit: Ref<bigint | undefined>
) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getCategoricalHistory',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined && 
      offset.value !== undefined && limit.value !== undefined
        ? [x.value, y.value, offset.value, limit.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => 
        x.value !== undefined && y.value !== undefined && 
        offset.value !== undefined && limit.value !== undefined
      )
    }
  }) as ReturnType<typeof useReadContract<typeof ZARYA_CONTRACT_CONFIG['abi'], 'getCategoricalHistory', readonly [bigint, bigint, bigint, bigint]>>;
}

/**
 * Get numerical history with pagination
 */
export function useNumericalHistory(
  x: Ref<bigint | undefined>, 
  y: Ref<bigint | undefined>,
  offset: Ref<bigint | undefined>,
  limit: Ref<bigint | undefined>
) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getNumericalHistory',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined && 
      offset.value !== undefined && limit.value !== undefined
        ? [x.value, y.value, offset.value, limit.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => 
        x.value !== undefined && y.value !== undefined && 
        offset.value !== undefined && limit.value !== undefined
      )
    }
  }) as ReturnType<typeof useReadContract<typeof ZARYA_CONTRACT_CONFIG['abi'], 'getNumericalHistory', readonly [bigint, bigint, bigint, bigint]>>;
}

/**
 * Get categorical sample length
 */
export function useCategoricalSampleLength(x: Ref<bigint | undefined>, y: Ref<bigint | undefined>) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getCategoricalSampleLength',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined 
        ? [x.value, y.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => x.value !== undefined && y.value !== undefined)
    }
  });
}

/**
 * Get numerical sample length
 */
export function useNumericalSampleLength(x: Ref<bigint | undefined>, y: Ref<bigint | undefined>) {
  return useReadContract({
    ...ZARYA_CONTRACT_CONFIG,
    functionName: 'getNumericalSampleLength',
    args: computed(() => 
      x.value !== undefined && y.value !== undefined 
        ? [x.value, y.value] as const
        : undefined
    ),
    query: {
      enabled: computed(() => x.value !== undefined && y.value !== undefined)
    }
  });
}
