import { describe, expect, it } from 'vitest'
import { SUPPORTED_PROVINCES } from '@/config/locations'
import {
  DISTRICT_SUPPORT_CONTACTS,
  ROI_ET_PROVINCIAL_OFFICE,
  getDistrictSupportContact,
  hasCompleteDirectContact,
  normalizeTelHref,
  shouldShowProvincialFallback,
} from '@/config/supportContacts'

describe('district support contact registry', () => {
  const formDistricts = SUPPORTED_PROVINCES[0]?.districts ?? []

  it('covers every assessment-form district token', () => {
    expect(formDistricts).toHaveLength(20)
    for (const district of formDistricts) {
      const contact = getDistrictSupportContact(district.id)
      expect(contact, district.id).not.toBeNull()
      expect(contact?.district).toBe(district.id)
      expect(DISTRICT_SUPPORT_CONTACTS[district.id]?.websiteUrl).toMatch(
        /^https:\/\/roiet\.doae\.go\.th\//,
      )
    }
  })

  it('keeps Phon Thong as a fully verified direct contact', () => {
    const phonThong = getDistrictSupportContact('phon_thong')
    expect(phonThong).not.toBeNull()
    if (!phonThong) {
      return
    }
    expect(hasCompleteDirectContact(phonThong)).toBe(true)
    expect(phonThong.phone).toBe('043-571-462')
    expect(phonThong.email).toBe('Phonthong.roi@doae.go.th')
    expect(normalizeTelHref(phonThong.phone ?? '')).toBe('tel:+6643571462')
    expect(shouldShowProvincialFallback(phonThong)).toBe(false)
  })

  it('does not copy Phon Thong details onto other districts', () => {
    for (const id of ['pho_chai', 'nong_phok', 'pathum_rat', 'selaphum', 'at_samat']) {
      const contact = getDistrictSupportContact(id)
      expect(contact).not.toBeNull()
      if (!contact) {
        continue
      }
      expect(contact.websiteUrl).not.toContain('phonthong-101')
      expect(contact.phone).not.toBe('043-571-462')
      expect(contact.email?.toLowerCase()).not.toBe('phonthong.roi@doae.go.th')
    }
  })

  it('omits unverified At Samat phone, email, and address', () => {
    const atSamat = getDistrictSupportContact('at_samat')
    expect(atSamat).not.toBeNull()
    if (!atSamat) {
      return
    }
    expect(atSamat.phone).toBeUndefined()
    expect(atSamat.email).toBeUndefined()
    expect(atSamat.addressTh).toBeUndefined()
    expect(hasCompleteDirectContact(atSamat)).toBe(false)
    expect(shouldShowProvincialFallback(atSamat)).toBe(true)
    expect(atSamat.websiteUrl).toBe('https://roiet.doae.go.th/atsamat-101/')
  })

  it('treats Selaphum as incomplete because no verified email was published', () => {
    const selaphum = getDistrictSupportContact('selaphum')
    expect(selaphum).not.toBeNull()
    if (!selaphum) {
      return
    }
    expect(selaphum.phone).toBe('043-551-458')
    expect(selaphum.email).toBeUndefined()
    expect(shouldShowProvincialFallback(selaphum)).toBe(true)
  })

  it('falls back to the provincial office for unknown or missing districts', () => {
    expect(getDistrictSupportContact('')).toBeNull()
    expect(getDistrictSupportContact('unknown_amphoe')).toBeNull()
    expect(shouldShowProvincialFallback(null)).toBe(true)
    expect(ROI_ET_PROVINCIAL_OFFICE.phone).toBe('043-569-004')
    expect(ROI_ET_PROVINCIAL_OFFICE.email).toBe('roiet@doae.go.th')
    expect(normalizeTelHref(ROI_ET_PROVINCIAL_OFFICE.phone)).toBe('tel:+6643569004')
  })
})
