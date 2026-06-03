import { LITO_X1 } from '../../shared/camera'

export interface Footprint {
  /** Across-track ground width of one frame, metres. */
  width: number
  /** Along-track ground height of one frame, metres. */
  height: number
}

/** Ground footprint of a nadir frame at a given altitude (m AGL). */
export function footprintMeters(
  altitude: number,
  hfovDeg = LITO_X1.hfovDeg,
  vfovDeg = LITO_X1.vfovDeg
): Footprint {
  const width = 2 * altitude * Math.tan((hfovDeg * Math.PI) / 360)
  const height = 2 * altitude * Math.tan((vfovDeg * Math.PI) / 360)
  return { width, height }
}

/** Distance between adjacent sweep lines so strips overlap by `sidelap` (0..1). */
export function lineSpacing(altitude: number, sidelap: number): number {
  const { width } = footprintMeters(altitude)
  return Math.max(1, width * (1 - clamp(sidelap, 0, 0.95)))
}

/** Ground sample distance (metres per video pixel) at nadir. */
export function gsd(altitude: number): number {
  const { width } = footprintMeters(altitude)
  return width / LITO_X1.videoWidth
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}
