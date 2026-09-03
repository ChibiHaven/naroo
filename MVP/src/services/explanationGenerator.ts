import type { DecisionTrace, FarmGuidanceResult } from '@/types/guidance'

const DISCONNECTED_SOURCE = {
  title: 'Prototype rule basis',
  connected: false as const,
  limitation:
    'The assessment uses project-defined demonstration rules that still require validation by agricultural experts.',
}

/**
 * Template explanation layer.
 * May explain a fixed DecisionTrace but must never change its classification.
 */
export function generateGuidanceExplanation(
  trace: DecisionTrace,
): FarmGuidanceResult {
  const classification = trace.classification

  const headlineKey =
    classification === 'suitable'
      ? 'status_suitable'
      : classification === 'borderline'
        ? 'status_borderline'
        : 'status_escalate'

  const summaryKey =
    classification === 'suitable'
      ? 'result_summary_suitable'
      : classification === 'borderline'
        ? 'result_summary_borderline'
        : 'result_summary_escalate'

  const confidence =
    classification === 'suitable'
      ? 'medium'
      : classification === 'borderline'
        ? 'low'
        : 'low'

  return {
    classification,
    headlineKey,
    summaryKey,
    crop: 'mung_bean',
    supportingConditions: [...trace.supportingConditionKeys],
    risks: [...trace.riskKeys],
    missingOrUncertain: [...trace.missingOrUncertainKeys],
    assumptionIds: [...trace.assumptionIds],
    limitations: [
      'limitation_prototype_only',
      'limitation_no_live_sources',
      'limitation_not_guarantee',
    ],
    confidence,
    confidenceLabelKey:
      confidence === 'medium' ? 'confidence_medium' : 'confidence_low',
    sources: [DISCONNECTED_SOURCE],
    requiresExpertSupport:
      classification === 'borderline' || classification === 'escalate',
    dataMode: 'prototype',
    prototypeBanner: 'PROTOTYPE GUIDANCE — NOT LIVE AGRICULTURAL ADVICE',
    decisionTrace: structuredClone(trace),
    weatherContextKey: 'weather_context_demo',
  }
}

/** Test helper: proves explanation cannot override classification. */
export function explainWithForcedClassificationAttempt(
  trace: DecisionTrace,
  attemptedOverride: DecisionTrace['classification'],
): FarmGuidanceResult {
  const result = generateGuidanceExplanation(trace)
  // Deliberately ignore attemptedOverride — classification stays from rules.
  void attemptedOverride
  return result
}
