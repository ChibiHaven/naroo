import type { LanguageCode } from '@/types/assessment'
import { t } from '@/i18n/translations'
import { displayMonthName } from '@/utils/displayLabels'

const TYPICAL_WEATHER_KEYS = [
  'typical_weather_1',
  'typical_weather_2',
  'typical_weather_3',
  'typical_weather_4',
  'typical_weather_5',
  'typical_weather_6',
  'typical_weather_7',
  'typical_weather_8',
  'typical_weather_9',
  'typical_weather_10',
  'typical_weather_11',
  'typical_weather_12',
] as const

export function isPlantingMonth(
  value: number | null | undefined,
): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 12
}

export function typicalMonthlyWeatherCopy(
  language: LanguageCode,
  month: number | null | undefined,
): { heading: string; description: string; disclaimer: string } | null {
  if (!isPlantingMonth(month)) {
    return null
  }

  const key = TYPICAL_WEATHER_KEYS[month - 1]
  if (!key) {
    return null
  }

  return {
    heading: t(language, 'typical_weather_heading', {
      month: displayMonthName(month, language),
    }),
    description: t(language, key),
    disclaimer: t(language, 'typical_weather_disclaimer'),
  }
}
