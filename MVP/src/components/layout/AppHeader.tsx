import { ArrowLeft, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const { translate, language, setLanguage, hasProgress, clearAll } =
    useAssessment()
  const [menuOpen, setMenuOpen] = useState(false)

  const isHome = variant === 'home'
  const isGreen = variant === 'green' || isHome

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

  return (
    <header
      className={`relative px-4 pb-3 pt-4 ${
        isGreen ? 'bg-brand-primary text-white' : 'bg-brand-surface text-brand-text'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {showBack ? (
            <button
              type="button"
              className="touch-target inline-flex items-center justify-center rounded-full"
              aria-label={translate('back')}
              onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <img
                src="./naroo-logo.png"
                alt={translate('app_name')}
                className="h-9 w-9 rounded-full bg-white object-contain p-0.5"
              />
              {!title ? (
                <span className="truncate text-sm font-semibold tracking-wide">
                  {translate('app_name')}
                </span>
              ) : null}
            </Link>
          )}
          {title ? (
            <h1 className="truncate text-lg font-semibold">{title}</h1>
          ) : null}
        </div>

        <button
          type="button"
          className="touch-target inline-flex items-center justify-center rounded-full"
          aria-label={menuOpen ? translate('close_menu') : translate('open_menu')}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen ? (
        <div
          className={`absolute right-4 top-16 z-20 w-56 rounded-2xl border p-3 shadow-lg ${
            isGreen
              ? 'border-white/20 bg-brand-dark text-white'
              : 'border-brand-border bg-white text-brand-text'
          }`}
          role="menu"
        >
          <p className="mb-2 text-xs uppercase tracking-wide opacity-80">
            {translate('language')}
          </p>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`touch-target rounded-xl px-3 text-sm font-medium ${
                language === 'en'
                  ? 'bg-white text-brand-primary'
                  : 'bg-white/10'
              }`}
              onClick={() => setLanguage('en')}
            >
              {translate('english')}
            </button>
            <button
              type="button"
              className={`touch-target rounded-xl px-3 text-sm font-medium ${
                language === 'th'
                  ? 'bg-white text-brand-primary'
                  : 'bg-white/10'
              }`}
              onClick={() => setLanguage('th')}
            >
              {translate('thai')}
            </button>
          </div>
          <Link
            to="/"
            className="touch-target mb-2 flex items-center rounded-xl px-3 text-sm font-medium hover:bg-white/10"
            onClick={() => setMenuOpen(false)}
          >
            {translate('home')}
          </Link>
          <button
            type="button"
            className="touch-target flex w-full items-center rounded-xl px-3 text-left text-sm font-medium hover:bg-white/10"
            onClick={handleClear}
          >
            {translate('clear_my_information')}
          </button>
        </div>
      ) : null}
    </header>
  )
}
