import type { LanguageCode } from '@/types/assessment'
import type { NarooRuleEvaluation } from '@/types/n8nApi'
import {
  displayConcernLabel,
  displayRuleLabel,
} from '@/utils/displayLabels'

export function displayRuleText(
  language: LanguageCode,
  id: string,
  description: string,
): string {
  return displayRuleLabel(id, language, description)
}

export function displayReturnedReason(
  language: LanguageCode,
  reason: string,
): string {
  return displayConcernLabel(reason, language)
}

export function rulesForDisplay(
  rules: NarooRuleEvaluation[],
  ruleIds: string[],
): Array<{ id: string; description: string; result?: string }> {
  const notable = rules.filter(
    (rule) =>
      rule.result === 'escalate' ||
      rule.result === 'borderline' ||
      rule.result === 'suitable',
  )
  if (notable.length > 0) {
    return notable
  }
  return ruleIds.map((id) => ({ id, description: '' }))
}
