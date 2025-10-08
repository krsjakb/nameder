import { memo } from 'react'
import type { Recommendation } from '../api/types'
import Button from './Button'
import Card from './Card'

interface SwipeCardProps {
  displayName: string
  lastName: string
  score: number
  remaining: number
  reviewed: number
  onLike: () => void
  onDislike: () => void
  disabled?: boolean
  recommendations: Recommendation[]
}

export const SwipeCard = memo(function SwipeCard({
  displayName,
  lastName,
  score,
  remaining,
  reviewed,
  onLike,
  onDislike,
  disabled,
  recommendations,
}: SwipeCardProps) {
  return (
    <Card className="swipe">
      <div className="swipe__title">
        <span className="swipe__first-name">{displayName}</span>
        <span className="swipe__last-name">{lastName}</span>
      </div>
      <div className="swipe__score">Hangzás pontszám: {score.toFixed(2)}</div>
      <div className="swipe__actions">
        <Button variant="ghost" onClick={onDislike} disabled={disabled} aria-label="Nem tetszik (balra)">
          ❌ Nem
        </Button>
        <Button variant="primary" onClick={onLike} disabled={disabled} aria-label="Tetszik (jobbra)">
          ✅ Tetszik
        </Button>
      </div>
      <p className="swipe__hint">Gyorsbillentyűk: ← nem tetszik, → tetszik</p>
      <div className="swipe__progress">{reviewed} név értékelve • {remaining} maradt</div>
      {recommendations.length ? (
        <div className="swipe__recommendations">
          <span className="swipe__recommendations-label">Ajánlások ehhez a vezetéknévhez:</span>
          <div className="swipe__chips">
            {recommendations.map((rec) => (
              <span key={rec.id} className="chip">
                {rec.value}
                <span className="chip__score">{rec.score.toFixed(1)}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  )
})

export default SwipeCard
