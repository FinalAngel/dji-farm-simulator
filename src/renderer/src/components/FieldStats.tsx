import type { LngLat } from '@shared/types'
import { areaHectares, areaSqMeters, perimeterMeters } from '../geo'
import { fmtLen } from '../format'
import { useI18n } from '../i18n'

/** Live size readout for a field polygon — shown while planning and while drawing/editing. */
export default function FieldStats({ polygon }: { polygon: LngLat[] }): JSX.Element {
  const { t, locale } = useI18n()
  const m2 = areaSqMeters(polygon)
  const ha = areaHectares(polygon)
  const valid = polygon.length >= 3

  return (
    <div className="stat-grid">
      <div className="stat"><div className="v">{valid ? `${ha.toFixed(2)} ha` : '—'}</div><div className="k">{t('stats.area')}</div></div>
      <div className="stat"><div className="v">{valid ? `${Math.round(m2).toLocaleString(locale)} m²` : '—'}</div><div className="k">{t('stats.areaSqM')}</div></div>
      <div className="stat"><div className="v">{polygon.length >= 2 ? fmtLen(perimeterMeters(polygon)) : '—'}</div><div className="k">{t('stats.perimeter')}</div></div>
      <div className="stat"><div className="v">{polygon.length}</div><div className="k">{t('stats.boundaryPoints')}</div></div>
    </div>
  )
}
