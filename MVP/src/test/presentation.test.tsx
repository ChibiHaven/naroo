import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import {
  createFreshSession,
  saveAssessmentSession,
  saveLanguage,
} from '@/utils/sessionStorage'
import { adaptNarooResponse } from '@/types/liveGuidance'
import {
  n8nGuidanceService,
  resetN8nGuidanceInFlightForTests,
} from '@/services/n8nGuidanceService'
import {
  completeAssessmentInput,
  jsonResponse,
  N8N_TEST_WEBHOOK_URL,
  narooGuidanceResponse,
} from '@/test/narooFixtures'
import { t } from '@/i18n/translations'
import {
  LIVE_GUIDANCE_STORAGE_KEY,
  assessmentFingerprint,
  peekStoredResponse,
  saveLiveGuidanceResult,
} from '@/utils/liveResultStorage'
import type { NarooGuidanceResponse } from '@/types/n8nApi'
import type { FarmAssessmentInput } from '@/types/assessment'

function farmerFacingText(): string {
  const main = document.querySelector('main')
  if (!main) {
    return document.body.textContent ?? ''
  }
  const clone = main.cloneNode(true) as HTMLElement
  clone.querySelectorAll('details').forEach((node) => node.remove())
  return clone.textContent ?? ''
}

function seedLiveResult(
  response: NarooGuidanceResponse,
  input: FarmAssessmentInput = completeAssessmentInput(response.language),
) {
  const session = createFreshSession(input.language)
  session.input = input
  session.currentStep = 'guidance'
  session.resultClassification = response.classification
  saveAssessmentSession(session)
  saveLanguage(input.language)
  saveLiveGuidanceResult(
    adaptNarooResponse(response),
    assessmentFingerprint(input),
    input.language,
  )
}

describe('live result presentation', () => {
  beforeEach(() => {
    sessionStorage.clear()
    window.location.hash = '#/guidance'
    resetN8nGuidanceInFlightForTests()
    vi.stubEnv('VITE_N8N_WEBHOOK_URL', N8N_TEST_WEBHOOK_URL)
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url, init) => {
        const body = JSON.parse(String(init?.body ?? '{}')) as { language?: string }
        return jsonResponse(
          narooGuidanceResponse({
            language: body.language === 'th' ? 'th' : 'en',
          }),
        )
      }),
    )
  })

  afterEach(() => {
    resetN8nGuidanceInFlightForTests()
    n8nGuidanceService.webhookUrlOverride = undefined
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('does not show raw codes in an English suitable result', async () => {
    const response = narooGuidanceResponse({
      language: 'en',
      aiExplanation: {
        generated: true,
        language: 'en',
        headline:
          'The field in district phon_thong, province roi_et with field type lowland_paddy is suitable',
        summary:
          'Previous crop rice, water irrigated, drainage good, soilKnowledge: yes, goal learn_mung_bean.',
        nextSteps: ['Check drainage if R3_DRAINAGE_POOR appears later'],
      },
    })
    seedLiveResult(response, {
      ...completeAssessmentInput('en'),
      district: 'phon_thong',
    })
    render(<App />)

    expect(
      await screen.findByText(/preliminarily suitable|Phon Thong/i),
    ).toBeInTheDocument()
    const visible = farmerFacingText()
    expect(visible).not.toMatch(/roi_et|phon_thong|lowland_paddy|learn_mung_bean|R3_DRAINAGE_POOR/)
    expect(visible).toContain(t('en', 'why_suitable'))
    expect(visible).not.toContain('Lowland paddy field type')
    expect(visible).not.toMatch(/\bsvg\b/i)

    const stored = JSON.parse(
      sessionStorage.getItem(LIVE_GUIDANCE_STORAGE_KEY) ?? '{}',
    ) as { byLanguage?: { en?: NarooGuidanceResponse } }
    expect(stored.byLanguage?.en?.aiExplanation.headline).toContain('phon_thong')
    expect(stored.byLanguage?.en?.aiExplanation.summary).toContain('learn_mung_bean')
  })

  it('does not show raw codes in a Thai result', async () => {
    const response = narooGuidanceResponse({
      language: 'th',
      aiExplanation: {
        generated: true,
        language: 'th',
        headline: 'แปลงในอำเภอ phon_thong จังหวัด roi_et ประเภทแปลง lowland_paddy',
        summary: 'พืชก่อนหน้า rice แหล่งน้ำ irrigated การระบายน้ำ good',
        nextSteps: ['ตรวจแปลง'],
      },
    })
    seedLiveResult(response, {
      ...completeAssessmentInput('th'),
      district: 'phon_thong',
    })
    render(<App />)
    expect(await screen.findByText(/โพนทอง|ร้อยเอ็ด/)).toBeInTheDocument()
    const visible = farmerFacingText()
    expect(visible).not.toMatch(/roi_et|phon_thong|lowland_paddy/)
    expect(visible).toContain(t('th', 'why_suitable'))
  })

  it('does not show English borderline or lowland paddy in a Thai result', async () => {
    const response = narooGuidanceResponse({
      language: 'th',
      classification: 'borderline',
      confidence: 'medium',
      requiresExpertSupport: true,
      aiExplanation: {
        generated: true,
        language: 'th',
        headline: 'แปลง lowland paddy ได้ผล borderline',
        summary:
          'ไม่มีข้อมูลความรู้เกี่ยวกับคุณสมบัติของดิน (ไม่มีข้อมูลดิน)',
        nextSteps: ['ตรวจแปลง borderline'],
      },
    })
    seedLiveResult(response, {
      ...completeAssessmentInput('th'),
      district: 'phon_thong',
    })
    render(<App />)
    expect(await screen.findByText('ควรตรวจสอบเพิ่มเติม')).toBeInTheDocument()
    const visible = farmerFacingText()
    expect(visible).toContain('นาลุ่ม')
    expect(visible).toContain('ยังไม่มีข้อมูลดิน')
    expect(visible).toContain('ควรตรวจสอบเพิ่มเติม')
    expect(visible).not.toMatch(/borderline/i)
    expect(visible).not.toMatch(/lowland paddy/i)
    const stored = JSON.parse(
      sessionStorage.getItem(LIVE_GUIDANCE_STORAGE_KEY) ?? '{}',
    ) as {
      byLanguage?: { th?: NarooGuidanceResponse }
    }
    expect(stored.byLanguage?.th?.aiExplanation.headline).toContain('borderline')
    expect(stored.byLanguage?.th?.aiExplanation.summary).toContain(
      'ไม่มีข้อมูลความรู้เกี่ยวกับคุณสมบัติของดิน',
    )
  })

  it('localizes borderline reasons and does not list pass rules', async () => {
    const response = narooGuidanceResponse({
      classification: 'borderline',
      confidence: 'medium',
      requiresExpertSupport: true,
      borderlineReasons: [
        'field_type',
        'planting_month_edge',
        'drainage_moderate',
        'soil_knowledge',
      ],
      decisionTrace: {
        classification: 'borderline',
        confidence: 'medium',
        hardEscalate: false,
        requiresExpertSupport: true,
        matchedRuleId: 'borderline_timing',
        matchedRuleDescription: 'Edge month',
        ruleIds: ['support_water', 'borderline_timing'],
        borderlineReasons: ['planting_month_edge'],
        rules: [
          { id: 'support_water', description: 'Usable water', result: 'pass' },
          {
            id: 'borderline_timing',
            description: 'planting_month_edge',
            result: 'borderline',
          },
        ],
      },
    })
    seedLiveResult(response)
    render(<App />)
    expect(await screen.findByText('Borderline')).toBeInTheDocument()
    expect(
      screen.getAllByText(/near the edge of the prototype window/i).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText(/Drainage is moderate/i).length).toBeGreaterThan(0)
    expect(farmerFacingText()).not.toContain('Usable water')
    expect(farmerFacingText()).not.toContain('planting_month_edge')
  })

  it('shows only the escalation reason for escalate results', async () => {
    const response = narooGuidanceResponse({
      classification: 'escalate',
      confidence: 'low',
      requiresExpertSupport: true,
      borderlineReasons: [],
      decisionTrace: {
        classification: 'escalate',
        confidence: 'low',
        hardEscalate: true,
        requiresExpertSupport: true,
        matchedRuleId: 'R3_DRAINAGE_POOR',
        matchedRuleDescription: 'R3_DRAINAGE_POOR triggered',
        ruleIds: ['support_water', 'R3_DRAINAGE_POOR'],
        borderlineReasons: [],
        rules: [
          { id: 'support_water', description: 'Usable water', result: 'pass' },
          {
            id: 'R3_DRAINAGE_POOR',
            description: 'Poor drainage',
            result: 'escalate',
          },
        ],
      },
    })
    seedLiveResult(response)
    render(<App />)
    expect(await screen.findByText('Escalate')).toBeInTheDocument()
    expect(farmerFacingText()).toMatch(/drainage|waterlog/i)
    expect(farmerFacingText()).not.toContain('Usable water')
    expect(farmerFacingText()).not.toContain('R3_DRAINAGE_POOR')
  })

  it('keeps weather code out of the main forecast card', async () => {
    seedLiveResult(narooGuidanceResponse())
    window.location.hash = '#/weather'
    render(<App />)
    expect(await screen.findByText(/Open-Meteo/)).toBeInTheDocument()
    expect(screen.getAllByText(/September|ก\.ย\.|กันยายน/i).length).toBeGreaterThan(0)
    const code = screen.getByText(/weather code|รหัสอากาศ/i)
    expect(code.closest('details')).not.toBeNull()
    expect(
      screen.getByText(t('en', 'weather_forecast_timing_note')),
    ).toBeInTheDocument()
  })

  it('shows the Open-Meteo URL once per source card', async () => {
    seedLiveResult(narooGuidanceResponse())
    window.location.hash = '#/sources'
    render(<App />)
    expect(await screen.findByText(t('en', 'source_prototype_title'))).toBeInTheDocument()
    const links = screen.getAllByRole('link', { name: 'Open-Meteo' })
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', 'https://open-meteo.com/')
  })

  it('shows Phon Thong contact actions only for that district', async () => {
    seedLiveResult(narooGuidanceResponse(), {
      ...completeAssessmentInput('en'),
      district: 'phon_thong',
    })
    window.location.hash = '#/expert-support'
    render(<App />)
    expect(
      await screen.findByText(/Phon Thong District Agricultural Extension Office/),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /043-571-462/ })).toHaveAttribute(
      'href',
      'tel:+6643571462',
    )
    expect(screen.getByRole('link', { name: /email/i })).toHaveAttribute(
      'href',
      'mailto:Phonthong.roi@doae.go.th',
    )
    expect(
      screen.getByRole('link', { name: /visit official website/i }).getAttribute('href'),
    ).toContain('phonthong-101')
  })

  it('does not show the Phon Thong contact for other districts', async () => {
    seedLiveResult(narooGuidanceResponse(), {
      ...completeAssessmentInput('en'),
      district: 'selaphum',
    })
    window.location.hash = '#/expert-support'
    render(<App />)
    expect(
      await screen.findByText(/Roi Et Provincial Agricultural Extension Office/),
    ).toBeInTheDocument()
    expect(screen.queryByText(/043-571-462/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Phonthong.roi@doae.go.th/i)).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /visit official website/i }),
    ).toHaveAttribute('href', 'https://roiet.doae.go.th/')
  })

  it('caches bilingual results and does not refetch a stored language', async () => {
    const user = userEvent.setup()
    const input = completeAssessmentInput('th')
    window.location.hash = '#/analyzing'
    const session = createFreshSession('th')
    session.input = input
    session.currentStep = 'analyzing'
    saveAssessmentSession(session)
    saveLanguage('th')

    render(<App />)
    expect(
      await screen.findByText('ถั่วเขียวอาจเหมาะสมหลังนาข้าว'),
    ).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: /เปิดเมนู|open menu/i }))
    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(
      await screen.findByText('Mung bean may be suitable after rice.'),
    ).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('button', { name: 'ไทย' }))
    expect(
      await screen.findByText('ถั่วเขียวอาจเหมาะสมหลังนาข้าว'),
    ).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)

    await user.click(screen.getByRole('button', { name: /เปิดเมนู|open menu/i }))
    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(
      await screen.findByText('Mung bean may be suitable after rice.'),
    ).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('restores the selected language from cache on refresh without calling n8n', async () => {
    const input = completeAssessmentInput('th')
    seedLiveResult(narooGuidanceResponse({ language: 'th' }), input)
    saveLiveGuidanceResult(
      adaptNarooResponse(narooGuidanceResponse({ language: 'en' })),
      assessmentFingerprint(input),
      'en',
    )
    const view = render(<App />)
    expect(
      await screen.findByText('ถั่วเขียวอาจเหมาะสมหลังนาข้าว'),
    ).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()

    view.unmount()
    window.location.hash = '#/guidance'
    render(<App />)
    expect(
      await screen.findByText('ถั่วเขียวอาจเหมาะสมหลังนาข้าว'),
    ).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('does not overwrite a successful cached result after a failed language fetch', async () => {
    const user = userEvent.setup()
    const input = completeAssessmentInput('en')
    const english = narooGuidanceResponse({ language: 'en' })
    seedLiveResult(english, input)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )

    render(<App />)
    expect(
      await screen.findByText('Mung bean may be suitable after rice.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('button', { name: 'ไทย' }))
    expect(
      await screen.findByText(/could not finish the analysis|วิเคราะห์ไม่สำเร็จ/i),
    ).toBeInTheDocument()

    const fingerprint = assessmentFingerprint(input)
    expect(peekStoredResponse(fingerprint, 'en')?.aiExplanation.headline).toBe(
      english.aiExplanation.headline,
    )
    expect(peekStoredResponse(fingerprint, 'th')).toBeNull()

    await user.click(screen.getByRole('button', { name: /open menu|เปิดเมนู/i }))
    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(
      await screen.findByText('Mung bean may be suitable after rice.'),
    ).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('invalidates both cached languages when an assessment answer changes', async () => {
    const user = userEvent.setup()
    const input = completeAssessmentInput('en')
    seedLiveResult(narooGuidanceResponse({ language: 'en' }), input)
    saveLiveGuidanceResult(
      adaptNarooResponse(narooGuidanceResponse({ language: 'th' })),
      assessmentFingerprint(input),
      'th',
    )
    render(<App />)
    expect(
      await screen.findByText('Mung bean may be suitable after rice.'),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /edit farm information/i }),
    )
    await user.selectOptions(
      await screen.findByRole('combobox', { name: /district|อำเภอ/i }),
      'phon_thong',
    )

    const fingerprint = assessmentFingerprint(input)
    expect(peekStoredResponse(fingerprint, 'en')).toBeNull()
    expect(peekStoredResponse(fingerprint, 'th')).toBeNull()
    expect(sessionStorage.getItem(LIVE_GUIDANCE_STORAGE_KEY)).toBeNull()
  })

  it('shows the weather timing clarification in Thai', async () => {
    seedLiveResult(
      narooGuidanceResponse({ language: 'th' }),
      completeAssessmentInput('th'),
    )
    window.location.hash = '#/weather'
    render(<App />)
    expect(
      await screen.findByText(t('th', 'weather_forecast_timing_note')),
    ).toBeInTheDocument()
  })
})
