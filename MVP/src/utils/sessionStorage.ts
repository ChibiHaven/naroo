import {
  emptyAssessmentInput,
  type AssessmentSessionState,
  type FarmAssessmentInput,
  type GuidanceClassification,
  type LanguageCode,
} from '@/types/assessment'

export const ASSESSMENT_STORAGE_KEY = 'naroo.assessment.session.v2'
export const LEGACY_ASSESSMENT_STORAGE_KEY = 'naroo.assessment.session.v1'
export const LANGUAGE_STORAGE_KEY = 'naroo.language.v1'

const CLASSIFICATIONS: GuidanceClassification[] = [
  'suitable',
  'borderline',
  'escalate',
]

export function readJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) {
      return null
    }
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): void {
  sessionStorage.setItem(key, JSON.stringify(value))
}

export function removeKey(key: string): void {
  sessionStorage.removeItem(key)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sanitizeInput(
  raw: unknown,
  language: LanguageCode,
): FarmAssessmentInput {
  const base = emptyAssessmentInput(language)
  if (!isObject(raw)) {
    return base
  }

  const plantingMonth =
    typeof raw.plantingMonth === 'number' &&
    Number.isFinite(raw.plantingMonth) &&
    raw.plantingMonth >= 1 &&
    raw.plantingMonth <= 12
      ? Math.trunc(raw.plantingMonth)
      : null

  const farmAreaRai =
    typeof raw.farmAreaRai === 'number' && Number.isFinite(raw.farmAreaRai)
      ? raw.farmAreaRai
      : null

  return {
    ...base,
    province:
      typeof raw.province === 'string' && raw.province ? raw.province : 'roi_et',
    district: typeof raw.district === 'string' ? raw.district : '',
    fieldType:
      raw.fieldType === 'lowland_paddy' ||
      raw.fieldType === 'upland' ||
      raw.fieldType === 'other' ||
      raw.fieldType === 'unsure'
        ? raw.fieldType
        : '',
    fieldTypeOther:
      typeof raw.fieldTypeOther === 'string' ? raw.fieldTypeOther : '',
    previousCrop:
      raw.previousCrop === 'rice' ||
      raw.previousCrop === 'mung_bean' ||
      raw.previousCrop === 'another_legume' ||
      raw.previousCrop === 'other' ||
      raw.previousCrop === 'none' ||
      raw.previousCrop === 'unsure'
        ? raw.previousCrop
        : '',
    previousCropOther:
      typeof raw.previousCropOther === 'string' ? raw.previousCropOther : '',
    plantingMonth,
    waterSource:
      raw.waterSource === 'irrigated' ||
      raw.waterSource === 'residual_moisture' ||
      raw.waterSource === 'rainfed' ||
      raw.waterSource === 'limited' ||
      raw.waterSource === 'unsure'
        ? raw.waterSource
        : '',
    drainageCondition:
      raw.drainageCondition === 'good' ||
      raw.drainageCondition === 'moderate' ||
      raw.drainageCondition === 'poor' ||
      raw.drainageCondition === 'unsure'
        ? raw.drainageCondition
        : '',
    farmAreaRai,
    soilKnowledge:
      raw.soilKnowledge === 'yes' ||
      raw.soilKnowledge === 'no' ||
      raw.soilKnowledge === 'unsure'
        ? raw.soilKnowledge
        : '',
    soilType: typeof raw.soilType === 'string' ? raw.soilType : '',
    decisionGoal:
      raw.decisionGoal === 'improve_soil' ||
      raw.decisionGoal === 'use_productively' ||
      raw.decisionGoal === 'add_crop' ||
      raw.decisionGoal === 'learn_mung_bean' ||
      raw.decisionGoal === 'other' ||
      raw.decisionGoal === 'unsure'
        ? raw.decisionGoal
        : '',
    decisionGoalOther:
      typeof raw.decisionGoalOther === 'string' ? raw.decisionGoalOther : '',
    language,
  }
}

export function loadAssessmentSession(): AssessmentSessionState | null {
  const current = readJson<unknown>(ASSESSMENT_STORAGE_KEY)
  if (current) {
    return normalizeSession(current)
  }

  // Migrate/ignore obsolete v1 payloads safely.
  const legacy = readJson<unknown>(LEGACY_ASSESSMENT_STORAGE_KEY)
  if (legacy) {
    removeKey(LEGACY_ASSESSMENT_STORAGE_KEY)
    const migrated = normalizeSession(legacy)
    if (migrated) {
      saveAssessmentSession(migrated)
      return migrated
    }
  }

  return null
}

function normalizeSession(raw: unknown): AssessmentSessionState | null {
  try {
    if (!isObject(raw)) {
      return null
    }
    const language = loadLanguage('en')
    const now = new Date().toISOString()
    const input = sanitizeInput(raw.input, language)
    const classification =
      typeof raw.resultClassification === 'string' &&
      CLASSIFICATIONS.includes(raw.resultClassification as GuidanceClassification)
        ? (raw.resultClassification as GuidanceClassification)
        : null

    const step = raw.currentStep
    const currentStep =
      step === 'step1' ||
      step === 'step2' ||
      step === 'step3' ||
      step === 'analyzing' ||
      step === 'guidance' ||
      step === 'weather' ||
      step === 'sources' ||
      step === 'assumptions' ||
      step === 'expert'
        ? step
        : 'step1'

    return {
      version: 2,
      input,
      currentStep,
      resultClassification: classification,
      createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
      updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
    }
  } catch {
    return null
  }
}

export function saveAssessmentSession(state: AssessmentSessionState): void {
  writeJson(ASSESSMENT_STORAGE_KEY, {
    ...state,
    version: 2,
    updatedAt: new Date().toISOString(),
  })
}

export function clearAssessmentSession(): void {
  removeKey(ASSESSMENT_STORAGE_KEY)
  removeKey(LEGACY_ASSESSMENT_STORAGE_KEY)
}

export function loadLanguage(defaultLanguage: LanguageCode = 'en'): LanguageCode {
  const stored = sessionStorage.getItem(LANGUAGE_STORAGE_KEY)
  return stored === 'th' || stored === 'en' ? stored : defaultLanguage
}

export function saveLanguage(language: LanguageCode): void {
  sessionStorage.setItem(LANGUAGE_STORAGE_KEY, language)
}

export function createFreshSession(
  language: LanguageCode = 'en',
): AssessmentSessionState {
  const now = new Date().toISOString()
  return {
    version: 2,
    input: emptyAssessmentInput(language),
    currentStep: 'step1',
    resultClassification: null,
    createdAt: now,
    updatedAt: now,
  }
}
