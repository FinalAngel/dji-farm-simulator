import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { DEFAULT_LANG, intlLocale, translate, type Lang, type Vars } from '@shared/i18n'

interface I18nCtx {
  lang: Lang
  /** BCP-47 locale for Intl date/number formatting. */
  locale: string
  setLang: (l: Lang) => void
  t: (key: string, vars?: Vars) => string
}

const Ctx = createContext<I18nCtx | null>(null)

/** Holds the active language. App sets it from the persisted setting on boot. */
export function I18nProvider({ children }: { children: ReactNode }): JSX.Element {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG)
  const t = useCallback((key: string, vars?: Vars) => translate(lang, key, vars), [lang])
  return <Ctx.Provider value={{ lang, locale: intlLocale(lang), setLang, t }}>{children}</Ctx.Provider>
}

export function useI18n(): I18nCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useI18n must be used within <I18nProvider>')
  return c
}
