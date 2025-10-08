import apiClient from './client'
import type { ParticipantRating, RatingRequest, RatingSummary } from './types'

export async function upsertRating(sessionId: string, payload: RatingRequest) {
  const response = await apiClient.post(`/sessions/${sessionId}/ratings`, payload)
  return response.data
}

export async function getRatings(sessionId: string) {
  const response = await apiClient.get<RatingSummary[]>(`/sessions/${sessionId}/ratings`)
  return response.data
}

export async function getParticipantRatings(sessionId: string, participantId: string) {
  const response = await apiClient.get<ParticipantRating[]>(`/sessions/${sessionId}/ratings/participant`, {
    params: { participantId },
  })
  return response.data
}
