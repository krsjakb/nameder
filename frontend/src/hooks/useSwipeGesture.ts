import { useEffect, useRef, useState } from 'react'

interface SwipeGestureOptions {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    minSwipeDistance?: number
    enabled?: boolean
}

interface SwipeState {
    isSwiping: boolean
    swipeDirection: 'left' | 'right' | null
    swipeDistance: number
}

export function useSwipeGesture({
    onSwipeLeft,
    onSwipeRight,
    minSwipeDistance = 50,
    enabled = true,
}: SwipeGestureOptions) {
    const touchStartX = useRef<number>(0)
    const touchEndX = useRef<number>(0)
    const [swipeState, setSwipeState] = useState<SwipeState>({
        isSwiping: false,
        swipeDirection: null,
        swipeDistance: 0,
    })

    const handleTouchStart = (e: TouchEvent) => {
        if (!enabled) return
        touchStartX.current = e.touches[0].clientX
        touchEndX.current = e.touches[0].clientX
        setSwipeState({ isSwiping: true, swipeDirection: null, swipeDistance: 0 })
    }

    const handleTouchMove = (e: TouchEvent) => {
        if (!enabled || !swipeState.isSwiping) return
        touchEndX.current = e.touches[0].clientX
        const distance = touchEndX.current - touchStartX.current
        const direction = distance > 0 ? 'right' : 'left'
        setSwipeState({
            isSwiping: true,
            swipeDirection: direction,
            swipeDistance: Math.abs(distance),
        })
    }

    const handleTouchEnd = () => {
        if (!enabled || !swipeState.isSwiping) return

        const distance = touchEndX.current - touchStartX.current

        if (Math.abs(distance) >= minSwipeDistance) {
            if (distance > 0 && onSwipeRight) {
                onSwipeRight()
            } else if (distance < 0 && onSwipeLeft) {
                onSwipeLeft()
            }
        }

        setSwipeState({ isSwiping: false, swipeDirection: null, swipeDistance: 0 })
        touchStartX.current = 0
        touchEndX.current = 0
    }

    return {
        handlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
        swipeState,
    }
}

// Hook for attaching to a ref element
export function useSwipeGestureRef(options: SwipeGestureOptions) {
    const elementRef = useRef<HTMLElement | null>(null)
    const { handlers } = useSwipeGesture(options)

    useEffect(() => {
        const element = elementRef.current
        if (!element || !options.enabled) return

        element.addEventListener('touchstart', handlers.onTouchStart)
        element.addEventListener('touchmove', handlers.onTouchMove)
        element.addEventListener('touchend', handlers.onTouchEnd)

        return () => {
            element.removeEventListener('touchstart', handlers.onTouchStart)
            element.removeEventListener('touchmove', handlers.onTouchMove)
            element.removeEventListener('touchend', handlers.onTouchEnd)
        }
    }, [handlers, options.enabled])

    return elementRef
}
