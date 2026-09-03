import { ArrowLeft, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAssessment } from '@/context/AssessmentContext'

interface AppHeaderProps {
  title?: string
  showBack?: boolean
  backTo?: string
  variant?: 'home' | 'green' | 'light'
}

export function AppHeader({
  title,
  showBack = false,
  backTo,
  variant = 'green',
}: AppHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { translate, language, setLanguage, hasProgress, clearAll } =
    useAssessment()
  const [menuOpen, setMenuOpen] = useState(false)

  const isHome = variant === 'home'
  const isGreen = variant === 'green'

  const handleClear = () => {
    if (!hasProgress) {
      setMenuOpen(false)
      return
    }
    const confirmed = window.confirm(translate('clear_confirm'))
    if (confirmed) {
      clearAll()
      setMenuOpen(false)
      navigate('/')
    }
  }

  /* Reference image: form pages have green header with white text and centered title.
     Home page has a simpler white/transparent header with logo. */
  const bgClass = isGreen
    ? 'bg-brand-primary text-white'
    : 'bg-brand-surface text-brand-text'

  return (
    <header className={`relative px-4 py-3 ${bgClass}`}>
      <div className="flex items-center justify-between gap-3">
        {/* Left: back button or logo */}
        <div className="flex min-w-0 items-center gap-2">
          {showBack ? (
            <button
              type="button"
              className="touch-target inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
              aria-label={translate('back')}
              onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : isHome ? (
            <Link to="/" className="flex items-center gap-2">
              <img
                src={`${import.meta.env.BASE_URL}naroo-logo-full.png`}
                alt={translate('app_name')}
                className="h-10 object-contain"
              />
            </Link>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <img
                src={`${import.meta.env.BASE_URL}naroo-logo-mark.png`}
                alt={translate('app_name')}
                className="h-8 w-8 rounded-full object-contain"
              />
            </Link>
          )}
        </div>

        {/* Center: title */}
        {title ? (
          <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 truncate text-base font-bold">
            {title}
          </h1>
        ) : null}

        {/* Right: menu */}
        <button
          type="button"
          className="touch-target inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
          aria-label={menuOpen ? translate('close_menu') : translate('open_menu')}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Dropdown menu */}
      {menuOpen ? (
        <div
          className="absolute right-4 top-14 z-30 w-56 rounded-2xl border border-brand-border bg-white p-3 text-brand-text shadow-xl"
          role="menu"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-muted">
            {translate('language')}
          </p>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`touch-target rounded-xl px-3 text-sm font-semibold transition ${
                language === 'en'
                  ? 'bg-brand-primary text-white'
                  : 'bg-brand-light text-brand-text hover:bg-brand-border-light'
              }`}
              onClick={() => {
                if (language === 'en') {
                  return
                }
                const outcome = setLanguage('en')
                if (outcome === 'cached' || outcome === 'needs-fetch') {
                  setMenuOpen(false)
                }
                if (
                  outcome === 'needs-fetch' &&
                  location.pathname !== '/expert-support'
                ) {
                  navigate('/analyzing')
                }
              }}
            >
              {translate('english')}
            </button>
            <button
              type="button"
              className={`touch-target rounded-xl px-3 text-sm font-semibold transition ${
                language === 'th'
                  ? 'bg-brand-primary text-white'
                  : 'bg-brand-light text-brand-text hover:bg-brand-border-light'
              }`}
              onClick={() => {
                if (language === 'th') {
                  return
                }
                const outcome = setLanguage('th')
                if (outcome === 'cached' || outcome === 'needs-fetch') {
                  setMenuOpen(false)
                }
                if (
                  outcome === 'needs-fetch' &&
                  location.pathname !== '/expert-support'
                ) {
                  navigate('/analyzing')
                }
              }}
            >
              {translate('thai')}
            </button>
          </div>
          <Link
            to="/"
            className="touch-target mb-2 flex items-center rounded-xl px-3 text-sm font-semibold text-brand-text hover:bg-brand-light"
            onClick={() => setMenuOpen(false)}
          >
            {translate('home')}
          </Link>
          <button
            type="button"
            className="touch-target flex w-full items-center rounded-xl px-3 text-left text-sm font-semibold text-brand-text hover:bg-brand-light"
            onClick={handleClear}
          >
            {translate('clear_my_information')}
          </button>
        </div>
      ) : null}
    </header>
  )
}
