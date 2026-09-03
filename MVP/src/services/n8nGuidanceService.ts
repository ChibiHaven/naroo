import type { FarmAssessmentInput } from '@/types/assessment'
import type { LiveGuidanceResult } from '@/types/liveGuidance'
import { adaptNarooResponse } from '@/types/liveGuidance'
import {
  isNarooValidationError,
  parseNarooGuidanceResponse,
} from '@/types/n8nApi'
import { GuidanceRequestError } from '@/services/n8nErrors'
import { buildNarooGuidanceRequest } from '@/services/n8nRequestMapper'
import type { GuidanceService } from '@/services/guidanceService'

export const N8N_REQUEST_TIMEOUT_MS = 60_000

const inFlightByKey = new Map<string, Promise<LiveGuidanceResult>>()

export function resetN8nGuidanceInFlightForTests(): void {
  inFlightByKey.clear()
}

export function getN8nWebhookUrl(): string | null {
  const value = import.meta.env.VITE_N8N_WEBHOOK_URL
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true
  }
  return error instanceof Error && error.name === 'AbortError'
}

export class N8nGuidanceService implements GuidanceService {
  timeoutMs: number
  fetchImpl: typeof fetch
  webhookUrlOverride: string | null | undefined

  constructor(options?: {
    timeoutMs?: number
    fetchImpl?: typeof fetch
    webhookUrl?: string | null
  }) {
    this.timeoutMs = options?.timeoutMs ?? N8N_REQUEST_TIMEOUT_MS
    this.fetchImpl =
      options?.fetchImpl ??
      ((input: RequestInfo | URL, init?: RequestInit) =>
        globalThis.fetch(input, init))
    this.webhookUrlOverride = options?.webhookUrl
  }

  resolveWebhookUrl(): string | null {
    if (this.webhookUrlOverride !== undefined) {
      const trimmed = this.webhookUrlOverride?.trim() ?? ''
      return trimmed.length > 0 ? trimmed : null
    }
    return getN8nWebhookUrl()
  }

  async analyze(input: FarmAssessmentInput): Promise<LiveGuidanceResult> {
    const request = buildNarooGuidanceRequest(input)
    const key = JSON.stringify(request)
    const existing = inFlightByKey.get(key)
    if (existing) {
      return existing
    }

    const promise = this.analyzeOnce(request).finally(() => {
      if (inFlightByKey.get(key) === promise) {
        inFlightByKey.delete(key)
      }
    })
    inFlightByKey.set(key, promise)
    return promise
  }

  async analyzeOnce(
    body: ReturnType<typeof buildNarooGuidanceRequest>,
  ): Promise<LiveGuidanceResult> {
    const url = this.resolveWebhookUrl()
    if (!url) {
      throw new GuidanceRequestError(
        'configuration',
        'VITE_N8N_WEBHOOK_URL is not configured',
      )
    }

    const controller = new AbortController()
    const timeoutId = globalThis.setTimeout(() => {
      controller.abort()
    }, this.timeoutMs)

    try {
      const response = await this.fetchImpl(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      let payload: unknown
      try {
        payload = await response.json()
      } catch (cause) {
        if (response.status === 400) {
          throw new GuidanceRequestError(
            'invalid_response',
            'Validation response was not valid JSON',
            { status: 400, cause },
          )
        }
        if (!response.ok) {
          throw new GuidanceRequestError(
            'server',
            `Guidance request failed with HTTP ${response.status}`,
            { status: response.status, cause },
          )
        }
        throw new GuidanceRequestError(
          'invalid_response',
          'Response was not valid JSON',
          { status: response.status, cause },
        )
      }

      if (response.status === 400) {
        if (isNarooValidationError(payload)) {
          throw new GuidanceRequestError('validation', payload.message, {
            validation: payload,
            status: 400,
          })
        }
        throw new GuidanceRequestError(
          'invalid_response',
          'Validation response was incomplete',
          { status: 400 },
        )
      }

      if (!response.ok) {
        throw new GuidanceRequestError(
          'server',
          `Guidance request failed with HTTP ${response.status}`,
          { status: response.status },
        )
      }

      const parsed = parseNarooGuidanceResponse(payload)
      if (!parsed) {
        throw new GuidanceRequestError(
          'invalid_response',
          'Guidance response failed structural validation',
          { status: response.status },
        )
      }

      return adaptNarooResponse(parsed)
    } catch (error) {
      if (error instanceof GuidanceRequestError) {
        throw error
      }
      if (isAbortError(error)) {
        throw new GuidanceRequestError('timeout', 'Guidance request timed out', {
          cause: error,
        })
      }
      throw new GuidanceRequestError(
        'network',
        'Guidance request could not be completed',
        { cause: error },
      )
    } finally {
      globalThis.clearTimeout(timeoutId)
    }
  }
}

export const n8nGuidanceService = new N8nGuidanceService()
