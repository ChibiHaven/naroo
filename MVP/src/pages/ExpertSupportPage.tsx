import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Mail, Phone } from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { useAssessment } from '@/context/AssessmentContext'
import {
  ROI_ET_PROVINCIAL_OFFICE,
  getDistrictSupportContact,
  normalizeTelHref,
  shouldShowProvincialFallback,
  type DistrictSupportContact,
  type ProvincialSupportContact,
} from '@/config/supportContacts'

const EXTERNAL_REL = 'noreferrer noopener'

function officeName(
  language: 'en' | 'th',
  office: Pick<DistrictSupportContact, 'officeNameEn' | 'officeNameTh'>,
): string {
  return language === 'th' ? office.officeNameTh : office.officeNameEn
}

function officeAddress(
  language: 'en' | 'th',
  office: {
    addressTh?: string
    addressEn?: string
  },
): string | undefined {
  if (language === 'th') {
    return office.addressTh
  }
  return office.addressEn ?? office.addressTh
}

function OfficeCard({
  title,
  address,
  phone,
  email,
  websiteUrl,
  callLabel,
  emailLabel,
  websiteLabel,
}: {
  title: string
  address?: string
  phone?: string
  email?: string
  websiteUrl: string
  callLabel: string
  emailLabel: string
  websiteLabel: string
}) {
  return (
    <section className="mt-5 overflow-hidden rounded-[var(--radius-card)] border border-brand-border bg-white shadow-sm">
      <div className="flex gap-4 p-4">
        <img
          src={`${import.meta.env.BASE_URL}agricultural-officer.png`}
          alt=""
          className="h-16 w-16 rounded-xl object-contain"
        />
        <div className="flex-1">
          <h2 className="text-base font-bold">{title}</h2>
          {address ? (
            <p className="mt-2 text-sm leading-relaxed text-brand-text">{address}</p>
          ) : null}
          {phone ? (
            <p className="mt-2 text-sm text-brand-muted">{phone}</p>
          ) : null}
          {email ? (
            <p className="text-sm text-brand-muted">{email}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-2 border-t border-brand-border px-4 py-3">
        {phone ? (
          <a
            className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-brand-primary px-6 py-3 text-base font-bold text-white"
            href={normalizeTelHref(phone)}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {callLabel}
          </a>
        ) : null}
        {email ? (
          <a
            className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-brand-border bg-white px-6 py-3 text-base font-semibold text-brand-primary"
            href={`mailto:${email}`}
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {emailLabel}
          </a>
        ) : null}
        <a
          className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-brand-border bg-white px-6 py-3 text-base font-semibold text-brand-primary"
          href={websiteUrl}
          target="_blank"
          rel={EXTERNAL_REL}
        >
          <Building2 className="h-4 w-4" aria-hidden="true" />
          {websiteLabel}
        </a>
      </div>
    </section>
  )
}

function provincialCardProps(office: ProvincialSupportContact) {
  return {
    titleEn: office.officeNameEn,
    titleTh: office.officeNameTh,
    addressTh: office.addressTh,
    addressEn: office.addressEn,
    phone: office.phone,
    email: office.email,
    websiteUrl: office.websiteUrl,
  }
}

export function ExpertSupportPage() {
  const navigate = useNavigate()
  const { translate, language, input, setCurrentStep } = useAssessment()
  const [acknowledged, setAcknowledged] = useState(false)
  const districtContact = getDistrictSupportContact(input.district)
  const showProvincial = shouldShowProvincialFallback(districtContact)
  const provincial = provincialCardProps(ROI_ET_PROVINCIAL_OFFICE)

  useEffect(() => {
    setCurrentStep('expert')
  }, [setCurrentStep])

  const callLabel = translate('call_office')
  const emailLabel = translate('email_office')
  const websiteLabel = translate('visit_official_website')

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

        {districtContact ? (
          <OfficeCard
            title={officeName(language, districtContact)}
            address={officeAddress(language, districtContact)}
            phone={districtContact.phone}
            email={districtContact.email}
            websiteUrl={districtContact.websiteUrl}
            callLabel={callLabel}
            emailLabel={emailLabel}
            websiteLabel={websiteLabel}
          />
        ) : null}

        {showProvincial ? (
          <OfficeCard
            title={language === 'th' ? provincial.titleTh : provincial.titleEn}
            address={officeAddress(language, provincial)}
            phone={provincial.phone}
            email={provincial.email}
            websiteUrl={provincial.websiteUrl}
            callLabel={callLabel}
            emailLabel={emailLabel}
            websiteLabel={websiteLabel}
          />
        ) : null}

        <p className="mt-5 text-sm leading-relaxed text-brand-muted">
          {translate('contact_verify_notice')}
        </p>

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
