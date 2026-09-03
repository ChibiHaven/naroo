import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Phone, UserRound, Users } from 'lucide-react'
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
        <div
          className="relative mb-5 h-40 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-light via-emerald-100 to-sky-100"
          aria-hidden="true"
        >
          <Users className="absolute left-8 top-12 h-16 w-16 text-brand-primary" />
          <UserRound className="absolute right-10 top-10 h-16 w-16 text-brand-dark" />
        </div>

        <h1 className="text-2xl font-bold text-brand-text">
          {translate('need_more_help')}
        </h1>
        <p className="mt-2 text-sm leading-6 text-brand-muted">
          {translate('expert_intro')}
        </p>

        {officer ? (
          <section className="mt-5 rounded-2xl border border-brand-border bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand-primary">
                <UserRound className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h2 className="text-base font-semibold">
                  {language === 'th' ? officer.titleTh : officer.titleEn}
                </h2>
                <p className="mt-1 text-sm leading-6 text-brand-muted">
                  {language === 'th'
                    ? officer.descriptionTh
                    : officer.descriptionEn}
                </p>
                <p className="mt-2 text-sm font-medium text-amber-800">
                  {translate('contact_not_connected')}
                </p>
                <div className="mt-4">
                  <PrimaryButton disabled>
                    {translate('find_local_support')} (
                    {translate('not_yet_connected')})
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-5">
          <h2 className="mb-3 text-base font-semibold">
            {translate('other_contact_methods')}
          </h2>
          <ul className="space-y-3">
            {otherContacts.map((contact) => (
              <li
                key={contact.id}
                className="rounded-2xl border border-brand-border bg-white p-4"
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
                    <h3 className="text-sm font-semibold">
                      {language === 'th' ? contact.titleTh : contact.titleEn}
                    </h3>
                    <p className="mt-1 text-sm text-brand-muted">
                      {language === 'th'
                        ? contact.descriptionTh
                        : contact.descriptionEn}
                    </p>
                    <button
                      type="button"
                      className="touch-target mt-3 rounded-xl border border-brand-border px-4 text-sm font-semibold text-brand-muted"
                      disabled
                    >
                      {language === 'th' ? contact.titleTh : contact.titleEn} —{' '}
                      {translate('not_yet_connected')}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="mt-6 rounded-2xl border border-brand-border bg-brand-light/60 px-4 py-4 text-sm leading-6 text-brand-muted">
          {translate('safety_disclaimer')}
        </aside>

        <label className="mt-4 flex items-start gap-3 text-sm text-brand-text">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
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
        {!acknowledged ? (
          <p className="mt-3 text-xs text-brand-muted">
            {translate('acknowledge_safety')}
          </p>
        ) : null}
      </main>
    </div>
  )
}
