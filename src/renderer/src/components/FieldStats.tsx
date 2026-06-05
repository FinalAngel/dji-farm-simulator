import type { LngLat } from '@shared/types'
import { areaHectares, areaSqMeters, perimeterMeters } from '../geo'
import { fmtLen } from '../format'

/** Live size readout for a field polygon — shown while planning and while drawing/editing. */
export default function FieldStats({ polygon }: { polygon: LngLat[] }): JSX.Element {
  const m2 = areaSqMeters(polygon)
  const ha = areaHectares(polygon)
  const valid = polygon.length >= 3

  return (
    <div className="stat-grid">
      <div className="stat"><div className="v">{valid ? `${ha.toFixed(2)} ha` : '—'}</div><div className="k">Area</div></div>
      <div className="stat"><div className="v">{valid ? `${Math.round(m2).toLocaleString()} m²` : '—'}</div><div className="k">Area (m²)</div></div>
      <div className="stat"><div className="v">{polygon.length >= 2 ? fmtLen(perimeterMeters(polygon)) : '—'}</div><div className="k">Perimeter</div></div>
      <div className="stat"><div className="v">{polygon.length}</div><div className="k">Boundary points</div></div>
    </div>
  )
}
