import type { GuidanceAssumption } from '@/types/guidance'

/**
 * Provisional demonstration assumptions for the course MVP.
 * These are NOT verified agronomic thresholds and must be reviewed
 * before any real-world use.
 */
export const PROTOTYPE_ASSUMPTIONS: GuidanceAssumption[] = [
  {
    id: 'scope_roi_et',
    labelKey: 'assumption_scope_label',
    detailKey: 'assumption_scope_detail',
    provisional: true,
  },
  {
    id: 'crop_mung_bean',
    labelKey: 'assumption_crop_label',
    detailKey: 'assumption_crop_detail',
    provisional: true,
  },
  {
    id: 'planting_window',
    labelKey: 'assumption_window_label',
    detailKey: 'assumption_window_detail',
    provisional: true,
  },
  {
    id: 'water_drainage',
    labelKey: 'assumption_water_label',
    detailKey: 'assumption_water_detail',
    provisional: true,
  },
  {
    id: 'weather_demo',
    labelKey: 'assumption_weather_label',
    detailKey: 'assumption_weather_detail',
    provisional: true,
  },
]

/** Provisional suitable planting months (1–12). Demonstration only. */
export const PROTOTYPE_SUITABLE_MONTHS = [11, 12] as const

/** Provisional edge months treated as borderline. Demonstration only. */
export const PROTOTYPE_EDGE_MONTHS = [10, 1] as const

export function getAssumptionById(id: string): GuidanceAssumption | undefined {
  return PROTOTYPE_ASSUMPTIONS.find((item) => item.id === id)
}
