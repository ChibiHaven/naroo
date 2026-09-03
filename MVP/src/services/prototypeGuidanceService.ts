import type { FarmAssessmentInput } from '@/types/assessment'
import type { FarmGuidanceResult } from '@/types/guidance'
import { generateGuidanceExplanation } from '@/services/explanationGenerator'
import { classifyFarmAssessment } from '@/services/rulesEngine'
import type { GuidanceService } from '@/services/guidanceService'

/**
 * Local prototype guidance service.
 * Replaceable later by an n8n webhook implementation of GuidanceService.
 */
export class PrototypeGuidanceService implements GuidanceService {
  delayMs: number

  constructor(delayMs = 1600) {
    this.delayMs = delayMs
  }

  async analyze(input: FarmAssessmentInput): Promise<FarmGuidanceResult> {
    const isTest = import.meta.env.MODE === 'test'
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const waitMs = isTest || prefersReducedMotion ? 0 : this.delayMs
    if (waitMs > 0) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, waitMs)
      })
    }

    const trace = classifyFarmAssessment(input)
    return generateGuidanceExplanation(trace)
  }
}

export const prototypeGuidanceService = new PrototypeGuidanceService()
