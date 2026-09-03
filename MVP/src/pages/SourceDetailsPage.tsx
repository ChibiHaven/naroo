import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader'
import { SourcePanel } from '@/components/guidance/SourcePanel'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { useAssessment } from '@/context/AssessmentContext'

export function SourceDetailsPage() {
  const navigate = useNavigate()
  const { translate, result, setCurrentStep } = useAssessment()

  useEffect(() => {
    setCurrentStep('sources')
  }, [setCurrentStep])

  const sources = result?.sources ?? [
    {
      title: 'Verified agricultural sources pending connection',
      connected: false,
      limitation:
        'Verified agricultural sources have not yet been connected to this prototype.',
    },
  ]

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title={translate('sources_title')} showBack variant="green" />
      <main className="flex flex-1 flex-col gap-4 px-5 py-5">
        <SourcePanel sources={sources} />
        <p className="text-sm leading-6 text-brand-muted">
          {translate('sources_placeholder')}
        </p>
        <SecondaryButton onClick={() => navigate(-1)}>
          {translate('back')}
        </SecondaryButton>
      </main>
    </div>
  )
}
