export type ContinuousVote = {
  id: string
  type: 'continuous'
  cellId: string
  row: string
  column: string
  proposedValue: number
  unit?: string
  currentSample: number[]
  currentMean?: number
  confidenceInterval?: [number, number]
  proposer: string
  timestamp: Date
  organ: string
  status: 'active' | 'passed' | 'rejected'
  votesFor: number
  votesAgainst: number
  quorum: number
  participantsVoted: number
}

export type CategoricalVote = {
  id: string
  type: 'categorical'
  cellId: string
  row: string
  column: string
  proposedValue: string
  categories: string[]
  currentSample: string[]
  currentDistribution?: Record<string, number>
  proposer: string
  timestamp: Date
  organ: string
  status: 'active' | 'passed' | 'rejected'
  votesFor: number
  votesAgainst: number
  quorum: number
  participantsVoted: number
}

export type Vote = ContinuousVote | CategoricalVote
