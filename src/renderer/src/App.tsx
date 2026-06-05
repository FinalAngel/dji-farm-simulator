import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  DetectionBackendInfo, Detection, ExportFormat, ExportResult,
  Field, Flight, FlightProgress, LngLat, MissionParams, MissionPlan
} from '@shared/types'
import { DEFAULT_MISSION_PARAMS } from '@shared/types'
import { api } from './api'
import MapView, { CLASS_COLORS } from './components/MapView'
import FieldsView from './components/FieldsView'
import PlanView from './components/PlanView'
import FlightsView from './components/FlightsView'

type View = 'fields' | 'plan' | 'flights'

export default function App(): JSX.Element {
  const [view, setView] = useState<View>('fields')
  const [basemap, setBasemap] = useState<'satellite' | 'streets'>('satellite')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [fields, setFields] = useState<Field[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [drawing, setDrawing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<LngLat[]>([])

  const [params, setParams] = useState<MissionParams>(DEFAULT_MISSION_PARAMS)
  const [plan, setPlan] = useState<MissionPlan | null>(null)
  const [exports, setExports] = useState<ExportResult[]>([])
  const [backend, setBackend] = useState<DetectionBackendInfo | null>(null)

  const [flights, setFlights] = useState<Flight[]>([])
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null)
  const [flightDetections, setFlightDetections] = useState<Detection[]>([])

  const [simProgress, setSimProgress] = useState<FlightProgress | null>(null)
  const [livePos, setLivePos] = useState<LngLat | null>(null)

  const selectedField = useMemo(() => fields.find((f) => f.id === selectedId) ?? null, [fields, selectedId])
  const selectedFlight = useMemo(() => flights.find((f) => f.id === selectedFlightId) ?? null, [flights, selectedFlightId])

  const reloadFields = useCallback(async () => setFields(await api.fields.list()), [])
  const reloadFlights = useCallback(async () => setFlights(await api.flights.list()), [])

  const guard = async (fn: () => Promise<void>): Promise<void> => {
    setBusy(true); setError(null)
    try { await fn() } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  // ---- bootstrap ----
  useEffect(() => {
    reloadFields(); reloadFlights()
    api.system.backend().then(setBackend)
    const off = api.onFlightProgress((p) => {
      setSimProgress(p)
      if (p.position) setLivePos(p.position)
      if (p.phase === 'done') setTimeout(() => setLivePos(null), 1500)
    })
    return off
  }, [reloadFields, reloadFlights])

  // ---- recompute plan when field/params change ----
  useEffect(() => {
    if (!selectedId) { setPlan(null); return }
    let cancelled = false
    api.mission.plan(selectedId, params).then((p) => { if (!cancelled) { setPlan(p); setExports([]) } }).catch(() => {})
    return () => { cancelled = true }
  }, [selectedId, params])

  // ---- selected flight detail ----
  useEffect(() => {
    if (!selectedFlightId) { setFlightDetections([]); return }
    api.flights.detections(selectedFlightId).then(setFlightDetections)
  }, [selectedFlightId, flights])

  // ---- field drawing / editing ----
  const onMapClick = (ll: LngLat): void => { if (drawing) setDraft((d) => [...d, ll]) }
  const startDraw = (): void => { setDrawing(true); setEditingId(null); setDraft([]); setSelectedId(null) }
  const startEdit = (id: string): void => {
    const f = fields.find((x) => x.id === id)
    if (!f) return
    setDrawing(true)
    setEditingId(id)
    setDraft(f.polygon.map((p) => ({ ...p })))
    setSelectedId(id)
  }
  const cancelDraw = (): void => { setDrawing(false); setEditingId(null); setDraft([]) }
  const undoPoint = (): void => setDraft((d) => d.slice(0, -1))
  const moveDraftPoint = (i: number, ll: LngLat): void =>
    setDraft((d) => d.map((pt, idx) => (idx === i ? ll : pt)))
  const deleteDraftPoint = (i: number): void =>
    setDraft((d) => d.filter((_, idx) => idx !== i))

  const saveField = (name: string, notes: string): void => {
    guard(async () => {
      if (editingId) {
        const id = editingId
        await api.fields.update(id, { name, notes, polygon: draft })
        setDrawing(false); setEditingId(null); setDraft([])
        await reloadFields()
        setSelectedId(id)
      } else {
        const f = await api.fields.create({ name, notes, polygon: draft })
        setDrawing(false); setDraft([])
        await reloadFields()
        setSelectedId(f.id)
      }
    })
  }

  const loadDemo = (): void => {
    // A ~7 ha meadow near Bern, CH — gives an instantly flyable, countable field.
    const demo: LngLat[] = [
      { lng: 7.4205, lat: 46.9485 },
      { lng: 7.4243, lat: 46.9487 },
      { lng: 7.4249, lat: 46.9472 },
      { lng: 7.4233, lat: 46.9463 },
      { lng: 7.4204, lat: 46.9468 }
    ]
    guard(async () => {
      const f = await api.fields.create({ name: 'Demo meadow (Bern)', notes: 'Sample field for testing', polygon: demo })
      await reloadFields()
      setSelectedId(f.id)
      setView('plan')
    })
  }

  const deleteField = (id: string): void => {
    if (!confirm('Delete this field and its flights?')) return
    guard(async () => {
      await api.fields.remove(id)
      if (selectedId === id) setSelectedId(null)
      await reloadFields(); await reloadFlights()
    })
  }

  // ---- export & fly ----
  const onExport = (formats: ExportFormat[], chooseDir: boolean): void => {
    if (!selectedId) return
    guard(async () => setExports(await api.mission.exportMission(selectedId, params, formats, chooseDir)))
  }

  const onSimulate = (): void => {
    if (!selectedId) return
    setSimProgress(null)
    guard(async () => {
      const flight = await api.flights.simulate(selectedId, params)
      await reloadFlights()
      setSelectedFlightId(flight.id)
      setView('flights')
    })
  }

  const onImportVideo = (): void => {
    if (!selectedId) return
    guard(async () => {
      const video = await api.system.openVideo()
      if (!video) return
      const srt = await api.system.openSrt() // optional; user can cancel
      const flight = await api.flights.analyzeVideo(selectedId, params, video, srt ?? undefined)
      await reloadFlights()
      setSelectedFlightId(flight.id)
      setView('flights')
    })
  }

  const deleteFlight = (id: string): void => {
    if (!confirm('Delete this flight?')) return
    guard(async () => {
      await api.flights.remove(id)
      setSelectedFlightId(null)
      await reloadFlights()
    })
  }

  // ---- map composition per view ----
  const mapPath = view === 'flights' ? selectedFlight?.plan.waypoints ?? null : view === 'plan' ? plan?.waypoints ?? null : null
  const mapDetections = view === 'flights' ? flightDetections : null
  const mapSelected = view === 'flights' ? selectedFlight?.fieldId ?? null : selectedId

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">Lito&nbsp;<span>X1</span>&nbsp;Cockpit</div>
        <div className="nav">
          <button className={view === 'fields' ? 'active' : ''} onClick={() => setView('fields')}>Fields</button>
          {/* Wrapper span carries the tooltip so it still shows while the button is disabled (disabled buttons swallow hover). */}
          <span
            className="tip"
            data-tip={drawing ? 'Save or cancel the field first' : selectedId ? undefined : 'Select a field in the Fields tab first'}
            style={{ display: 'inline-flex' }}
          >
            <button className={view === 'plan' ? 'active' : ''} onClick={() => setView('plan')} disabled={!selectedId || drawing}>Plan &amp; Fly</button>
          </span>
          <span className="tip" data-tip={drawing ? 'Save or cancel the field first' : undefined} style={{ display: 'inline-flex' }}>
            <button className={view === 'flights' ? 'active' : ''} onClick={() => { setSelectedFlightId(null); setView('flights') }} disabled={drawing}>Flights</button>
          </span>
        </div>
        <div className="spacer" />
        {backend && <div className={`backend-pill ${backend.kind}`}>● {backend.kind === 'yolo' ? 'YOLO ready' : 'Simulator'}</div>}
      </div>

      <div className="body">
        <div className="sidebar">
          {error && <div className="banner err" onClick={() => setError(null)}>{error} <span className="muted">(click to dismiss)</span></div>}

          {view === 'fields' && (
            <FieldsView
              fields={fields} selectedId={selectedId} drawing={drawing} draft={draft}
              editField={editingId ? selectedField : null}
              onSelect={(id) => { if (!drawing) setSelectedId(id) }} onStartDraw={startDraw} onStartEdit={startEdit}
              onPlan={(id) => { setSelectedId(id); setView('plan') }}
              onClearSelection={() => setSelectedId(null)}
              onUndoPoint={undoPoint} onCancelDraw={cancelDraw} onSave={saveField} onDelete={deleteField} onLoadDemo={loadDemo}
            />
          )}
          {view === 'plan' && (
            <PlanView
              field={selectedField} params={params} plan={plan} backend={backend} exports={exports}
              simProgress={simProgress} busy={busy}
              onParams={(patch) => setParams((p) => ({ ...p, ...patch }))}
              onExport={onExport} onReveal={api.system.revealPath} onSimulate={onSimulate} onImportVideo={onImportVideo}
            />
          )}
          {view === 'flights' && (
            <FlightsView
              flights={flights} selectedId={selectedFlightId} selected={selectedFlight} detections={flightDetections}
              onSelect={(id) => setSelectedFlightId(id || null)} onDelete={deleteFlight} onReveal={api.system.revealPath}
            />
          )}
        </div>

        <div className="map-wrap">
          <MapView
            fields={fields} selectedId={mapSelected} drawing={drawing} editingId={editingId} draft={draft}
            path={mapPath} detections={mapDetections} livePosition={livePos} basemap={basemap}
            onSelectField={(id) => { if (!drawing && (view === 'fields' || view === 'plan')) setSelectedId(id) }}
            onMapClick={onMapClick} onMoveDraftPoint={moveDraftPoint} onDeleteDraftPoint={deleteDraftPoint}
          />
          <div className="basemap-toggle">
            <button className={`small ${basemap === 'satellite' ? 'primary' : ''}`} onClick={() => setBasemap('satellite')}>Satellite</button>
            <button className={`small ${basemap === 'streets' ? 'primary' : ''}`} onClick={() => setBasemap('streets')}>Map</button>
          </div>
          {mapDetections && mapDetections.length > 0 && (
            <div className="legend">
              {Object.entries(CLASS_COLORS).map(([cls, c]) => (
                <div className="lg" key={cls}><span className="dot" style={{ background: c }} />{cls}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
