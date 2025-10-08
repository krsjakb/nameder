import type { PropsWithChildren, HTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Card({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={clsx('card', className)} {...props}>
      {children}
    </div>
  )
}

export default Card
