import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

class MatchMediaMock {
  matches = false
  media = ''
  onchange = null
  addListener() {}
  removeListener() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return false
  }
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => {
    const media = new MatchMediaMock()
    media.media = query
    media.matches = false
    return media
  },
})
