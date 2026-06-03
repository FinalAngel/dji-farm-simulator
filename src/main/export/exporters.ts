// Text-based mission exporters: Litchi CSV, KML, GeoJSON.
// The DJI WPML/KMZ exporter lives in ./wpml.ts because it produces a zip.

import type { Field, MissionPlan } from '../../shared/types'

/** Litchi Mission Hub CSV — widely importable, rock-solid format. */
export function toLitchiCsv(plan: MissionPlan): string {
  const header = [
    'latitude', 'longitude', 'altitude(m)', 'heading(deg)', 'curvesize(m)',
    'rotationdir', 'gimbalmode', 'gimbalpitchangle',
    ...Array.from({ length: 15 }, (_, i) => [`actiontype${i + 1}`, `actionparam${i + 1}`]).flat(),
    'altitudemode', 'speed(m/s)',
    'poi_latitude', 'poi_longitude', 'poi_altitude(m)', 'poi_altitudemode',
    'photo_timeinterval', 'photo_distinterval'
  ].join(',')

  const rows = plan.waypoints.map((w) => {
    const actions = Array.from({ length: 15 }, () => ['-1', '0']).flat()
    return [
      w.lat.toFixed(8), w.lng.toFixed(8), w.alt.toFixed(1), w.heading.toFixed(0), '0',
      '0', '2' /* gimbal FPV->interpolate; 2 = focus POI off */, '-90' /* nadir */,
      ...actions,
      '1' /* AGL */, plan.params.speed.toFixed(1),
      '0', '0', '0', '0',
      '-1' /* photo time interval off; detection runs on continuous video */, '-1'
    ].join(',')
  })

  return [header, ...rows].join('\n')
}

/** Plain KML LineString + waypoint placemarks (Google Earth / generic GIS). */
export function toKml(field: Field, plan: MissionPlan): string {
  const coordStr = plan.waypoints.map((w) => `${w.lng},${w.lat},${w.alt}`).join(' ')
  const fieldRing = [...field.polygon, field.polygon[0]]
    .map((p) => `${p.lng},${p.lat},0`)
    .join(' ')
  const placemarks = plan.waypoints
    .map(
      (w) => `    <Placemark><name>WP${w.index}</name><Point><altitudeMode>relativeToGround</altitudeMode><coordinates>${w.lng},${w.lat},${w.alt}</coordinates></Point></Placemark>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(field.name)} coverage mission</name>
    <Placemark><name>Field boundary</name><Polygon><outerBoundaryIs><LinearRing><coordinates>${fieldRing}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>
    <Placemark><name>Flight path</name><LineString><altitudeMode>relativeToGround</altitudeMode><coordinates>${coordStr}</coordinates></LineString></Placemark>
${placemarks}
  </Document>
</kml>`
}

/** GeoJSON FeatureCollection: field polygon + flight line + waypoint points. */
export function toGeoJson(field: Field, plan: MissionPlan): string {
  const fc = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { kind: 'field', name: field.name, areaHa: field.areaHa },
        geometry: {
          type: 'Polygon',
          coordinates: [[...field.polygon, field.polygon[0]].map((p) => [p.lng, p.lat])]
        }
      },
      {
        type: 'Feature',
        properties: { kind: 'flightpath', lengthM: plan.pathLengthM },
        geometry: { type: 'LineString', coordinates: plan.waypoints.map((w) => [w.lng, w.lat]) }
      },
      ...plan.waypoints.map((w) => ({
        type: 'Feature',
        properties: { kind: 'waypoint', index: w.index, alt: w.alt, heading: w.heading },
        geometry: { type: 'Point', coordinates: [w.lng, w.lat] }
      }))
    ]
  }
  return JSON.stringify(fc, null, 2)
}

export function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!))
}
