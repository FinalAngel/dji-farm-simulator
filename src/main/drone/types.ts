import type { Detection, Field, Flight, FlightProgress, MissionPlan } from '../../shared/types'

export interface FlyResult {
  detections: Detection[]
  videoPath?: string
  telemetryPath?: string
  detectionBackend: string
}

/**
 * Abstraction over "how the field actually gets flown". This is the seam that lets
 * an MSDK-based live bridge (e.g. a DJIControlServer companion on an MSDK-supported
 * drone) drop in later without touching the rest of the app.
 */
export interface DroneController {
  readonly kind: 'offline' | 'simulated' | 'bridge'
  readonly label: string
  /** True if this controller actually flies; false = it only prepares artifacts. */
  readonly autonomous: boolean

  /** Whether this controller can run given the current hardware/config. */
  available(): Promise<{ ok: boolean; reason?: string }>

  /** Execute a mission (simulated or live). Throws if !autonomous. */
  fly?(
    field: Field,
    flight: Flight,
    onProgress: (p: FlightProgress) => void
  ): Promise<FlyResult>
}

export type ProgressFn = (p: FlightProgress) => void
export type { MissionPlan }
