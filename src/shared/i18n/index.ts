// Lightweight, dependency-free i18n shared by both the main and renderer processes.
// `translate()` is pure (no Electron, no DOM) so it bundles cleanly into either —
// the renderer wraps it in a React context (see renderer/src/i18n.tsx); the main
// process calls it via main/i18n.ts using the persisted language setting.

import { en, type Dict } from './en'
import { de } from './de'
import { fr } from './fr'
import { it } from './it'

export type Lang = 'en' | 'de' | 'fr' | 'it'
export type { Dict }

export const DEFAULT_LANG: Lang = 'en'
export const SUPPORTED_LANGS: Lang[] = ['en', 'de', 'fr', 'it']

/** Native-name labels for the language picker (kept in their own language on purpose). */
export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' }
]

const DICTS: Record<Lang, Dict> = { en, de, fr, it }

/** Map an OS/browser locale (e.g. "de-CH", "fr_FR") to a supported language, English otherwise. */
export function resolveLang(locale?: string | null): Lang {
  const base = (locale ?? '').toLowerCase().split(/[-_]/)[0]
  return (SUPPORTED_LANGS as string[]).includes(base) ? (base as Lang) : DEFAULT_LANG
}

/** BCP-47 locale used for date/number formatting (Swiss variants where applicable). */
export function intlLocale(lang: Lang): string {
  return { en: 'en-GB', de: 'de-CH', fr: 'fr-CH', it: 'it-CH' }[lang]
}

// en/de/it: one for n===1, else other. fr: one for 0 and 1, else other.
function pluralCategory(lang: Lang, n: number): 'one' | 'other' {
  if (lang === 'fr') return n === 0 || n === 1 ? 'one' : 'other'
  return n === 1 ? 'one' : 'other'
}

function lookup(dict: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), dict)
}

function interpolate(s: string, vars?: Vars): string {
  if (!vars) return s
  return s.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`))
}

export type Vars = Record<string, string | number>

/**
 * Resolve a dotted key (e.g. "flights.cows") for a language, with English fallback
 * and the key itself as a last resort. Plural entries ({ one, other }) are selected
 * by `vars.count`; `{placeholders}` are filled from `vars`.
 */
export function translate(lang: Lang, key: string, vars?: Vars): string {
  let val = lookup(DICTS[lang], key)
  if (val === undefined) val = lookup(DICTS.en, key) // missing translation → English
  if (val === undefined) return key // unknown key → surface it rather than blank
  if (val && typeof val === 'object') {
    const forms = val as { one?: string; other?: string }
    const cat = pluralCategory(lang, Number(vars?.count ?? 0))
    val = forms[cat] ?? forms.other ?? ''
  }
  return interpolate(String(val), vars)
}
