import { describe, expect, it } from 'vitest'
import {
  completeAssessmentInput,
  narooGuidanceResponse,
} from '@/test/narooFixtures'
import { t } from '@/i18n/translations'
import { whyStatusItems } from '@/utils/displayLabels'
import {
  forecastCoversPlantingMonth,
  resultHeadline as structuredHeadlineFromResponse,
  shouldRejectAiNextStep as rejectStep,
  suggestedNextSteps as nextStepsFromResponse,
  structuredSummaryLines as summaryLines,
} from '@/utils/structuredGuidanceDisplay'

describe('structured guidance display', () => {
  const septemberEscalate = narooGuidanceResponse({
    classification: 'escalate',
    confidence: 'medium',
    requiresExpertSupport: true,
    language: 'en',
    borderlineReasons: ['previous_crop', 'drainage_moderate'],
    decisionTrace: {
      classification: 'escalate',
      confidence: 'medium',
      hardEscalate: true,
      requiresExpertSupport: true,
      matchedRuleId: 'R5_PLANTING_MONTH',
      matchedRuleDescription: 'Planting month is borderline',
      ruleIds: ['R2_CRITICAL_INFO', 'R5_PLANTING_MONTH'],
      borderlineReasons: ['previous_crop', 'drainage_moderate'],
      rules: [
        {
          id: 'R2_CRITICAL_INFO',
          description: 'Critical information is present',
          result: 'pass',
        },
        {
          id: 'R5_PLANTING_MONTH',
          description: 'Planting month is borderline',
          result: 'escalate',
        },
        {
          id: 'borderline_previous_legume',
          description: 'Previous mung bean',
          result: 'borderline',
        },
        {
          id: 'drainage_moderate',
          description: 'Moderate drainage',
          result: 'borderline',
        },
      ],
    },
    input: {
      province: 'roi_et',
      district: 'pathum_rat',
      fieldType: 'upland',
      previousCrop: 'mung_bean',
      plantingMonth: 9,
      waterSource: 'rainfed',
      drainageCondition: 'moderate',
      soilKnowledge: 'yes',
      soilType: 'ดินร่วง',
    },
    aiExplanation: {
      generated: true,
      language: 'en',
      headline: 'September is a borderline planting month in Roi Et',
      summary:
        'classification: escalate; province=Roi Et; fieldType=Lowland paddy',
      nextSteps: [
        'province=Roi Et; fieldType=Lowland paddy',
        'Use this September forecast to decide on December planting',
        'Walk the field and speak with an officer',
      ],
    },
  })

  it('never describes R5 September escalation as borderline in the structured headline', () => {
    const input = {
      ...completeAssessmentInput('en'),
      district: 'pathum_rat',
      plantingMonth: 9,
      previousCrop: 'mung_bean' as const,
    }
    const headline = structuredHeadlineFromResponse('en', septemberEscalate, input)
    expect(headline.toLowerCase()).not.toContain('borderline')
    expect(headline).toBe(t('en', 'headline_escalate_planting_month'))
    expect(headline.toLowerCase()).not.toContain('borderline')
    expect(
      whyStatusItems(
        'en',
        'escalate',
        septemberEscalate.decisionTrace.rules,
        septemberEscalate.borderlineReasons,
        'R5_PLANTING_MONTH',
        'mung_bean',
      ).join(' '),
    ).not.toMatch(/is a borderline/i)
  })

  it('does not treat an R2 pass as missing information', () => {
    const why = whyStatusItems(
      'en',
      'escalate',
      septemberEscalate.decisionTrace.rules,
      septemberEscalate.borderlineReasons,
      'R5_PLANTING_MONTH',
      'mung_bean',
    )
    expect(why.join(' ')).not.toContain(t('en', 'missing_uncertain'))
    expect(why).toContain(t('en', 'rule_planting_month_outside'))
    expect(why).toContain(t('en', 'concern_previous_mung_bean'))
    expect(why).toContain(t('en', 'concern_drainage_moderate'))
  })

  it('rejects technical dumps and weather-timing steps', () => {
    expect(
      rejectStep(
        'province=Roi Et; fieldType=Lowland paddy',
        'escalate',
        septemberEscalate.weather,
        9,
      ),
    ).toBe(true)
    expect(
      rejectStep(
        'Use this September forecast to decide on December planting',
        'escalate',
        septemberEscalate.weather,
        9,
      ),
    ).toBe(true)
    expect(
      rejectStep('Walk the field locally', 'escalate', septemberEscalate.weather, 9),
    ).toBe(false)
  })

  it('keeps acceptable AI next steps and drops unsafe ones', () => {
    const { steps, usedAi } = nextStepsFromResponse(
      'en',
      septemberEscalate,
      12,
    )
    expect(usedAi).toBe(true)
    expect(steps.some((step) => /walk the field/i.test(step))).toBe(true)
    expect(steps.join(' ')).not.toContain('province=')
    expect(steps.join(' ').toLowerCase()).not.toContain('december planting')
  })

  it('preserves user soil text in the structured summary', () => {
    const input = {
      ...completeAssessmentInput('th'),
      district: 'pathum_rat',
      soilKnowledge: 'yes' as const,
      soilType: 'ดินร่วน',
      plantingMonth: 9,
    }
    const lines = summaryLines('th', septemberEscalate, input)
    const soil = lines.find((line) => line.label === t('th', 'summary_soil'))
    expect(soil?.value).toBe('ดินร่วน')
    expect(lines.map((line) => line.value).join(' ')).not.toContain('ดินร่วง')
    expect(lines.map((line) => `${line.label} ${line.value}`).join(' ')).not.toMatch(
      /September \(September\)/,
    )
  })

  it('does not treat current September weather as covering December planting', () => {
    expect(
      forecastCoversPlantingMonth(septemberEscalate.weather, 12),
    ).toBe(false)
    expect(
      forecastCoversPlantingMonth(septemberEscalate.weather, 9),
    ).toBe(true)
  })

  it('falls back to structured actions when every AI step is rejected', () => {
    const { steps, usedAi } = nextStepsFromResponse(
      'en',
      {
        ...septemberEscalate,
        aiExplanation: {
          ...septemberEscalate.aiExplanation,
          nextSteps: [
            'province=Roi Et; fieldType=Lowland paddy',
            'R5_PLANTING_MONTH says borderline',
            'Use this September forecast to plant in December',
          ],
        },
      },
      9,
    )
    expect(usedAi).toBe(false)
    expect(steps).toContain(t('en', 'fallback_step_review_answers'))
    expect(steps).toContain(t('en', 'fallback_step_consult_office'))
    expect(steps).toContain(t('en', 'fallback_step_weather_context_only'))
    expect(steps.join(' ')).not.toContain('province=')
  })
})
