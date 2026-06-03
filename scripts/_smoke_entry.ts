// Exercises the pure domain logic end-to-end (no Electron). Run via scripts/smoke.mjs.
import { writeFileSync, mkdirSync } from 'node:fs'
import JSZip from 'jszip'
import { planMission } from '../src/main/geo/coverage'
import { areaHectares } from '../src/main/geo/geo'
import { toGeoJson, toKml, toLitchiCsv } from '../src/main/export/exporters'
import { buildWpmlKmz } from '../src/main/export/wpml'
import { generateMockDetections } from '../src/main/detection/mock'
import { pixelToLngLat } from '../src/main/geo/geolocate'
import { parseSrt, sampleAt } from '../src/main/detection/srt'
import { DEFAULT_MISSION_PARAMS } from '../src/shared/types'

let failures = 0
function check(name: string, cond: boolean, detail = ''): void {
  console.log(`${cond ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
  if (!cond) failures++
}

const polygon = [
  { lng: 7.4205, lat: 46.9485 },
  { lng: 7.4243, lat: 46.9487 },
  { lng: 7.4249, lat: 46.9472 },
  { lng: 7.4233, lat: 46.9463 },
  { lng: 7.4204, lat: 46.9468 }
]
const field = {
  id: 'demo', name: 'Demo meadow', polygon,
  areaHa: areaHectares(polygon), createdAt: '', updatedAt: ''
}

// 1. Area
check('area is plausible (1–15 ha)', field.areaHa > 1 && field.areaHa < 15, `${field.areaHa.toFixed(2)} ha`)

// 2. Coverage planning
const plan = planMission(field.id, polygon, DEFAULT_MISSION_PARAMS, polygon[0])
check('plan has waypoints', plan.waypoints.length > 4, `${plan.waypoints.length} wps`)
check('path length > 0', plan.pathLengthM > 50, `${plan.pathLengthM} m`)
check('strip spacing positive', plan.lineSpacingM > 0, `${plan.lineSpacingM} m`)
check('duration estimated', plan.estDurationS > 0, `${plan.estDurationS}s`)
check('battery estimate present', plan.estBatteryPct > 0, `${plan.estBatteryPct}%`)
check('headings are finite', plan.waypoints.every((w) => Number.isFinite(w.heading)))

// 3. Denser overlap → tighter spacing → more waypoints
const dense = planMission(field.id, polygon, { ...DEFAULT_MISSION_PARAMS, sidelap: 0.8 }, polygon[0])
check('higher overlap yields more waypoints', dense.waypoints.length > plan.waypoints.length,
  `${plan.waypoints.length} → ${dense.waypoints.length}`)

// 4. Exporters
const csv = toLitchiCsv(plan)
check('Litchi CSV has header + rows', csv.startsWith('latitude,longitude') && csv.split('\n').length === plan.waypoints.length + 1)
const kml = toKml(field, plan)
check('KML well-formed-ish', kml.includes('<LineString>') && kml.includes('</kml>'))
const gj = JSON.parse(toGeoJson(field, plan))
check('GeoJSON parses to FeatureCollection', gj.type === 'FeatureCollection' && gj.features.length > 2)

// 5. WPML / KMZ
const kmz = await buildWpmlKmz(field, plan)
check('KMZ buffer produced', kmz.length > 200, `${kmz.length} bytes`)
const unzipped = await JSZip.loadAsync(kmz)
check('KMZ contains wpmz/template.kml', !!unzipped.file('wpmz/template.kml'))
check('KMZ contains wpmz/waylines.wpml', !!unzipped.file('wpmz/waylines.wpml'))

// 6. Mock detections
const dets = generateMockDetections('flight-1', field, 300)
check('mock detections generated', dets.length > 0, `${dets.length}`)
check('detections have classes', dets.every((d) => typeof d.cls === 'string' && d.confidence > 0))
const again = generateMockDetections('flight-1', field, 300)
check('mock detector is deterministic per flight id', again.length === dets.length)

// 7. Geolocation: a pixel offset to the right at heading 90° (east) should move east.
const center = pixelToLngLat({ lng: 7.42, lat: 46.95, aglAltitude: 40, headingDeg: 0 }, 1920, 1080)
check('center pixel maps to ~drone position', Math.abs(center.lng - 7.42) < 1e-4 && Math.abs(center.lat - 46.95) < 1e-4)
const east = pixelToLngLat({ lng: 7.42, lat: 46.95, aglAltitude: 40, headingDeg: 0 }, 3840, 1080)
check('right-edge pixel (heading 0) maps east of center', east.lng > center.lng, `Δlng=${(east.lng - center.lng).toExponential(2)}`)

// 8. SRT parsing
mkdirSync('scratch', { recursive: true })
const srt = `1
00:00:00,000 --> 00:00:01,000
[latitude: 46.9475] [longitude: 7.4220] [rel_alt: 40.0 abs_alt: 600.0]

2
00:00:01,000 --> 00:00:02,000
[latitude: 46.9476] [longitude: 7.4221] [rel_alt: 41.0 abs_alt: 601.0]
`
writeFileSync('scratch/test.srt', srt)
const samples = parseSrt('scratch/test.srt')
check('SRT parsed two samples', samples.length === 2, `${samples.length}`)
check('SRT sample has lat/lng/alt', samples[0].lat === 46.9475 && samples[0].lng === 7.422 && samples[0].altitude === 40)
const near = sampleAt(samples, 1.4)
check('sampleAt picks nearest', near?.timeS === 1)

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILED`)
process.exit(failures === 0 ? 0 : 1)
