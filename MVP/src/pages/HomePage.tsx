import {
  CheckCircle2,
  ClipboardList,
  Leaf,
  Search,
  ShieldCheck,
  Sprout,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { useAssessment } from '@/context/AssessmentContext'

function FarmHeroArt() {
  return (
    <div
      className="relative mx-auto mt-4 h-44 w-full max-w-sm overflow-hidden rounded-[28px] bg-gradient-to-b from-sky-200 via-brand-light to-emerald-200"
      aria-hidden="true"
    >
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-emerald-600/40 to-transparent" />
      <div className="absolute bottom-8 left-6 h-16 w-24 rounded-t-full bg-emerald-700/70" />
      <div className="absolute bottom-10 right-10 h-14 w-20 rounded-t-full bg-emerald-600/80" />
      <div className="absolute bottom-16 left-1/2 h-10 w-16 -translate-x-1/2 rounded-xl bg-amber-700/80 shadow-sm" />
      <div className="absolute left-8 top-8 h-10 w-10 rounded-full bg-yellow-300/90" />
      <Sprout className="absolute bottom-12 right-16 h-8 w-8 text-brand-primary" />
      <Leaf className="absolute bottom-20 left-16 h-7 w-7 text-brand-dark" />
    </div>
  )
}

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
    { icon: <ClipboardList className="h-4 w-4" />, label: translate('how_1') },
    { icon: <Search className="h-4 w-4" />, label: translate('how_2') },
    { icon: <CheckCircle2 className="h-4 w-4" />, label: translate('how_3') },
    { icon: <ShieldCheck className="h-4 w-4" />, label: translate('how_4') },
  ]

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader variant="home" />
      <main className="flex flex-1 flex-col px-5 pb-8 pt-2">
        <section className="rounded-[28px] bg-gradient-to-b from-brand-primary to-brand-dark px-5 pb-6 pt-4 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
            {translate('advisor_label')}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight">
            {translate('home_heading')}
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/90">
            {translate('home_subheading')}
          </p>
          <FarmHeroArt />
          <div className="mt-5">
            <PrimaryButton
              className="bg-white text-brand-primary hover:bg-brand-light"
              onClick={() => {
                setCurrentStep('step1')
                navigate('/assessment/step-1')
              }}
            >
              {translate('get_farm_guidance')}
            </PrimaryButton>
          </div>
          <p className="mt-4 text-xs leading-5 text-white/85">
            {translate('trust_statement')}
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-brand-text">
            {translate('what_can_we_help')}
          </h2>
          <ul className="mt-3 space-y-3">
            {helpItems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-brand-border bg-white px-4 py-3"
              >
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-success"
                  aria-hidden="true"
                />
                <span className="text-sm leading-6 text-brand-text">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-brand-text">
            {translate('how_it_works')}
          </h2>
          <ol className="mt-3 grid grid-cols-2 gap-3">
            {steps.map((step, index) => (
              <li
                key={step.label}
                className="rounded-2xl border border-brand-border bg-brand-light/70 px-3 py-4"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white">
                  {step.icon}
                </div>
                <p className="text-xs font-semibold text-brand-muted">
                  {index + 1}
                </p>
                <p className="mt-1 text-sm font-semibold leading-5 text-brand-text">
                  {step.label}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <aside className="mt-6 rounded-2xl border border-brand-border bg-white px-4 py-4 text-sm leading-6 text-brand-muted">
          {translate('safety_disclaimer')}
        </aside>
      </main>
    </div>
  )
}
