import { BookOpen } from 'lucide-react'
import type { GuidanceSource } from '@/types/guidance'
import { DecorativeIcon } from '@/components/common/DecorativeIcon'
import { useAssessment } from '@/context/AssessmentContext'
import {
  formatLocalizedDateTime,
  openMeteoHref,
} from '@/utils/displayLabels'

interface SourcePanelProps {
  sources: GuidanceSource[]
}

export function SourcePanel({ sources }: SourcePanelProps) {
  const { translate, language } = useAssessment()

  return (
    <section className="rounded-[var(--radius-card)] border border-brand-border bg-brand-light/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <DecorativeIcon>
          <BookOpen className="h-5 w-5 text-brand-primary" />
        </DecorativeIcon>
        <h2 className="text-base font-bold text-brand-text">
          {translate('source_of_recommendation')}
        </h2>
      </div>
      {sources.length === 0 ? (
        <p className="text-sm leading-6 text-brand-muted">
          {translate('source_prototype_body')}
        </p>
      ) : (
        <ul className="space-y-3">
          {sources.map((source) => {
            if (source.kind === 'open_meteo') {
              const href = openMeteoHref(source.url ?? '')
              return (
                <li
                  key="open-meteo"
                  className="rounded-xl bg-white p-3 text-sm shadow-sm"
                >
                  <a
                    href={href}
                    className="font-semibold text-brand-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {translate('source_open_meteo_title')}
                  </a>
                  <p className="mt-1 text-brand-muted">
                    {translate('source_open_meteo_body')}
                  </p>
                  {source.geographicScope ? (
                    <p className="mt-1 text-xs text-brand-muted">
                      {source.geographicScope}
                      {source.timezone ? ` · ${source.timezone}` : ''}
                    </p>
                  ) : null}
                  {source.retrievedAt ? (
                    <p className="text-xs text-brand-muted">
                      {translate('weather_retrieved_label')}:{' '}
                      {formatLocalizedDateTime(source.retrievedAt, language)}
                    </p>
                  ) : null}
                  {source.limitation ? (
                    <p className="mt-1 text-xs text-brand-muted">
                      {translate('weather_unavailable_note')}
                    </p>
                  ) : null}
                </li>
              )
            }

            return (
              <li
                key="prototype-rules"
                className="rounded-xl bg-white p-3 text-sm shadow-sm"
              >
                <p className="font-semibold text-brand-text">
                  {translate('source_prototype_title')}
                </p>
                <p className="mt-1 text-brand-muted">
                  {translate('source_prototype_body')}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
