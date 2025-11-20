import { useState } from 'react'
import type { MutualName } from '../api/types'
import Card from './Card'
import SearchBar from './SearchBar'

interface MyLikesListProps {
    names: MutualName[]
}

export function MyLikesList({ names }: MyLikesListProps) {
    const [searchQuery, setSearchQuery] = useState('')

    if (!names.length) {
        return (
            <Card>
                <p>Még nincsenek kedvelt neveid. Folytasd a szavazást!</p>
            </Card>
        )
    }

    const filteredNames = searchQuery
        ? names.filter((name) => name.value.toLowerCase().includes(searchQuery.toLowerCase()))
        : names

    return (
        <Card className="my-likes">
            <h3>Saját kedvencek</h3>
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Keresés a saját kedvencek között..." />
            <ul className="mutual__list">
                {filteredNames.map((name) => (
                    <li key={name.id} className="mutual__item">
                        <div className="mutual__details">
                            <span className="mutual__name">{name.value}</span>
                            <span className="mutual__gender" style={{ marginLeft: '0.5rem' }}>
                                {name.gender === 'MALE' ? 'Fiú' : 'Lány'}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    )
}

export default MyLikesList
