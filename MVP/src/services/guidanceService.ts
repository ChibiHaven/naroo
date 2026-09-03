import type { FarmAssessmentInput } from '@/types/assessment'
import type { FarmGuidanceResult } from '@/types/guidance'

export interface GuidanceService {
  analyze(input: FarmAssessmentInput): Promise<FarmGuidanceResult>
}
