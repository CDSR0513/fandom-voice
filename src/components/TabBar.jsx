import { TABS } from '../lib/constants'

export default function TabBar({ selected, onChange }) {
  return (
    <div className="flex border-b border-surface-border gap-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition -mb-px ${
            selected === tab.id
              ? 'border-accent text-accent-glow'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
