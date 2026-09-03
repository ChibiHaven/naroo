import type { WeatherSnapshot } from '@/types/guidance'

export interface WeatherService {
  getSnapshot(): Promise<WeatherSnapshot>
}
