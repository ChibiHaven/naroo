import { useAssessment } from '@/context/AssessmentContext'
import { typicalMonthlyWeatherCopy } from '@/config/typicalMonthlyWeather'

export function TypicalMonthlyWeather({
  month,
  headingLevel = 'h3',
  standalone = false,
}: {
  month: number | null
  headingLevel?: 'h2' | 'h3'
  standalone?: boolean
}) {
  const { language } = useAssessment()
  const copy = typicalMonthlyWeatherCopy(language, month)
  if (!copy) {
    return null
  }

  const Heading = headingLevel

  return (
    <div className={standalone ? '' : 'mt-4 border-t border-brand-border pt-4'}>
      <Heading className="text-sm font-bold text-brand-text">{copy.heading}</Heading>
      <p className="mt-2 text-sm leading-relaxed text-brand-text">{copy.description}</p>
      <p className="mt-2 text-xs leading-relaxed text-brand-muted">{copy.disclaimer}</p>
    </div>
  )
}
