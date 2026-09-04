import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import {
  ASSESSMENT_STORAGE_KEY,
  LANGUAGE_STORAGE_KEY,
} from '@/utils/sessionStorage'
import { LIVE_GUIDANCE_STORAGE_KEY } from '@/utils/liveResultStorage'
import * as rulesEngine from '@/services/rulesEngine'
import * as prototypeModule from '@/services/prototypeGuidanceService'
import * as demoWeather from '@/services/demoWeatherService'
import {
  n8nGuidanceService,
  resetN8nGuidanceInFlightForTests,
} from '@/services/n8nGuidanceService'
import {
  jsonResponse,
  N8N_TEST_WEBHOOK_URL,
  narooGuidanceResponse,
  narooValidationError,
  unavailableWeather,
} from '@/test/narooFixtures'

async function completeThreeStepForm(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.click(
    screen.getByRole('button', {
      name: /get farm guidance|รับคำแนะนำสำหรับนา/i,
    }),
  )

  await user.selectOptions(
    screen.getByRole('combobox', { name: /district|อำเภอ/i }),
    'selaphum',
  )
  await user.click(screen.getByRole('radio', { name: /lowland paddy|นาลุ่ม/i }))
  await user.click(screen.getByRole('radio', { name: /^rice$|^ข้าว$/i }))
  await user.click(screen.getByRole('button', { name: /continue|ต่อไป/i }))

  await user.selectOptions(
    screen.getByRole('combobox', { name: /plant mung bean|ปลูกถั่วเขียว/i }),
    '11',
  )
  await user.click(
    screen.getByRole('radio', {
      name: /residual soil moisture|ความชื้นดินหลังเกี่ยวข้าว/i,
    }),
  )
  await user.click(screen.getByRole('radio', { name: /^good$|ระบายน้ำดี/i }))
  await user.click(screen.getByRole('button', { name: /continue|ต่อไป/i }))

  fireEvent.change(screen.getByLabelText(/how large|พื้นที่กี่ไร่/i), {
    target: { value: '5' },
  })
  await user.click(screen.getByRole('radio', { name: /^yes$|^รู้$/i }))
  await user.click(
    screen.getByRole('radio', {
      name: /learn whether mung bean|ถั่วเขียวเหมาะกับแปลง/i,
    }),
  )
}

describe('revised assessment journey', () => {
  beforeEach(() => {
    sessionStorage.clear()
    window.location.hash = '#/'
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    resetN8nGuidanceInFlightForTests()
    vi.stubEnv('VITE_N8N_WEBHOOK_URL', N8N_TEST_WEBHOOK_URL)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(narooGuidanceResponse())),
    )
  })

  afterEach(() => {
    resetN8nGuidanceInFlightForTests()
    n8nGuidanceService.webhookUrlOverride = undefined
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('completes the three-step form and renders live n8n mung-bean guidance', async () => {
    const user = userEvent.setup()
    const classifySpy = vi.spyOn(rulesEngine, 'classifyFarmAssessment')
    const prototypeSpy = vi.spyOn(
      prototypeModule.prototypeGuidanceService,
      'analyze',
    )
    render(<App />)

    await completeThreeStepForm(user)
    expect(screen.getByText(/your farm summary|สรุปข้อมูลนา/i)).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /get my guidance|ดูคำแนะนำ/i }),
    )

    expect(
      await screen.findByText('PROTOTYPE GUIDANCE — NOT LIVE AGRICULTURAL ADVICE'),
    ).toBeInTheDocument()
    expect(screen.getByText(/preliminarily suitable for mung bean/i)).toBeInTheDocument()
    expect(screen.getByText(/^Mung bean$|^ถั่วเขียว$/i)).toBeInTheDocument()
    expect(screen.getAllByText('Likely suitable').length).toBeGreaterThan(0)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(classifySpy).not.toHaveBeenCalled()
    expect(prototypeSpy).not.toHaveBeenCalled()
  })

  it('supports edit navigation and starting a new assessment', async () => {
    const user = userEvent.setup()
    render(<App />)

    await completeThreeStepForm(user)
    await user.click(screen.getByRole('link', { name: /edit|แก้ไข/i }))
    expect(
      await screen.findByText(/where is your farm|นาของคุณอยู่ที่ไหน/i),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /continue|ต่อไป/i }))
    await user.click(screen.getByRole('button', { name: /continue|ต่อไป/i }))
    await user.click(
      screen.getByRole('button', { name: /get my guidance|ดูคำแนะนำ/i }),
    )
    expect(
      await screen.findByText('PROTOTYPE GUIDANCE — NOT LIVE AGRICULTURAL ADVICE'),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: /start new assessment|เริ่มประเมินใหม่/i,
      }),
    )
    expect(
      await screen.findByRole('button', {
        name: /get farm guidance|รับคำแนะนำสำหรับนา/i,
      }),
    ).toBeInTheDocument()
    expect(sessionStorage.getItem(ASSESSMENT_STORAGE_KEY)).toBeTruthy()
    expect(sessionStorage.getItem(LIVE_GUIDANCE_STORAGE_KEY)).toBeNull()
  })

  it('switches language between English and Thai', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('button', { name: 'ไทย' }))
    expect(sessionStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('th')
    expect(
      await screen.findByRole('heading', { name: /ช่วยตัดสินใจปลูกพืช/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(
      await screen.findByRole('heading', {
        name: /make a better crop decision/i,
      }),
    ).toBeInTheDocument()
  })

  it('restores session values after remount', async () => {
    const user = userEvent.setup()
    const view = render(<App />)

    await user.click(
      screen.getByRole('button', {
        name: /get farm guidance|รับคำแนะนำสำหรับนา/i,
      }),
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: /district|อำเภอ/i }),
      'selaphum',
    )

    view.unmount()
    window.location.hash = '#/'
    render(<App />)

    await user.click(
      screen.getByRole('button', {
        name: /get farm guidance|รับคำแนะนำสำหรับนา/i,
      }),
    )

    await waitFor(() => {
      expect(
        (
          screen.getByRole('combobox', {
            name: /district|อำเภอ/i,
          }) as HTMLSelectElement
        ).value,
      ).toBe('selaphum')
    })
  })

  it('restores a saved n8n result on remount without calling n8n or local rules', async () => {
    const user = userEvent.setup()
    const classifySpy = vi.spyOn(rulesEngine, 'classifyFarmAssessment')
    const view = render(<App />)

    await completeThreeStepForm(user)
    await user.click(
      screen.getByRole('button', { name: /get my guidance|ดูคำแนะนำ/i }),
    )
    expect(
      await screen.findByText(/preliminarily suitable for mung bean/i),
    ).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(1)

    view.unmount()
    vi.mocked(fetch).mockClear()
    classifySpy.mockClear()

    window.location.hash = '#/guidance'
    render(<App />)

    expect(
      await screen.findByText(/preliminarily suitable for mung bean/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/req-test-001/)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
    expect(classifySpy).not.toHaveBeenCalled()
  })

  it('protects later routes when earlier steps are incomplete', async () => {
    window.location.hash = '#/assessment/step-3'
    render(<App />)
    expect(
      await screen.findByText(/where is your farm|นาของคุณอยู่ที่ไหน/i),
    ).toBeInTheDocument()
  })

  it('shows a validation error and keeps answers when HTTP 400 is returned', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(narooValidationError(), 400)),
    )
    const user = userEvent.setup()
    render(<App />)

    await completeThreeStepForm(user)
    await user.click(
      screen.getByRole('button', { name: /get my guidance|ดูคำแนะนำ/i }),
    )

    expect(
      await screen.findByText(/could not finish the analysis|วิเคราะห์ไม่สำเร็จ/i),
    ).toBeInTheDocument()
    expect(screen.getAllByText(/plantingMonth/).length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: /edit answers|แก้ไขคำตอบ/i }))
    expect(
      await screen.findByText(/timing and water|ช่วงเวลาปลูกและน้ำ/i),
    ).toBeInTheDocument()
    expect(
      (screen.getByRole('combobox', { name: /plant mung bean|ปลูกถั่วเขียว/i }) as HTMLSelectElement)
        .value,
    ).toBe('11')
  })

  it('retries manually after a network failure', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(jsonResponse(narooGuidanceResponse()))
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    render(<App />)
    await completeThreeStepForm(user)
    await user.click(
      screen.getByRole('button', { name: /get my guidance|ดูคำแนะนำ/i }),
    )

    expect(
      await screen.findByRole('button', { name: /retry|ลองอีกครั้ง/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /retry|ลองอีกครั้ง/i }))
    expect(
      await screen.findByText(/preliminarily suitable for mung bean/i),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('renders weather from the n8n response and does not call the demo weather service', async () => {
    const weatherSpy = vi.spyOn(demoWeather.demoWeatherService, 'getSnapshot')
    const user = userEvent.setup()
    render(<App />)

    await completeThreeStepForm(user)
    await user.click(
      screen.getByRole('button', { name: /get my guidance|ดูคำแนะนำ/i }),
    )
    expect(
      await screen.findByText(/preliminarily suitable for mung bean/i),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /view 7-day forecast|ดูพยากรณ์อากาศ 7 วัน/i }))
    expect(await screen.findByText(/Open-Meteo/)).toBeInTheDocument()
    expect(screen.getAllByText(/September|ก\.ย\.|กันยายน/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/weather code|รหัสอากาศ/i).closest('details')).not.toBeNull()
    expect(weatherSpy).not.toHaveBeenCalled()
  })

  it('shows the bilingual unavailable weather state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(narooGuidanceResponse({ weather: unavailableWeather() })),
      ),
    )
    const user = userEvent.setup()
    render(<App />)

    await completeThreeStepForm(user)
    await user.click(
      screen.getByRole('button', { name: /get my guidance|ดูคำแนะนำ/i }),
    )
    await user.click(
      await screen.findByRole('button', { name: /view 7-day forecast|ดูพยากรณ์อากาศ 7 วัน/i }),
    )
    expect(
      await screen.findByText(/weather unavailable|ไม่มีข้อมูลอากาศ/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/will not invent weather values|จะไม่สร้างตัวเลขอากาศเอง/i),
    ).toBeInTheDocument()
  })

  it('shows a configuration error when the webhook env is missing', async () => {
    n8nGuidanceService.webhookUrlOverride = ''
    vi.stubEnv('VITE_N8N_WEBHOOK_URL', '')
    const user = userEvent.setup()
    render(<App />)

    await completeThreeStepForm(user)
    await user.click(
      screen.getByRole('button', { name: /get my guidance|ดูคำแนะนำ/i }),
    )
    expect(
      await screen.findByText(/not configured|ยังไม่ได้ตั้งค่าที่อยู่/i),
    ).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })
})
