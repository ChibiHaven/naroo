import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAssessment } from '@/context/AssessmentContext'
import {
  getFirstIncompleteStep,
  validateStep1,
  validateStep2,
  validateStep3,
} from '@/validation/assessmentValidation'

const stepPath = {
  step1: '/assessment/step-1',
  step2: '/assessment/step-2',
  step3: '/assessment/step-3',
} as const

export function RequireStep1({ children }: { children: ReactNode }) {
  const { input } = useAssessment()
  if (Object.keys(validateStep1(input)).length > 0) {
    return <Navigate to="/assessment/step-1" replace />
  }
  return children
}

export function RequireStep2({ children }: { children: ReactNode }) {
  const { input } = useAssessment()
  if (Object.keys(validateStep1(input)).length > 0) {
    return <Navigate to="/assessment/step-1" replace />
  }
  if (Object.keys(validateStep2(input)).length > 0) {
    return <Navigate to="/assessment/step-2" replace />
  }
  return children
}

export function RequireReadyForAnalysis({
  children,
}: {
  children: ReactNode
}) {
  const { input } = useAssessment()
  const incomplete =
    Object.keys(validateStep1(input)).length > 0 ||
    Object.keys(validateStep2(input)).length > 0 ||
    Object.keys(validateStep3(input)).length > 0

  if (incomplete) {
    const step = getFirstIncompleteStep(input)
    const path =
      step === 'step1' || step === 'step2' || step === 'step3'
        ? stepPath[step]
        : stepPath.step1
    return <Navigate to={path} replace />
  }
  return children
}

export function RequireResult({ children }: { children: ReactNode }) {
  const { result } = useAssessment()
  if (!result) {
    return <Navigate to="/" replace />
  }
  return children
}
