import { CATEGORY_LABELS, URGENCY_LABELS } from '../lib/constants'

export function UrgencyBadge({ urgencyLevel }) {
  if (!urgencyLevel || urgencyLevel === 'normal') return null
  const label = URGENCY_LABELS[urgencyLevel]
  const cls = urgencyLevel === 'urgent' ? 'badge-urgent' : 'badge-hot'
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cls}`}>
      {label}
    </span>
  )
}

export function CategoryBadge({ category }) {
  if (!category) return null
  const label = CATEGORY_LABELS[category] ?? category
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md badge-status">
      {label}
    </span>
  )
}

export function VerifiedBadge() {
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
      인증 팬
    </span>
  )
}
