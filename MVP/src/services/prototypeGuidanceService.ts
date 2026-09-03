import type { FarmAssessmentInput } from '@/types/assessment'
import type { LiveGuidanceResult } from '@/types/liveGuidance'

/**
 * Legacy local prototype service.
 * Kept in the repository for reference/tests history only.
 * Production analysis must use N8nGuidanceService and must never call this.
 */
export class PrototypeGuidanceService {
  async analyze(_input: FarmAssessmentInput): Promise<LiveGuidanceResult> {
    throw new Error(
      'PrototypeGuidanceService is disabled. Configure VITE_N8N_WEBHOOK_URL and use N8nGuidanceService.',
    )
  }
}

export const prototypeGuidanceService = new PrototypeGuidanceService()
