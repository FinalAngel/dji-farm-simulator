import type { Detection, Flight } from '@shared/types'
import { CLASS_COLORS } from './MapView'
import { fmtDate, fmtDuration } from '../format'

interface Props {
  flights: Flight[]
  selectedId: string | null
  selected: Flight | null
  detections: Detection[]
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onReveal: (path: string) => void
}

function mediaUrl(path: string): string {
  return `media://stream?path=${encodeURIComponent(path)}`
}

export default function FlightsView(p: Props): JSX.Element {
  if (p.selected) return <Detail {...p} flight={p.selected} />

  return (
    <div>
      <div className="plan-head">
        <div className="plan-name">Flights</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
          Every simulated or analyzed flight is stored here with its counts and footage.
        </div>
      </div>

      {p.flights.length === 0 ? (
        <div className="empty-state">
          <div className="ico">🛰️</div>
          <div className="title">No flights yet</div>
          <div>Plan a field, then run a simulation or import a video to see results here.</div>
        </div>
      ) : (
        <div className="flight-list">
          {p.flights.map((f) => (
          <div key={f.id} className={`flight-item ${f.id === p.selectedId ? 'active' : ''}`} onClick={() => p.onSelect(f.id)}>
            <div className="top">
              <strong>{f.fieldName}</strong>
              <span className={`badge ${f.status}`}>{f.status}</span>
            </div>
            <div className="muted" style={{ fontSize: 12, margin: '4px 0' }}>
              {fmtDate(f.createdAt)} · {f.controller}{f.controller === 'simulated' ? ' (sim)' : ''}
            </div>
            <div className="chips">
              <span className="chip cow">🐄 {f.stats?.byClass.cow ?? 0} cows</span>
              <span className="chip deer">🦌 {f.stats?.byClass.deer ?? 0} deer</span>
              <span className="chip">Σ {f.detectionCount}</span>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Detail(p: Props & { flight: Flight }): JSX.Element {
  const f = p.flight
  const deer = f.stats?.byClass.deer ?? 0
  const classes = Object.entries(f.stats?.byClass ?? {}).sort((a, b) => b[1] - a[1])

  return (
    <div>
      <button className="ghost small" onClick={() => p.onSelect('')}>← All flights</button>
      <div className="card" style={{ marginTop: 8 }}>
        <h3>{f.fieldName}</h3>
        <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>
          {fmtDate(f.startedAt ?? f.createdAt)} → {fmtDate(f.endedAt)} · {f.controller} · <span className={`badge ${f.status}`}>{f.status}</span>
        </div>

        {deer > 0 && (
          <div className="banner err" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            🦌 <strong>{deer} deer detected</strong> — verify and clear before mowing. (RGB best-effort; thermal at dawn is more reliable.)
          </div>
        )}

        <div className="stat-grid">
          <div className="stat"><div className="v" style={{ color: CLASS_COLORS.cow }}>{f.stats?.byClass.cow ?? 0}</div><div className="k">🐄 Cows</div></div>
          <div className="stat"><div className="v" style={{ color: CLASS_COLORS.deer }}>{deer}</div><div className="k">🦌 Deer</div></div>
          <div className="stat"><div className="v">{f.detectionCount}</div><div className="k">Total animals</div></div>
          <div className="stat"><div className="v">{fmtDuration(f.plan.estDurationS)}</div><div className="k">Planned time</div></div>
        </div>
      </div>

      {classes.length > 0 && (
        <div className="card">
          <h3>Detected classes</h3>
          <div className="chips">
            {classes.map(([cls, n]) => (
              <span key={cls} className="chip" style={{ borderColor: CLASS_COLORS[cls] }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: CLASS_COLORS[cls], marginRight: 6 }} />
                {cls} · {n}
              </span>
            ))}
          </div>
          <div className="help">Detection backend: {f.detectionBackend ?? '—'}</div>
        </div>
      )}

      {f.videoPath && (
        <div className="card">
          <h3>Footage</h3>
          <video controls src={mediaUrl(f.videoPath)} />
          <a className="export-list" style={{ display: 'block', marginTop: 6 }} onClick={() => p.onReveal(f.videoPath!)}>📄 {f.videoPath}</a>
        </div>
      )}

      <div className="card">
        <h3>Mission</h3>
        <div className="muted" style={{ fontSize: 12, lineHeight: 1.7 }}>
          Altitude {f.plan.params.altitude} m · speed {f.plan.params.speed} m/s · overlap {Math.round(f.plan.params.sidelap * 100)}% · {f.plan.waypoints.length} waypoints
        </div>
        <div style={{ height: 10 }} />
        <button className="danger small" onClick={() => p.onDelete(f.id)}>Delete flight</button>
      </div>
    </div>
  )
}
