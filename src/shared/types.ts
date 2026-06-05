// Shared domain types used by both the main process and the renderer.

export interface LngLat {
  lng: number
  lat: number
}

export interface Field {
  id: string
  name: string
  notes?: string
  /** Ordered ring (not closed — the last vertex connects back to the first). */
  polygon: LngLat[]
  /** Optional launch / return-to-home point. Defaults to polygon centroid if unset. */
  homePoint?: LngLat
  areaHa: number
  /** Last-used Plan & Fly parameters for this field (remembered per field). */
  missionParams?: MissionParams
  createdAt: string
  updatedAt: string
}

export interface MissionParams {
  /** Altitude above ground level, metres. */
  altitude: number
  /** Cruise speed, m/s. */
  speed: number
  /** Side overlap between adjacent strips, 0..1. Higher = denser coverage. */
  sidelap: number
  /** Sweep-line heading in degrees (0 = south→north strips). */
  angleDeg: number
  /** Inset from the field edge applied to each strip end, metres. */
  marginM: number
}

export const DEFAULT_MISSION_PARAMS: MissionParams = {
  altitude: 40,
  speed: 8,
  sidelap: 0.3,
  angleDeg: 0,
  marginM: 3
}

export interface Waypoint {
  index: number
  lng: number
  lat: number
  /** Altitude AGL, metres. */
  alt: number
  /** Speed at this waypoint, m/s. */
  speed: number
  /** Heading at this waypoint, degrees (0 = north). */
  heading: number
}

export interface MissionPlan {
  fieldId: string
  params: MissionParams
  waypoints: Waypoint[]
  lineSpacingM: number
  footprintWidthM: number
  pathLengthM: number
  estDurationS: number
  /** Estimated battery use, percentage of one charge. */
  estBatteryPct: number
  /** How many batteries the mission needs (>1 means split required). */
  batteriesNeeded: number
}

export type ControllerKind = 'offline' | 'simulated' | 'bridge'

export type DetectionClass =
  | 'cow'
  | 'deer'
  | 'sheep'
  | 'horse'
  | 'dog'
  | 'person'
  | 'other'

export interface Detection {
  id: string
  flightId: string
  cls: DetectionClass
  confidence: number
  lng: number
  lat: number
  /** Seconds into the video where the detection occurred (real-video pipeline only). */
  frameTimeS?: number
  px?: number
  py?: number
}

export type FlightStatus =
  | 'planned'
  | 'flying'
  | 'completed'
  | 'failed'
  | 'aborted'

export interface FlightStats {
  total: number
  byClass: Record<string, number>
  /** Per-class peak simultaneous count — more robust to double counting than total. */
  byClassPeak?: Record<string, number>
}

export interface Flight {
  id: string
  fieldId: string
  fieldName: string
  controller: ControllerKind
  status: FlightStatus
  plan: MissionPlan
  createdAt: string
  startedAt?: string
  endedAt?: string
  /** Path to the recorded video imported for analysis. */
  videoPath?: string
  /** Path to the DJI .SRT telemetry sidecar used to geolocate detections. */
  telemetryPath?: string
  /** Exported mission artifact paths, by format. */
  exports?: Partial<Record<ExportFormat, string>>
  stats?: FlightStats
  notes?: string
  detectionCount: number
  /** Human-readable backend used to produce detections. */
  detectionBackend?: string
}

export type ExportFormat = 'wpml' | 'litchi' | 'kml' | 'geojson'

export interface ExportResult {
  format: ExportFormat
  path: string
}

export interface DetectionBackendInfo {
  available: boolean
  /** 'yolo' when the Python sidecar is usable, otherwise 'mock'. */
  kind: 'yolo' | 'mock'
  detail: string
}

/** Progress event emitted while a simulated/live mission runs. */
export interface FlightProgress {
  flightId: string
  phase: 'takeoff' | 'enroute' | 'scanning' | 'returning' | 'landed' | 'analyzing' | 'done'
  /** 0..1 coverage progress. */
  progress: number
  message: string
  /** Live aircraft position for the map. */
  position?: LngLat
  detectionsSoFar?: number
}
