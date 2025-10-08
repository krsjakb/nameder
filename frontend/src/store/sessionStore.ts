import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Participant, SessionSummary } from '../api/types'

interface SessionContext {
  session?: SessionSummary
  participant?: Participant
}

interface SessionStoreState {
  context?: SessionContext
  setContext: (context: SessionContext) => void
  clear: () => void
}

export const useSessionStore = create<SessionStoreState>()(
  persist(
    (set) => ({
      context: undefined,
      setContext: (context) => set({ context }),
      clear: () => set({ context: undefined }),
    }),
    {
      name: 'nameder-session',
    },
  ),
)
