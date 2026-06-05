import type { AppSettings, Basemap, DetectionBackendInfo, MissionParams } from '@shared/types'
import { DRONES } from '@shared/camera'

interface Props {
  settings: AppSettings
  backend: DetectionBackendInfo | null
  busy: boolean
  firstRun: boolean
  onChange: (patch: Partial<AppSettings>) => void
  onRecheckBackend: () => void
  onFinish: () => void
}

function Slider(props: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }): JSX.Element {
  return (
    <div className="slider-row">
      <label>{props.label}<span className="val">{props.value}{props.unit}</span></label>
      <input type="range" min={props.min} max={props.max} step={props.step} value={props.value}
        onChange={(e) => props.onChange(parseFloat(e.target.value))} />
    </div>
  )
}

export default function SettingsView(p: Props): JSX.Element {
  const s = p.settings
  const setParam = (patch: Partial<MissionParams>): void => p.onChange({ defaultParams: { ...s.defaultParams, ...patch } })
  const yolo = p.backend?.kind === 'yolo'

  return (
    <div>
      <div className="plan-head">
        <div className="plan-name">{p.firstRun ? 'Welcome 👋 — set up your cockpit' : 'Settings'}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
          {p.firstRun
            ? 'Pick the drone you fly and review the detection engine. You can change all of this later from the ⚙ button.'
            : 'Configure your aircraft, detection engine and defaults.'}
        </div>
      </div>

      <div className="card">
        <h3>Your drone</h3>
        <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>
          Drives coverage spacing, flight-time estimates and pixel→ground geolocation.
        </div>
        <div className="drone-list">
          {DRONES.map((d) => (
            <div
              key={d.id}
              className={`drone-item ${d.id === s.droneId ? 'active' : ''}`}
              onClick={() => p.onChange({ droneId: d.id })}
            >
              <div className="drone-top">
                <div className="name">{d.id === s.droneId ? '◉' : '○'} {d.name}</div>
                <span className={`badge ${d.msdk ? 'flying' : 'simulated'}`}>{d.msdk ? 'MSDK' : 'No SDK'}</span>
              </div>
              <div className="drone-specs muted">~{d.usableFlightMinutes} min usable · {d.hfovDeg}°×{d.vfovDeg}° FOV · {(d.videoWidth)}×{d.videoHeight}</div>
              <div className="drone-note muted">{d.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Detection engine</h3>
        <div className={`banner ${yolo ? 'info' : 'warn'}`}>
          <strong>{yolo ? '● Real YOLO detector active' : '● Simulator (mock detections)'}</strong>
          <div style={{ marginTop: 4 }}>{p.backend?.detail ?? 'Checking…'}</div>
        </div>
        <div className="help" style={{ marginTop: 0 }}>
          The <strong>Simulator</strong> generates synthetic, seeded counts so you can try the whole workflow with no setup —
          it powers “Simulate flight”. <strong>YOLO</strong> runs real object detection (Ultralytics) on imported flight
          video: cows count well; deer is RGB best-effort.
        </div>

        <div style={{ height: 12 }} />
        <label>Python interpreter (for YOLO)</label>
        <input
          value={s.pythonPath ?? ''}
          placeholder="/path/to/python/.venv/bin/python — leave blank to auto-detect"
          onChange={(e) => p.onChange({ pythonPath: e.target.value || undefined })}
        />
        <div className="help">To enable real detection, create a venv and install the detector, then point to it above:</div>
        <pre className="codeblock">python3 -m venv python/.venv
python/.venv/bin/pip install -r python/requirements.txt</pre>
        <button className="small" disabled={p.busy} onClick={p.onRecheckBackend}>↻ Re-check engine</button>

        <div style={{ height: 14 }} />
        <Slider label="Detection confidence" value={Math.round(s.minConfidence * 100)} min={10} max={90} step={5} unit=" %"
          onChange={(v) => p.onChange({ minConfidence: v / 100 })} />
        <div className="help" style={{ marginTop: 0 }}>Lower catches more animals but adds false positives; higher is stricter.</div>
      </div>

      <div className="card">
        <h3>Default flight parameters</h3>
        <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>Applied to a new field until you tune it in Plan &amp; Fly.</div>
        <Slider label="Altitude (AGL)" value={s.defaultParams.altitude} min={15} max={120} step={1} unit=" m" onChange={(v) => setParam({ altitude: v })} />
        <Slider label="Speed" value={s.defaultParams.speed} min={2} max={15} step={0.5} unit=" m/s" onChange={(v) => setParam({ speed: v })} />
        <Slider label="Side overlap" value={Math.round(s.defaultParams.sidelap * 100)} min={0} max={80} step={5} unit=" %" onChange={(v) => setParam({ sidelap: v / 100 })} />
        <Slider label="Sweep angle" value={s.defaultParams.angleDeg} min={0} max={179} step={1} unit="°" onChange={(v) => setParam({ angleDeg: v })} />
        <Slider label="Edge margin" value={s.defaultParams.marginM} min={0} max={20} step={1} unit=" m" onChange={(v) => setParam({ marginM: v })} />
      </div>

      <div className="card">
        <h3>Map</h3>
        <label>Default basemap</label>
        <div className="segmented full">
          {(['satellite', 'streets'] as Basemap[]).map((b) => (
            <button key={b} className={s.defaultBasemap === b ? 'active' : ''} onClick={() => p.onChange({ defaultBasemap: b })}>
              {b === 'satellite' ? 'Satellite' : 'Map'}
            </button>
          ))}
        </div>
      </div>

      {p.firstRun && (
        <button className="primary" style={{ width: '100%' }} onClick={p.onFinish}>
          Get started →
        </button>
      )}
    </div>
  )
}
