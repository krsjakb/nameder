import { clsx } from 'clsx'

export interface TabOption {
  id: string
  label: string
  badge?: string | number
}

interface TabNavigationProps {
  tabs: TabOption[]
  activeId: string
  onChange: (id: string) => void
}

export function TabNavigation({ tabs, activeId, onChange }: TabNavigationProps) {
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={clsx('tabs__button', { 'tabs__button--active': tab.id === activeId })}
          onClick={() => onChange(tab.id)}
        >
          <span>{tab.label}</span>
          {tab.badge !== undefined ? <span className="tabs__badge">{tab.badge}</span> : null}
        </button>
      ))}
    </div>
  )
}

export default TabNavigation
