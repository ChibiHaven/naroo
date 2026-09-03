import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Phone } from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { useAssessment } from '@/context/AssessmentContext'
import { placeholderSupportContactService } from '@/services/supportContactService'
import type { SupportContactMethod } from '@/config/supportContacts'

export function ExpertSupportPage() {
  const navigate = useNavigate()
  const { translate, language, setCurrentStep } = useAssessment()
  const [contacts, setContacts] = useState<SupportContactMethod[]>([])
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    setCurrentStep('expert')
    void placeholderSupportContactService.listContacts().then(setContacts)
  }, [setCurrentStep])

  const officer = contacts.find((contact) => contact.type === 'extension_officer')
  const otherContacts = contacts.filter(
    (contact) => contact.type !== 'extension_officer',
  )

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title={translate('expert_support')} showBack variant="green" />
      <main className="flex flex-1 flex-col px-5 py-5">
        {/* Banner image */}
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

        {/* Extension officer card */}
        {officer ? (
          <section className="mt-5 overflow-hidden rounded-[var(--radius-card)] border border-brand-border bg-white shadow-sm">
            <div className="flex gap-4 p-4">
              <img
                src={`${import.meta.env.BASE_URL}agricultural-officer.png`}
                alt=""
                className="h-16 w-16 rounded-xl object-contain"
              />
              <div className="flex-1">
                <h2 className="text-base font-bold">
                  {language === 'th' ? officer.titleTh : officer.titleEn}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-brand-muted">
                  {language === 'th'
                    ? officer.descriptionTh
                    : officer.descriptionEn}
                </p>
              </div>
            </div>
            <div className="border-t border-brand-border px-4 py-3">
              <PrimaryButton disabled>
                {translate('find_local_support')}
                <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
              <p className="mt-2 text-center text-xs font-medium text-brand-warning">
                {translate('contact_not_connected')}
              </p>
            </div>
          </section>
        ) : null}

        {/* Other contact methods */}
        <section className="mt-6">
          <h2 className="mb-3 text-base font-bold">
            {translate('other_contact_methods')}
          </h2>
          <ul className="space-y-3">
            {otherContacts.map((contact) => (
              <li
                key={contact.id}
                className="rounded-[var(--radius-card)] border border-brand-border bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand-primary">
                    {contact.type === 'phone' ? (
                      <Phone className="h-5 w-5" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold">
                      {language === 'th' ? contact.titleTh : contact.titleEn}
                    </h3>
                    <p className="mt-1 text-sm text-brand-muted">
                      {language === 'th'
                        ? contact.descriptionTh
                        : contact.descriptionEn}
                    </p>
                    <button
                      type="button"
                      className="touch-target mt-3 rounded-[var(--radius-button)] border border-brand-border px-4 py-2 text-sm font-semibold text-brand-muted"
                      disabled
                    >
                      {translate('not_yet_connected')}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Disclaimer */}
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
