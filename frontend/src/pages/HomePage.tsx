import { FormEvent, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Card from '../components/Card'
import TextField from '../components/TextField'
import Button from '../components/Button'
import { createSession, joinSession } from '../api/sessions'
import { useSessionStore } from '../store/sessionStore'

export function HomePage() {
  const navigate = useNavigate()
  const [searchParams, setParams] = useSearchParams()
  const inviteCode = searchParams.get('code') ?? ''

  const [createForm, setCreateForm] = useState({ lastName: '', displayName: '', email: '' })
  const [joinForm, setJoinForm] = useState({ code: inviteCode, displayName: '', email: '' })
  const setContext = useSessionStore((state) => state.setContext)

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
    joinMutation.mutate()
  }

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
            required
          />
          <TextField
            label="E-mail (opcionális)"
            name="joinEmail"
            type="email"
            value={joinForm.email}
            onChange={(event) => setJoinForm((prev) => ({ ...prev, email: event.target.value }))}
          />
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
