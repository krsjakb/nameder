import { useEffect } from 'react'

export function useKeyboardSwipe(onLike: () => void, onDislike: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) {
      return () => {}
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onLike()
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onDislike()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled, onLike, onDislike])
}
