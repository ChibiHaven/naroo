import { BookOpen } from 'lucide-react'
import type { GuidanceSource } from '@/types/guidance'
import { useAssessment } from '@/context/AssessmentContext'

interface SourcePanelProps {
  sources: GuidanceSource[]
}

export function SourcePanel({ sources }: SourcePanelProps) {
  const { translate } = useAssessment()
  const hasConnected = sources.some((source) => source.connected)

  return (
    <section className="rounded-2xl border border-brand-border bg-brand-light/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-brand-primary" aria-hidden="true" />
        <h2 className="text-base font-semibold text-brand-text">
          {translate('source_of_recommendation')}
        </h2>
      </div>
      {!hasConnected ? (
        <p className="text-sm leading-6 text-brand-muted">
          {translate('sources_placeholder')}
        </p>
      ) : (
        <ul className="space-y-3">
          {sources.map((source) => (
            <li
              key={`${source.title}-${source.organization ?? 'org'}`}
              className="rounded-xl bg-white p-3 text-sm"
            >
              <p className="font-semibold text-brand-text">{source.title}</p>
              {source.organization ? (
                <p className="text-brand-muted">{source.organization}</p>
              ) : null}
              {source.geographicScope ? (
                <p className="text-brand-muted">{source.geographicScope}</p>
              ) : null}
              {source.referencePeriod ? (
                <p className="text-brand-muted">{source.referencePeriod}</p>
              ) : null}
              {source.retrievedAt ? (
                <p className="text-brand-muted">{source.retrievedAt}</p>
              ) : null}
              {source.url ? (
                <a
                  href={source.url}
                  className="font-medium text-brand-primary underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.url}
                </a>
              ) : null}
              {source.limitation ? (
                <p className="mt-1 text-brand-muted">{source.limitation}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
