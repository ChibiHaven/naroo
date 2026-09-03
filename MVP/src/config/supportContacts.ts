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

export const PHON_THONG_OFFICE = {
  districtId: 'phon_thong',
  nameEn: 'Phon Thong District Agricultural Extension Office',
  nameTh: 'สำนักงานเกษตรอำเภอโพนทอง',
  phoneDisplay: '043-571-462',
  phoneTel: '+6643571462',
  email: 'Phonthong.roi@doae.go.th',
  addressEn: '179 Phon Thong–Nong Phok Road, Waeng, Phon Thong, Roi Et 45110',
  addressTh:
    '179 ถนนโพนทอง–หนองพอก ตำบลแวง อำเภอโพนทอง จังหวัดร้อยเอ็ด 45110',
  website: 'https://roiet.doae.go.th/phonthong-101/ติดต่อเรา/',
} as const

export const ROI_ET_PROVINCIAL_OFFICE_URL = 'https://roiet.doae.go.th/'

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
