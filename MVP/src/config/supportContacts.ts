export interface SupportContactMethod {
  id: string
  type: 'extension_officer' | 'phone' | 'office_visit' | 'other'
  titleEn: string
  titleTh: string
  descriptionEn: string
  descriptionTh: string
  connected: boolean
  value?: string
}

export interface DistrictSupportContact {
  district: string
  officeNameTh: string
  officeNameEn: string
  websiteUrl: string
  phone?: string
  email?: string
  addressTh?: string
  addressEn?: string
  sourceUrl: string
  verifiedOn: string
}

export interface ProvincialSupportContact {
  officeNameTh: string
  officeNameEn: string
  phone: string
  email: string
  websiteUrl: string
  sourceUrl: string
  addressTh?: string
  addressEn?: string
}

const VERIFIED_ON = '2026-09-04'

export const ROI_ET_PROVINCIAL_OFFICE: ProvincialSupportContact = {
  officeNameTh: 'สำนักงานเกษตรจังหวัดร้อยเอ็ด',
  officeNameEn: 'Roi Et Provincial Agricultural Extension Office',
  phone: '043-569-004',
  email: 'roiet@doae.go.th',
  websiteUrl: 'https://roiet.doae.go.th/',
  sourceUrl: 'https://roiet.doae.go.th/ติดต่อเรา/',
  addressTh:
    '138 หมู่ 4 ถนนแจ้งสนิท ตำบลนิเวศน์ อำเภอธวัชบุรี จังหวัดร้อยเอ็ด 45170',
  addressEn:
    '138 Moo 4, Chaeng Sanit Road, Niwet, Thawat Buri, Roi Et 45170',
}

export const ROI_ET_PROVINCIAL_OFFICE_URL = ROI_ET_PROVINCIAL_OFFICE.websiteUrl

export const DISTRICT_SUPPORT_CONTACTS: Record<string, DistrictSupportContact> = {
  mueang_roi_et: {
    district: 'mueang_roi_et',
    officeNameTh: 'สำนักงานเกษตรอำเภอเมืองร้อยเอ็ด',
    officeNameEn: 'Mueang Roi Et District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/mueang-101/',
    phone: '043-512-913',
    email: 'mueang.roi@doae.go.th',
    addressTh:
      '89 ถนนเทศบาลบำรุง ตำบลในเมือง อำเภอเมืองร้อยเอ็ด จังหวัดร้อยเอ็ด 45000',
    addressEn:
      '89 Thetsaban Bamrung Road, Nai Mueang, Mueang Roi Et, Roi Et 45000',
    sourceUrl: 'https://roiet.doae.go.th/mueang-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  kaset_wisai: {
    district: 'kaset_wisai',
    officeNameTh: 'สำนักงานเกษตรอำเภอเกษตรวิสัย',
    officeNameEn: 'Kaset Wisai District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/kasetwisai-101/',
    phone: '043-589-249',
    email: 'kaset.roi@doae.go.th',
    addressTh:
      'ถนนปัทมานนท์ ตำบลเกษตรวิสัย อำเภอเกษตรวิสัย จังหวัดร้อยเอ็ด 45150',
    addressEn: 'Pattamanan Road, Kaset Wisai, Kaset Wisai, Roi Et 45150',
    sourceUrl: 'https://roiet.doae.go.th/kasetwisai-101/',
    verifiedOn: VERIFIED_ON,
  },
  pathum_rat: {
    district: 'pathum_rat',
    officeNameTh: 'สำนักงานเกษตรอำเภอปทุมรัตต์',
    officeNameEn: 'Pathum Rat District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/pathumrat-101/',
    phone: '043-587-066',
    email: 'pathumrat.roiet@doae.go.th',
    addressTh: 'หมู่ 12 ตำบลบัวแดง อำเภอปทุมรัตต์ จังหวัดร้อยเอ็ด 45190',
    addressEn: 'Moo 12, Bua Daeng, Pathum Rat, Roi Et 45190',
    sourceUrl: 'https://roiet.doae.go.th/pathumrat-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  chaturaphak_phiman: {
    district: 'chaturaphak_phiman',
    officeNameTh: 'สำนักงานเกษตรอำเภอจตุรพักตรพิมาน',
    officeNameEn: 'Chaturaphak Phiman District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/chaturapak-101/',
    phone: '043-561-067',
    email: 'chaturaphak.roi@doae.go.th',
    addressTh:
      '17 หมู่ 1 ตำบลหัวช้าง อำเภอจตุรพักตรพิมาน จังหวัดร้อยเอ็ด 45180',
    addressEn: '17 Moo 1, Hua Chang, Chaturaphak Phiman, Roi Et 45180',
    sourceUrl: 'https://roiet.doae.go.th/chaturapak-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  thawat_buri: {
    district: 'thawat_buri',
    officeNameTh: 'สำนักงานเกษตรอำเภอธวัชบุรี',
    officeNameEn: 'Thawat Buri District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/thawatburi-101/',
    phone: '043-569-003',
    email: 'thawat.roi@doae.go.th',
    addressTh:
      'ถนนแจ้งสนิท หมู่ 4 ตำบลนิเวศน์ อำเภอธวัชบุรี จังหวัดร้อยเอ็ด 45170',
    addressEn: 'Chaeng Sanit Road, Moo 4, Niwet, Thawat Buri, Roi Et 45170',
    sourceUrl: 'https://roiet.doae.go.th/thawatburi-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  phanom_phrai: {
    district: 'phanom_phrai',
    officeNameTh: 'สำนักงานเกษตรอำเภอพนมไพร',
    officeNameEn: 'Phanom Phrai District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/phanomphrai-101/',
    phone: '043-591-062',
    email: 'phanom.roi@doae.go.th',
    addressTh:
      'ถนนนิคมคณารักษ์ ตำบลพนมไพร อำเภอพนมไพร จังหวัดร้อยเอ็ด 45140',
    addressEn: 'Nikhom Khanarak Road, Phanom Phrai, Phanom Phrai, Roi Et 45140',
    sourceUrl: 'https://roiet.doae.go.th/phanomphrai-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  phon_thong: {
    district: 'phon_thong',
    officeNameTh: 'สำนักงานเกษตรอำเภอโพนทอง',
    officeNameEn: 'Phon Thong District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/phonthong-101/',
    phone: '043-571-462',
    email: 'Phonthong.roi@doae.go.th',
    addressTh:
      '179 ถนนโพนทอง–หนองพอก ตำบลแวง อำเภอโพนทอง จังหวัดร้อยเอ็ด 45110',
    addressEn:
      '179 Phon Thong–Nong Phok Road, Waeng, Phon Thong, Roi Et 45110',
    sourceUrl: 'https://roiet.doae.go.th/phonthong-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  pho_chai: {
    district: 'pho_chai',
    officeNameTh: 'สำนักงานเกษตรอำเภอโพธิ์ชัย',
    officeNameEn: 'Pho Chai District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/phochai-101/',
    phone: '043-567-033',
    email: 'Phochai.roi@doae.go.th',
    addressTh:
      '143 หมู่ 2 ถนนจรจำรูญ ตำบลขามเปี้ย อำเภอโพธิ์ชัย จังหวัดร้อยเอ็ด 45230',
    addressEn: '143 Moo 2, Chonchamrun Road, Kham Pia, Pho Chai, Roi Et 45230',
    sourceUrl: 'https://roiet.doae.go.th/phochai-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  nong_phok: {
    district: 'nong_phok',
    officeNameTh: 'สำนักงานเกษตรอำเภอหนองพอก',
    officeNameEn: 'Nong Phok District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/nongphok-101/',
    phone: '043-579-166',
    email: 'nongphok.roi@doae.go.th',
    addressTh:
      '116 หมู่ 8 ตำบลหนองพอก อำเภอหนองพอก จังหวัดร้อยเอ็ด 45210',
    addressEn: '116 Moo 8, Nong Phok, Nong Phok, Roi Et 45210',
    sourceUrl: 'https://roiet.doae.go.th/nongphok-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  selaphum: {
    district: 'selaphum',
    officeNameTh: 'สำนักงานเกษตรอำเภอเสลภูมิ',
    officeNameEn: 'Selaphum District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/selaphum-101/',
    phone: '043-551-458',
    addressTh:
      '224 หมู่ 1 ตำบลขวัญเมือง อำเภอเสลภูมิ จังหวัดร้อยเอ็ด 45120',
    addressEn: '224 Moo 1, Khwan Mueang, Selaphum, Roi Et 45120',
    sourceUrl: 'https://roiet.doae.go.th/selaphum-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  suwannaphum: {
    district: 'suwannaphum',
    officeNameTh: 'สำนักงานเกษตรอำเภอสุวรรณภูมิ',
    officeNameEn: 'Suwannaphum District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/suvarnabhum-101/',
    phone: '043-581-462',
    email: 'roi_suwannaphum@doae.go.th',
    addressTh:
      '258 หมู่ 3 ตำบลสระคู อำเภอสุวรรณภูมิ จังหวัดร้อยเอ็ด 45130',
    addressEn: '258 Moo 3, Sa Khu, Suwannaphum, Roi Et 45130',
    sourceUrl: 'https://roiet.doae.go.th/suvarnabhum-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  mueang_suang: {
    district: 'mueang_suang',
    officeNameTh: 'สำนักงานเกษตรอำเภอเมืองสรวง',
    officeNameEn: 'Mueang Suang District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/mueangsuang-101/',
    phone: '043-597-350',
    email: 'mueangsuang@doae.go.th',
    addressTh:
      'ถนนร้อยเอ็ด-สุวรรณภูมิ ตำบลเมืองสรวง อำเภอเมืองสรวง จังหวัดร้อยเอ็ด 45220',
    addressEn: 'Roi Et–Suwannaphum Road, Mueang Suang, Mueang Suang, Roi Et 45220',
    sourceUrl: 'https://roiet.doae.go.th/mueangsuang-101/',
    verifiedOn: VERIFIED_ON,
  },
  phon_sai: {
    district: 'phon_sai',
    officeNameTh: 'สำนักงานเกษตรอำเภอโพนทราย',
    officeNameEn: 'Phon Sai District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/phonsai-101/',
    phone: '043-595-066',
    email: 'Phonsai.roi@doae.go.th',
    addressTh:
      '101 หมู่ 9 ตำบลโพนทราย อำเภอโพนทราย จังหวัดร้อยเอ็ด 45240',
    addressEn: '101 Moo 9, Phon Sai, Phon Sai, Roi Et 45240',
    sourceUrl: 'https://roiet.doae.go.th/phonsai-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  at_samat: {
    district: 'at_samat',
    officeNameTh: 'สำนักงานเกษตรอำเภออาจสามารถ',
    officeNameEn: 'At Samat District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/atsamat-101/',
    sourceUrl: 'https://roiet.doae.go.th/atsamat-101/',
    verifiedOn: VERIFIED_ON,
  },
  moei_wadi: {
    district: 'moei_wadi',
    officeNameTh: 'สำนักงานเกษตรอำเภอเมยวดี',
    officeNameEn: 'Moei Wadi District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/moeiwadee-101/',
    phone: '043-577-055',
    email: 'moeiwadi.roi@doae.go.th',
    addressTh:
      '115 ถนนเมยวดี-หนองพอก ตำบลเมยวดี อำเภอเมยวดี จังหวัดร้อยเอ็ด 45250',
    addressEn: '115 Moei Wadi–Nong Phok Road, Moei Wadi, Moei Wadi, Roi Et 45250',
    sourceUrl: 'https://roiet.doae.go.th/moeiwadee-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  si_somdet: {
    district: 'si_somdet',
    officeNameTh: 'สำนักงานเกษตรอำเภอศรีสมเด็จ',
    officeNameEn: 'Si Somdet District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/sisomdet-101/',
    phone: '043-508-319',
    email: 'sisomdet.roi@doae.go.th',
    addressTh:
      '150 หมู่ 10 ตำบลศรีสมเด็จ อำเภอศรีสมเด็จ จังหวัดร้อยเอ็ด 45000',
    addressEn: '150 Moo 10, Si Somdet, Si Somdet, Roi Et 45000',
    sourceUrl: 'https://roiet.doae.go.th/sisomdet-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  changhan: {
    district: 'changhan',
    officeNameTh: 'สำนักงานเกษตรอำเภอจังหาร',
    officeNameEn: 'Changhan District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/changhan-101/',
    phone: '043-507-136',
    email: 'changhan.roi@doae.go.th',
    addressTh: '147 หมู่ 3 ตำบลจังหาร อำเภอจังหาร จังหวัดร้อยเอ็ด 45000',
    addressEn: '147 Moo 3, Changhan, Changhan, Roi Et 45000',
    sourceUrl: 'https://roiet.doae.go.th/changhan-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  chiang_khwan: {
    district: 'chiang_khwan',
    officeNameTh: 'สำนักงานเกษตรอำเภอเชียงขวัญ',
    officeNameEn: 'Chiang Khwan District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/chiangkhwan-101/',
    phone: '043-509-170',
    email: 'Chaingkwan.roi@doae.go.th',
    addressTh: 'ตำบลพระธาตุ อำเภอเชียงขวัญ จังหวัดร้อยเอ็ด 45000',
    addressEn: 'Phra That, Chiang Khwan, Roi Et 45000',
    sourceUrl: 'https://roiet.doae.go.th/chiangkhwan-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  nong_hi: {
    district: 'nong_hi',
    officeNameTh: 'สำนักงานเกษตรอำเภอหนองฮี',
    officeNameEn: 'Nong Hi District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/nonghi-101/',
    phone: '043-506-338',
    email: 'nonghi.roi@doae.go.th',
    addressTh: 'หมู่ 10 ตำบลหนองฮี อำเภอหนองฮี จังหวัดร้อยเอ็ด 45140',
    addressEn: 'Moo 10, Nong Hi, Nong Hi, Roi Et 45140',
    sourceUrl: 'https://roiet.doae.go.th/nonghi-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
  thung_khao_luang: {
    district: 'thung_khao_luang',
    officeNameTh: 'สำนักงานเกษตรอำเภอทุ่งเขาหลวง',
    officeNameEn: 'Thung Khao Luang District Agricultural Extension Office',
    websiteUrl: 'https://roiet.doae.go.th/thungkhaoluang-101/',
    phone: '043-557-088',
    email: 'roi_thungkhaoluang@doae.go.th',
    addressTh: 'ตำบลทุ่งเขาหลวง อำเภอทุ่งเขาหลวง จังหวัดร้อยเอ็ด 45170',
    addressEn: 'Thung Khao Luang, Thung Khao Luang, Roi Et 45170',
    sourceUrl: 'https://roiet.doae.go.th/thungkhaoluang-101/ติดต่อเรา/',
    verifiedOn: VERIFIED_ON,
  },
}

export const PHON_THONG_OFFICE = DISTRICT_SUPPORT_CONTACTS.phon_thong

/**
 * Placeholder configuration for generic support methods.
 * District-specific verified contacts are rendered separately.
 */
export const SUPPORT_CONTACTS: SupportContactMethod[] = [
  {
    id: 'extension_officer',
    type: 'extension_officer',
    titleEn: 'Agricultural Extension Officer',
    titleTh: 'เจ้าหน้าที่ส่งเสริมการเกษตร',
    descriptionEn:
      'Get help with your farm-specific situation from a local agricultural professional.',
    descriptionTh:
      'ขอคำแนะนำเฉพาะของนาคุณจากเจ้าหน้าที่ส่งเสริมการเกษตรในพื้นที่',
    connected: false,
  },
]

export function normalizeTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) {
    return 'tel:'
  }
  if (digits.startsWith('66')) {
    return `tel:+${digits}`
  }
  if (digits.startsWith('0')) {
    return `tel:+66${digits.slice(1)}`
  }
  return `tel:+66${digits}`
}

export function hasCompleteDirectContact(
  contact: DistrictSupportContact,
): boolean {
  return Boolean(contact.phone && contact.email && contact.addressTh)
}

export function getDistrictSupportContact(
  districtId: string | null | undefined,
): DistrictSupportContact | null {
  if (!districtId) {
    return null
  }
  return DISTRICT_SUPPORT_CONTACTS[districtId] ?? null
}

export function shouldShowProvincialFallback(
  contact: DistrictSupportContact | null,
): boolean {
  return !contact || !hasCompleteDirectContact(contact)
}
