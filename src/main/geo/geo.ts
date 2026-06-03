// Lightweight planar geometry helpers. We project lng/lat to a local east/north
// metric frame around a chosen origin (equirectangular approximation). For field-
// sized areas (a few hundred metres) the distortion is negligible.

import type { LngLat } from '../../shared/types'

export const EARTH_R = 6378137 // metres (WGS84 semi-major axis)

export interface Vec2 {
  x: number // east, metres
  y: number // north, metres
}

export function toLocal(p: LngLat, origin: LngLat): Vec2 {
  const x = ((p.lng - origin.lng) * Math.PI) / 180 * EARTH_R * Math.cos((origin.lat * Math.PI) / 180)
  const y = ((p.lat - origin.lat) * Math.PI) / 180 * EARTH_R
  return { x, y }
}

export function toLngLat(v: Vec2, origin: LngLat): LngLat {
  const lat = origin.lat + (v.y / EARTH_R) * (180 / Math.PI)
  const lng = origin.lng + (v.x / (EARTH_R * Math.cos((origin.lat * Math.PI) / 180))) * (180 / Math.PI)
  return { lng, lat }
}

export function centroid(poly: LngLat[]): LngLat {
  let lng = 0
  let lat = 0
  for (const p of poly) {
    lng += p.lng
    lat += p.lat
  }
  return { lng: lng / poly.length, lat: lat / poly.length }
}

/** Signed area (m²) via the shoelace formula in the local frame. */
export function signedArea(local: Vec2[]): number {
  let a = 0
  for (let i = 0; i < local.length; i++) {
    const p = local[i]
    const q = local[(i + 1) % local.length]
    a += p.x * q.y - q.x * p.y
  }
  return a / 2
}

export function areaHectares(poly: LngLat[]): number {
  if (poly.length < 3) return 0
  const origin = centroid(poly)
  const local = poly.map((p) => toLocal(p, origin))
  return Math.abs(signedArea(local)) / 10000
}

export function perimeterMeters(poly: LngLat[]): number {
  if (poly.length < 2) return 0
  let len = 0
  for (let i = 0; i < poly.length; i++) {
    len += haversine(poly[i], poly[(i + 1) % poly.length])
  }
  return len
}

export function haversine(a: LngLat, b: LngLat): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Initial bearing from a→b in degrees (0 = north, clockwise). */
export function bearing(a: LngLat, b: LngLat): number {
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const y = Math.sin(dLng) * Math.cos(la2)
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLng)
  return (Math.atan2(y, x) * 180) / Math.PI
}

/** Ray-casting point-in-polygon test in the local frame. */
export function pointInPolygon(pt: Vec2, ring: Vec2[]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i].x
    const yi = ring[i].y
    const xj = ring[j].x
    const yj = ring[j].y
    const intersect = yi > pt.y !== yj > pt.y && pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/** Random point uniformly distributed inside a lng/lat polygon (rejection sampling). */
export function randomPointInPolygon(poly: LngLat[], rnd: () => number = Math.random): LngLat {
  const origin = centroid(poly)
  const local = poly.map((p) => toLocal(p, origin))
  const xs = local.map((p) => p.x)
  const ys = local.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  for (let i = 0; i < 200; i++) {
    const cand = { x: minX + rnd() * (maxX - minX), y: minY + rnd() * (maxY - minY) }
    if (pointInPolygon(cand, local)) return toLngLat(cand, origin)
  }
  return origin // degenerate fallback
}
