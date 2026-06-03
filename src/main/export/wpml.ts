// DJI WPML / KMZ waypoint-mission exporter.
//
// A DJI ".kmz" is a zip containing `wpmz/template.kml` and `wpmz/waylines.wpml`.
// The schema (wpml 1.0.x) is finicky and varies between firmware/app versions, so
// treat this as best-effort: ALWAYS verify the import in DJI Fly before flying, and
// fall back to the Litchi CSV export if a build rejects it. Coordinates are written
// lng,lat (KML order).

import JSZip from 'jszip'
import type { Field, MissionPlan } from '../../shared/types'
import { escapeXml } from './exporters'

const NS = 'xmlns="http://www.opengis.net/kml/2.2" xmlns:wpml="http://www.dji.com/wpmz/1.0.6"'

export async function buildWpmlKmz(field: Field, plan: MissionPlan): Promise<Buffer> {
  const template = templateKml(field, plan)
  const waylines = waylinesWpml(plan)

  const zip = new JSZip()
  const wpmz = zip.folder('wpmz')!
  wpmz.file('template.kml', template)
  wpmz.file('waylines.wpml', waylines)

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
}

function missionConfig(plan: MissionPlan): string {
  return `    <wpml:missionConfig>
      <wpml:flyToWaylineMode>safely</wpml:flyToWaylineMode>
      <wpml:finishAction>goHome</wpml:finishAction>
      <wpml:exitOnRCLost>executeLostAction</wpml:exitOnRCLost>
      <wpml:executeRCLostAction>goBack</wpml:executeRCLostAction>
      <wpml:globalTransitionalSpeed>${plan.params.speed.toFixed(1)}</wpml:globalTransitionalSpeed>
      <wpml:droneInfo>
        <wpml:droneEnumValue>68</wpml:droneEnumValue>
        <wpml:droneSubEnumValue>0</wpml:droneSubEnumValue>
      </wpml:droneInfo>
    </wpml:missionConfig>`
}

function templateKml(field: Field, plan: MissionPlan): string {
  const placemarks = plan.waypoints.map((w) => placemark(w.index, w.lng, w.lat, w.alt, w.heading)).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml ${NS}>
  <Document>
    <wpml:author>LitoX1 Cockpit</wpml:author>
    <wpml:createTime>0</wpml:createTime>
    <wpml:updateTime>0</wpml:updateTime>
${missionConfig(plan)}
    <Folder>
      <wpml:templateType>waypoint</wpml:templateType>
      <wpml:templateId>0</wpml:templateId>
      <wpml:waylineCoordinateSysParam>
        <wpml:coordinateMode>WGS84</wpml:coordinateMode>
        <wpml:heightMode>relativeToStartPoint</wpml:heightMode>
      </wpml:waylineCoordinateSysParam>
      <wpml:autoFlightSpeed>${plan.params.speed.toFixed(1)}</wpml:autoFlightSpeed>
      <wpml:gimbalPitchMode>usePointSetting</wpml:gimbalPitchMode>
      <name>${escapeXml(field.name)}</name>
${placemarks}
    </Folder>
  </Document>
</kml>`
}

function waylinesWpml(plan: MissionPlan): string {
  const placemarks = plan.waypoints.map((w) => placemark(w.index, w.lng, w.lat, w.alt, w.heading, true)).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml ${NS}>
  <Document>
${missionConfig(plan)}
    <Folder>
      <wpml:templateId>0</wpml:templateId>
      <wpml:waylineId>0</wpml:waylineId>
      <wpml:autoFlightSpeed>${plan.params.speed.toFixed(1)}</wpml:autoFlightSpeed>
${placemarks}
    </Folder>
  </Document>
</kml>`
}

function placemark(index: number, lng: number, lat: number, alt: number, heading: number, exec = false): string {
  const headingBlock = `        <wpml:waypointHeadingParam>
          <wpml:waypointHeadingMode>smoothTransition</wpml:waypointHeadingMode>
          <wpml:waypointHeadingAngle>${Math.round(heading)}</wpml:waypointHeadingAngle>
          <wpml:waypointPoiPoint>0.000000,0.000000,0.000000</wpml:waypointPoiPoint>
          <wpml:waypointHeadingPathMode>followBadArc</wpml:waypointHeadingPathMode>
        </wpml:waypointHeadingParam>`
  const turn = `        <wpml:waypointTurnParam>
          <wpml:waypointTurnMode>toPointAndStopWithDiscontinuityCurvature</wpml:waypointTurnMode>
          <wpml:waypointTurnDampingDist>0</wpml:waypointTurnDampingDist>
        </wpml:waypointTurnParam>`
  const execHeight = exec
    ? `        <wpml:executeHeight>${alt.toFixed(1)}</wpml:executeHeight>\n`
    : `        <wpml:ellipsoidHeight>${alt.toFixed(1)}</wpml:ellipsoidHeight>\n        <wpml:height>${alt.toFixed(1)}</wpml:height>\n`
  return `      <Placemark>
        <Point><coordinates>${lng.toFixed(8)},${lat.toFixed(8)}</coordinates></Point>
        <wpml:index>${index}</wpml:index>
${execHeight}${headingBlock}
${turn}
        <wpml:useGlobalSpeed>1</wpml:useGlobalSpeed>
        <wpml:gimbalPitchAngle>-90</wpml:gimbalPitchAngle>
      </Placemark>`
}
