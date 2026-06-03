import type { Detection, FlightStats } from '../shared/types'

export function computeStats(detections: Detection[]): FlightStats {
  const byClass: Record<string, number> = {}
  for (const d of detections) byClass[d.cls] = (byClass[d.cls] ?? 0) + 1
  return { total: detections.length, byClass }
}
