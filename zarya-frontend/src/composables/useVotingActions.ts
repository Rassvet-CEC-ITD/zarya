import { useWriteContract, useWaitForTransactionReceipt } from '@wagmi/vue';
import { ZARYA_CONTRACT_CONFIG } from '../zarya';

/**
 * Hook for casting a vote
 */
export function useCastVote() {
  const writeContract = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: writeContract.data
  });

  const castVote = (
    votingId: bigint,
    support: boolean,
    organ: string // bytes32
  ) => {
    writeContract.mutate({
      ...ZARYA_CONTRACT_CONFIG,
      functionName: 'castVote',
      args: [votingId, support, organ as `0x${string}`]
    });
  };

  return {
    castVote,
    hash: writeContract.data,
    isPending: writeContract.isPending,
    isConfirming,
    isSuccess,
    error: writeContract.error
  };
}

/**
 * Hook for executing/finalizing a voting
 */
export function useExecuteVoting() {
  const writeContract = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: writeContract.data
  });

  const executeVoting = (
    votingId: bigint,
    minimumQuorum: bigint,
    minimumApprovalPercentage: bigint
  ) => {
    writeContract.mutate({
      ...ZARYA_CONTRACT_CONFIG,
      functionName: 'executeVoting',
      args: [votingId, minimumQuorum, minimumApprovalPercentage]
    });
  };

  return {
    executeVoting,
    hash: writeContract.data,
    isPending: writeContract.isPending,
    isConfirming,
    isSuccess,
    error: writeContract.error
  };
}

/**
 * Hook for creating membership voting
 */
export function useCreateMembershipVoting() {
  const writeContract = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: writeContract.data
  });

  const createVoting = (
    organ: string, // bytes32
    member: string, // address
    duration: bigint
  ) => {
    writeContract.mutate({
      ...ZARYA_CONTRACT_CONFIG,
      functionName: 'createMembershipVoting',
      args: [organ as `0x${string}`, member as `0x${string}`, duration]
    });
  };

  return {
    createVoting,
    hash: writeContract.data,
    isPending: writeContract.isPending,
    isConfirming,
    isSuccess,
    error: writeContract.error
  };
}

/**
 * Hook for creating membership revocation voting
 */
export function useCreateMembershipRevocationVoting() {
  const writeContract = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: writeContract.data
  });

  const createVoting = (
    organ: string,
    member: string,
    duration: bigint
  ) => {
    writeContract.mutate({
      ...ZARYA_CONTRACT_CONFIG,
      functionName: 'createMembershipRevocationVoting',
      args: [organ as `0x${string}`, member as `0x${string}`, duration]
    });
  };

  return {
    createVoting,
    hash: writeContract.data,
    isPending: writeContract.isPending,
    isConfirming,
    isSuccess,
    error: writeContract.error
  };
}

/**
 * Hook for creating category voting
 */
export function useCreateCategoryVoting() {
  const writeContract = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: writeContract.data
  });

  const createVoting = (
    organ: string,
    x: bigint,
    y: bigint,
    category: bigint,
    categoryName: string,
    duration: bigint
  ) => {
    writeContract.mutate({
      ...ZARYA_CONTRACT_CONFIG,
      functionName: 'createCategoryVoting',
      args: [organ as `0x${string}`, x, y, category, categoryName, duration]
    });
  };

  return {
    createVoting,
    hash: writeContract.data,
    isPending: writeContract.isPending,
    isConfirming,
    isSuccess,
    error: writeContract.error
  };
}

/**
 * Hook for creating decimals voting
 */
export function useCreateDecimalsVoting() {
  const writeContract = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: writeContract.data
  });

  const createVoting = (
    organ: string,
    x: bigint,
    y: bigint,
    decimals: number,
    duration: bigint
  ) => {
    writeContract.mutate({
      ...ZARYA_CONTRACT_CONFIG,
      functionName: 'createDecimalsVoting',
      args: [organ as `0x${string}`, x, y, decimals, duration]
    });
  };

  return {
    createVoting,
    hash: writeContract.data,
    isPending: writeContract.isPending,
    isConfirming,
    isSuccess,
    error: writeContract.error
  };
}

/**
 * Hook for creating theme voting
 */
export function useCreateThemeVoting() {
  const writeContract = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: writeContract.data
  });

  const createVoting = (
    isCategorical: boolean,
    x: bigint,
    theme: string,
    duration: bigint
  ) => {
    writeContract.mutate({
      ...ZARYA_CONTRACT_CONFIG,
      functionName: 'createThemeVoting',
      args: [isCategorical, x, theme, duration]
    });
  };

  return {
    createVoting,
    hash: writeContract.data,
    isPending: writeContract.isPending,
    isConfirming,
    isSuccess,
    error: writeContract.error
  };
}

/**
 * Hook for creating statement voting
 */
export function useCreateStatementVoting() {
  const writeContract = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: writeContract.data
  });

  const createVoting = (
    isCategorical: boolean,
    x: bigint,
    y: bigint,
    statement: string,
    duration: bigint
  ) => {
    writeContract.mutate({
      ...ZARYA_CONTRACT_CONFIG,
      functionName: 'createStatementVoting',
      args: [isCategorical, x, y, statement, duration]
    });
  };

  return {
    createVoting,
    hash: writeContract.data,
    isPending: writeContract.isPending,
    isConfirming,
    isSuccess,
    error: writeContract.error
  };
}

/**
 * Hook for creating categorical value voting
 */
export function useCreateCategoricalValueVoting() {
  const writeContract = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: writeContract.data
  });

  const createVoting = (
    organ: string,
    x: bigint,
    y: bigint,
    value: bigint,
    valueAuthor: string,
    duration: bigint
  ) => {
    writeContract.mutate({
      ...ZARYA_CONTRACT_CONFIG,
      functionName: 'createCategoricalValueVoting',
      args: [organ as `0x${string}`, x, y, value, valueAuthor as `0x${string}`, duration]
    });
  };

  return {
    createVoting,
    hash: writeContract.data,
    isPending: writeContract.isPending,
    isConfirming,
    isSuccess,
    error: writeContract.error
  };
}

/**
 * Hook for creating numerical value voting
 */
export function useCreateNumericalValueVoting() {
  const writeContract = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: writeContract.data
  });

  const createVoting = (
    organ: string,
    x: bigint,
    y: bigint,
    value: bigint,
    valueAuthor: string,
    duration: bigint
  ) => {
    writeContract.mutate({
      ...ZARYA_CONTRACT_CONFIG,
      functionName: 'createNumericalValueVoting',
      args: [organ as `0x${string}`, x, y, value, valueAuthor as `0x${string}`, duration]
    });
  };

  return {
    createVoting,
    hash: writeContract.data,
    isPending: writeContract.isPending,
    isConfirming,
    isSuccess,
    error: writeContract.error
  };
}

/**
 * Unified hook for creating any type of voting
 */
export function useCreateVoting() {
  const membership = useCreateMembershipVoting();
  const membershipRevocation = useCreateMembershipRevocationVoting();
  const category = useCreateCategoryVoting();
  const decimals = useCreateDecimalsVoting();
  const theme = useCreateThemeVoting();
  const statement = useCreateStatementVoting();
  const categoricalValue = useCreateCategoricalValueVoting();
  const numericalValue = useCreateNumericalValueVoting();

  return {
    membership,
    membershipRevocation,
    category,
    decimals,
    theme,
    statement,
    categoricalValue,
    numericalValue
  };
}

/**
 * Unified hook for all voting actions
 */
export function useVotingActions() {
  const castVote = useCastVote();
  const executeVoting = useExecuteVoting();
  const create = useCreateVoting();

  return {
    castVote,
    executeVoting,
    create
  };
}
