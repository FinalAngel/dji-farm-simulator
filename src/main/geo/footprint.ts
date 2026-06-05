import { LITO_X1, type CameraSpec } from '../../shared/camera'

export interface Footprint {
  /** Across-track ground width of one frame, metres. */
  width: number
  /** Along-track ground height of one frame, metres. */
  height: number
}

/** Ground footprint of a nadir frame at a given altitude (m AGL). */
export function footprintMeters(altitude: number, cam: CameraSpec = LITO_X1): Footprint {
  const width = 2 * altitude * Math.tan((cam.hfovDeg * Math.PI) / 360)
  const height = 2 * altitude * Math.tan((cam.vfovDeg * Math.PI) / 360)
  return { width, height }
}

/** Distance between adjacent sweep lines so strips overlap by `sidelap` (0..1). */
export function lineSpacing(altitude: number, sidelap: number, cam: CameraSpec = LITO_X1): number {
  const { width } = footprintMeters(altitude, cam)
  return Math.max(1, width * (1 - clamp(sidelap, 0, 0.95)))
}

/** Ground sample distance (metres per video pixel) at nadir. */
export function gsd(altitude: number, cam: CameraSpec = LITO_X1): number {
  const { width } = footprintMeters(altitude, cam)
  return width / cam.videoWidth
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}
