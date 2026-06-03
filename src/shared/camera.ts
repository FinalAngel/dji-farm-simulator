// DJI Lito X1 camera & airframe characteristics.
//
// NOTE: DJI does not publish exact lens FOV figures for mapping. The values below
// are reasonable approximations for the Lito X1's ~24mm-equivalent wide lens and a
// nadir (straight-down) gimbal. They drive coverage spacing and pixel→ground
// geolocation. Tune `hfovDeg`/`vfovDeg` against a real calibration flight if you
// need survey-grade accuracy.

export const LITO_X1 = {
  name: 'DJI Lito X1',

  // Field of view of the 4K (16:9) video frame used for detection.
  hfovDeg: 73,
  vfovDeg: 44,

  // Detection runs on recorded video, so use the video resolution.
  videoWidth: 3840,
  videoHeight: 2160,

  // Full-res still resolution (40MP, 4:3).
  stillWidth: 8064,
  stillHeight: 6048,

  // Airframe limits used for mission estimates.
  maxFlightMinutes: 36, // standard Intelligent Flight Battery
  cruiseSpeedMs: 10,
  maxSpeedMs: 16,

  // Conservative usable battery window (reserve ~25% for RTH + margin).
  usableFlightMinutes: 27
} as const

export type CameraSpec = typeof LITO_X1
