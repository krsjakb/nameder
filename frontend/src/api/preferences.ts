import apiClient from './client'
import type { PreferenceRequest, PreferenceSummary } from './types'

export async function setPreference(sessionId: string, payload: PreferenceRequest) {
  const response = await apiClient.post(`/sessions/${sessionId}/preferences`, payload)
  return response.data
}

export async function getPreferenceSummary(sessionId: string, participantId: string) {
  const response = await apiClient.get<PreferenceSummary>(`/sessions/${sessionId}/preferences/summary`, {
    params: { participantId },
  })
  return response.data
}
