import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import type { LiveGuidanceResult } from '@/types/liveGuidance'
import { n8nGuidanceService } from '@/services/n8nGuidanceService'
import {
  clearAssessmentSession,
  createFreshSession,
  loadAssessmentSession,
  loadLanguage,
  saveAssessmentSession,
  saveLanguage,
} from '@/utils/sessionStorage'
import {
  assessmentFingerprint,
  clearLiveGuidanceResult,
  hasAnyCachedResult,
  loadLiveGuidanceResult,
  saveLiveGuidanceResult,
} from '@/utils/liveResultStorage'
import { t } from '@/i18n/translations'

export type LanguageSwitchOutcome =
  | 'unchanged'
  | 'cached'
  | 'needs-fetch'
  | 'language-only'

interface AssessmentContextValue {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => LanguageSwitchOutcome
  input: FarmAssessmentInput
  updateInput: (patch: Partial<FarmAssessmentInput>) => void
  currentStep: AssessmentStep
  setCurrentStep: (step: AssessmentStep) => void
  result: LiveGuidanceResult | null
  resultClassification: GuidanceClassification | null
  setResultFromAnalysis: (result: LiveGuidanceResult) => void
  analyze: () => Promise<LiveGuidanceResult>
  clearAll: () => void
  translate: (key: string, vars?: Record<string, string | number>) => string
  hasProgress: boolean
  analysisInFlight: boolean
  languageRefreshPending: boolean
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

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AssessmentSessionState>(() =>
    hydrateSession(),
  )
  const [result, setResult] = useState<LiveGuidanceResult | null>(() => {
    const initial = hydrateSession()
    return loadLiveGuidanceResult(
      assessmentFingerprint(initial.input),
      initial.input.language,
    )
  })
  const [analysisInFlight, setAnalysisInFlight] = useState(false)
  const [languageRefreshPending, setLanguageRefreshPending] = useState(false)
  const requestSeqRef = useRef(0)
  const languageRef = useRef(session.input.language)

  useEffect(() => {
    languageRef.current = session.input.language
  }, [session.input.language])

  useEffect(() => {
    saveAssessmentSession(session)
    saveLanguage(session.input.language)
  }, [session])

  const setLanguage = useCallback((language: LanguageCode): LanguageSwitchOutcome => {
    if (session.input.language === language) {
      return 'unchanged'
    }

    const fingerprint = assessmentFingerprint(session.input)
    const cached = loadLiveGuidanceResult(fingerprint, language)

    requestSeqRef.current += 1
    setSession((prev) => ({
      ...prev,
      input: { ...prev.input, language },
    }))

    if (cached) {
      setResult(cached)
      setLanguageRefreshPending(false)
      setAnalysisInFlight(false)
      return 'cached'
    }

    if (hasAnyCachedResult(fingerprint) || result) {
      setResult(null)
      setLanguageRefreshPending(true)
      return 'needs-fetch'
    }

    return 'language-only'
  }, [result, session.input])

  const updateInput = useCallback((patch: Partial<FarmAssessmentInput>) => {
    setSession((prev) => {
      const nextInput = { ...prev.input, ...patch }
      const changed =
        assessmentFingerprint(prev.input) !== assessmentFingerprint(nextInput)
      if (changed) {
        clearLiveGuidanceResult()
      }
      return {
        ...prev,
        input: nextInput,
        resultClassification: changed ? null : prev.resultClassification,
      }
    })
    setResult((current) => {
      const nextInput = { ...session.input, ...patch }
      const changed =
        assessmentFingerprint(session.input) !== assessmentFingerprint(nextInput)
      return changed ? null : current
    })
  }, [session.input])

  const setCurrentStep = useCallback((step: AssessmentStep) => {
    setSession((prev) => ({ ...prev, currentStep: step }))
  }, [])

  const setResultFromAnalysis = useCallback((next: LiveGuidanceResult) => {
    const fingerprint = assessmentFingerprint(session.input)
    saveLiveGuidanceResult(next, fingerprint, session.input.language)
    setResult(next)
    setLanguageRefreshPending(false)
    setSession((prev) => ({
      ...prev,
      resultClassification: next.response.classification,
    }))
  }, [session.input])

  const analyze = useCallback(async () => {
    const inputSnapshot = session.input
    const fingerprint = assessmentFingerprint(inputSnapshot)
    const language = inputSnapshot.language
    const cached = loadLiveGuidanceResult(fingerprint, language)
    if (cached) {
      setResult(cached)
      setLanguageRefreshPending(false)
      setSession((prev) => ({
        ...prev,
        resultClassification: cached.response.classification,
      }))
      return cached
    }

    const requestId = ++requestSeqRef.current
    setAnalysisInFlight(true)

    try {
      const next = await n8nGuidanceService.analyze(inputSnapshot)
      saveLiveGuidanceResult(next, fingerprint, language)
      if (requestId !== requestSeqRef.current) {
        throw new Error('Stale analysis response ignored')
      }
      if (languageRef.current !== language) {
        return next
      }
      setResult(next)
      setLanguageRefreshPending(false)
      setSession((prev) => ({
        ...prev,
        resultClassification: next.response.classification,
      }))
      return next
    } finally {
      if (requestId === requestSeqRef.current) {
        setAnalysisInFlight(false)
      }
    }
  }, [session.input])

  const clearAll = useCallback(() => {
    requestSeqRef.current += 1
    clearAssessmentSession()
    clearLiveGuidanceResult()
    const language = loadLanguage('en')
    const fresh = createFreshSession(language)
    setSession(fresh)
    setResult(null)
    setAnalysisInFlight(false)
    setLanguageRefreshPending(false)
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
      resultClassification:
        result?.response.classification ?? session.resultClassification,
      setResultFromAnalysis,
      analyze,
      clearAll,
      translate,
      hasProgress,
      analysisInFlight,
      languageRefreshPending,
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
      analysisInFlight,
      languageRefreshPending,
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
