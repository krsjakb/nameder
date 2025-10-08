import type { Participant, SessionSummary, SessionStats } from '../api/types'
import Card from './Card'
import StatBadge from './StatBadge'

interface SessionHeaderProps {
  session: SessionSummary
  stats: SessionStats
  participants: Participant[]
}

export function SessionHeader({ session, stats, participants }: SessionHeaderProps) {
  return (
    <Card className="header">
      <div>
        <h1 className="header__title">{session.lastName} babanév projekt</h1>
        <p className="header__subtitle">Szoba kód: {session.code} • Fázis: {session.phase === 'PRIMARY' ? 'Első kör' : 'Döntő'}</p>
        <p className="header__participants">
          Résztvevők: {participants.map((p) => p.displayName).join(', ')}
        </p>
      </div>
      <div className="header__stats">
        <StatBadge label="Tetszik" value={stats.totalLikes} />
        <StatBadge label="Nem tetszik" value={stats.totalDislikes} />
        <StatBadge label="Közös" value={stats.mutualCount} />
        <StatBadge label="Értékelt" value={stats.ratedMutualCount} />
      </div>
    </Card>
  )
}

export default SessionHeader
