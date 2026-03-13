import { useEffect, useRef } from 'react'

interface ConfettiProps {
    active: boolean
    onComplete?: () => void
    duration?: number
}

export function Confetti({ active, onComplete, duration = 3000 }: ConfettiProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!active || !containerRef.current) return

        const container = containerRef.current
        const colors = ['#7b3afc', '#a855f7', '#f472b6', '#fb923c', '#fbbf24', '#4ade80']
        const confettiCount = 50

        // Create confetti pieces
        const pieces: HTMLDivElement[] = []
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div')
            confetti.className = 'confetti-piece'
            confetti.style.left = `${Math.random() * 100}%`
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
            confetti.style.animationDelay = `${Math.random() * 0.5}s`
            confetti.style.animationDuration = `${2 + Math.random() * 1}s`
            container.appendChild(confetti)
            pieces.push(confetti)
        }

        // Cleanup after duration
        const timer = setTimeout(() => {
            pieces.forEach((piece) => piece.remove())
            if (onComplete) onComplete()
        }, duration)

        return () => {
            clearTimeout(timer)
            pieces.forEach((piece) => piece.remove())
        }
    }, [active, duration, onComplete])

    if (!active) return null

    return <div ref={containerRef} className="confetti-container" />
}

export default Confetti
