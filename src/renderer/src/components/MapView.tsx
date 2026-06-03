import { useEffect, useRef } from 'react'
import maplibregl, { Map as MlMap, GeoJSONSource } from 'maplibre-gl'
import type { Detection, Field, LngLat, Waypoint } from '@shared/types'

export const CLASS_COLORS: Record<string, string> = {
  cow: '#f4a261',
  deer: '#ff4d4d',
  sheep: '#a8dadc',
  horse: '#b5838d',
  dog: '#9aa7b2',
  person: '#ffffff',
  other: '#cccccc'
}

interface Props {
  fields: Field[]
  selectedId: string | null
  drawing: boolean
  draft: LngLat[]
  path: Waypoint[] | null
  detections: Detection[] | null
  livePosition: LngLat | null
  basemap: 'satellite' | 'streets'
  onSelectField: (id: string) => void
  onMapClick: (ll: LngLat) => void
}

const EMPTY = { type: 'FeatureCollection', features: [] } as const

function makeStyle(): maplibregl.StyleSpecification {
  return {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      satellite: {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: 'Imagery © Esri'
      },
      streets: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [
      { id: 'satellite', type: 'raster', source: 'satellite', layout: { visibility: 'visible' } },
      { id: 'streets', type: 'raster', source: 'streets', layout: { visibility: 'none' } }
    ]
  }
}

export default function MapView(props: Props): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MlMap | null>(null)
  const readyRef = useRef(false)
  // Keep latest props for the click handler closure.
  const propsRef = useRef(props)
  propsRef.current = props

  // ---- init once ----
  useEffect(() => {
    if (!containerRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: makeStyle(),
      center: [8.23, 46.8], // Switzerland
      zoom: 7,
      attributionControl: { compact: true }
    })
    mapRef.current = map
    map.on('error', (e) => console.error('[maplibre]', (e as { error?: Error }).error?.message ?? e))
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right')

    // Keep the GL canvas in sync with the container (fixes blank map if the flex
    // layout sizes the container after the map is created).
    const ro = new ResizeObserver(() => map.resize())
    if (containerRef.current) ro.observe(containerRef.current)
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')

    map.on('load', () => {
      const src = (id: string) => map.addSource(id, { type: 'geojson', data: EMPTY as never })
      src('fields')
      src('draft')
      src('path')
      src('detections')
      src('live')

      map.addLayer({
        id: 'fields-fill', type: 'fill', source: 'fields',
        paint: {
          'fill-color': ['case', ['get', 'selected'], '#4cc2ff', '#7fb3d5'],
          'fill-opacity': ['case', ['get', 'selected'], 0.22, 0.1]
        }
      })
      map.addLayer({
        id: 'fields-line', type: 'line', source: 'fields',
        paint: {
          'line-color': ['case', ['get', 'selected'], '#4cc2ff', '#7fb3d5'],
          'line-width': ['case', ['get', 'selected'], 2.5, 1.2]
        }
      })
      map.addLayer({ id: 'draft-fill', type: 'fill', source: 'draft', paint: { 'fill-color': '#4cc2ff', 'fill-opacity': 0.15 } })
      map.addLayer({ id: 'draft-line', type: 'line', source: 'draft', paint: { 'line-color': '#4cc2ff', 'line-width': 2, 'line-dasharray': [2, 1] } })
      map.addLayer({ id: 'draft-pts', type: 'circle', source: 'draft', filter: ['==', '$type', 'Point'], paint: { 'circle-radius': 5, 'circle-color': '#4cc2ff', 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5 } })

      map.addLayer({ id: 'path-line', type: 'line', source: 'path', filter: ['==', '$type', 'LineString'], paint: { 'line-color': '#ffd166', 'line-width': 2, 'line-opacity': 0.9 } })
      map.addLayer({ id: 'path-home', type: 'circle', source: 'path', filter: ['==', ['get', 'home'], true], paint: { 'circle-radius': 7, 'circle-color': '#5bd99a', 'circle-stroke-color': '#0f1419', 'circle-stroke-width': 2 } })

      map.addLayer({
        id: 'det', type: 'circle', source: 'detections',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 4, 18, 9],
          'circle-color': ['match', ['get', 'cls'],
            'cow', CLASS_COLORS.cow, 'deer', CLASS_COLORS.deer, 'sheep', CLASS_COLORS.sheep,
            'horse', CLASS_COLORS.horse, 'dog', CLASS_COLORS.dog, 'person', CLASS_COLORS.person,
            CLASS_COLORS.other],
          'circle-stroke-color': '#0f1419',
          'circle-stroke-width': 1.5,
          'circle-opacity': 0.95
        }
      })
      // Pulse ring for deer (the safety-critical class).
      map.addLayer({
        id: 'det-deer-ring', type: 'circle', source: 'detections', filter: ['==', ['get', 'cls'], 'deer'],
        paint: { 'circle-radius': 16, 'circle-color': 'transparent', 'circle-stroke-color': CLASS_COLORS.deer, 'circle-stroke-width': 2, 'circle-stroke-opacity': 0.6 }
      }, 'det')

      map.addLayer({ id: 'live', type: 'circle', source: 'live', paint: { 'circle-radius': 8, 'circle-color': '#4cc2ff', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } })

      readyRef.current = true
      syncAll(map, propsRef.current)
      fitToFields(map, propsRef.current)
    })

    map.on('click', (e) => {
      const p = propsRef.current
      const ll = { lng: e.lngLat.lng, lat: e.lngLat.lat }
      if (p.drawing) {
        p.onMapClick(ll)
        return
      }
      const hits = map.queryRenderedFeatures(e.point, { layers: ['fields-fill'] })
      const id = hits[0]?.properties?.id as string | undefined
      if (id) p.onSelectField(id)
    })

    map.on('mousemove', (e) => {
      if (propsRef.current.drawing) return
      const hits = map.queryRenderedFeatures(e.point, { layers: ['fields-fill', 'det'] })
      map.getCanvas().style.cursor = hits.length ? 'pointer' : ''
    })

    return () => { ro.disconnect(); map.remove() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- react to prop changes ----
  useEffect(() => { if (readyRef.current && mapRef.current) syncFields(mapRef.current, props) }, [props.fields, props.selectedId])
  useEffect(() => { if (readyRef.current && mapRef.current) syncDraft(mapRef.current, props) }, [props.draft])
  useEffect(() => { if (readyRef.current && mapRef.current) syncPath(mapRef.current, props) }, [props.path])
  useEffect(() => { if (readyRef.current && mapRef.current) syncDetections(mapRef.current, props) }, [props.detections])
  useEffect(() => { if (readyRef.current && mapRef.current) syncLive(mapRef.current, props) }, [props.livePosition])
  useEffect(() => {
    const map = mapRef.current
    if (!readyRef.current || !map) return
    map.setLayoutProperty('satellite', 'visibility', props.basemap === 'satellite' ? 'visible' : 'none')
    map.setLayoutProperty('streets', 'visibility', props.basemap === 'streets' ? 'visible' : 'none')
  }, [props.basemap])

  // Fit when the selected field changes (and exists).
  const lastFit = useRef<string | null>(null)
  useEffect(() => {
    const map = mapRef.current
    if (!readyRef.current || !map || !props.selectedId) return
    if (lastFit.current === props.selectedId) return
    lastFit.current = props.selectedId
    const f = props.fields.find((x) => x.id === props.selectedId)
    if (f) fitToPolygon(map, f.polygon)
  }, [props.selectedId, props.fields])

  // App.tsx already wraps this in a positioned `.map-wrap`; fill it completely.
  return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
}

// ---- helpers ----
function setData(map: MlMap, id: string, data: unknown): void {
  const s = map.getSource(id) as GeoJSONSource | undefined
  if (s) s.setData(data as never)
}

function ringFeature(poly: LngLat[], props: Record<string, unknown>) {
  return {
    type: 'Feature' as const,
    properties: props,
    geometry: { type: 'Polygon' as const, coordinates: [[...poly, poly[0]].map((p) => [p.lng, p.lat])] }
  }
}

function syncFields(map: MlMap, p: Props): void {
  setData(map, 'fields', {
    type: 'FeatureCollection',
    features: p.fields.filter((f) => f.polygon.length >= 3).map((f) =>
      ringFeature(f.polygon, { id: f.id, name: f.name, selected: f.id === p.selectedId })
    )
  })
}

function syncDraft(map: MlMap, p: Props): void {
  const features: unknown[] = p.draft.map((pt, i) => ({
    type: 'Feature', properties: { i }, geometry: { type: 'Point', coordinates: [pt.lng, pt.lat] }
  }))
  if (p.draft.length >= 2) {
    features.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: p.draft.map((pt) => [pt.lng, pt.lat]) } })
  }
  if (p.draft.length >= 3) features.push(ringFeature(p.draft, {}))
  setData(map, 'draft', { type: 'FeatureCollection', features })
}

function syncPath(map: MlMap, p: Props): void {
  if (!p.path || p.path.length < 2) { setData(map, 'path', EMPTY); return }
  const coords = p.path.map((w) => [w.lng, w.lat])
  setData(map, 'path', {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } },
      { type: 'Feature', properties: { home: true }, geometry: { type: 'Point', coordinates: coords[0] } }
    ]
  })
}

function syncDetections(map: MlMap, p: Props): void {
  if (!p.detections) { setData(map, 'detections', EMPTY); return }
  setData(map, 'detections', {
    type: 'FeatureCollection',
    features: p.detections.map((d) => ({
      type: 'Feature',
      properties: { cls: d.cls, confidence: d.confidence },
      geometry: { type: 'Point', coordinates: [d.lng, d.lat] }
    }))
  })
}

function syncLive(map: MlMap, p: Props): void {
  if (!p.livePosition) { setData(map, 'live', EMPTY); return }
  setData(map, 'live', {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [p.livePosition.lng, p.livePosition.lat] } }]
  })
}

function syncAll(map: MlMap, p: Props): void {
  syncFields(map, p); syncDraft(map, p); syncPath(map, p); syncDetections(map, p); syncLive(map, p)
}

function bounds(coords: number[][]): maplibregl.LngLatBoundsLike {
  let w = 180, s = 90, e = -180, n = -90
  for (const [lng, lat] of coords) { w = Math.min(w, lng); e = Math.max(e, lng); s = Math.min(s, lat); n = Math.max(n, lat) }
  return [[w, s], [e, n]]
}

function fitToPolygon(map: MlMap, poly: LngLat[]): void {
  if (poly.length < 1) return
  map.fitBounds(bounds(poly.map((p) => [p.lng, p.lat])), { padding: 80, maxZoom: 18, duration: 600 })
}

function fitToFields(map: MlMap, p: Props): void {
  const all = p.fields.flatMap((f) => f.polygon.map((pt) => [pt.lng, pt.lat]))
  if (all.length) map.fitBounds(bounds(all), { padding: 80, maxZoom: 16, duration: 0 })
}
