import { useEffect, useRef } from 'react'
import type { AppSettings, Basemap, DetectionBackendInfo, MissionParams } from '@shared/types'
import { DRONES } from '@shared/camera'
import { LANGS, type Lang } from '@shared/i18n'
import { useI18n } from '../i18n'

interface Props {
  settings: AppSettings
  backend: DetectionBackendInfo | null
  busy: boolean
  firstRun: boolean
  installing: boolean
  installLog: string[]
  scrollTo: { to: 'drone' | 'engine'; n: number } | null
  onChange: (patch: Partial<AppSettings>) => void
  onRecheckBackend: () => void
  onInstall: () => void
  onFinish: () => void
  onReset: () => void
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
  const { t } = useI18n()
  const s = p.settings
  const setParam = (patch: Partial<MissionParams>): void => p.onChange({ defaultParams: { ...s.defaultParams, ...patch } })
  const ready = p.backend?.kind === 'real'

  // Keep the install log scrolled to the latest line.
  const logRef = useRef<HTMLPreElement>(null)
  useEffect(() => { logRef.current?.scrollTo(0, logRef.current.scrollHeight) }, [p.installLog])

  // Jump to a section when arriving from a top-bar badge.
  const droneRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!p.scrollTo) return
    const el = p.scrollTo.to === 'drone' ? droneRef.current : engineRef.current
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [p.scrollTo?.n])

  return (
    <div>
      <div className="plan-head">
        <div className="plan-name">{p.firstRun ? t('settings.welcomeTitle') : t('settings.title')}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
          {p.firstRun ? t('settings.welcomeSub') : t('settings.sub')}
        </div>
      </div>

      {p.firstRun && (
        <button className="primary" style={{ width: '100%', marginBottom: 14 }} onClick={p.onFinish}>
          {t('settings.getStarted')}
        </button>
      )}

      <div className="card">
        <h3>{t('settings.language')}</h3>
        <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>{t('settings.languageHelp')}</div>
        <select value={s.language} onChange={(e) => p.onChange({ language: e.target.value as Lang })}>
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>

      <div className="card" ref={droneRef}>
        <h3>{t('settings.yourDrone')}</h3>
        <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>
          {t('settings.droneHelp')}
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
                <span className={`badge ${d.msdk ? 'flying' : 'simulated'}`}>{d.msdk ? t('settings.badgeMsdk') : t('settings.badgeNoSdk')}</span>
              </div>
              <div className="drone-specs muted">{t('settings.droneSpecs', { min: d.usableFlightMinutes, hfov: d.hfovDeg, vfov: d.vfovDeg, w: d.videoWidth, h: d.videoHeight })}</div>
              <div className="drone-note muted">{d.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" ref={engineRef}>
        <h3>{t('settings.detectionEngine')}</h3>
        <div className={`banner ${ready ? 'ok' : 'warn'}`}>
          <strong>{ready ? t('settings.realActive') : t('settings.simulatorMock')}</strong>
          <div style={{ marginTop: 4 }}>{p.backend?.detail ?? t('settings.checking')}</div>
        </div>
        <div className="help" style={{ marginTop: 0 }}>
          {t('settings.engineHelp')}
        </div>

        {!ready && (
          <>
            <div style={{ height: 12 }} />
            <button className="primary" style={{ width: '100%' }} disabled={p.installing} onClick={p.onInstall}>
              {p.installing ? t('settings.installing') : t('settings.installEngine')}
            </button>
            <div style={{ height: 8 }} />
            <button className="small" style={{ width: '100%' }} disabled={p.busy || p.installing} onClick={p.onRecheckBackend}>{t('settings.recheck')}</button>
            <div className="help">
              {t('settings.installHelp')}
            </div>
          </>
        )}

        {p.installLog.length > 0 && (
          <pre className="codeblock log" ref={logRef}>{p.installLog.join('\n')}</pre>
        )}

        <div style={{ height: 14 }} />
        <Slider label={t('settings.confidence')} value={Math.round(s.minConfidence * 100)} min={10} max={90} step={5} unit=" %"
          onChange={(v) => p.onChange({ minConfidence: v / 100 })} />
        <div className="help" style={{ marginTop: 0 }}>{t('settings.confidenceHelp')}</div>
      </div>

      <div className="card">
        <h3>{t('settings.defaultParams')}</h3>
        <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>{t('settings.defaultParamsHelp')}</div>
        <Slider label={t('params.altitude')} value={s.defaultParams.altitude} min={15} max={120} step={1} unit=" m" onChange={(v) => setParam({ altitude: v })} />
        <Slider label={t('params.speed')} value={s.defaultParams.speed} min={2} max={15} step={0.5} unit=" m/s" onChange={(v) => setParam({ speed: v })} />
        <Slider label={t('params.sideOverlap')} value={Math.round(s.defaultParams.sidelap * 100)} min={0} max={80} step={5} unit=" %" onChange={(v) => setParam({ sidelap: v / 100 })} />
        <Slider label={t('params.sweepAngle')} value={s.defaultParams.angleDeg} min={0} max={179} step={1} unit="°" onChange={(v) => setParam({ angleDeg: v })} />
        <Slider label={t('params.edgeMargin')} value={s.defaultParams.marginM} min={0} max={20} step={1} unit=" m" onChange={(v) => setParam({ marginM: v })} />
      </div>

      <div className="card">
        <h3>{t('settings.map')}</h3>
        <label>{t('settings.defaultBasemap')}</label>
        <div className="segmented full">
          {(['satellite', 'streets'] as Basemap[]).map((b) => (
            <button key={b} className={s.defaultBasemap === b ? 'active' : ''} onClick={() => p.onChange({ defaultBasemap: b })}>
              {b === 'satellite' ? t('topbar.satellite') : t('topbar.map')}
            </button>
          ))}
        </div>
      </div>

      {!p.firstRun && (
        <div className="card">
          <h3>{t('settings.reset')}</h3>
          <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
            {t('settings.resetHelp')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="danger small" onClick={p.onReset}>{t('settings.resetButton')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
