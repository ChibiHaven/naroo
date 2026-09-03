import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Mail, Phone } from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { useAssessment } from '@/context/AssessmentContext'
import {
  PHON_THONG_OFFICE,
  ROI_ET_PROVINCIAL_OFFICE_URL,
} from '@/config/supportContacts'

export function ExpertSupportPage() {
  const navigate = useNavigate()
  const { translate, language, input, setCurrentStep } = useAssessment()
  const [acknowledged, setAcknowledged] = useState(false)
  const isPhonThong = input.district === PHON_THONG_OFFICE.districtId

  useEffect(() => {
    setCurrentStep('expert')
  }, [setCurrentStep])

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title={translate('expert_support')} showBack variant="green" />
      <main className="flex flex-1 flex-col px-5 py-5">
        <div className="mb-5 overflow-hidden rounded-[var(--radius-card)]">
          <img
            src={`${import.meta.env.BASE_URL}expert-support-banner.png`}
            alt=""
            className="h-40 w-full object-cover"
          />
        </div>

        <h1 className="text-xl font-bold text-brand-text">
          {translate('need_more_help')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-muted">
          {translate('expert_intro')}
        </p>

        {isPhonThong ? (
          <section className="mt-5 overflow-hidden rounded-[var(--radius-card)] border border-brand-border bg-white shadow-sm">
            <div className="flex gap-4 p-4">
              <img
                src={`${import.meta.env.BASE_URL}agricultural-officer.png`}
                alt=""
                className="h-16 w-16 rounded-xl object-contain"
              />
              <div className="flex-1">
                <h2 className="text-base font-bold">
                  {language === 'th'
                    ? PHON_THONG_OFFICE.nameTh
                    : PHON_THONG_OFFICE.nameEn}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-text">
                  {language === 'th'
                    ? PHON_THONG_OFFICE.addressTh
                    : PHON_THONG_OFFICE.addressEn}
                </p>
                <p className="mt-2 text-sm text-brand-muted">
                  {translate('call_office')}: {PHON_THONG_OFFICE.phoneDisplay}
                </p>
                <p className="text-sm text-brand-muted">
                  {translate('email_office')}: {PHON_THONG_OFFICE.email}
                </p>
              </div>
            </div>
            <div className="space-y-2 border-t border-brand-border px-4 py-3">
              <a
                className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-brand-primary px-6 py-3 text-base font-bold text-white"
                href={`tel:${PHON_THONG_OFFICE.phoneTel}`}
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {translate('call_office')} {PHON_THONG_OFFICE.phoneDisplay}
              </a>
              <a
                className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-brand-border bg-white px-6 py-3 text-base font-semibold text-brand-primary"
                href={`mailto:${PHON_THONG_OFFICE.email}`}
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {translate('email_office')}
              </a>
              <a
                className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-brand-border bg-white px-6 py-3 text-base font-semibold text-brand-primary"
                href={PHON_THONG_OFFICE.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Building2 className="h-4 w-4" aria-hidden="true" />
                {translate('visit_official_website')}
              </a>
            </div>
          </section>
        ) : (
          <section className="mt-5 rounded-[var(--radius-card)] border border-brand-border bg-white p-4 shadow-sm">
            <h2 className="text-base font-bold">
              {translate('expert_roi_et_general_title')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              {translate('expert_roi_et_general_body')}
            </p>
            <a
              className="touch-target mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-brand-primary px-6 py-3 text-base font-bold text-white"
              href={ROI_ET_PROVINCIAL_OFFICE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Building2 className="h-4 w-4" aria-hidden="true" />
              {translate('visit_official_website')}
            </a>
          </section>
        )}

        <aside className="mt-6 rounded-[var(--radius-card)] border border-brand-border bg-brand-cream px-4 py-4 text-sm leading-relaxed text-brand-muted">
          {translate('safety_disclaimer')}
        </aside>

        <label className="mt-4 flex items-start gap-3 text-sm text-brand-text">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-brand-primary"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />
          <span>{translate('acknowledge_safety')}</span>
        </label>

        <div className="mt-6">
          <SecondaryButton onClick={() => navigate(-1)}>
            {translate('back')}
          </SecondaryButton>
        </div>
      </main>
    </div>
  )
}
