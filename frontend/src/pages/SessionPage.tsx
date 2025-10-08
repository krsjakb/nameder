import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getSessionDetails,
  updateSessionPhase,
} from '../api/sessions'
import { getNextName, getRecommendations, getMutualNames } from '../api/names'
import { setPreference } from '../api/preferences'
import { getParticipantRatings, getRatings, upsertRating } from '../api/ratings'
import { useSessionStore } from '../store/sessionStore'
import { useKeyboardSwipe } from '../hooks/useKeyboardSwipe'
import SessionHeader from '../components/SessionHeader'
import SwipeCard from '../components/SwipeCard'
import MutualList from '../components/MutualList'
import TopList from '../components/TopList'
import InviteCard from '../components/InviteCard'
import TabNavigation from '../components/TabNavigation'
import Button from '../components/Button'

const TABS = [
  { id: 'swipe', label: 'Szavazás' },
  { id: 'mutual', label: 'Közös kedvencek' },
  { id: 'top', label: 'Toplista' },
]

export function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const storedContext = useSessionStore((state) => state.context)
  const setContext = useSessionStore((state) => state.setContext)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const participantIdFromUrl = searchParams.get('participantId') ?? undefined
  const participantId = participantIdFromUrl ?? storedContext?.participant?.id

  const [activeTab, setActiveTab] = useState('swipe')

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

  const nextNameQuery = useQuery({
    queryKey: ['nextName', sessionId, participantId],
    queryFn: () => getNextName(sessionId!, participantId!),
    enabled: Boolean(sessionId && participantId),
    retry: false,
  })

  const recommendationsQuery = useQuery({
    queryKey: ['recommendations', sessionId],
    queryFn: () => getRecommendations(sessionId!, 6),
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

  const preferenceMutation = useMutation({
    mutationFn: (value: 'LIKE' | 'DISLIKE') =>
      setPreference(sessionId!, {
        nameId: nextNameQuery.data!.name.id,
        value,
        participantId: participantId!,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['nextName', sessionId, participantId] }),
        queryClient.invalidateQueries({ queryKey: ['session', sessionId, participantId] }),
        queryClient.invalidateQueries({ queryKey: ['mutual', sessionId] }),
        queryClient.invalidateQueries({ queryKey: ['ratings', sessionId] }),
        queryClient.invalidateQueries({ queryKey: ['participantRatings', sessionId, participantId] }),
      ])
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
    },
  })

  const phaseMutation = useMutation({
    mutationFn: (phase: 'PRIMARY' | 'FINAL') => updateSessionPhase(sessionId!, phase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId, participantId] })
    },
  })

  const handleLike = () => {
    if (!nextNameQuery.data || preferenceMutation.isPending) return
    preferenceMutation.mutate('LIKE')
  }

  const handleDislike = () => {
    if (!nextNameQuery.data || preferenceMutation.isPending) return
    preferenceMutation.mutate('DISLIKE')
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

  return (
    <div className="session">
      {sessionQuery.data && (
        <SessionHeader
          session={sessionQuery.data.session}
          stats={sessionQuery.data.stats}
          participants={sessionQuery.data.participants}
        />
      )}

      <div className="session__top">
        {sessionQuery.data ? (
          <InviteCard sessionCode={sessionQuery.data.session.code} lastName={sessionQuery.data.session.lastName} />
        ) : null}
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
              disabled={preferenceMutation.isPending}
              recommendations={recommendations}
            />
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
