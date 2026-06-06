import { useState } from 'react'
import type { DetectionBackendInfo, ExportFormat, ExportResult, Field, FlightProgress, MissionParams, MissionPlan } from '@shared/types'
import { fmtDuration, fmtLen } from '../format'
import { useI18n } from '../i18n'

interface Props {
  field: Field | null
  params: MissionParams
  plan: MissionPlan | null
  backend: DetectionBackendInfo | null
  exports: ExportResult[]
  simProgress: FlightProgress | null
  busy: boolean
  onParams: (patch: Partial<MissionParams>) => void
  onExport: (formats: ExportFormat[], chooseDir: boolean) => void
  onReveal: (path: string) => void
  onSimulate: () => void
  onImportVideo: () => void
}

const ALL_FORMATS: { fmt: ExportFormat; label: string }[] = [
  { fmt: 'wpml', label: 'DJI WPML (.kmz)' },
  { fmt: 'litchi', label: 'Litchi (.csv)' },
  { fmt: 'kml', label: 'KML' },
  { fmt: 'geojson', label: 'GeoJSON' }
]

function Slider(props: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }): JSX.Element {
  return (
    <div className="slider-row">
      <label>{props.label}<span className="val">{props.value}{props.unit}</span></label>
      <input type="range" min={props.min} max={props.max} step={props.step} value={props.value}
        onChange={(e) => props.onChange(parseFloat(e.target.value))} />
    </div>
  )
}

export default function PlanView(p: Props): JSX.Element {
  const { t } = useI18n()
  const [formats, setFormats] = useState<Record<ExportFormat, boolean>>({ wpml: true, litchi: true, kml: false, geojson: false })
  const [tab, setTab] = useState<'plan' | 'fly'>('plan')

  if (!p.field) {
    return <div className="empty">{t('plan.selectPrompt')}</div>
  }

  const selectedFormats = ALL_FORMATS.filter((f) => formats[f.fmt]).map((f) => f.fmt)

  return (
    <div>
      <div className="plan-head">
        <div className="plan-name">{p.field.name}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
          {t('plan.boundaryPoints', { area: p.field.areaHa.toFixed(2), points: p.field.polygon.length })}
        </div>
      </div>

      <div className="segmented full" style={{ marginBottom: 14 }}>
        <button className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}>{t('plan.tabParameters')}</button>
        <button className={tab === 'fly' ? 'active' : ''} onClick={() => setTab('fly')}>{t('plan.tabExportFly')}</button>
      </div>

      {tab === 'plan' && (
        <>
          <div className="card">
            <h3>{t('plan.flightParameters')}</h3>
            <Slider label={t('params.altitude')} value={p.params.altitude} min={15} max={120} step={1} unit=" m" onChange={(v) => p.onParams({ altitude: v })} />
            <Slider label={t('params.speed')} value={p.params.speed} min={2} max={15} step={0.5} unit=" m/s" onChange={(v) => p.onParams({ speed: v })} />
            <Slider label={t('params.sideOverlap')} value={Math.round(p.params.sidelap * 100)} min={0} max={80} step={5} unit=" %" onChange={(v) => p.onParams({ sidelap: v / 100 })} />
            <Slider label={t('params.sweepAngle')} value={p.params.angleDeg} min={0} max={179} step={1} unit="°" onChange={(v) => p.onParams({ angleDeg: v })} />
            <Slider label={t('params.edgeMargin')} value={p.params.marginM} min={0} max={20} step={1} unit=" m" onChange={(v) => p.onParams({ marginM: v })} />
          </div>

          {p.plan && (
            <div className="card">
              <h3>{t('plan.flightEstimate')}</h3>
              <div className="stat-grid">
                <div className="stat"><div className="v">{fmtDuration(p.plan.estDurationS)}</div><div className="k">{t('plan.estFlightTime')}</div></div>
                <div className="stat"><div className="v">{fmtLen(p.plan.pathLengthM)}</div><div className="k">{t('plan.pathLength')}</div></div>
                <div className="stat"><div className="v">{p.plan.waypoints.length}</div><div className="k">{t('plan.waypoints')}</div></div>
                <div className="stat"><div className="v">{p.plan.lineSpacingM} m</div><div className="k">{t('plan.stripSpacing')}</div></div>
              </div>
              <div style={{ height: 12 }} />
              <div className="banner info" style={{ marginBottom: 0 }}>
                {t('plan.footprintInfo', { width: p.plan.footprintWidthM, pct: p.plan.estBatteryPct })}
                {p.plan.batteriesNeeded > 1 && <strong>{t('plan.batteriesWarn', { count: p.plan.batteriesNeeded })}</strong>}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'fly' && (
        <>
          <div className="card">
            <h3>{t('plan.exportTitle')}</h3>
            <div className="chips" style={{ marginBottom: 14 }}>
              {ALL_FORMATS.map((f) => (
                <label key={f.fmt} className="chip" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: 'auto', marginRight: 6 }} checked={formats[f.fmt]}
                    onChange={(e) => setFormats({ ...formats, [f.fmt]: e.target.checked })} />
                  {f.label}
                </label>
              ))}
            </div>
            <button className="primary" style={{ width: '100%' }} disabled={p.busy || selectedFormats.length === 0} onClick={() => p.onExport(selectedFormats, true)}>
              {t('plan.exportTo')}
            </button>
            {p.exports.length > 0 && (
              <div className="export-list" style={{ marginTop: 12 }}>
                {p.exports.map((e) => (
                  <a key={e.path} onClick={() => p.onReveal(e.path)} title={t('plan.revealTitle')}>📄 {e.path}</a>
                ))}
              </div>
            )}
            <div className="help" style={{ marginTop: 12 }}>
              {t('plan.wpmlHelp')}
            </div>
          </div>

          <div className="card">
            <h3>{t('plan.flyTitle')}</h3>
            {p.simProgress && p.simProgress.phase !== 'done' && (
              <div>
                <div className="muted">{p.simProgress.message}</div>
                <div className="progress"><div className="bar" style={{ width: `${Math.round(p.simProgress.progress * 100)}%` }} /></div>
              </div>
            )}
            <button className="primary" style={{ width: '100%', marginBottom: 8 }} disabled={p.busy} onClick={p.onSimulate}>
              {t('plan.simulate')}
            </button>
            <button style={{ width: '100%' }} disabled={p.busy} onClick={p.onImportVideo}>
              {t('plan.importVideo')}
            </button>
            <div className="help">
              {p.backend
                ? <>{t('plan.backendLabel')} <strong className={p.backend.kind === 'real' ? '' : 'muted'}>{p.backend.kind === 'real' ? t('plan.backendReal') : t('plan.backendMock')}</strong> — {p.backend.detail}</>
                : t('plan.backendChecking')}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
