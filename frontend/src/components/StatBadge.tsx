import type { PropsWithChildren } from 'react'

interface StatBadgeProps {
  label: string
  value: string | number
}

export function StatBadge({ label, value }: PropsWithChildren<StatBadgeProps>) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  )
}

export default StatBadge
