import { memo } from 'react'

interface ThemeToggleProps {
    theme: 'light' | 'dark'
    onToggle: () => void
}

export const ThemeToggle = memo(function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
    return (
        <button
            className="theme-toggle"
            onClick={onToggle}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <span className="theme-toggle__icon">
                {theme === 'light' ? '🌙' : '☀️'}
            </span>
        </button>
    )
})

export default ThemeToggle
