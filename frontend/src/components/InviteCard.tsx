import { useMemo } from 'react'
import Card from './Card'
import Button from './Button'

interface InviteCardProps {
  sessionCode: string
  lastName: string
}

export function InviteCard({ sessionCode, lastName }: InviteCardProps) {
  const inviteLink = useMemo(() => {
    const base = window.location.origin
    return `${base}/?code=${sessionCode}`
  }, [sessionCode])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
    } catch {
      // ignore
    }
  }

  return (
    <Card className="invite">
      <h3>Meghívó</h3>
      <p>Oszd meg a pároddal ezt a kódot vagy linket, hogy együtt válasszatok nevet!</p>
      <div className="invite__code">{sessionCode}</div>
      <div className="invite__link">{inviteLink}</div>
      <Button variant="secondary" onClick={handleCopy}>
        Másolás a vágólapra
      </Button>
      <p className="invite__note">Vezetéknév: {lastName}</p>
    </Card>
  )
}

export default InviteCard
