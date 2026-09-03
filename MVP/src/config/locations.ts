export interface DistrictOption {
  id: string
  nameEn: string
  nameTh: string
}

export interface ProvinceOption {
  id: string
  nameEn: string
  nameTh: string
  districts: DistrictOption[]
}

/**
 * Prototype coverage: Roi Et Province only.
 * District list includes commonly referenced amphoe for the pilot UI.
 * This is not a claim that every district has verified agronomic data.
 */
export const SUPPORTED_PROVINCES: ProvinceOption[] = [
  {
    id: 'roi_et',
    nameEn: 'Roi Et Province',
    nameTh: 'จังหวัดร้อยเอ็ด',
    districts: [
      { id: 'mueang_roi_et', nameEn: 'Mueang Roi Et', nameTh: 'เมืองร้อยเอ็ด' },
      { id: 'kaset_wisai', nameEn: 'Kaset Wisai', nameTh: 'เกษตรวิสัย' },
      { id: 'pathum_rat', nameEn: 'Pathum Rat', nameTh: 'ปทุมรัตต์' },
      { id: 'chaturaphak_phiman', nameEn: 'Chaturaphak Phiman', nameTh: 'จตุรพักตรพิมาน' },
      { id: 'thawat_buri', nameEn: 'Thawat Buri', nameTh: 'ธวัชบุรี' },
      { id: 'phanom_phrai', nameEn: 'Phanom Phrai', nameTh: 'พนมไพร' },
      { id: 'phon_thong', nameEn: 'Phon Thong', nameTh: 'โพนทอง' },
      { id: 'pho_chai', nameEn: 'Pho Chai', nameTh: 'โพธิ์ชัย' },
      { id: 'nong_phok', nameEn: 'Nong Phok', nameTh: 'หนองพอก' },
      { id: 'selaphum', nameEn: 'Selaphum', nameTh: 'เสลภูมิ' },
      { id: 'suwannaphum', nameEn: 'Suwannaphum', nameTh: 'สุวรรณภูมิ' },
      { id: 'mueang_suang', nameEn: 'Mueang Suang', nameTh: 'เมืองสรวง' },
      { id: 'phon_sai', nameEn: 'Phon Sai', nameTh: 'โพนทราย' },
      { id: 'at_samat', nameEn: 'At Samat', nameTh: 'อาจสามารถ' },
      { id: 'moei_wadi', nameEn: 'Moei Wadi', nameTh: 'เมยวดี' },
      { id: 'si_somdet', nameEn: 'Si Somdet', nameTh: 'ศรีสมเด็จ' },
      { id: 'changhan', nameEn: 'Changhan', nameTh: 'จังหาร' },
      { id: 'chiang_khwan', nameEn: 'Chiang Khwan', nameTh: 'เชียงขวัญ' },
      { id: 'nong_hi', nameEn: 'Nong Hi', nameTh: 'หนองฮี' },
      { id: 'thung_khao_luang', nameEn: 'Thung Khao Luang', nameTh: 'ทุ่งเขาหลวง' },
    ],
  },
]

export const DEFAULT_PROVINCE_ID = 'roi_et'

export const COVERAGE_NOTE_EN =
  'This prototype currently supports farm location selection for Roi Et Province only. District options are provided for demonstration and do not imply verified soil or weather coverage for every amphoe.'

export const COVERAGE_NOTE_TH =
  'ระบบนี้ใช้เลือกที่ตั้งนาได้เฉพาะจังหวัดร้อยเอ็ด รายชื่ออำเภอใช้สำหรับสาธิต และไม่ได้หมายความว่ามีข้อมูลดินหรืออากาศที่ยืนยันแล้วครบทุกอำเภอ'

export function getProvince(provinceId: string): ProvinceOption | undefined {
  return SUPPORTED_PROVINCES.find((province) => province.id === provinceId)
}

export function getDistrict(
  provinceId: string,
  districtId: string,
): DistrictOption | undefined {
  return getProvince(provinceId)?.districts.find(
    (district) => district.id === districtId,
  )
}
