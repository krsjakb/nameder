import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getSessionDetails,
  updateSessionPhase,
} from '../api/sessions'
import { getNextName, getRecommendations, getMutualNames } from '../api/names'
import { removePreference, setPreference } from '../api/preferences'
import { getParticipantRatings, getRatings, upsertRating } from '../api/ratings'
import { useSessionStore } from '../store/sessionStore'
import { useKeyboardSwipe } from '../hooks/useKeyboardSwipe'
import { useToast } from '../hooks/useToast'
import { useTheme } from '../hooks/useTheme'
import SessionHeader from '../components/SessionHeader'
import SwipeCard from '../components/SwipeCard'
import MutualList from '../components/MutualList'
import TopList from '../components/TopList'
import InviteCard from '../components/InviteCard'
import TabNavigation from '../components/TabNavigation'
import Button from '../components/Button'
import Card from '../components/Card'
import ToastNotification from '../components/ToastNotification'
import ThemeToggle from '../components/ThemeToggle'
import Confetti from '../components/Confetti'
import type { Gender, NextNameResponse } from '../api/types'

const TABS = [
  { id: 'swipe', label: 'Szavazás' },
  { id: 'mutual', label: 'Közös kedvencek' },
  { id: 'top', label: 'Toplista' },
]

type HistoryEntry = {
  snapshot: NextNameResponse
  preference: 'LIKE' | 'DISLIKE'
  genderKey: string
}

export function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const storedContext = useSessionStore((state) => state.context)
  const setContext = useSessionStore((state) => state.setContext)
  const preferredGender = useSessionStore((state) => state.preferredGender)
  const setPreferredGender = useSessionStore((state) => state.setPreferredGender)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const participantIdFromUrl = searchParams.get('participantId') ?? undefined
  const participantId = participantIdFromUrl ?? storedContext?.participant?.id

  const [activeTab, setActiveTab] = useState('swipe')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [showConfetti, setShowConfetti] = useState(false)

  const { toasts, removeToast } = useToast()
  const { theme, toggleTheme } = useTheme()

  const genderFilterKey = preferredGender ?? 'ALL'
  const recommendationQueryKey = ['recommendations', sessionId, genderFilterKey] as const

  const sessionQuery = useQuery({
    queryKey: ['session', sessionId, participantId],
    queryFn: () => getSessionDetails(sessionId!, participantId),
    enabled: Boolean(sessionId),
  })

  useEffect(() => {
    if (sessionQuery.data?.session.phase === 'FINAL') {
      setActiveTab((current) => (current === 'swipe' ? 'mutual' : current))
    }
  }, [sessionQuery.data?.session.phase])

  useEffect(() => {
    if (sessionQuery.data) {
      setContext({ session: sessionQuery.data.session, participant: sessionQuery.data.participant ?? storedContext?.participant })
      if (!participantIdFromUrl && sessionQuery.data.participant) {
        setSearchParams((params) => {
          const next = new URLSearchParams(params)
          next.set('participantId', sessionQuery.data.participant!.id)
          return next
        })
      }
    }
  }, [participantIdFromUrl, sessionQuery.data, setContext, setSearchParams, storedContext?.participant])

  useEffect(() => {
    if (!participantId && sessionQuery.isFetched && !sessionQuery.data?.participant) {
      navigate('/', { replace: true })
    }
  }, [participantId, sessionQuery.data, sessionQuery.isFetched, navigate])

  useEffect(() => {
    setHistory([])
  }, [sessionId, participantId, genderFilterKey])

  const nextNameQuery = useQuery<NextNameResponse | null>({
    queryKey: ['nextName', sessionId, participantId, genderFilterKey],
    queryFn: () => getNextName(sessionId!, participantId!, preferredGender ?? undefined),
    enabled: Boolean(sessionId && participantId),
    retry: false,
  })

  const recommendationsQuery = useQuery({
    queryKey: recommendationQueryKey,
    queryFn: () => getRecommendations(sessionId!, 6, preferredGender ?? undefined),
    enabled: Boolean(sessionId),
  })

  const mutualQuery = useQuery({
    queryKey: ['mutual', sessionId],
    queryFn: () => getMutualNames(sessionId!),
    enabled: Boolean(sessionId),
  })

  const ratingsQuery = useQuery({
    queryKey: ['ratings', sessionId],
    queryFn: () => getRatings(sessionId!),
    enabled: Boolean(sessionId),
  })

  const participantRatingsQuery = useQuery({
    queryKey: ['participantRatings', sessionId, participantId],
    queryFn: () => getParticipantRatings(sessionId!, participantId!),
    enabled: Boolean(sessionId && participantId),
  })

  const invalidateSessionQueries = (options?: { includeNextName?: boolean }) => {
    if (!sessionId || !participantId) {
      return Promise.resolve()
    }
    const tasks = [
      queryClient.invalidateQueries({ queryKey: ['session', sessionId, participantId] }),
      queryClient.invalidateQueries({ queryKey: ['mutual', sessionId] }),
      queryClient.invalidateQueries({ queryKey: ['ratings', sessionId] }),
      queryClient.invalidateQueries({ queryKey: ['participantRatings', sessionId, participantId] }),
      queryClient.invalidateQueries({ queryKey: recommendationQueryKey }),
    ]
    if (options?.includeNextName !== false) {
      tasks.push(queryClient.invalidateQueries({ queryKey: ['nextName', sessionId, participantId] }))
    }
    return Promise.all(tasks).catch((error) => {
      console.error('Failed to refresh session data', error)
    })
  }

  const preferenceMutation = useMutation({
    mutationFn: (value: 'LIKE' | 'DISLIKE') =>
      setPreference(sessionId!, {
        nameId: nextNameQuery.data!.name.id,
        value,
        participantId: participantId!,
      }),
    onSuccess: async (_data, value) => {
      await invalidateSessionQueries()
      // success(value === 'LIKE' ? 'Név hozzáadva kedvencekhez' : 'Név elutasítva')

      // Check if this created a new mutual match (both participants liked it)
      if (value === 'LIKE') {
        const mutualNames = await queryClient.fetchQuery({
          queryKey: ['mutual', sessionId],
          queryFn: () => getMutualNames(sessionId!),
        })
        // Check if the current name is now in mutual list
        const isNewMutual = mutualNames?.some((m) => m.id === nextNameQuery.data!.name.id)
        if (isNewMutual) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
        }
      }
    },
    onError: () => {
      // error('Hiba történt a szavazás mentése közben')
    },
  })

  const undoMutation = useMutation({
    mutationFn: async (entry: HistoryEntry) => {
      await removePreference(sessionId!, participantId!, entry.snapshot.name.id)
      return entry
    },
    onMutate: async (entry) => {
      await queryClient.cancelQueries({
        queryKey: ['nextName', sessionId, participantId, entry.genderKey],
      })
      setHistory((prev: HistoryEntry[]) => prev.filter((candidate) => candidate !== entry))
      return { entry }
    },
    onError: (_error, _entry, context?: { entry: HistoryEntry }) => {
      if (context?.entry) {
        setHistory((prev: HistoryEntry[]) => [context.entry, ...prev])
      }
      // error('Hiba történt a visszavonás közben')
    },
    onSuccess: (entry) => {
      queryClient.setQueryData(
        ['nextName', sessionId, participantId, entry.genderKey],
        entry.snapshot,
      )
      void invalidateSessionQueries({ includeNextName: false })
      // success('Visszavonva')
    },
  })

  const ratingMutation = useMutation({
    mutationFn: (payload: { nameId: string; score: number }) =>
      upsertRating(sessionId!, {
        nameId: payload.nameId,
        score: payload.score,
        participantId: participantId!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['participantRatings', sessionId, participantId] })
      // success('Értékelés mentve')
    },
    onError: () => {
      // error('Hiba történt az értékelés mentése közben')
    },
  })

  const phaseMutation = useMutation({
    mutationFn: (phase: 'PRIMARY' | 'FINAL') => updateSessionPhase(sessionId!, phase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId, participantId] })
    },
  })

  const pushHistory = (value: 'LIKE' | 'DISLIKE') => {
    if (!nextNameQuery.data) return null
    const entry: HistoryEntry = {
      snapshot: nextNameQuery.data,
      preference: value,
      genderKey: genderFilterKey,
    }
    setHistory((prev) => [entry, ...prev])
    return entry
  }

  const handleLike = () => {
    if (!nextNameQuery.data || preferenceMutation.isPending) return
    const entry = pushHistory('LIKE')
    preferenceMutation.mutate('LIKE', {
      onError: () => {
        if (entry) {
          setHistory((prev) => prev.filter((candidate) => candidate !== entry))
        }
      },
    })
  }

  const handleDislike = () => {
    if (!nextNameQuery.data || preferenceMutation.isPending) return
    const entry = pushHistory('DISLIKE')
    preferenceMutation.mutate('DISLIKE', {
      onError: () => {
        if (entry) {
          setHistory((prev) => prev.filter((candidate) => candidate !== entry))
        }
      },
    })
  }

  const handleUndo = () => {
    if (!history.length || undoMutation.isPending) return
    undoMutation.mutate(history[0])
  }

  useKeyboardSwipe(handleLike, handleDislike, activeTab === 'swipe')

  const currentName = nextNameQuery.data
  const recommendations = recommendationsQuery.data ?? []
  const mutualNames = mutualQuery.data ?? []
  const ratings = ratingsQuery.data ?? []
  const participantRatings = participantRatingsQuery.data ?? []

  const canAdvanceToFinal = useMemo(() => {
    if (!sessionQuery.data) return false
    return sessionQuery.data.session.phase === 'PRIMARY' && sessionQuery.data.stats.mutualCount > 0
  }, [sessionQuery.data])

  const genderTabs: { id: string; label: string; value: Gender | null }[] = [
    { id: 'ALL', label: 'Mindegy', value: null },
    { id: 'FEMALE', label: 'Lány', value: 'FEMALE' },
    { id: 'MALE', label: 'Fiú', value: 'MALE' },
  ]

  const handleGenderSelect = (id: string) => {
    const selected = genderTabs.find((tab) => tab.id === id)
    setPreferredGender(selected?.value ?? null)
  }

  return (
    <div className="session">
      <ToastNotification toasts={toasts} onRemove={removeToast} />
      <Confetti active={showConfetti} />

      {sessionQuery.data && (
        <SessionHeader
          session={sessionQuery.data.session}
          stats={sessionQuery.data.stats}
          participants={sessionQuery.data.participants}
        />
      )}

      <div className="session__top">
        <div className="session__top-left">
          {sessionQuery.data ? (
            <InviteCard sessionCode={sessionQuery.data.session.code} lastName={sessionQuery.data.session.lastName} />
          ) : null}
          <Card>
            <div className="session__filters">
              <span className="session__filters-label">Preferált nem:</span>
              <TabNavigation
                tabs={genderTabs.map(({ id, label }) => ({ id, label }))}
                activeId={genderFilterKey}
                onChange={handleGenderSelect}
              />
            </div>
          </Card>
        </div>
        <div className="session__top-right">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          {canAdvanceToFinal ? (
            <Button
              variant="secondary"
              onClick={() => phaseMutation.mutate('FINAL')}
              disabled={phaseMutation.isPending}
            >
              Lépjünk a döntő szakaszba
            </Button>
          ) : null}
        </div>
      </div>

      <TabNavigation
        tabs={TABS.map((tab) => ({
          ...tab,
          badge:
            tab.id === 'mutual'
              ? mutualNames.length
              : tab.id === 'top'
                ? ratings.length
                : undefined,
        }))}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'swipe' && (
        <div className="session__content">
          {currentName ? (
            <SwipeCard
              displayName={currentName.name.value}
              lastName={sessionQuery.data?.session.lastName ?? ''}
              score={currentName.score}
              remaining={currentName.remaining}
              reviewed={currentName.reviewed}
              onLike={handleLike}
              onDislike={handleDislike}
              onUndo={history.length ? handleUndo : undefined}
              undoDisabled={undoMutation.isPending}
              disabled={preferenceMutation.isPending || undoMutation.isPending}
              recommendations={recommendations}
            />
          ) : currentName === null ? (
            <div className="session__empty">
              <p>Minden a szűrésnek megfelelő nevet értékeltél. Próbálj másik nemet választani, vagy nézd meg a közös kedvenceket!</p>
            </div>
          ) : nextNameQuery.isError ? (
            <div className="session__empty">
              <p>Úgy tűnik, minden nevet átnéztetek. Lépjetek át a közös kedvencekhez vagy a toplistához!</p>
            </div>
          ) : (
            <div className="session__empty">
              <p>Betöltés...</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'mutual' && (
        <MutualList
          names={mutualNames}
          ratings={ratings}
          participantRatings={participantRatings}
          onRate={(nameId, score) => ratingMutation.mutate({ nameId, score })}
          canRate={Boolean(participantId)}
        />
      )}

      {activeTab === 'top' && <TopList ratings={ratings} />}
    </div>
  )
}

export default SessionPage
