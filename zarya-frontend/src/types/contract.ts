/**
 * Contract return types for Zarya smart contract
 */

export interface VoteResults {
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
}

export interface CategoricalCellInfo {
  organ: number;
  categories: bigint[];
  sampleLength: bigint;
}

export interface NumericalCellInfo {
  organ: number;
  decimals: number;
  sampleLength: bigint;
}

export interface CategoricalValueEntry {
  value: bigint;
  timestamp: number;
}

export interface NumericalValueEntry {
  value: bigint;
  timestamp: number;
}
