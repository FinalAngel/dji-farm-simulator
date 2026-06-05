// Synthetic detector. Produces plausible, geolocated detections inside the field so
// the whole pipeline (storage, stats, map, history) is demonstrable without a real
// flight or a detector install. Used by the simulated controller.

import { randomUUID } from 'node:crypto'
import type { Detection, DetectionClass, Field } from '../../shared/types'
import { randomPointInPolygon } from '../geo/geo'

// Weighted herd composition for a typical Swiss pasture/meadow.
const COMPOSITION: Array<{ cls: DetectionClass; weight: number }> = [
  { cls: 'cow', weight: 0.7 },
  { cls: 'deer', weight: 0.12 },
  { cls: 'sheep', weight: 0.08 },
  { cls: 'horse', weight: 0.04 },
  { cls: 'dog', weight: 0.03 },
  { cls: 'person', weight: 0.03 }
]

function pickClass(rnd: () => number): DetectionClass {
  let r = rnd()
  for (const c of COMPOSITION) {
    if (r < c.weight) return c.cls
    r -= c.weight
  }
  return 'other'
}

/** Deterministic-ish PRNG seeded from a string so re-runs of a flight reproduce. */
function seeded(seed: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateMockDetections(flightId: string, field: Field, durationS: number): Detection[] {
  const rnd = seeded(flightId)
  // Scale herd size by area, with noise. ~ a handful to a few dozen on a pasture.
  const base = Math.max(3, Math.round(field.areaHa * 6))
  const count = Math.round(base * (0.7 + rnd() * 0.6))

  const detections: Detection[] = []
  for (let i = 0; i < count; i++) {
    const cls = pickClass(rnd)
    const at = randomPointInPolygon(field.polygon, rnd)
    detections.push({
      id: randomUUID(),
      flightId,
      cls,
      confidence: Number((0.62 + rnd() * 0.35).toFixed(2)),
      lng: at.lng,
      lat: at.lat,
      frameTimeS: Number((rnd() * durationS).toFixed(1))
    })
  }
  return detections
}
