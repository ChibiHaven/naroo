import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import {
  ASSESSMENT_STORAGE_KEY,
  LANGUAGE_STORAGE_KEY,
} from '@/utils/sessionStorage'

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
  await user.click(screen.getByRole('radio', { name: /lowland paddy|นาที่ลุ่ม/i }))
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
  })

  it('completes the three-step form and renders prototype mung-bean guidance', async () => {
    const user = userEvent.setup()
    render(<App />)

    await completeThreeStepForm(user)
    expect(screen.getByText(/your farm summary|สรุปข้อมูลนา/i)).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /get my guidance|ดูคำแนะนำ/i }),
    )

    expect(
      await screen.findByText('PROTOTYPE GUIDANCE — NOT LIVE AGRICULTURAL ADVICE'),
    ).toBeInTheDocument()
    expect(screen.getByText(/^Mung bean$|^ถั่วเขียว$/i)).toBeInTheDocument()
    expect(screen.getByText('Suitable')).toBeInTheDocument()
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

  it('protects later routes when earlier steps are incomplete', async () => {
    window.location.hash = '#/assessment/step-3'
    render(<App />)
    expect(
      await screen.findByText(/where is your farm|นาของคุณอยู่ที่ไหน/i),
    ).toBeInTheDocument()
  })
})
