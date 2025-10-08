import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Participant, SessionSummary, Gender } from '../api/types'

export interface SessionContext {
  session?: SessionSummary
  participant?: Participant
}

export interface SessionStoreState {
  context: SessionContext | null
  preferredGender: Gender | null
  setContext: (context: SessionContext | null) => void
  setPreferredGender: (gender: Gender | null) => void
}

export const useSessionStore = create<SessionStoreState>()(
  persist(
    (set) => ({
      context: null,
      preferredGender: null,
      setContext: (context) => set({ context }),
      setPreferredGender: (gender) => set({ preferredGender: gender }),
    }),
    {
      name: 'nameder-session',
    },
  ),
)
