// Renderer-side geometry for live readouts (area/perimeter while drawing or editing).
// Mirrors src/main/geo/geo.ts intentionally so the numbers shown match what the
// backend stores on save. The renderer cannot import from src/main, hence this copy.

import type { LngLat } from '@shared/types'

const EARTH_R = 6378137 // metres (WGS84 semi-major axis)

interface Vec2 { x: number; y: number }

function centroid(poly: LngLat[]): LngLat {
  let lng = 0
  let lat = 0
  for (const p of poly) { lng += p.lng; lat += p.lat }
  return { lng: lng / poly.length, lat: lat / poly.length }
}

function toLocal(p: LngLat, origin: LngLat): Vec2 {
  const x = ((p.lng - origin.lng) * Math.PI) / 180 * EARTH_R * Math.cos((origin.lat * Math.PI) / 180)
  const y = ((p.lat - origin.lat) * Math.PI) / 180 * EARTH_R
  return { x, y }
}

function haversine(a: LngLat, b: LngLat): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Area in m² via the shoelace formula in a local metric frame. 0 for <3 points. */
export function areaSqMeters(poly: LngLat[]): number {
  if (poly.length < 3) return 0
  const origin = centroid(poly)
  const local = poly.map((p) => toLocal(p, origin))
  let a = 0
  for (let i = 0; i < local.length; i++) {
    const p = local[i]
    const q = local[(i + 1) % local.length]
    a += p.x * q.y - q.x * p.y
  }
  return Math.abs(a / 2)
}

export function areaHectares(poly: LngLat[]): number {
  return areaSqMeters(poly) / 10000
}

/** Closed-ring perimeter in metres. 0 for <2 points. */
export function perimeterMeters(poly: LngLat[]): number {
  if (poly.length < 2) return 0
  let len = 0
  for (let i = 0; i < poly.length; i++) len += haversine(poly[i], poly[(i + 1) % poly.length])
  return len
}
