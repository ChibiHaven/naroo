import { AlertTriangle } from 'lucide-react'
import { useAssessment } from '@/context/AssessmentContext'

export function PrototypeBanner() {
  const { translate } = useAssessment()
  return (
    <div
      className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
      role="status"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="font-semibold">{translate('prototype_banner')}</p>
    </div>
  )
}
