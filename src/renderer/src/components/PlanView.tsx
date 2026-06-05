import { useState } from 'react'
import type { DetectionBackendInfo, ExportFormat, ExportResult, Field, FlightProgress, MissionParams, MissionPlan } from '@shared/types'
import { fmtDuration, fmtLen } from '../format'

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
  const [formats, setFormats] = useState<Record<ExportFormat, boolean>>({ wpml: true, litchi: true, kml: false, geojson: false })
  const [tab, setTab] = useState<'plan' | 'fly'>('plan')

  if (!p.field) {
    return <div className="empty">Select a field on the Fields tab, then come back here to plan the flight.</div>
  }

  const selectedFormats = ALL_FORMATS.filter((f) => formats[f.fmt]).map((f) => f.fmt)

  return (
    <div>
      <div className="plan-head">
        <div className="plan-name">{p.field.name}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
          {p.field.areaHa.toFixed(2)} ha · {p.field.polygon.length} boundary points
        </div>
      </div>

      <div className="segmented full" style={{ marginBottom: 14 }}>
        <button className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}>Parameters</button>
        <button className={tab === 'fly' ? 'active' : ''} onClick={() => setTab('fly')}>Export &amp; Fly</button>
      </div>

      {tab === 'plan' && (
        <>
          <div className="card">
            <h3>Flight parameters</h3>
            <Slider label="Altitude (AGL)" value={p.params.altitude} min={15} max={120} step={1} unit=" m" onChange={(v) => p.onParams({ altitude: v })} />
            <Slider label="Speed" value={p.params.speed} min={2} max={15} step={0.5} unit=" m/s" onChange={(v) => p.onParams({ speed: v })} />
            <Slider label="Side overlap" value={Math.round(p.params.sidelap * 100)} min={0} max={80} step={5} unit=" %" onChange={(v) => p.onParams({ sidelap: v / 100 })} />
            <Slider label="Sweep angle" value={p.params.angleDeg} min={0} max={179} step={1} unit="°" onChange={(v) => p.onParams({ angleDeg: v })} />
            <Slider label="Edge margin" value={p.params.marginM} min={0} max={20} step={1} unit=" m" onChange={(v) => p.onParams({ marginM: v })} />
          </div>

          {p.plan && (
            <div className="card">
              <h3>Flight estimate</h3>
              <div className="stat-grid">
                <div className="stat"><div className="v">{fmtDuration(p.plan.estDurationS)}</div><div className="k">Est. flight time</div></div>
                <div className="stat"><div className="v">{fmtLen(p.plan.pathLengthM)}</div><div className="k">Path length</div></div>
                <div className="stat"><div className="v">{p.plan.waypoints.length}</div><div className="k">Waypoints</div></div>
                <div className="stat"><div className="v">{p.plan.lineSpacingM} m</div><div className="k">Strip spacing</div></div>
              </div>
              <div style={{ height: 12 }} />
              <div className="banner info" style={{ marginBottom: 0 }}>
                Footprint {p.plan.footprintWidthM} m wide · est. {p.plan.estBatteryPct}% of one battery
                {p.plan.batteriesNeeded > 1 && <strong> · ⚠ needs {p.plan.batteriesNeeded} batteries (split the mission)</strong>}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'fly' && (
        <>
          <div className="card">
            <h3>Export mission → DJI Fly</h3>
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
              Export to…
            </button>
            {p.exports.length > 0 && (
              <div className="export-list" style={{ marginTop: 12 }}>
                {p.exports.map((e) => (
                  <a key={e.path} onClick={() => p.onReveal(e.path)} title="Reveal in file manager">📄 {e.path}</a>
                ))}
              </div>
            )}
            <div className="help" style={{ marginTop: 12 }}>
              WPML import compatibility varies by firmware — if DJI Fly rejects the .kmz, use the Litchi CSV. Fly in VLOS; fully unattended flight is the EASA/BAZL specific category.
            </div>
          </div>

          <div className="card">
            <h3>Fly the field</h3>
            {p.simProgress && p.simProgress.phase !== 'done' && (
              <div>
                <div className="muted">{p.simProgress.message}</div>
                <div className="progress"><div className="bar" style={{ width: `${Math.round(p.simProgress.progress * 100)}%` }} /></div>
              </div>
            )}
            <button className="primary" style={{ width: '100%', marginBottom: 8 }} disabled={p.busy} onClick={p.onSimulate}>
              ▶ Simulate flight (no hardware)
            </button>
            <button style={{ width: '100%' }} disabled={p.busy} onClick={p.onImportVideo}>
              ⬆ Import flight video for analysis
            </button>
            <div className="help">
              {p.backend
                ? <>Detection backend: <strong className={p.backend.kind === 'yolo' ? '' : 'muted'}>{p.backend.kind === 'yolo' ? 'YOLO' : 'Simulator/mock'}</strong> — {p.backend.detail}</>
                : 'Checking detection backend…'}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
