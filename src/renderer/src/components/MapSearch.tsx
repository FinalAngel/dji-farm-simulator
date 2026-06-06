import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'

export interface GeoResult {
  label: string
  lng: number
  lat: number
  /** Photon bbox: [minLon, maxLat, maxLon, minLat]. Present for areas/streets, not POIs. */
  extent?: [number, number, number, number]
}

// Build a readable one-line label from a Photon feature's properties.
function labelOf(f: { properties?: Record<string, string> }, unnamed: string): string {
  const p = f.properties ?? {}
  const main = p.name || [p.street, p.housenumber].filter(Boolean).join(' ') || p.city || unnamed
  const ctx = [p.city && p.city !== main ? p.city : null, p.state, p.country].filter(Boolean).join(', ')
  return ctx ? `${main} · ${ctx}` : main
}

/** Place/address search box. Geocodes via Photon (OpenStreetMap) and reports a pick upward. */
export default function MapSearch({ onGoto }: { onGoto: (r: GeoResult) => void }): JSX.Element {
  const { t } = useI18n()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abort = useRef<AbortController | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  // Close the dropdown when clicking elsewhere.
  useEffect(() => {
    const onDown = (e: MouseEvent): void => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const search = (text: string): void => {
    setQ(text)
    if (timer.current) clearTimeout(timer.current)
    if (text.trim().length < 3) { setResults([]); setOpen(false); return }
    timer.current = setTimeout(async () => {
      abort.current?.abort()
      const ac = new AbortController()
      abort.current = ac
      setBusy(true)
      try {
        const res = await fetch(`https://photon.komoot.io/api/?limit=6&q=${encodeURIComponent(text)}`, { signal: ac.signal })
        const data = await res.json()
        const rs: GeoResult[] = (data.features ?? [])
          .filter((f: { geometry?: { type?: string } }) => f.geometry?.type === 'Point')
          .map((f: { geometry: { coordinates: number[] }; properties?: Record<string, string> }) => ({
            label: labelOf(f, t('mapSearch.unnamed')),
            lng: f.geometry.coordinates[0],
            lat: f.geometry.coordinates[1],
            extent: (f.properties as unknown as { extent?: [number, number, number, number] })?.extent
          }))
        setResults(rs)
        setOpen(true)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setResults([])
      } finally {
        setBusy(false)
      }
    }, 300)
  }

  const pick = (r: GeoResult): void => {
    onGoto(r)
    setQ(r.label)
    setOpen(false)
  }

  const clear = (): void => { setQ(''); setResults([]); setOpen(false) }

  return (
    <div className="map-search" ref={boxRef}>
      <div className="map-search-input">
        <span className={`mag ${busy ? 'busy' : ''}`} aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          value={q}
          placeholder={t('mapSearch.placeholder')}
          onChange={(e) => search(e.target.value)}
          onFocus={() => { if (results.length) setOpen(true) }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) pick(results[0])
            else if (e.key === 'Escape') clear()
          }}
        />
        {q && <button className="clear" title={t('mapSearch.clear')} onClick={clear}>✕</button>}
      </div>
      {open && results.length > 0 && (
        <div className="map-search-results">
          {results.map((r, i) => (
            <button key={i} onClick={() => pick(r)}>{r.label}</button>
          ))}
          <div className="attr">Geocoding © OpenStreetMap · Photon</div>
        </div>
      )}
    </div>
  )
}
