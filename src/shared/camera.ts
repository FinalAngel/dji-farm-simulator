// DJI drone camera & airframe characteristics.
//
// NOTE: DJI does not publish exact lens FOV figures for mapping. The values below
// are reasonable approximations for each aircraft's wide lens and a nadir
// (straight-down) gimbal. They drive coverage spacing, flight-time estimates and
// pixel→ground geolocation. Tune `hfovDeg`/`vfovDeg` against a real calibration
// flight if you need survey-grade accuracy.

export interface DroneSpec {
  id: string
  name: string
  /** MSDK-controllable → a live bridge is theoretically possible. The Lito X1 is not. */
  msdk: boolean

  // Field of view of the (16:9) video frame used for detection.
  hfovDeg: number
  vfovDeg: number

  // Detection runs on recorded video, so use the video resolution.
  videoWidth: number
  videoHeight: number

  // Full-res still resolution.
  stillWidth: number
  stillHeight: number

  // Airframe limits used for mission estimates.
  maxFlightMinutes: number
  cruiseSpeedMs: number
  maxSpeedMs: number
  /** Conservative usable battery window (reserve ~25% for RTH + margin). */
  usableFlightMinutes: number

  /** One-line capability note shown in Settings. */
  note: string
}

/** Camera/airframe spec consumed by the geo math. */
export type CameraSpec = DroneSpec

export const DRONES: DroneSpec[] = [
  {
    id: 'lito-x1', name: 'DJI Lito X1', msdk: false,
    hfovDeg: 73, vfovDeg: 44,
    videoWidth: 3840, videoHeight: 2160, stillWidth: 8064, stillHeight: 6048,
    maxFlightMinutes: 36, cruiseSpeedMs: 10, maxSpeedMs: 16, usableFlightMinutes: 27,
    note: 'Plan & export only — no Mobile SDK, so the desktop can’t fly it. RGB camera (deer is best-effort).'
  },
  {
    id: 'mini-3-pro', name: 'DJI Mini 3 Pro', msdk: true,
    hfovDeg: 73, vfovDeg: 44,
    videoWidth: 3840, videoHeight: 2160, stillWidth: 8064, stillHeight: 6048,
    maxFlightMinutes: 34, cruiseSpeedMs: 10, maxSpeedMs: 16, usableFlightMinutes: 25,
    note: 'Sub-250 g, MSDK-capable (RC-N1 + Android). Wide 24 mm-equiv RGB.'
  },
  {
    id: 'mini-4-pro', name: 'DJI Mini 4 Pro', msdk: true,
    hfovDeg: 73, vfovDeg: 44,
    videoWidth: 3840, videoHeight: 2160, stillWidth: 8064, stillHeight: 6048,
    maxFlightMinutes: 34, cruiseSpeedMs: 12, maxSpeedMs: 16, usableFlightMinutes: 26,
    note: 'Sub-250 g, omnidirectional sensing, MSDK-capable (RC-N2 + Android). A live bridge is possible.'
  },
  {
    id: 'air-3', name: 'DJI Air 3', msdk: true,
    hfovDeg: 72, vfovDeg: 43,
    videoWidth: 3840, videoHeight: 2160, stillWidth: 8064, stillHeight: 6048,
    maxFlightMinutes: 46, cruiseSpeedMs: 12, maxSpeedMs: 21, usableFlightMinutes: 34,
    note: 'Dual wide/tele camera, long endurance, MSDK-capable. Wide cam used for mapping.'
  },
  {
    id: 'mavic-3-pro', name: 'DJI Mavic 3 Pro', msdk: true,
    hfovDeg: 75, vfovDeg: 46,
    videoWidth: 3840, videoHeight: 2160, stillWidth: 5280, stillHeight: 3956,
    maxFlightMinutes: 43, cruiseSpeedMs: 15, maxSpeedMs: 21, usableFlightMinutes: 32,
    note: 'Hasselblad 4/3 CMOS, excellent image quality, MSDK-capable.'
  },
  {
    id: 'mavic-3-enterprise', name: 'DJI Mavic 3 Enterprise', msdk: true,
    hfovDeg: 75, vfovDeg: 46,
    videoWidth: 3840, videoHeight: 2160, stillWidth: 5280, stillHeight: 3956,
    maxFlightMinutes: 45, cruiseSpeedMs: 15, maxSpeedMs: 21, usableFlightMinutes: 34,
    note: 'Mechanical shutter + RTK option, MSDK/Enterprise SDK. Survey-oriented.'
  }
]

export const DEFAULT_DRONE_ID = 'lito-x1'

export function getDrone(id: string | undefined): DroneSpec {
  return DRONES.find((d) => d.id === id) ?? DRONES.find((d) => d.id === DEFAULT_DRONE_ID)!
}

/** Default camera spec used by the geo math when no drone is passed explicitly. */
export const LITO_X1 = getDrone(DEFAULT_DRONE_ID)
