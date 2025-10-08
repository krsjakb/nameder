import type { RatingSummary } from '../api/types'
import Card from './Card'

interface TopListProps {
  ratings: RatingSummary[]
}

export function TopList({ ratings }: TopListProps) {
  if (!ratings.length) {
    return (
      <Card>
        <p>Még nincs toplista. Értékeljétek a közös kedvenceket, hogy felkerüljenek ide!</p>
      </Card>
    )
  }

  return (
    <Card className="toplist">
      <h3>Toplista</h3>
      <ol>
        {ratings.map((rating) => (
          <li key={rating.nameId}>
            <span className="toplist__name">{rating.name.value}</span>
            <span className="toplist__score">{rating.average.toFixed(2)} pont ({rating.votes} szavazat)</span>
          </li>
        ))}
      </ol>
    </Card>
  )
}

export default TopList
