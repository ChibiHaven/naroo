import { describe, expect, it } from 'vitest'
import { typicalMonthlyWeatherCopy } from '@/config/typicalMonthlyWeather'
import { t } from '@/i18n/translations'
import { displayMonthName } from '@/utils/displayLabels'

const EXPECTED = {
  1: {
    en: 'Usually cool and dry, with low rainfall and limited natural soil moisture.',
    th: 'โดยทั่วไปอากาศเย็นและแห้ง มีฝนน้อย และความชื้นตามธรรมชาติในดินค่อนข้างจำกัด',
  },
  2: {
    en: 'Usually dry and gradually warmer, with little rainfall.',
    th: 'โดยทั่วไปอากาศแห้งและเริ่มอุ่นขึ้น โดยมีฝนตกเล็กน้อย',
  },
  3: {
    en: 'Usually hot and dry, although occasional summer storms may occur.',
    th: 'โดยทั่วไปอากาศร้อนและแห้ง แต่อาจมีพายุฤดูร้อนเกิดขึ้นเป็นครั้งคราว',
  },
  4: {
    en: 'Usually very hot, with an increasing chance of short thunderstorms.',
    th: 'โดยทั่วไปอากาศร้อนจัด และมีโอกาสเกิดฝนฟ้าคะนองระยะสั้นเพิ่มขึ้น',
  },
  5: {
    en: 'Usually hot and humid as the rainy season begins and rainfall becomes more frequent.',
    th: 'โดยทั่วไปอากาศร้อนชื้น เนื่องจากเริ่มเข้าสู่ฤดูฝนและมีฝนตกบ่อยขึ้น',
  },
  6: {
    en: 'Usually warm, humid, and rainy, with regular rainfall during the month.',
    th: 'โดยทั่วไปอากาศอบอุ่น ชื้น และมีฝนตกอย่างสม่ำเสมอตลอดเดือน',
  },
  7: {
    en: 'Usually humid and rainy, with frequent showers and increasing soil moisture.',
    th: 'โดยทั่วไปอากาศชื้นและมีฝนตกบ่อย ทำให้ความชื้นในดินเพิ่มขึ้น',
  },
  8: {
    en: 'Usually very wet and humid, with frequent or heavy rainfall.',
    th: 'โดยทั่วไปมีความชื้นสูงและฝนตกบ่อย โดยอาจมีฝนตกหนักในบางช่วง',
  },
  9: {
    en: 'Usually one of the wettest periods, with heavy rainfall and possible waterlogging.',
    th: 'โดยทั่วไปเป็นหนึ่งในช่วงที่มีฝนตกมากที่สุด อาจมีฝนตกหนักและเกิดน้ำขังได้',
  },
  10: {
    en: 'Rainfall usually begins to decrease as the rainy season approaches its end.',
    th: 'โดยทั่วไปปริมาณฝนเริ่มลดลงเมื่อฤดูฝนใกล้สิ้นสุด',
  },
  11: {
    en: 'Usually cooler and drier, with declining rainfall and soil moisture.',
    th: 'โดยทั่วไปอากาศเย็นและแห้งขึ้น โดยปริมาณฝนและความชื้นในดินเริ่มลดลง',
  },
  12: {
    en: 'Usually cool and dry, with little rainfall.',
    th: 'โดยทั่วไปอากาศเย็นและแห้ง โดยมีฝนตกน้อย',
  },
} as const

describe('typical monthly weather copy', () => {
  it('hides the subsection when no planting month is available', () => {
    expect(typicalMonthlyWeatherCopy('en', null)).toBeNull()
    expect(typicalMonthlyWeatherCopy('th', 0)).toBeNull()
    expect(typicalMonthlyWeatherCopy('en', 13)).toBeNull()
  })

  it('returns bilingual heading, description, and disclaimer for every month', () => {
    for (const month of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const) {
      const english = typicalMonthlyWeatherCopy('en', month)
      const thai = typicalMonthlyWeatherCopy('th', month)
      expect(english).not.toBeNull()
      expect(thai).not.toBeNull()
      expect(english?.heading).toBe(
        `Typical weather in ${displayMonthName(month, 'en')}`,
      )
      expect(thai?.heading).toBe(
        `สภาพอากาศโดยทั่วไปในเดือน${displayMonthName(month, 'th')}`,
      )
      expect(english?.description).toBe(EXPECTED[month].en)
      expect(thai?.description).toBe(EXPECTED[month].th)
      expect(english?.disclaimer).toBe(t('en', 'typical_weather_disclaimer'))
      expect(thai?.disclaimer).toBe(t('th', 'typical_weather_disclaimer'))
      expect(english?.description.toLowerCase()).not.toContain('forecast')
      expect(thai?.description).not.toContain('พยากรณ์')
    }
  })
})
