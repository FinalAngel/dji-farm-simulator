import type { Detection, Flight } from '@shared/types'
import { CLASS_COLORS } from './MapView'
import { fmtDate, fmtDuration } from '../format'
import { useI18n } from '../i18n'

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
  const { t, locale } = useI18n()
  if (p.selected) return <Detail {...p} flight={p.selected} />

  return (
    <div>
      <div className="plan-head">
        <div className="plan-name">{t('flights.title')}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
          {t('flights.subtitle')}
        </div>
      </div>

      {p.flights.length === 0 ? (
        <div className="empty-state">
          <div className="ico">🛰️</div>
          <div className="title">{t('flights.noneTitle')}</div>
          <div>{t('flights.noneBody')}</div>
        </div>
      ) : (
        <div className="flight-list">
          {p.flights.map((f) => (
          <div key={f.id} className={`flight-item ${f.id === p.selectedId ? 'active' : ''}`} onClick={() => p.onSelect(f.id)}>
            <div className="top">
              <strong>{f.fieldName}</strong>
              <span className={`badge ${f.status}`}>{t(`status.${f.status}`)}</span>
            </div>
            <div className="muted" style={{ fontSize: 12, margin: '4px 0' }}>
              {fmtDate(f.createdAt, locale)} · {t(`controller.${f.controller}`)}
            </div>
            <div className="chips">
              <span className="chip cow">{t('flights.cows', { count: f.stats?.byClass.cow ?? 0 })}</span>
              <span className="chip deer">{t('flights.deer', { count: f.stats?.byClass.deer ?? 0 })}</span>
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
  const { t, locale } = useI18n()
  const f = p.flight
  const deer = f.stats?.byClass.deer ?? 0
  const classes = Object.entries(f.stats?.byClass ?? {}).sort((a, b) => b[1] - a[1])

  return (
    <div>
      <button className="small" style={{ marginBottom: 12 }} onClick={() => p.onSelect('')}>{t('flights.allFlights')}</button>

      <div className="plan-head">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div className="plan-name">{f.fieldName}</div>
          <span className={`badge ${f.status}`}>{t(`status.${f.status}`)}</span>
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
          {fmtDate(f.startedAt ?? f.createdAt, locale)} → {fmtDate(f.endedAt, locale)} · {t(`controller.${f.controller}`)}
        </div>
      </div>

      {deer > 0 && (
        <div className="banner err">
          <strong>{t('flights.deerAlertTitle', { count: deer })}</strong>
          <div style={{ marginTop: 4 }}>{t('flights.deerAlertBody')}</div>
        </div>
      )}

      <div className="card">
        <h3>{t('flights.detections')}</h3>
        <div className="stat-grid">
          <div className="stat"><div className="v" style={{ color: CLASS_COLORS.cow }}>{f.stats?.byClass.cow ?? 0}</div><div className="k">{t('flights.cowsLabel')}</div></div>
          <div className="stat"><div className="v" style={{ color: CLASS_COLORS.deer }}>{deer}</div><div className="k">{t('flights.deerLabel')}</div></div>
          <div className="stat"><div className="v">{f.detectionCount}</div><div className="k">{t('flights.totalAnimals')}</div></div>
          <div className="stat"><div className="v">{fmtDuration(f.plan.estDurationS)}</div><div className="k">{t('flights.plannedTime')}</div></div>
        </div>
      </div>

      {classes.length > 0 && (
        <div className="card">
          <h3>{t('flights.detectedClasses')}</h3>
          <div className="chips">
            {classes.map(([cls, n]) => (
              <span key={cls} className="chip" style={{ borderColor: CLASS_COLORS[cls] }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: CLASS_COLORS[cls], marginRight: 6 }} />
                {t(`cls.${cls}`)} · {n}
              </span>
            ))}
          </div>
          <div className="help">{t('flights.detectionBackend', { name: f.detectionBackend ?? '—' })}</div>
        </div>
      )}

      {f.videoPath && (
        <div className="card">
          <h3>{t('flights.footage')}</h3>
          <video controls src={mediaUrl(f.videoPath)} />
          <a className="export-list" style={{ display: 'block', marginTop: 6 }} onClick={() => p.onReveal(f.videoPath!)}>📄 {f.videoPath}</a>
        </div>
      )}

      <div className="card">
        <h3>{t('flights.mission')}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
          <div className="muted" style={{ fontSize: 12, lineHeight: 1.7 }}>
            {t('flights.missionSummary', { alt: f.plan.params.altitude, speed: f.plan.params.speed, overlap: Math.round(f.plan.params.sidelap * 100), waypoints: f.plan.waypoints.length })}
          </div>
          <button className="danger small" style={{ flexShrink: 0 }} onClick={() => p.onDelete(f.id)}>{t('flights.deleteFlight')}</button>
        </div>
      </div>
    </div>
  )
}
