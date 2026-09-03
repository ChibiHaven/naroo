import { AlertTriangle } from 'lucide-react'
import { useAssessment } from '@/context/AssessmentContext'

export function PrototypeBanner() {
  const { translate } = useAssessment()
  return (
    <div
      className="flex items-start gap-3 rounded-[var(--radius-card)] border border-status-borderline-border bg-status-borderline-bg px-4 py-3 text-sm"
      role="status"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-warning" aria-hidden="true" />
      <p className="font-semibold text-status-borderline-text">{translate('prototype_banner')}</p>
    </div>
  )
}
