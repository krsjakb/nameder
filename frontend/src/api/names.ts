import axios from 'axios'
import apiClient from './client'
import type { Gender, MutualName, NextNameResponse, Recommendation } from './types'

export async function getNextName(sessionId: string, participantId: string, preferredGender?: Gender) {
  try {
    const response = await apiClient.get<NextNameResponse>(`/sessions/${sessionId}/names/next`, {
      params: {
        participantId,
        preferredGender,
      },
    })
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw error
  }
}

export async function getRecommendations(sessionId: string, limit = 8, gender?: Gender) {
  const response = await apiClient.get<Recommendation[]>(`/sessions/${sessionId}/names/recommendations`, {
    params: {
      limit,
      gender,
    },
  })
  return response.data
}

export async function getMutualNames(sessionId: string) {
  const response = await apiClient.get<MutualName[]>(`/sessions/${sessionId}/preferences/mutual`)
  return response.data
}
