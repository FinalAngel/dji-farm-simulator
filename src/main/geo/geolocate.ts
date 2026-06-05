// Map a pixel in a nadir video frame to a ground lng/lat, given the aircraft's
// position, AGL altitude and heading at that instant. Assumes a straight-down
// (-90°) gimbal, which is what coverage flights use.

import type { LngLat } from '../../shared/types'
import { LITO_X1, type CameraSpec } from '../../shared/camera'
import { toLngLat } from './geo'

export function pixelToLngLat(
  drone: { lng: number; lat: number; aglAltitude: number; headingDeg: number },
  px: number,
  py: number,
  cam: CameraSpec = LITO_X1
): LngLat {
  const imgW = cam.videoWidth
  const imgH = cam.videoHeight
  const footW = 2 * drone.aglAltitude * Math.tan((cam.hfovDeg * Math.PI) / 360)
  const footH = 2 * drone.aglAltitude * Math.tan((cam.vfovDeg * Math.PI) / 360)

  // Offsets in the image plane, metres on the ground.
  const right = ((px - imgW / 2) / imgW) * footW // +x = image right
  const fwd = ((imgH / 2 - py) / imgH) * footH // +y = image up (toward top)

  // Image "up" points along the aircraft heading; "right" is heading + 90°.
  const h = (drone.headingDeg * Math.PI) / 180
  const hr = h + Math.PI / 2

  const east = fwd * Math.sin(h) + right * Math.sin(hr)
  const north = fwd * Math.cos(h) + right * Math.cos(hr)

  return toLngLat({ x: east, y: north }, { lng: drone.lng, lat: drone.lat })
}
