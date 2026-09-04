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
  clone.querySelectorAll('details, svg, [aria-hidden="true"]').forEach((node) => {
    node.remove()
  })
  return clone.textContent ?? ''
}

function assertNoSvgArtifacts() {
  for (const svg of document.querySelectorAll('svg')) {
    expect(svg.closest('[aria-hidden="true"]')).not.toBeNull()
  }
  const visible = farmerFacingText()
  expect(visible).not.toMatch(/svg/i)
  expect(visible).not.toMatch(/^\s*[-*•]\s*$/m)
  for (const item of document.querySelectorAll('main li')) {
    const text = item.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    expect(text).not.toBe('')
    expect(text).not.toMatch(/^[-*•]$/)
    expect(text).not.toMatch(/^svg/i)
  }
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
      await screen.findAllByText(/preliminarily suitable|Phon Thong/i),
    ).not.toHaveLength(0)
    const visible = farmerFacingText()
    expect(visible).not.toMatch(/roi_et|phon_thong|lowland_paddy|learn_mung_bean|R3_DRAINAGE_POOR/)
    expect(visible).toContain(t('en', 'why_suitable'))
    expect(visible).not.toContain('Lowland paddy field type')
    assertNoSvgArtifacts()

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
    expect(await screen.findAllByText(/โพนทอง|ร้อยเอ็ด/)).not.toHaveLength(0)
    const visible = farmerFacingText()
    expect(visible).not.toMatch(/roi_et|phon_thong|lowland_paddy/)
    expect(visible).toContain(t('th', 'why_suitable'))
    expect(visible).toContain(t('th', 'next_step_confirm_residual_moisture'))
    assertNoSvgArtifacts()
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
    expect((await screen.findAllByText('ควรตรวจสอบเพิ่มเติม')).length).toBeGreaterThan(0)
    const visible = farmerFacingText()
    expect(visible).toContain('นาลุ่ม')
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
    expect((await screen.findAllByText('Further review recommended')).length).toBeGreaterThan(0)
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
    expect((await screen.findAllByText('Expert review required')).length).toBeGreaterThan(0)
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
    expect(
      screen.getByText('Typical weather in November'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(t('en', 'typical_weather_11')),
    ).toBeInTheDocument()
    expect(
      screen.getByText(t('en', 'typical_weather_disclaimer')),
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
    expect(screen.getByRole('link', { name: t('en', 'call_office') })).toHaveAttribute(
      'href',
      'tel:+6643571462',
    )
    expect(screen.getByRole('link', { name: t('en', 'email_office') })).toHaveAttribute(
      'href',
      'mailto:Phonthong.roi@doae.go.th',
    )
    expect(
      screen.getByRole('link', { name: t('en', 'visit_official_website') }),
    ).toHaveAttribute('href', 'https://roiet.doae.go.th/phonthong-101/')
    expect(
      screen.queryByText(/Roi Et Provincial Agricultural Extension Office/),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(t('en', 'contact_not_connected'))).not.toBeInTheDocument()
  })

  it('does not show the Phon Thong contact for other districts', async () => {
    seedLiveResult(narooGuidanceResponse(), {
      ...completeAssessmentInput('en'),
      district: 'selaphum',
    })
    window.location.hash = '#/expert-support'
    render(<App />)
    expect(
      await screen.findByText(/Selaphum District Agricultural Extension Office/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Roi Et Provincial Agricultural Extension Office/),
    ).toBeInTheDocument()
    expect(screen.queryByText(/043-571-462/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Phonthong.roi@doae.go.th/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: t('en', 'email_office') })).toHaveAttribute(
      'href',
      'mailto:roiet@doae.go.th',
    )
    const websites = screen.getAllByRole('link', {
      name: t('en', 'visit_official_website'),
    })
    expect(websites[0]).toHaveAttribute(
      'href',
      'https://roiet.doae.go.th/selaphum-101/',
    )
    expect(websites[1]).toHaveAttribute('href', 'https://roiet.doae.go.th/')
    expect(websites[0]).toHaveAttribute('target', '_blank')
    expect(websites[0]).toHaveAttribute('rel', 'noreferrer noopener')
  })

  it('shows district-specific official pages for Pho Chai, Nong Phok, and Pathum Rat', async () => {
    const cases = [
      {
        district: 'pho_chai' as const,
        name: 'Pho Chai District Agricultural Extension Office',
        href: 'https://roiet.doae.go.th/phochai-101/',
        email: 'mailto:Phochai.roi@doae.go.th',
      },
      {
        district: 'nong_phok' as const,
        name: 'Nong Phok District Agricultural Extension Office',
        href: 'https://roiet.doae.go.th/nongphok-101/',
        email: 'mailto:nongphok.roi@doae.go.th',
      },
      {
        district: 'pathum_rat' as const,
        name: 'Pathum Rat District Agricultural Extension Office',
        href: 'https://roiet.doae.go.th/pathumrat-101/',
        email: 'mailto:pathumrat.roiet@doae.go.th',
      },
    ]

    for (const example of cases) {
      window.location.hash = '#/expert-support'
      seedLiveResult(narooGuidanceResponse(), {
        ...completeAssessmentInput('en'),
        district: example.district,
      })
      const view = render(<App />)
      expect(await screen.findByText(example.name)).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: t('en', 'visit_official_website') }),
      ).toHaveAttribute('href', example.href)
      expect(
        screen.getByRole('link', { name: t('en', 'email_office') }),
      ).toHaveAttribute('href', example.email)
      expect(screen.queryByText(/Phon Thong District/)).not.toBeInTheDocument()
      expect(farmerFacingText()).not.toContain(example.district)
      expect(screen.queryByText(t('en', 'contact_not_connected'))).not.toBeInTheDocument()
      view.unmount()
    }
  })

  it('hides missing At Samat rows and shows the provincial fallback', async () => {
    seedLiveResult(narooGuidanceResponse(), {
      ...completeAssessmentInput('en'),
      district: 'at_samat',
    })
    window.location.hash = '#/expert-support'
    render(<App />)
    expect(
      await screen.findByText(/At Samat District Agricultural Extension Office/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Roi Et Provincial Agricultural Extension Office/),
    ).toBeInTheDocument()
    expect(screen.queryByText(/043-512-913/)).not.toBeInTheDocument()
    expect(screen.queryByText(/mueang\.roi@doae\.go\.th/i)).not.toBeInTheDocument()
    const websites = screen.getAllByRole('link', {
      name: t('en', 'visit_official_website'),
    })
    expect(websites[0]).toHaveAttribute(
      'href',
      'https://roiet.doae.go.th/atsamat-101/',
    )
    expect(websites[1]).toHaveAttribute('href', 'https://roiet.doae.go.th/')
    expect(screen.getAllByRole('link', { name: t('en', 'call_office') })).toHaveLength(1)
    expect(screen.getByRole('link', { name: t('en', 'call_office') })).toHaveAttribute(
      'href',
      'tel:+6643569004',
    )
    expect(farmerFacingText()).not.toContain('at_samat')
    expect(screen.queryByText(t('en', 'contact_not_connected'))).not.toBeInTheDocument()
  })

  it('falls back to the provincial office for an unknown district', async () => {
    seedLiveResult(narooGuidanceResponse(), {
      ...completeAssessmentInput('en'),
      district: 'unknown_amphoe',
    })
    window.location.hash = '#/expert-support'
    render(<App />)
    expect(
      await screen.findByText(/Roi Et Provincial Agricultural Extension Office/),
    ).toBeInTheDocument()
    expect(screen.queryByText(/District Agricultural Extension Office/)).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: t('en', 'visit_official_website') }),
    ).toHaveAttribute('href', 'https://roiet.doae.go.th/')
    expect(farmerFacingText()).not.toContain('unknown_amphoe')
    expect(screen.queryByText(t('en', 'contact_not_connected'))).not.toBeInTheDocument()
  })

  it('switches Local Support office names and buttons without calling n8n', async () => {
    const user = userEvent.setup()
    seedLiveResult(narooGuidanceResponse(), {
      ...completeAssessmentInput('en'),
      district: 'pho_chai',
    })
    window.location.hash = '#/expert-support'
    render(<App />)
    expect(
      await screen.findByText(/Pho Chai District Agricultural Extension Office/),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: t('en', 'call_office') })).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('button', { name: 'ไทย' }))
    expect(
      await screen.findByText('สำนักงานเกษตรอำเภอโพธิ์ชัย'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'โทรติดต่อ' })).toHaveAttribute(
      'href',
      'tel:+6643567033',
    )
    expect(screen.getByRole('link', { name: 'ส่งอีเมล' })).toHaveAttribute(
      'href',
      'mailto:Phochai.roi@doae.go.th',
    )
    expect(screen.getByRole('link', { name: 'เปิดเว็บไซต์สำนักงาน' })).toHaveAttribute(
      'href',
      'https://roiet.doae.go.th/phochai-101/',
    )
    expect(screen.getByText(t('th', 'contact_verify_notice'))).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
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
      await screen.findByText(/มีความเหมาะสมเบื้องต้นสำหรับถั่วเขียว/),
    ).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: /เปิดเมนู|open menu/i }))
    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(
      await screen.findByText(/preliminarily suitable for mung bean/i),
    ).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('button', { name: 'ไทย' }))
    expect(
      await screen.findByText(/มีความเหมาะสมเบื้องต้นสำหรับถั่วเขียว/),
    ).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)

    await user.click(screen.getByRole('button', { name: /เปิดเมนู|open menu/i }))
    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(
      await screen.findByText(/preliminarily suitable for mung bean/i),
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
      await screen.findByText(/มีความเหมาะสมเบื้องต้นสำหรับถั่วเขียว/),
    ).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()

    view.unmount()
    window.location.hash = '#/guidance'
    render(<App />)
    expect(
      await screen.findByText(/มีความเหมาะสมเบื้องต้นสำหรับถั่วเขียว/),
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
      await screen.findByText(/preliminarily suitable for mung bean/i),
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
      await screen.findByText(/preliminarily suitable for mung bean/i),
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
      await screen.findByText(/preliminarily suitable for mung bean/i),
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
    expect(screen.getByText('สภาพอากาศโดยทั่วไปในเดือนพฤศจิกายน')).toBeInTheDocument()
    expect(
      screen.getByText(t('th', 'typical_weather_11')),
    ).toBeInTheDocument()
  })

  it('shows weather context sentences once and typical weather for the planting month', async () => {
    seedLiveResult(narooGuidanceResponse())
    window.location.hash = '#/guidance'
    render(<App />)
    expect(await screen.findByText(t('en', 'weather_context'))).toBeInTheDocument()
    const visible = farmerFacingText()
    const live = t('en', 'weather_context_live')
    const timing = t('en', 'weather_forecast_timing_note')
    expect(visible.split(live)).toHaveLength(2)
    expect(visible.split(timing)).toHaveLength(2)
    expect(screen.getByText('Typical weather in November')).toBeInTheDocument()
    expect(screen.getByText(t('en', 'typical_weather_11'))).toBeInTheDocument()
    expect(screen.getByText(t('en', 'typical_weather_disclaimer'))).toBeInTheDocument()
  })

  it('presents R5 September escalation from structured data, not AI prose', async () => {
    const input = {
      ...completeAssessmentInput('en'),
      district: 'pathum_rat',
      fieldType: 'upland' as const,
      previousCrop: 'mung_bean' as const,
      plantingMonth: 9,
      waterSource: 'rainfed' as const,
      drainageCondition: 'moderate' as const,
      soilKnowledge: 'yes' as const,
      soilType: 'ดินร่วน',
    }
    const response = narooGuidanceResponse({
      language: 'en',
      classification: 'escalate',
      confidence: 'medium',
      requiresExpertSupport: true,
      borderlineReasons: ['previous_crop', 'drainage_moderate'],
      decisionTrace: {
        classification: 'escalate',
        confidence: 'medium',
        hardEscalate: true,
        requiresExpertSupport: true,
        matchedRuleId: 'R5_PLANTING_MONTH',
        matchedRuleDescription: 'Planting month is borderline',
        ruleIds: ['R2_CRITICAL_INFO', 'R5_PLANTING_MONTH'],
        borderlineReasons: ['previous_crop', 'drainage_moderate'],
        rules: [
          {
            id: 'R2_CRITICAL_INFO',
            description: 'Critical information is present',
            result: 'pass',
          },
          {
            id: 'R5_PLANTING_MONTH',
            description: 'Planting month is borderline',
            result: 'escalate',
          },
          {
            id: 'borderline_previous_legume',
            description: 'Previous mung bean',
            result: 'borderline',
          },
          {
            id: 'drainage_moderate',
            description: 'Moderate drainage',
            result: 'borderline',
          },
        ],
      },
      input: {
        province: 'roi_et',
        district: 'pathum_rat',
        fieldType: 'upland',
        previousCrop: 'mung_bean',
        plantingMonth: 9,
        waterSource: 'rainfed',
        drainageCondition: 'moderate',
      },
      aiExplanation: {
        generated: true,
        language: 'en',
        headline: 'September is a borderline planting month',
        summary: 'classification: escalate; province=Roi Et; fieldType=Lowland paddy',
        nextSteps: [
          'province=Roi Et; fieldType=Lowland paddy',
          'Use this September forecast to plant in December',
          'Walk the field and speak with an officer',
        ],
      },
    })
    seedLiveResult(response, input)
    render(<App />)

    expect((await screen.findAllByText('Expert review required')).length).toBeGreaterThan(0)
    expect(
      screen.getByText(t('en', 'headline_escalate_planting_month')),
    ).toBeInTheDocument()
    const visible = farmerFacingText()
    expect(visible).not.toContain('September is a borderline')
    expect(visible).not.toMatch(/is a borderline planting month/i)
    expect(visible).not.toContain(t('en', 'missing_uncertain'))
    expect(visible).toContain(t('en', 'rule_planting_month_outside'))
    expect(visible).toContain(t('en', 'concern_previous_mung_bean'))
    expect(visible).toContain(t('en', 'concern_drainage_moderate'))
    expect(visible).toContain('ดินร่วน')
    expect(visible).not.toContain('ดินร่วง')
    expect(visible).not.toContain('province=')
    expect(visible).not.toMatch(/September \(September\)/)
    expect(visible).toContain(t('en', 'next_step_consult_before_planting'))
    expect(visible).toContain(
      t('en', 'next_step_explain_previous_crop', {
        crop: t('en', 'previous_mung_bean'),
      }),
    )
    expect(visible).toContain(t('en', 'next_step_confirm_moisture_drainage'))
    expect(visible).not.toContain('Walk the field and speak with an officer')
    expect(visible).not.toContain('plant in December')
    expect(visible).not.toContain('September is a borderline')
    assertNoSvgArtifacts()

    const stored = peekStoredResponse(assessmentFingerprint(input), 'en')
    expect(stored?.aiExplanation.headline).toContain('borderline')
    expect(stored?.aiExplanation.summary).toContain('province=Roi Et')
  })

  it('uses a drainage-specific headline for R3 escalate', async () => {
    seedLiveResult(
      narooGuidanceResponse({
        classification: 'escalate',
        requiresExpertSupport: true,
        decisionTrace: {
          classification: 'escalate',
          confidence: 'low',
          hardEscalate: true,
          requiresExpertSupport: true,
          matchedRuleId: 'R3_DRAINAGE_POOR',
          matchedRuleDescription: 'Poor drainage',
          ruleIds: ['R3_DRAINAGE_POOR'],
          borderlineReasons: [],
          rules: [
            {
              id: 'R3_DRAINAGE_POOR',
              description: 'Poor drainage',
              result: 'escalate',
            },
          ],
        },
      }),
    )
    render(<App />)
    expect(
      await screen.findByText(t('en', 'headline_escalate_drainage')),
    ).toBeInTheDocument()
  })

  it('keeps Thai farmer-facing text free of known English labels', async () => {
    const input = {
      ...completeAssessmentInput('th'),
      district: 'nong_phok',
      fieldType: 'upland' as const,
      waterSource: 'rainfed' as const,
      soilType: 'ดินร่วน',
      soilKnowledge: 'yes' as const,
    }
    seedLiveResult(
      narooGuidanceResponse({
        language: 'th',
        classification: 'borderline',
        requiresExpertSupport: true,
        input: {
          province: 'roi_et',
          district: 'nong_phok',
          fieldType: 'upland',
          previousCrop: 'rice',
          plantingMonth: 11,
          waterSource: 'rainfed',
          drainageCondition: 'good',
          soilKnowledge: 'yes',
          soilType: 'ดินร่วน',
        },
        aiExplanation: {
          generated: true,
          language: 'th',
          headline: 'Roi Et Nong Phok upland rainfed classification edge',
          summary: 'Use Lowland paddy in Pathum Rat',
          nextSteps: ['ตรวจแปลง'],
        },
      }),
      input,
    )
    render(<App />)
    expect((await screen.findAllByText('ควรตรวจสอบเพิ่มเติม')).length).toBeGreaterThan(0)
    const visible = farmerFacingText()
    expect(visible).toContain('หนองพอก')
    expect(visible).toContain('ที่ดอน')
    expect(visible).toContain('อาศัยน้ำฝน')
    expect(visible).toContain('ดินร่วน')
    expect(visible).not.toMatch(/Roi Et|Nong Phok|Pathum Rat|Upland|Rainfed|classification/i)
    expect(visible).not.toContain(t('th', 'missing_uncertain'))
  })
})
