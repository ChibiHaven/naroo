import { AlertTriangle } from 'lucide-react'
import { DecorativeIcon } from '@/components/common/DecorativeIcon'
import { useAssessment } from '@/context/AssessmentContext'

export function PrototypeBanner() {
  const { translate } = useAssessment()
  return (
    <div
      className="flex items-start gap-3 rounded-[var(--radius-card)] border border-status-borderline-border bg-status-borderline-bg px-4 py-3 text-sm"
      role="status"
    >
      <DecorativeIcon className="mt-0.5">
        <AlertTriangle className="h-5 w-5 text-brand-warning" />
      </DecorativeIcon>
      <p className="font-semibold text-status-borderline-text">{translate('prototype_banner')}</p>
    </div>
  )
}
