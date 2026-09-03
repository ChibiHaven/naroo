import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloudSun } from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { useAssessment } from '@/context/AssessmentContext'
import { demoWeatherService } from '@/services/demoWeatherService'
import type { WeatherSnapshot } from '@/types/guidance'

export function WeatherSnapshotPage() {
  const navigate = useNavigate()
  const { translate, setCurrentStep } = useAssessment()
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null)

  useEffect(() => {
    setCurrentStep('weather')
    void demoWeatherService.getSnapshot().then(setSnapshot)
  }, [setCurrentStep])

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title={translate('weather_title')} showBack variant="green" />
      <main className="flex flex-1 flex-col gap-4 px-5 py-5">
        <div className="inline-flex w-fit items-center rounded-full bg-status-borderline-bg px-4 py-1.5 text-xs font-bold text-status-borderline-text">
          {translate('demonstration_mode')}
        </div>

        <section className="overflow-hidden rounded-[var(--radius-card)] border border-brand-border bg-gradient-to-b from-sky-50 to-white">
          <div className="flex items-center gap-3 px-5 pt-5">
            <CloudSun className="h-10 w-10 text-brand-primary" />
            <div>
              <h1 className="text-xl font-bold">{translate('weather_title')}</h1>
              <p className="text-sm text-brand-muted">
                {snapshot ? translate(snapshot.locationLabelKey) : '...'}
              </p>
            </div>
          </div>
          {snapshot ? (
            <div className="px-5 pb-5">
              <p className="mt-4 text-sm text-brand-muted">
                {translate(snapshot.periodLabelKey)}
              </p>
              <ul className="mt-4 space-y-2.5">
                {snapshot.days.map((day) => (
                  <li
                    key={day.labelKey}
                    className="rounded-xl border border-brand-border bg-white px-4 py-3"
                  >
                    <p className="text-sm font-bold">
                      {translate(day.labelKey)}
                    </p>
                    <p className="mt-1 text-sm text-brand-muted">
                      {translate(day.summaryKey)}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm leading-relaxed text-brand-text">
                {translate(snapshot.interpretationKey)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">
                {translate(snapshot.limitationKey)}
              </p>
              <p className="mt-3 text-xs leading-5 text-brand-muted">
                {translate(snapshot.sourceNoteKey)}
              </p>
            </div>
          ) : null}
        </section>

        <SecondaryButton onClick={() => navigate(-1)}>
          {translate('back')}
        </SecondaryButton>
      </main>
    </div>
  )
}
