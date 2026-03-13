import { useState } from 'react'
import type { MutualName, ParticipantRating, RatingSummary } from '../api/types'
import Button from './Button'
import Card from './Card'
import SearchBar from './SearchBar'

interface MutualListProps {
  names: MutualName[]
  ratings: RatingSummary[]
  participantRatings: ParticipantRating[]
  onRate: (nameId: string, score: number) => void
  canRate?: boolean
}

export function MutualList({ names, ratings, participantRatings, onRate, canRate = true }: MutualListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  if (!names.length) {
    return (
      <Card>
        <p>Még nincsenek közösen kedvelt nevek. Folytassátok a szavazást!</p>
      </Card>
    )
  }

  const ratingMap = new Map(ratings.map((rating) => [rating.nameId, rating]))
  const participantMap = new Map(participantRatings.map((rating) => [rating.nameId, rating.score]))

  const filteredNames = searchQuery
    ? names.filter((name) => name.value.toLowerCase().includes(searchQuery.toLowerCase()))
    : names

  return (
    <Card className="mutual">
      <h3>Közös kedvencek</h3>
      <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Keresés a közös kedvencek között..." />
      <ul className="mutual__list">
        {filteredNames.map((name) => {
          const aggregate = ratingMap.get(name.id)
          const ownScore = participantMap.get(name.id)
          return (
            <li key={name.id} className="mutual__item">
              <div className="mutual__details">
                <span className="mutual__name">{name.value}</span>
                {aggregate ? (
                  <span className="mutual__aggregate">
                    Átlag: {aggregate.average.toFixed(2)} • Szavazatok: {aggregate.votes}
                  </span>
                ) : (
                  <span className="mutual__aggregate">Még nincs végső értékelés</span>
                )}
              </div>
              <div className="mutual__rating">
                {[1, 2, 3, 4, 5].map((score) => (
                  <Button
                    key={score}
                    variant={ownScore === score ? 'primary' : 'secondary'}
                    onClick={() => canRate && onRate(name.id, score)}
                    disabled={!canRate}
                  >
                    {score}
                  </Button>
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

export default MutualList
