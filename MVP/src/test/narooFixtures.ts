import { emptyAssessmentInput, type FarmAssessmentInput } from '@/types/assessment'
import type {
  NarooGuidanceResponse,
  NarooValidationError,
  NarooWeather,
} from '@/types/n8nApi'

export const N8N_TEST_WEBHOOK_URL =
  'https://chibihaven.app.n8n.cloud/webhook/naroo-guidance'

export function completeAssessmentInput(
  language: FarmAssessmentInput['language'] = 'en',
): FarmAssessmentInput {
  const input = emptyAssessmentInput(language)
  input.province = 'roi_et'
  input.district = 'selaphum'
  input.fieldType = 'lowland_paddy'
  input.previousCrop = 'rice'
  input.plantingMonth = 11
  input.waterSource = 'residual_moisture'
  input.drainageCondition = 'good'
  input.farmAreaRai = 5
  input.soilKnowledge = 'yes'
  input.soilType = 'loam'
  input.decisionGoal = 'learn_mung_bean'
  return input
}

export function availableWeather(
  overrides?: Partial<NarooWeather>,
): NarooWeather {
  return {
    mode: 'available',
    source: 'Open-Meteo',
    retrievedAt: '2026-09-03T12:00:00.000Z',
    latitude: 16.0534,
    longitude: 103.6531,
    timezone: 'Asia/Bangkok',
    forecastDays: 7,
    days: [
      {
        date: '2026-09-04',
        weatherCode: 2,
        tempMax: 33.1,
        tempMin: 24.2,
        precipitationSum: 1.4,
        precipitationProbabilityMax: 40,
      },
    ],
    ...overrides,
  }
}

export function unavailableWeather(): NarooWeather {
  return {
    mode: 'unavailable',
    source: 'Open-Meteo',
    retrievedAt: '2026-09-03T12:00:00.000Z',
    latitude: 16.0534,
    longitude: 103.6531,
    timezone: 'Asia/Bangkok',
    forecastDays: 7,
    days: [],
  }
}

export function narooGuidanceResponse(
  overrides?: Partial<NarooGuidanceResponse>,
): NarooGuidanceResponse {
  const classification = overrides?.classification ?? 'suitable'
  const language = overrides?.language ?? 'en'
  const headline =
    language === 'th'
      ? 'ถั่วเขียวอาจเหมาะสมหลังนาข้าว'
      : 'Mung bean may be suitable after rice.'
  const summary =
    language === 'th'
      ? 'จากข้อมูลที่ส่งมา ระบบประเมินว่าถั่วเขียวเป็นทางเลือกที่พิจารณาได้'
      : 'Based on the submitted answers, mung bean is an option to consider.'

  const base: NarooGuidanceResponse = {
    classification,
    confidence: 'high',
    requiresExpertSupport: classification === 'escalate',
    crop: 'mung_bean',
    ruleIds: ['support_field_type', 'support_water', 'suitable_base'],
    decisionTrace: {
      classification,
      confidence: 'high',
      hardEscalate: classification === 'escalate',
      requiresExpertSupport: classification === 'escalate',
      matchedRuleId: 'suitable_base',
      matchedRuleDescription: 'Base suitable scenario',
      ruleIds: ['support_field_type', 'support_water', 'suitable_base'],
      borderlineReasons: [],
      rules: [
        {
          id: 'support_field_type',
          description: 'Lowland paddy field type',
          result: 'pass',
        },
        {
          id: 'support_water',
          description: 'Usable residual moisture',
          result: 'pass',
        },
      ],
    },
    borderlineReasons: [],
    input: {
      province: 'roi_et',
      fieldType: 'lowland_paddy',
    },
    language,
    dataMode: 'prototype',
    aiExplanation: {
      generated: true,
      language,
      headline,
      summary,
      nextSteps:
        language === 'th'
          ? ['ตรวจแปลงในพื้นที่', 'ปรึกษาเจ้าหน้าที่ถ้ายังไม่แน่ใจ']
          : ['Walk the field locally', 'Ask an officer if you remain unsure'],
    },
    weather: availableWeather(),
    meta: {
      requestId: 'req-test-001',
      processedAt: '2026-09-03T12:00:12.000Z',
    },
  }

  return {
    ...base,
    ...overrides,
    decisionTrace: {
      ...base.decisionTrace,
      ...overrides?.decisionTrace,
      classification:
        overrides?.decisionTrace?.classification ??
        overrides?.classification ??
        base.decisionTrace.classification,
    },
    aiExplanation: {
      ...base.aiExplanation,
      ...overrides?.aiExplanation,
    },
    weather: overrides?.weather ?? base.weather,
    meta: {
      ...base.meta,
      ...overrides?.meta,
    },
  }
}

export function narooValidationError(
  overrides?: Partial<NarooValidationError>,
): NarooValidationError {
  return {
    code: 'VALIDATION_ERROR',
    message: 'One or more fields are invalid',
    dataMode: 'prototype',
    errors: [
      {
        field: 'plantingMonth',
        message: 'plantingMonth must be an integer between 1 and 12',
      },
    ],
    meta: {
      requestId: 'req-test-400',
      processedAt: '2026-09-03T12:00:12.000Z',
    },
    ...overrides,
  }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
