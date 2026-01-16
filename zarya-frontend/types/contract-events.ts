/**
 * Contract event argument types for type-safe event handling
 * These types correspond to the emitted events from the Zarya smart contract
 * Note: indexed parameters are automatically decoded by wagmi/viem
 */

// Base VotingCreated event (emitted for all voting types)
// event VotingCreated(uint256 indexed votingId, address indexed author, uint256 startTime, uint256 endTime, SuggestionType suggestionType)
export interface VotingCreatedEventArgs {
  votingId: bigint
  author: string
  startTime: bigint
  endTime: bigint
  suggestionType: number // SuggestionType enum (uint8)
}

// Type-specific voting creation events
// event MembershipVotingCreated(uint256 indexed votingId, PartyOrgan organ, address member)
export interface MembershipVotingCreatedEventArgs {
  votingId: bigint
  organ: string // PartyOrgan (bytes32)
  member: string
}

// event MembershipRevocationVotingCreated(uint256 indexed votingId, PartyOrgan organ, address member)
export interface MembershipRevocationVotingCreatedEventArgs {
  votingId: bigint
  organ: string // PartyOrgan (bytes32)
  member: string
}

// event CategoryVotingCreated(uint256 indexed votingId, PartyOrgan organ, uint256 x, uint256 y, uint64 category, string categoryName)
export interface CategoryVotingCreatedEventArgs {
  votingId: bigint
  organ: string // PartyOrgan (bytes32)
  x: bigint
  y: bigint
  category: bigint // uint64
  categoryName: string
}

// event DecimalsVotingCreated(uint256 indexed votingId, PartyOrgan organ, uint256 x, uint256 y, uint8 decimals)
export interface DecimalsVotingCreatedEventArgs {
  votingId: bigint
  organ: string // PartyOrgan (bytes32)
  x: bigint
  y: bigint
  decimals: number // uint8
}

// event ThemeVotingCreated(uint256 indexed votingId, bool isCategorical, uint256 x, string theme)
export interface ThemeVotingCreatedEventArgs {
  votingId: bigint
  isCategorical: boolean
  x: bigint
  theme: string
}

// event StatementVotingCreated(uint256 indexed votingId, bool isCategorical, uint256 x, uint256 y, string statement)
export interface StatementVotingCreatedEventArgs {
  votingId: bigint
  isCategorical: boolean
  x: bigint
  y: bigint
  statement: string
}

// event CategoricalValueVotingCreated(uint256 indexed votingId, PartyOrgan organ, uint256 x, uint256 y, uint64 value, address author)
export interface CategoricalValueVotingCreatedEventArgs {
  votingId: bigint
  organ: string // PartyOrgan (bytes32)
  x: bigint
  y: bigint
  value: bigint // uint64
  author: string
}

// event NumericalValueVotingCreated(uint256 indexed votingId, PartyOrgan organ, uint256 x, uint256 y, uint64 value, address author)
export interface NumericalValueVotingCreatedEventArgs {
  votingId: bigint
  organ: string // PartyOrgan (bytes32)
  x: bigint
  y: bigint
  value: bigint // uint64
  author: string
}

// Voting action events
// event VoteCasted(uint256 indexed votingId, address indexed partyMember, bool support, uint256 forVotes, uint256 againstVotes)
export interface VoteCastedEventArgs {
  votingId: bigint
  partyMember: string
  support: boolean
  forVotes: bigint // uint256
  againstVotes: bigint // uint256
}

// event VotingFinalized(uint256 indexed votingId, bool success, uint256 forVotes, uint256 againstVotes)
export interface VotingFinalizedEventArgs {
  votingId: bigint
  success: boolean
  forVotes: bigint // uint256
  againstVotes: bigint // uint256
}
