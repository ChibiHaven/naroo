import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  emptyAssessmentInput,
  type AssessmentSessionState,
  type AssessmentStep,
  type FarmAssessmentInput,
  type GuidanceClassification,
  type LanguageCode,
} from '@/types/assessment'
import type { FarmGuidanceResult } from '@/types/guidance'
import { prototypeGuidanceService } from '@/services/prototypeGuidanceService'
import { classifyFarmAssessment } from '@/services/rulesEngine'
import { generateGuidanceExplanation } from '@/services/explanationGenerator'
import {
  clearAssessmentSession,
  createFreshSession,
  loadAssessmentSession,
  loadLanguage,
  saveAssessmentSession,
  saveLanguage,
} from '@/utils/sessionStorage'
import { t } from '@/i18n/translations'

interface AssessmentContextValue {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  input: FarmAssessmentInput
  updateInput: (patch: Partial<FarmAssessmentInput>) => void
  currentStep: AssessmentStep
  setCurrentStep: (step: AssessmentStep) => void
  result: FarmGuidanceResult | null
  resultClassification: GuidanceClassification | null
  setResultFromAnalysis: (result: FarmGuidanceResult) => void
  analyze: () => Promise<FarmGuidanceResult>
  clearAll: () => void
  translate: (key: string, vars?: Record<string, string | number>) => string
  hasProgress: boolean
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null)

function hydrateSession(): AssessmentSessionState {
  const language = loadLanguage('en')
  const stored = loadAssessmentSession()
  if (!stored) {
    return createFreshSession(language)
  }
  return {
    ...stored,
    input: {
      ...emptyAssessmentInput(language),
      ...stored.input,
      language,
    },
  }
}

function restoreResult(
  classification: GuidanceClassification | null,
  input: FarmAssessmentInput,
): FarmGuidanceResult | null {
  if (!classification) {
    return null
  }
  // Always recompute from current rules; stored classification is a cache hint only.
  void classification
  return generateGuidanceExplanation(classifyFarmAssessment(input))
}

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AssessmentSessionState>(() =>
    hydrateSession(),
  )
  const [result, setResult] = useState<FarmGuidanceResult | null>(() => {
    const stored = loadAssessmentSession()
    if (!stored) {
      return null
    }
    return restoreResult(stored.resultClassification, stored.input)
  })

  useEffect(() => {
    saveAssessmentSession(session)
    saveLanguage(session.input.language)
  }, [session])

  const setLanguage = useCallback((language: LanguageCode) => {
    setSession((prev) => ({
      ...prev,
      input: { ...prev.input, language },
    }))
  }, [])

  const updateInput = useCallback((patch: Partial<FarmAssessmentInput>) => {
    setSession((prev) => ({
      ...prev,
      input: { ...prev.input, ...patch },
      resultClassification: null,
    }))
    setResult(null)
  }, [])

  const setCurrentStep = useCallback((step: AssessmentStep) => {
    setSession((prev) => ({ ...prev, currentStep: step }))
  }, [])

  const setResultFromAnalysis = useCallback((next: FarmGuidanceResult) => {
    setResult(next)
    setSession((prev) => ({
      ...prev,
      resultClassification: next.classification,
    }))
  }, [])

  const analyze = useCallback(async () => {
    const next = await prototypeGuidanceService.analyze(session.input)
    setResultFromAnalysis(next)
    return next
  }, [session.input, setResultFromAnalysis])

  const clearAll = useCallback(() => {
    clearAssessmentSession()
    const language = loadLanguage('en')
    const fresh = createFreshSession(language)
    setSession(fresh)
    setResult(null)
  }, [])

  const translate = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      t(session.input.language, key, vars),
    [session.input.language],
  )

  const hasProgress = useMemo(() => {
    const { input } = session
    return Boolean(
      input.district ||
        input.fieldType ||
        input.previousCrop ||
        input.plantingMonth ||
        input.waterSource ||
        input.drainageCondition ||
        input.farmAreaRai ||
        input.decisionGoal ||
        result,
    )
  }, [session, result])

  const value = useMemo<AssessmentContextValue>(
    () => ({
      language: session.input.language,
      setLanguage,
      input: session.input,
      updateInput,
      currentStep: session.currentStep,
      setCurrentStep,
      result,
      resultClassification: session.resultClassification,
      setResultFromAnalysis,
      analyze,
      clearAll,
      translate,
      hasProgress,
    }),
    [
      session,
      setLanguage,
      updateInput,
      setCurrentStep,
      result,
      setResultFromAnalysis,
      analyze,
      clearAll,
      translate,
      hasProgress,
    ],
  )

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  )
}

export function useAssessment(): AssessmentContextValue {
  const context = useContext(AssessmentContext)
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider')
  }
  return context
}
