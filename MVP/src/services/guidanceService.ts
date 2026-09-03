import type { FarmAssessmentInput } from '@/types/assessment'
import type { LiveGuidanceResult } from '@/types/liveGuidance'

export interface GuidanceService {
  analyze(input: FarmAssessmentInput): Promise<LiveGuidanceResult>
}
