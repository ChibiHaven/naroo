import { describe, expect, it } from 'vitest'
import { emptyAssessmentInput } from '@/types/assessment'
import { classifyFarmAssessment } from '@/services/rulesEngine'
import {
  explainWithForcedClassificationAttempt,
  generateGuidanceExplanation,
} from '@/services/explanationGenerator'

function suitableInput() {
  const input = emptyAssessmentInput('en')
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

describe('rules-first classification', () => {
  it('classifies a complete positive scenario as suitable', () => {
    const trace = classifyFarmAssessment(suitableInput())
    expect(trace.classification).toBe('suitable')
  })

  it('classifies unknown soil or limited water as borderline', () => {
    const soilUnknown = suitableInput()
    soilUnknown.soilKnowledge = 'unsure'
    expect(classifyFarmAssessment(soilUnknown).classification).toBe('borderline')

    const limitedWater = suitableInput()
    limitedWater.waterSource = 'limited'
    expect(classifyFarmAssessment(limitedWater).classification).toBe('borderline')
  })

  it('escalates missing critical information and poor drainage', () => {
    const missing = suitableInput()
    missing.waterSource = 'unsure'
    expect(classifyFarmAssessment(missing).classification).toBe('escalate')

    const poorDrainage = suitableInput()
    poorDrainage.drainageCondition = 'poor'
    expect(classifyFarmAssessment(poorDrainage).classification).toBe('escalate')
  })

  it('is deterministic for the same input', () => {
    const input = suitableInput()
    expect(classifyFarmAssessment(input)).toEqual(classifyFarmAssessment(input))
  })

  it('keeps explanation from overriding rules classification', () => {
    const trace = classifyFarmAssessment(suitableInput())
    const explained = generateGuidanceExplanation(trace)
    const forced = explainWithForcedClassificationAttempt(trace, 'escalate')
    expect(explained.classification).toBe('suitable')
    expect(forced.classification).toBe('suitable')
    expect(forced.crop).toBe('mung_bean')
    expect(forced.prototypeBanner).toContain('PROTOTYPE GUIDANCE')
  })
})
