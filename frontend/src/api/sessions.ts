import apiClient from './client'
import type {
  CreateSessionRequest,
  JoinSessionRequest,
  SessionDetailsResponse,
  SessionSummary,
  Participant,
  SessionPhase,
} from './types'

export async function createSession(payload: CreateSessionRequest) {
  const response = await apiClient.post<{
    session: SessionSummary
    participant: Participant
  }>('/sessions', payload)
  return response.data
}

export async function joinSession(code: string, payload: JoinSessionRequest) {
  const response = await apiClient.post<{
    session: SessionSummary
    participant: Participant
  }>(`/sessions/${code}/join`, payload)
  return response.data
}

export async function getSessionDetails(sessionId: string, participantId?: string) {
  const response = await apiClient.get<SessionDetailsResponse>(`/sessions/${sessionId}`, {
    params: participantId ? { participantId } : undefined,
  })
  return response.data
}

export async function updateSessionPhase(sessionId: string, phase: SessionPhase) {
  const response = await apiClient.patch<{ id: string; phase: SessionPhase; completedPrimary: boolean }>(
    `/sessions/${sessionId}/phase`,
    { phase },
  )
  return response.data
}
