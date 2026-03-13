import { useState } from 'react'
import type { RatingSummary } from '../api/types'
import Card from './Card'
import SearchBar from './SearchBar'

interface TopListProps {
  ratings: RatingSummary[]
}

export function TopList({ ratings }: TopListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  if (!ratings.length) {
    return (
      <Card>
        <p>Még nincs toplista. Értékeljétek a közös kedvenceket, hogy felkerüljenek ide!</p>
      </Card>
    )
  }

  const filteredRatings = searchQuery
    ? ratings.filter((rating) => rating.name.value.toLowerCase().includes(searchQuery.toLowerCase()))
    : ratings

  return (
    <Card className="toplist">
      <h3>Toplista</h3>
      <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Keresés a toplistában..." />
      <ol>
        {filteredRatings.map((rating) => (
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
