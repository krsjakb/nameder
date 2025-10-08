export type Gender = 'MALE' | 'FEMALE' | 'UNISEX'

export type SessionPhase = 'PRIMARY' | 'FINAL'

export interface Participant {
  id: string
  displayName: string
  inviteCode: string
  isCreator: boolean
}

export interface SessionSummary {
  id: string
  code: string
  lastName: string
  phase: SessionPhase
  createdAt?: string
}

export interface SessionStats {
  totalParticipants: number
  totalLikes: number
  totalDislikes: number
  mutualCount: number
  ratedMutualCount: number
  participantRatings: number
}

export interface SessionDetailsResponse {
  session: SessionSummary
  participants: Participant[]
  stats: SessionStats
  participant: Participant | null
}

export interface NextNameResponse {
  name: {
    id: string
    value: string
    gender: Gender
    syllableCount: number
  }
  score: number
  remaining: number
  reviewed: number
}

export interface Recommendation {
  id: string
  value: string
  gender: Gender
  score: number
}

export interface MutualName {
  id: string
  value: string
  gender: Gender
}

export interface PreferenceSummary {
  likes: number
  dislikes: number
}

export interface RatingSummary {
  nameId: string
  name: {
    id: string
    value: string
    gender: Gender
  }
  average: number
  votes: number
}

export interface ParticipantRating {
  nameId: string
  score: number
}

export interface CreateSessionRequest {
  lastName: string
  displayName: string
  email?: string
}

export interface JoinSessionRequest {
  displayName: string
  email?: string
}

export interface PreferenceRequest {
  nameId: string
  value: 'LIKE' | 'DISLIKE'
  participantId: string
}

export interface RatingRequest {
  nameId: string
  participantId: string
  score: number
}
