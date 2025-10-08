import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Card from '../components/Card'
import TextField from '../components/TextField'
import Button from '../components/Button'
import { createSession, getSessionByCode, joinSession } from '../api/sessions'
import { useSessionStore } from '../store/sessionStore'
import type { Participant, SessionSummary } from '../api/types'

export function HomePage() {
  const navigate = useNavigate()
  const [searchParams, setParams] = useSearchParams()
  const inviteCode = searchParams.get('code') ?? ''

  const [createForm, setCreateForm] = useState({ lastName: '', displayName: '', email: '' })
  const [joinForm, setJoinForm] = useState({ code: inviteCode, displayName: '', email: '' })
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null)
  const setContext = useSessionStore((state) => state.setContext)

  const sessionLookupQuery = useQuery<{ session: SessionSummary; participants: Participant[] }>({
    queryKey: ['sessionByCode', joinForm.code],
    queryFn: () => getSessionByCode(joinForm.code),
    enabled: joinForm.code.length >= 6,
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: () => createSession({
      lastName: createForm.lastName,
      displayName: createForm.displayName,
      email: createForm.email || undefined,
    }),
    onSuccess: (data) => {
      setContext({ session: data.session, participant: data.participant })
      navigate(`/session/${data.session.id}?participantId=${data.participant.id}`)
    },
  })

  const joinMutation = useMutation({
    mutationFn: () => joinSession(joinForm.code, {
      displayName: joinForm.displayName,
      email: joinForm.email || undefined,
    }),
    onSuccess: (data) => {
      setContext({ session: data.session, participant: data.participant })
      navigate(`/session/${data.session.id}?participantId=${data.participant.id}`)
    },
  })

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createMutation.mutate()
  }

  const handleJoinSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (selectedParticipantId && sessionLookupQuery.data) {
      const { session, participants } = sessionLookupQuery.data
      const participant = participants.find(
        (participantItem: Participant) => participantItem.id === selectedParticipantId,
      )
      if (participant) {
        setContext({ session, participant })
        navigate(`/session/${session.id}?participantId=${participant.id}`)
        return
      }
    }
    joinMutation.mutate()
  }

  const handleSelectExistingParticipant = (participant: Participant) => {
    if (!sessionLookupQuery.data) return
    setSelectedParticipantId(participant.id)
    setContext({ session: sessionLookupQuery.data.session, participant })
    navigate(`/session/${sessionLookupQuery.data.session.id}?participantId=${participant.id}`)
  }

  const availableParticipants: Participant[] = useMemo(
    () => sessionLookupQuery.data?.participants ?? [],
    [sessionLookupQuery.data?.participants],
  )

  return (
    <div className="home">
      <Card className="home__hero">
        <h1>Nameder</h1>
        <p>Magyar babanevek közös válogatása. Hozzatok létre egy szobát, hívd meg a párod és döntsetek együtt!</p>
      </Card>
      <div className="home__forms">
        <form className="home__form" onSubmit={handleCreateSubmit}>
          <h2>Új szoba létrehozása</h2>
          <TextField
            label="Vezetéknév"
            name="lastName"
            value={createForm.lastName}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, lastName: event.target.value }))}
            required
          />
          <TextField
            label="Te keresztneved"
            name="displayName"
            value={createForm.displayName}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, displayName: event.target.value }))}
            required
          />
          <TextField
            label="E-mail (opcionális)"
            name="email"
            type="email"
            value={createForm.email}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          <Button type="submit" disabled={createMutation.isPending}>
            Szoba létrehozása
          </Button>
          {createMutation.error ? <p className="form-error">Hiba történt a létrehozás során.</p> : null}
        </form>
        <form className="home__form" onSubmit={handleJoinSubmit}>
          <h2>Csatlakozás meglévő szobához</h2>
          <TextField
            label="Meghívó kód"
            name="code"
            value={joinForm.code}
            onChange={(event) => {
              const value = event.target.value.toUpperCase()
              setJoinForm((prev) => ({ ...prev, code: value }))
              setSelectedParticipantId(null)
              setParams((params) => {
                const next = new URLSearchParams(params)
                if (value) {
                  next.set('code', value)
                } else {
                  next.delete('code')
                }
                return next
              })
            }}
            required
          />
          <TextField
            label="Te keresztneved"
            name="joinDisplayName"
            value={joinForm.displayName}
            onChange={(event) => setJoinForm((prev) => ({ ...prev, displayName: event.target.value }))}
            required={!selectedParticipantId}
          />
          <TextField
            label="E-mail (opcionális)"
            name="joinEmail"
            type="email"
            value={joinForm.email}
            onChange={(event) => setJoinForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          {availableParticipants.length ? (
            <div className="home__participant-select">
              <p className="home__participant-select-label">Melyik felhasználó vagy te?</p>
              <div className="home__participant-options">
                {availableParticipants.map((participant) => (
                  <button
                    key={participant.id}
                    type="button"
                    className={`home__participant-button${selectedParticipantId === participant.id ? ' home__participant-button--active' : ''}`}
                    onClick={() => handleSelectExistingParticipant(participant)}
                  >
                    <span className="home__participant-name">{participant.displayName}</span>
                    {participant.isCreator ? <span className="home__participant-badge">Szervező</span> : null}
                  </button>
                ))}
              </div>
              <p className="home__participant-hint">Ha nem szerepelsz a listán, add meg a neved és csatlakozz új résztvevőként.</p>
            </div>
          ) : null}
          <Button type="submit" disabled={joinMutation.isPending}>
            Csatlakozás
          </Button>
          {joinMutation.error ? <p className="form-error">Hiba történt a csatlakozás során.</p> : null}
        </form>
      </div>
    </div>
  )
}

export default HomePage
