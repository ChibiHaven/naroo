export interface SupportContactMethod {
  id: string
  type: 'extension_officer' | 'phone' | 'office_visit' | 'other'
  titleEn: string
  titleTh: string
  descriptionEn: string
  descriptionTh: string
  connected: boolean
  /** Leave empty until verified contact details are available. */
  value?: string
}

/**
 * Placeholder configuration for future verified agricultural support contacts.
 * Do not invent officer names, phone numbers, addresses, or official links.
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
  {
    id: 'call_office',
    type: 'phone',
    titleEn: 'Call Local Agricultural Office',
    titleTh: 'โทรติดต่อสำนักงานเกษตรในพื้นที่',
    descriptionEn: 'Local support contact information has not yet been connected.',
    descriptionTh: 'ยังไม่ได้เชื่อมต่อข้อมูลการติดต่อหน่วยงานในพื้นที่',
    connected: false,
  },
  {
    id: 'visit_office',
    type: 'office_visit',
    titleEn: 'Visit Local Agricultural Office',
    titleTh: 'ไปที่สำนักงานเกษตรในพื้นที่',
    descriptionEn: 'Local support contact information has not yet been connected.',
    descriptionTh: 'ยังไม่ได้เชื่อมต่อข้อมูลการติดต่อหน่วยงานในพื้นที่',
    connected: false,
  },
]
