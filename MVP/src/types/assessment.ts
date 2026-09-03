export type LanguageCode = 'en' | 'th'

export type FieldType = 'lowland_paddy' | 'upland' | 'other' | 'unsure'

export type PreviousCrop =
  | 'rice'
  | 'mung_bean'
  | 'another_legume'
  | 'other'
  | 'none'
  | 'unsure'

export type WaterSource =
  | 'irrigated'
  | 'residual_moisture'
  | 'rainfed'
  | 'limited'
  | 'unsure'

export type DrainageCondition = 'good' | 'moderate' | 'poor' | 'unsure'

export type SoilKnowledge = 'yes' | 'no' | 'unsure'

export type DecisionGoal =
  | 'improve_soil'
  | 'use_productively'
  | 'add_crop'
  | 'learn_mung_bean'
  | 'other'
  | 'unsure'

export type AssessmentStep =
  | 'step1'
  | 'step2'
  | 'step3'
  | 'analyzing'
  | 'guidance'
  | 'weather'
  | 'sources'
  | 'assumptions'
  | 'expert'

/** Fixed MVP crop — not selectable by the farmer. */
export const SUPPORTED_CROP = 'mung_bean' as const

export interface FarmAssessmentInput {
  province: string
  district: string
  fieldType: FieldType | ''
  fieldTypeOther?: string
  previousCrop: PreviousCrop | ''
  previousCropOther?: string
  plantingMonth: number | null
  waterSource: WaterSource | ''
  drainageCondition: DrainageCondition | ''
  farmAreaRai: number | null
  soilKnowledge: SoilKnowledge | ''
  soilType?: string
  decisionGoal: DecisionGoal | ''
  decisionGoalOther?: string
  language: LanguageCode
}

export type GuidanceClassification = 'suitable' | 'borderline' | 'escalate'

export interface AssessmentSessionState {
  version: 2
  input: FarmAssessmentInput
  currentStep: AssessmentStep
  resultClassification: GuidanceClassification | null
  createdAt: string
  updatedAt: string
}

export const emptyAssessmentInput = (
  language: LanguageCode = 'en',
): FarmAssessmentInput => ({
  province: 'roi_et',
  district: '',
  fieldType: '',
  fieldTypeOther: '',
  previousCrop: '',
  previousCropOther: '',
  plantingMonth: null,
  waterSource: '',
  drainageCondition: '',
  farmAreaRai: null,
  soilKnowledge: '',
  soilType: '',
  decisionGoal: '',
  decisionGoalOther: '',
  language,
})
