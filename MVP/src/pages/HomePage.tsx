import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Search,
  ShieldCheck,
  Sprout,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { DecorativeIcon } from '@/components/common/DecorativeIcon'
import { useAssessment } from '@/context/AssessmentContext'

export function HomePage() {
  const navigate = useNavigate()
  const { translate, setCurrentStep } = useAssessment()

  const helpItems = [
    translate('help_item_1'),
    translate('help_item_2'),
    translate('help_item_3'),
    translate('help_item_4'),
  ]

  const steps = [
    { icon: <ClipboardList className="h-5 w-5" />, label: translate('how_1') },
    { icon: <Search className="h-5 w-5" />, label: translate('how_2') },
    { icon: <Sprout className="h-5 w-5" />, label: translate('how_3') },
    { icon: <ShieldCheck className="h-5 w-5" />, label: translate('how_4') },
  ]

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader variant="home" />
      <main className="flex flex-1 flex-col pb-8">
        {/* Hero section */}
        <section className="bg-brand-primary px-5 pb-6 pt-2 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
            {translate('advisor_label')}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
            {translate('home_heading')}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/90">
            {translate('home_subheading')}
          </p>

          {/* Farm landscape image */}
          <div className="mt-5 overflow-hidden rounded-2xl">
            <img
              src={`${import.meta.env.BASE_URL}home-farm-landscape.png`}
              alt=""
              className="h-44 w-full object-cover"
            />
          </div>

          <div className="mt-5">
            <PrimaryButton
              className="bg-white !text-brand-primary hover:bg-brand-cream"
              onClick={() => {
                setCurrentStep('step1')
                navigate('/assessment/step-1')
              }}
            >
              {translate('get_farm_guidance')}
              <DecorativeIcon>
                <ArrowRight className="h-4 w-4" />
              </DecorativeIcon>
            </PrimaryButton>
          </div>
        </section>

        {/* Trust statement */}
        <p className="mx-5 mt-5 text-xs leading-5 text-brand-muted">
          {translate('trust_statement')}
        </p>

        {/* What can we help with */}
        <section className="mt-6 px-5">
          <h2 className="text-lg font-bold text-brand-text">
            {translate('what_can_we_help')}
          </h2>
          <ul className="mt-3 space-y-2.5">
            {helpItems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-[var(--radius-card)] border border-brand-border bg-white px-4 py-3"
              >
                <DecorativeIcon className="mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-brand-success" />
                </DecorativeIcon>
                <span className="text-sm leading-relaxed text-brand-text">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="mt-6 px-5">
          <h2 className="text-lg font-bold text-brand-text">
            {translate('how_it_works')}
          </h2>
          <ol className="mt-3 grid grid-cols-2 gap-3">
            {steps.map((step, index) => (
              <li
                key={step.label}
                className="rounded-[var(--radius-card)] border border-brand-border bg-brand-light px-3 py-4"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-white">
                  <DecorativeIcon>{step.icon}</DecorativeIcon>
                </div>
                <p className="text-xs font-bold text-brand-muted">
                  {index + 1}.
                </p>
                <p className="mt-1 text-sm font-semibold leading-snug text-brand-text">
                  {step.label}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Safety disclaimer */}
        <aside className="mx-5 mt-6 rounded-[var(--radius-card)] border border-brand-border bg-brand-cream px-4 py-3.5 text-xs leading-relaxed text-brand-muted">
          {translate('safety_disclaimer')}
        </aside>
      </main>
    </div>
  )
}
