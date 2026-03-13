import apiClient from './client'
import type { PreferenceRequest, PreferenceSummary, MutualName } from './types'

export async function setPreference(sessionId: string, payload: PreferenceRequest) {
  const response = await apiClient.post(`/sessions/${sessionId}/preferences`, payload)
  return response.data
}

export async function removePreference(sessionId: string, participantId: string, nameId: string) {
  await apiClient.delete(`/sessions/${sessionId}/preferences/${nameId}`, {
    params: { participantId },
  })
}

export async function getPreferenceSummary(sessionId: string, participantId: string) {
  const response = await apiClient.get<PreferenceSummary>(`/sessions/${sessionId}/preferences/summary`, {
    params: { participantId },
  })
  return response.data
}

export async function getMyLikes(sessionId: string, participantId: string) {
  const response = await apiClient.get<MutualName[]>(`/sessions/${sessionId}/preferences/my-likes`, {
    params: { participantId },
  })
  return response.data
}
