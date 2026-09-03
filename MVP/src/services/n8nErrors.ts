import type { NarooValidationError } from '@/types/n8nApi'

export type GuidanceErrorKind =
  | 'configuration'
  | 'validation'
  | 'timeout'
  | 'network'
  | 'server'
  | 'invalid_response'

export class GuidanceRequestError extends Error {
  kind: GuidanceErrorKind
  validation: NarooValidationError | null
  status: number | null

  constructor(
    kind: GuidanceErrorKind,
    message: string,
    options?: {
      validation?: NarooValidationError
      status?: number
      cause?: unknown
    },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined)
    this.name = 'GuidanceRequestError'
    this.kind = kind
    this.validation = options?.validation ?? null
    this.status = options?.status ?? null
  }
}

export function isGuidanceRequestError(
  error: unknown,
): error is GuidanceRequestError {
  return error instanceof GuidanceRequestError
}
