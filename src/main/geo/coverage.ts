// Boustrophedon ("lawnmower") coverage path planning.
//
// We rotate the field into a frame where sweep lines are horizontal, scan from one
// side to the other at `lineSpacing` apart, intersect each scan line with the
// polygon, and stitch the resulting segments into a back-and-forth path. Concave
// fields that produce multiple segments per scan line are handled by ordering the
// segments along the sweep direction.

import type { LngLat, MissionParams, MissionPlan, Waypoint } from '../../shared/types'
import { LITO_X1, type CameraSpec } from '../../shared/camera'
import { footprintMeters, lineSpacing } from './footprint'
import { bearing, centroid, haversine, toLngLat, toLocal, Vec2 } from './geo'

export function planMission(
  fieldId: string,
  polygon: LngLat[],
  params: MissionParams,
  home?: LngLat,
  cam: CameraSpec = LITO_X1
): MissionPlan {
  const origin = centroid(polygon)
  const local = polygon.map((p) => toLocal(p, origin))

  // Rotate field by -angle so strips run along the X axis.
  const a = (params.angleDeg * Math.PI) / 180
  const ca = Math.cos(-a)
  const sa = Math.sin(-a)
  const rot = (p: Vec2): Vec2 => ({ x: p.x * ca - p.y * sa, y: p.x * sa + p.y * ca })
  const ica = Math.cos(a)
  const isa = Math.sin(a)
  const unrot = (p: Vec2): Vec2 => ({ x: p.x * ica - p.y * isa, y: p.x * isa + p.y * ica })

  const rpoly = local.map(rot)
  const ys = rpoly.map((p) => p.y)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const spacing = lineSpacing(params.altitude, params.sidelap, cam)
  const ordered: Vec2[] = []
  let dir = 1

  for (let y = minY + spacing / 2; y < maxY; y += spacing) {
    const crossings: number[] = []
    for (let i = 0; i < rpoly.length; i++) {
      const A = rpoly[i]
      const B = rpoly[(i + 1) % rpoly.length]
      if ((A.y <= y && B.y > y) || (B.y <= y && A.y > y)) {
        const t = (y - A.y) / (B.y - A.y)
        crossings.push(A.x + t * (B.x - A.x))
      }
    }
    crossings.sort((p, q) => p - q)

    const segs: Array<[number, number]> = []
    for (let i = 0; i + 1 < crossings.length; i += 2) {
      let x0 = crossings[i]
      let x1 = crossings[i + 1]
      if (x1 - x0 > 2 * params.marginM) {
        x0 += params.marginM
        x1 -= params.marginM
      }
      segs.push([x0, x1])
    }
    if (dir < 0) segs.reverse()
    for (const [x0, x1] of segs) {
      if (dir > 0) {
        ordered.push({ x: x0, y }, { x: x1, y })
      } else {
        ordered.push({ x: x1, y }, { x: x0, y })
      }
    }
    dir *= -1
  }

  // Un-rotate and convert back to lng/lat.
  const coords = ordered.map((p) => toLngLat(unrot(p), origin))

  // Prepend/append the home point so the aircraft launches and returns there.
  const start = home ?? origin
  const route: LngLat[] = [start, ...coords, start]

  const waypoints: Waypoint[] = coords.map((ll, i) => {
    const next = coords[Math.min(i + 1, coords.length - 1)]
    return {
      index: i,
      lng: ll.lng,
      lat: ll.lat,
      alt: params.altitude,
      speed: params.speed,
      heading: Math.round(bearing(ll, next))
    }
  })

  let pathLengthM = 0
  for (let i = 1; i < route.length; i++) pathLengthM += haversine(route[i - 1], route[i])

  const { width } = footprintMeters(params.altitude, cam)

  // Time: cruise distance + a fixed turn penalty per strip reversal.
  const turns = Math.max(0, waypoints.length / 2 - 1)
  const estDurationS = pathLengthM / Math.max(1, params.speed) + turns * 3 + 20 /* takeoff/land */

  const usableSeconds = cam.usableFlightMinutes * 60
  const estBatteryPct = (estDurationS / usableSeconds) * 100
  const batteriesNeeded = Math.max(1, Math.ceil(estDurationS / usableSeconds))

  return {
    fieldId,
    params,
    waypoints,
    lineSpacingM: round(spacing, 2),
    footprintWidthM: round(width, 1),
    pathLengthM: round(pathLengthM, 1),
    estDurationS: Math.round(estDurationS),
    estBatteryPct: round(estBatteryPct, 1),
    batteriesNeeded
  }
}

function round(v: number, dp: number): number {
  const f = 10 ** dp
  return Math.round(v * f) / f
}
