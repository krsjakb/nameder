import { memo } from 'react'

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export const SearchBar = memo(function SearchBar({
    value,
    onChange,
    placeholder = 'Keresés...',
}: SearchBarProps) {
    return (
        <div className="search-bar">
            <span className="search-bar__icon">🔍</span>
            <input
                type="text"
                className="search-bar__input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
            {value && (
                <button
                    className="search-bar__clear"
                    onClick={() => onChange('')}
                    aria-label="Clear search"
                >
                    ✕
                </button>
            )}
        </div>
    )
})

export default SearchBar
