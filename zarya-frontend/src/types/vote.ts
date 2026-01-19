// ============ Contract Enums ============

export enum SuggestionType {
  Membership = 0,
  MembershipRevocation = 1,
  Category = 2,
  Decimals = 3,
  Theme = 4,
  Statement = 5,
  CategoricalValue = 6,
  NumericalValue = 7
}

export enum PartyOrganType {
  LocalSoviet = 0,
  LocalGeneralAssembly = 1,
  RegionalSoviet = 2,
  RegionalConference = 3,
  RegionalGeneralAssembly = 4,
  Chairperson = 5,
  CentralSoviet = 6,
  Congress = 7
}

// ============ Base Voting Types ============

interface BaseVoting {
  votingId: bigint
  author: string
  startTime: bigint
  endTime: bigint
  suggestionType: SuggestionType
  forVotes: bigint
  againstVotes: bigint
  finalized: boolean
  success?: boolean
}

// ============ Type-Specific Voting Data ============

export interface MembershipVoting extends BaseVoting {
  suggestionType: SuggestionType.Membership
  organ: `0x${string}` // bytes32 encoded
  member: string // address
}

export interface MembershipRevocationVoting extends BaseVoting {
  suggestionType: SuggestionType.MembershipRevocation
  organ: `0x${string}` // bytes32 encoded
  member: string // address
}

export interface CategoryVoting extends BaseVoting {
  suggestionType: SuggestionType.Category
  organ: `0x${string}` // bytes32 encoded
  x: bigint
  y: bigint
  category: bigint
  categoryName: string
}

export interface DecimalsVoting extends BaseVoting {
  suggestionType: SuggestionType.Decimals
  organ: `0x${string}` // bytes32 encoded
  x: bigint
  y: bigint
  decimals: number
}

export interface ThemeVoting extends BaseVoting {
  suggestionType: SuggestionType.Theme
  isCategorical: boolean
  x: bigint
  theme: string
}

export interface StatementVoting extends BaseVoting {
  suggestionType: SuggestionType.Statement
  isCategorical: boolean
  x: bigint
  y: bigint
  statement: string
}

export interface CategoricalValueVoting extends BaseVoting {
  suggestionType: SuggestionType.CategoricalValue
  organ: `0x${string}` // bytes32 encoded
  x: bigint
  y: bigint
  value: bigint
  valueAuthor: string // address
}

export interface NumericalValueVoting extends BaseVoting {
  suggestionType: SuggestionType.NumericalValue
  organ: `0x${string}` // bytes32 encoded
  x: bigint
  y: bigint
  value: bigint
  valueAuthor: string // address
}

// ============ Union Type ============

export type Voting =
  | MembershipVoting
  | MembershipRevocationVoting
  | CategoryVoting
  | DecimalsVoting
  | ThemeVoting
  | StatementVoting
  | CategoricalValueVoting
  | NumericalValueVoting

// ============ Event Types ============

export interface VotingCreatedEvent {
  votingId: bigint
  author: string
  startTime: bigint
  endTime: bigint
  suggestionType: number
}

export interface VoteCastedEvent {
  votingId: bigint
  partyMember: string
  support: boolean
  forVotes: bigint
  againstVotes: bigint
}

export interface VotingFinalizedEvent {
  votingId: bigint
  success: boolean
  forVotes: bigint
  againstVotes: bigint
}

// ============ Display Helper Types ============

export interface VotingStatus {
  isActive: boolean
  isFinalized: boolean
  timeRemaining?: bigint
  statusLabel: 'active' | 'passed' | 'rejected' | 'pending'
}

export interface OrganInfo {
  encoded: string // bytes32
  type: PartyOrganType
  region: number
  number: number
  displayName: string
}
