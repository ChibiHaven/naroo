import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloudSun } from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { RequireResult } from '@/components/common/RouteGuards'
import { TypicalMonthlyWeather } from '@/components/guidance/TypicalMonthlyWeather'
import { useAssessment } from '@/context/AssessmentContext'
import {
  formatLocalizedDate,
  formatLocalizedDateTime,
} from '@/utils/displayLabels'
import { plantingMonthValue } from '@/utils/structuredGuidanceDisplay'

function formatNumber(
  value: number | null,
  language: 'en' | 'th',
  suffix = '',
): string {
  if (value === null || Number.isNaN(value)) {
    return '—'
  }
  const formatted = new Intl.NumberFormat(language === 'th' ? 'th-TH' : 'en-US', {
    maximumFractionDigits: 1,
  }).format(value)
  return `${formatted}${suffix}`
}

export function WeatherSnapshotPage() {
  return (
    <RequireResult>
      <WeatherSnapshotContent />
    </RequireResult>
  )
}

function WeatherSnapshotContent() {
  const navigate = useNavigate()
  const { translate, language, setCurrentStep, result, input } = useAssessment()

  useEffect(() => {
    setCurrentStep('weather')
  }, [setCurrentStep])

  const weather = result?.response.weather
  const available =
    weather?.mode === 'available' && (weather.days?.length ?? 0) > 0
  const plantingMonth = plantingMonthValue(
    result?.response.input ?? {},
    input.plantingMonth,
  )

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title={translate('weather_title')} showBack variant="green" />
      <main className="flex flex-1 flex-col gap-4 px-5 py-5">
        <div className="inline-flex w-fit items-center rounded-full bg-status-borderline-bg px-4 py-1.5 text-xs font-bold text-status-borderline-text">
          {available
            ? translate('weather_live_badge')
            : translate('weather_unavailable_badge')}
        </div>

        <section className="overflow-hidden rounded-[var(--radius-card)] border border-brand-border bg-gradient-to-b from-sky-50 to-white">
          <div className="flex items-center gap-3 px-5 pt-5">
            <CloudSun className="h-10 w-10 text-brand-primary" aria-hidden="true" />
            <div>
              <h1 className="text-xl font-bold">{translate('weather_title')}</h1>
              <p className="text-sm text-brand-muted">
                {weather
                  ? translate('weather_location_roi_et')
                  : translate('weather_unavailable_title')}
              </p>
            </div>
          </div>

          <div className="px-5 pb-5">
            {!result || !weather || !available ? (
              <>
                <p className="mt-4 text-sm leading-relaxed text-brand-text">
                  {translate('weather_unavailable_body')}
                </p>
                <p className="mt-3 text-xs leading-5 text-brand-muted">
                  {translate('weather_unavailable_note')}
                </p>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm text-brand-muted">
                  {translate('weather_forecast_days', {
                    days: weather.forecastDays,
                  })}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {weather.days.map((day) => (
                    <li
                      key={day.date}
                      className="rounded-xl border border-brand-border bg-white px-4 py-3"
                    >
                      <p className="text-sm font-bold">
                        {formatLocalizedDate(day.date, language)}
                      </p>
                      <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-brand-muted">
                        <div>
                          <dt>{translate('weather_temp_max')}</dt>
                          <dd className="font-semibold text-brand-text">
                            {formatNumber(day.tempMax, language, '°C')}
                          </dd>
                        </div>
                        <div>
                          <dt>{translate('weather_temp_min')}</dt>
                          <dd className="font-semibold text-brand-text">
                            {formatNumber(day.tempMin, language, '°C')}
                          </dd>
                        </div>
                        <div>
                          <dt>{translate('weather_precip_sum')}</dt>
                          <dd className="font-semibold text-brand-text">
                            {formatNumber(day.precipitationSum, language, ' mm')}
                          </dd>
                        </div>
                        <div>
                          <dt>{translate('weather_precip_prob')}</dt>
                          <dd className="font-semibold text-brand-text">
                            {formatNumber(
                              day.precipitationProbabilityMax,
                              language,
                              '%',
                            )}
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm leading-relaxed text-brand-text">
                  {translate('weather_interpretation_live')}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-brand-muted">
                  {translate('weather_forecast_timing_note')}
                </p>
                <p className="mt-3 text-xs leading-5 text-brand-muted">
                  {translate('weather_source_label')}: Open-Meteo
                </p>
                <p className="mt-1 text-xs leading-5 text-brand-muted">
                  {translate('weather_retrieved_label')}:{' '}
                  {formatLocalizedDateTime(weather.retrievedAt, language)}
                </p>
                <details className="mt-3 text-xs text-brand-muted">
                  <summary className="cursor-pointer font-semibold">
                    {translate('weather_technical_details')}
                  </summary>
                  <ul className="mt-2 space-y-1">
                    <li>
                      {weather.latitude}, {weather.longitude} · {weather.timezone}
                    </li>
                    {weather.days.map((day) => (
                      <li key={`code-${day.date}`}>
                        {formatLocalizedDate(day.date, language)}:{' '}
                        {translate('weather_code_label')}{' '}
                        {day.weatherCode === null ? '—' : day.weatherCode}
                      </li>
                    ))}
                  </ul>
                </details>
              </>
            )}
          </div>
        </section>

        {plantingMonth ? (
          <section className="rounded-[var(--radius-card)] border border-brand-border bg-white p-4">
            <TypicalMonthlyWeather
              month={plantingMonth}
              headingLevel="h2"
              standalone
            />
          </section>
        ) : null}

        <SecondaryButton onClick={() => navigate(-1)}>
          {translate('back')}
        </SecondaryButton>
      </main>
    </div>
  )
}
