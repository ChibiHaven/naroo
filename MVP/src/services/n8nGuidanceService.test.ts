import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { N8nGuidanceService, resetN8nGuidanceInFlightForTests } from '@/services/n8nGuidanceService'
import { PrototypeGuidanceService } from '@/services/prototypeGuidanceService'
import { buildNarooGuidanceRequest } from '@/services/n8nRequestMapper'
import { parseNarooGuidanceResponse } from '@/types/n8nApi'
import { emptyAssessmentInput } from '@/types/assessment'
import {
  completeAssessmentInput,
  jsonResponse,
  N8N_TEST_WEBHOOK_URL,
  narooGuidanceResponse,
  narooValidationError,
  unavailableWeather,
} from '@/test/narooFixtures'

function hangingFetch(_url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return new Promise((_, reject) => {
    init?.signal?.addEventListener('abort', () => {
      reject(new DOMException('The operation was aborted.', 'AbortError'))
    })
  })
}

describe('n8n request mapping', () => {
  it('preserves canonical frontend values without remapping', () => {
    const input = completeAssessmentInput('th')
    input.waterSource = 'residual_moisture'
    input.previousCrop = 'another_legume'
    input.drainageCondition = 'unsure'
    input.soilKnowledge = 'unsure'
    input.fieldType = 'unsure'

    const body = buildNarooGuidanceRequest(input)
    expect(body.province).toBe('roi_et')
    expect(body.fieldType).toBe('unsure')
    expect(body.waterSource).toBe('residual_moisture')
    expect(body.previousCrop).toBe('another_legume')
    expect(body.drainageCondition).toBe('unsure')
    expect(body.soilKnowledge).toBe('unsure')
    expect(body.language).toBe('th')
    expect(body.plantingMonth).toBe(11)
    expect(body.farmAreaRai).toBe(5)
    expect(body).not.toHaveProperty('crop')
  })

  it('preserves none and does not map another_legume to legume', () => {
    const noneCrop = completeAssessmentInput()
    noneCrop.previousCrop = 'none'
    expect(buildNarooGuidanceRequest(noneCrop).previousCrop).toBe('none')

    const legume = completeAssessmentInput()
    legume.previousCrop = 'another_legume'
    expect(buildNarooGuidanceRequest(legume).previousCrop).toBe('another_legume')
    expect(buildNarooGuidanceRequest(legume).previousCrop).not.toBe('legume')
  })

  it('always sends province roi_et and omits non-positive farm area', () => {
    const input = completeAssessmentInput()
    input.province = 'other_province'
    input.farmAreaRai = 0
    const body = buildNarooGuidanceRequest(input)
    expect(body.province).toBe('roi_et')
    expect(body.farmAreaRai).toBeUndefined()
  })
})

describe('n8n response validation', () => {
  it('accepts a complete successful payload', () => {
    expect(parseNarooGuidanceResponse(narooGuidanceResponse())).not.toBeNull()
  })

  it('rejects a structurally invalid HTTP 200 payload', () => {
    const invalid = narooGuidanceResponse()
    const broken = {
      ...invalid,
      classification: 'maybe',
    }
    expect(parseNarooGuidanceResponse(broken)).toBeNull()
    expect(parseNarooGuidanceResponse({ classification: 'suitable' })).toBeNull()
  })
})

describe('N8nGuidanceService', () => {
  beforeEach(() => {
    resetN8nGuidanceInFlightForTests()
  })

  afterEach(() => {
    resetN8nGuidanceInFlightForTests()
    vi.useRealTimers()
  })

  it('returns a suitable HTTP 200 result', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse(narooGuidanceResponse({ classification: 'suitable' })),
    )
    const service = new N8nGuidanceService({
      fetchImpl,
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })
    const result = await service.analyze(completeAssessmentInput())
    expect(result.transport).toBe('n8n')
    expect(result.response.classification).toBe('suitable')
    expect(result.response.crop).toBe('mung_bean')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('returns a borderline HTTP 200 result', async () => {
    const service = new N8nGuidanceService({
      fetchImpl: vi.fn(async () =>
        jsonResponse(
          narooGuidanceResponse({
            classification: 'borderline',
            confidence: 'medium',
            requiresExpertSupport: true,
            borderlineReasons: ['risk_limited_water'],
          }),
        ),
      ),
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })
    const result = await service.analyze(completeAssessmentInput())
    expect(result.response.classification).toBe('borderline')
    expect(result.borderlineReasons).toEqual(['risk_limited_water'])
  })

  it('returns an escalate HTTP 200 result', async () => {
    const service = new N8nGuidanceService({
      fetchImpl: vi.fn(async () =>
        jsonResponse(
          narooGuidanceResponse({
            classification: 'escalate',
            confidence: 'low',
            requiresExpertSupport: true,
          }),
        ),
      ),
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })
    const result = await service.analyze(completeAssessmentInput())
    expect(result.response.classification).toBe('escalate')
    expect(result.response.requiresExpertSupport).toBe(true)
  })

  it('preserves a Thai AI explanation as plain text', async () => {
    const payload = narooGuidanceResponse({ language: 'th' })
    const service = new N8nGuidanceService({
      fetchImpl: vi.fn(async () => jsonResponse(payload)),
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })
    const result = await service.analyze(completeAssessmentInput('th'))
    expect(result.response.language).toBe('th')
    expect(result.response.aiExplanation.headline).toBe(
      'ถั่วเขียวอาจเหมาะสมหลังนาข้าว',
    )
    expect(result.response.aiExplanation.nextSteps[0]).toBe('ตรวจแปลงในพื้นที่')
  })

  it('preserves an English AI explanation as plain text', async () => {
    const payload = narooGuidanceResponse({ language: 'en' })
    const service = new N8nGuidanceService({
      fetchImpl: vi.fn(async () => jsonResponse(payload)),
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })
    const result = await service.analyze(completeAssessmentInput('en'))
    expect(result.response.aiExplanation.headline).toBe(
      'Mung bean may be suitable after rice.',
    )
  })

  it('maps HTTP 400 validation errors', async () => {
    const service = new N8nGuidanceService({
      fetchImpl: vi.fn(async () => jsonResponse(narooValidationError(), 400)),
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })
    await expect(service.analyze(completeAssessmentInput())).rejects.toMatchObject({
      kind: 'validation',
      validation: {
        code: 'VALIDATION_ERROR',
        errors: [
          {
            field: 'plantingMonth',
            message: 'plantingMonth must be an integer between 1 and 12',
          },
        ],
      },
    })
  })

  it('maps HTTP 500 and other non-OK responses', async () => {
    const service = new N8nGuidanceService({
      fetchImpl: vi.fn(async () => jsonResponse({ error: 'boom' }, 500)),
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })
    await expect(service.analyze(completeAssessmentInput())).rejects.toMatchObject({
      kind: 'server',
      status: 500,
    })
  })

  it('maps network failure', async () => {
    const service = new N8nGuidanceService({
      fetchImpl: vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })
    await expect(service.analyze(completeAssessmentInput())).rejects.toMatchObject({
      kind: 'network',
    })
  })

  it('maps timeout after 60 seconds', async () => {
    vi.useFakeTimers()
    const service = new N8nGuidanceService({
      timeoutMs: 60_000,
      fetchImpl: hangingFetch,
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })
    const promise = service.analyze(completeAssessmentInput())
    const expectation = expect(promise).rejects.toMatchObject({ kind: 'timeout' })
    await vi.advanceTimersByTimeAsync(60_000)
    await expectation
  })

  it('maps invalid JSON on HTTP 200', async () => {
    const service = new N8nGuidanceService({
      fetchImpl: vi.fn(
        async () =>
          new Response('<html>nope</html>', {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          }),
      ),
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })
    await expect(service.analyze(completeAssessmentInput())).rejects.toMatchObject({
      kind: 'invalid_response',
    })
  })

  it('maps a structurally invalid HTTP 200 response', async () => {
    const service = new N8nGuidanceService({
      fetchImpl: vi.fn(async () =>
        jsonResponse({ classification: 'suitable', headline: 'nope' }),
      ),
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })
    await expect(service.analyze(completeAssessmentInput())).rejects.toMatchObject({
      kind: 'invalid_response',
    })
  })

  it('keeps available weather from the payload', async () => {
    const service = new N8nGuidanceService({
      fetchImpl: vi.fn(async () => jsonResponse(narooGuidanceResponse())),
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })
    const result = await service.analyze(completeAssessmentInput())
    expect(result.response.weather.mode).toBe('available')
    expect(result.response.weather.source).toBe('Open-Meteo')
    expect(result.response.weather.days).toHaveLength(1)
  })

  it('keeps unavailable weather from the payload', async () => {
    const service = new N8nGuidanceService({
      fetchImpl: vi.fn(async () =>
        jsonResponse(narooGuidanceResponse({ weather: unavailableWeather() })),
      ),
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })
    const result = await service.analyze(completeAssessmentInput())
    expect(result.response.weather.mode).toBe('unavailable')
    expect(result.response.weather.days).toEqual([])
  })

  it('creates exactly one new request on a later retry after failure', async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(jsonResponse(narooGuidanceResponse()))
    const service = new N8nGuidanceService({
      fetchImpl,
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })

    await expect(service.analyze(completeAssessmentInput())).rejects.toMatchObject({
      kind: 'network',
    })
    const retried = await service.analyze(completeAssessmentInput())
    expect(retried.response.classification).toBe('suitable')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('prevents duplicate in-flight submissions for the same input', async () => {
    let release: ((value: Response) => void) | undefined
    const fetchImpl = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve
        }),
    )
    const service = new N8nGuidanceService({
      fetchImpl,
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })
    const input = completeAssessmentInput()
    const first = service.analyze(input)
    const second = service.analyze(input)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    release?.(jsonResponse(narooGuidanceResponse()))
    const [a, b] = await Promise.all([first, second])
    expect(a.response.meta.requestId).toBe(b.response.meta.requestId)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('shows a configuration error when the webhook URL is missing', async () => {
    const fetchImpl = vi.fn()
    const service = new N8nGuidanceService({
      fetchImpl,
      webhookUrl: '',
    })
    await expect(service.analyze(completeAssessmentInput())).rejects.toMatchObject({
      kind: 'configuration',
    })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('does not fall back to PrototypeGuidanceService', async () => {
    const prototype = new PrototypeGuidanceService()
    const analyzeSpy = vi.spyOn(prototype, 'analyze')
    const service = new N8nGuidanceService({
      fetchImpl: vi.fn(async () => jsonResponse(narooGuidanceResponse())),
      webhookUrl: N8N_TEST_WEBHOOK_URL,
    })
    await service.analyze(completeAssessmentInput())
    expect(analyzeSpy).not.toHaveBeenCalled()
    await expect(prototype.analyze(emptyAssessmentInput())).rejects.toThrow(
      /disabled/i,
    )
  })
})
