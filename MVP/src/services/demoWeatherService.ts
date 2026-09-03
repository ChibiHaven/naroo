import type { WeatherSnapshot } from '@/types/guidance'
import type { WeatherService } from '@/services/weatherService'

/**
 * Demonstration weather only.
 * Does not call live APIs and must not be presented as current Roi Et conditions.
 */
export class DemoWeatherService implements WeatherService {
  async getSnapshot(): Promise<WeatherSnapshot> {
    return {
      mode: 'demonstration',
      locationLabelKey: 'weather_location_demo',
      periodLabelKey: 'weather_period_demo',
      days: [
        { labelKey: 'weather_day_1', summaryKey: 'weather_day_1_summary' },
        { labelKey: 'weather_day_2', summaryKey: 'weather_day_2_summary' },
        { labelKey: 'weather_day_3', summaryKey: 'weather_day_3_summary' },
      ],
      interpretationKey: 'weather_interpretation_demo',
      limitationKey: 'weather_limitation_demo',
      sourceNoteKey: 'weather_source_demo',
    }
  }
}

export const demoWeatherService = new DemoWeatherService()
