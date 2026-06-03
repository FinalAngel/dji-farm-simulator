// Parser for DJI .SRT telemetry sidecars. DJI embeds per-frame GPS/altitude in the
// subtitle blocks; the exact field names vary by model/firmware, so we parse
// defensively with regexes and tolerate missing fields.

import { readFileSync } from 'node:fs'

export interface TelemetrySample {
  /** Seconds from the start of the video. */
  timeS: number
  lat: number
  lng: number
  /** Relative (AGL-ish) altitude in metres when available, else absolute. */
  altitude: number
  headingDeg: number
}

const TIME_RE = /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->/
const LAT_RE = /\[?latitude:?\s*([\-\d.]+)\]?/i
const LON_RE = /\[?longitude:?\s*([\-\d.]+)\]?/i
const REL_ALT_RE = /rel_alt:?\s*([\-\d.]+)/i
const ABS_ALT_RE = /abs_alt:?\s*([\-\d.]+)/i
// Some firmwares log GPS as "GPS(lng,lat,alt)" and a separate compass/yaw.
const GPS_RE = /GPS\s*\(?\s*([\-\d.]+)\s*,\s*([\-\d.]+)\s*,\s*([\-\d.]+)/i
const YAW_RE = /(?:yaw|heading)\s*[:=]?\s*([\-\d.]+)/i

export function parseSrt(path: string): TelemetrySample[] {
  const text = readFileSync(path, 'utf8')
  const blocks = text.split(/\r?\n\r?\n/)
  const samples: TelemetrySample[] = []

  for (const block of blocks) {
    const tm = block.match(TIME_RE)
    if (!tm) continue
    const timeS = +tm[1] * 3600 + +tm[2] * 60 + +tm[3] + +tm[4] / 1000

    let lat: number | undefined
    let lng: number | undefined
    const gps = block.match(GPS_RE)
    if (gps) {
      lng = parseFloat(gps[1])
      lat = parseFloat(gps[2])
    }
    const latM = block.match(LAT_RE)
    const lonM = block.match(LON_RE)
    if (latM) lat = parseFloat(latM[1])
    if (lonM) lng = parseFloat(lonM[1])
    if (lat === undefined || lng === undefined) continue

    const rel = block.match(REL_ALT_RE)
    const abs = block.match(ABS_ALT_RE)
    const gpsAlt = gps ? parseFloat(gps[3]) : undefined
    const altitude = rel ? parseFloat(rel[1]) : abs ? parseFloat(abs[1]) : gpsAlt ?? 0

    const yaw = block.match(YAW_RE)
    samples.push({ timeS, lat, lng, altitude, headingDeg: yaw ? parseFloat(yaw[1]) : 0 })
  }
  return samples
}

/** Nearest telemetry sample to a given video time. */
export function sampleAt(samples: TelemetrySample[], timeS: number): TelemetrySample | undefined {
  if (samples.length === 0) return undefined
  let best = samples[0]
  let bestD = Math.abs(samples[0].timeS - timeS)
  for (const s of samples) {
    const d = Math.abs(s.timeS - timeS)
    if (d < bestD) {
      best = s
      bestD = d
    }
  }
  return best
}
