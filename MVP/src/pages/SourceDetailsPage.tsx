import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader'
import { SourcePanel } from '@/components/guidance/SourcePanel'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { useAssessment } from '@/context/AssessmentContext'
import type { GuidanceSource } from '@/types/guidance'

const STATIC_SOURCES: GuidanceSource[] = [
  {
    kind: 'prototype_rules',
    title: 'Prototype rule basis',
    connected: false,
  },
]

export function SourceDetailsPage() {
  const navigate = useNavigate()
  const { translate, result, setCurrentStep } = useAssessment()

  useEffect(() => {
    setCurrentStep('sources')
  }, [setCurrentStep])

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title={translate('sources_title')} showBack variant="green" />
      <main className="flex flex-1 flex-col gap-4 px-5 py-5">
        <SourcePanel sources={result?.sources ?? STATIC_SOURCES} />
        <SecondaryButton onClick={() => navigate(-1)}>
          {translate('back')}
        </SecondaryButton>
      </main>
    </div>
  )
}
