// Live bridge controller — talks to a DJIControlServer-style companion app (an
// Android device running the DJI Mobile SDK and exposing a REST API on the LAN).
//
// IMPORTANT: this only works on MSDK-supported aircraft. The DJI Lito X1 is NOT
// MSDK-supported (it has on-board waypoints in DJI Fly but no SDK), so this path
// cannot fly a Lito X1 today. It's implemented as a working HTTP client + a clear
// guard so that swapping in an MSDK drone (e.g. Mini 4 Pro + RC-N2) is a config
// change, not a rewrite. See README "Live control".

import type { Field, Flight, FlightProgress } from '../../shared/types'
import type { DroneController, FlyResult, ProgressFn } from './types'

export interface BridgeConfig {
  /** Base URL of the companion REST server, e.g. http://192.168.1.50:8080 */
  baseUrl: string
  /** Aircraft model reported by the bridge; used to gate unsupported drones. */
  model?: string
}

const MSDK_SUPPORTED = new Set(['mini 4 pro', 'mini 3 pro', 'mavic 3 enterprise', 'matrice 30', 'matrice 350'])

export class BridgeController implements DroneController {
  readonly kind = 'bridge' as const
  readonly label = 'Live bridge (MSDK companion)'
  readonly autonomous = true

  constructor(private config: BridgeConfig) {}

  async available() {
    if (!this.config.baseUrl) return { ok: false, reason: 'No bridge URL configured.' }
    try {
      const res = await fetch(new URL('/status', this.config.baseUrl), { signal: AbortSignal.timeout(2500) })
      if (!res.ok) return { ok: false, reason: `Bridge responded ${res.status}.` }
      const status = (await res.json().catch(() => ({}))) as { model?: string }
      const model = (status.model ?? this.config.model ?? '').toLowerCase()
      if (model && !MSDK_SUPPORTED.has(model)) {
        return { ok: false, reason: `Connected aircraft "${model}" is not MSDK-controllable. The Lito X1 cannot be flown via SDK.` }
      }
      return { ok: true }
    } catch (e) {
      return { ok: false, reason: `Cannot reach bridge: ${(e as Error).message}` }
    }
  }

  async fly(_field: Field, flight: Flight, onProgress: ProgressFn): Promise<FlyResult> {
    const avail = await this.available()
    if (!avail.ok) throw new Error(avail.reason ?? 'Bridge unavailable')

    const emit = (p: Omit<FlightProgress, 'flightId'>) => onProgress({ flightId: flight.id, ...p })
    const base = this.config.baseUrl

    // Upload the mission as waypoints, then start it. (Endpoint names follow the
    // DJIControlServer convention; adapt to your companion app's actual API.)
    emit({ phase: 'takeoff', progress: 0, message: 'Uploading mission to companion…' })
    await this.post('/mission/upload', { waypoints: flight.plan.waypoints, finishAction: 'goHome' })
    await this.post('/mission/start', {})

    // Poll telemetry until the mission completes.
    for (;;) {
      const t = await this.get<{ progress: number; lat: number; lng: number; state: string }>('/mission/telemetry')
      emit({
        phase: t.state === 'returning' ? 'returning' : 'scanning',
        progress: t.progress ?? 0,
        message: `Live: ${t.state}`,
        position: { lng: t.lng, lat: t.lat }
      })
      if (t.state === 'finished' || (t.progress ?? 0) >= 1) break
      await new Promise((r) => setTimeout(r, 1000))
    }

    emit({ phase: 'done', progress: 1, message: 'Mission complete. Import the SD-card video to analyze.' })
    // Live video frames could be analyzed in real time; for now detections come from
    // the post-flight video-import pipeline, identical to the offline path.
    return { detections: [], detectionBackend: 'Live bridge (analyze video post-flight)' }
  }

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(new URL(path, this.config.baseUrl))
    if (!res.ok) throw new Error(`${path} → ${res.status}`)
    return res.json() as Promise<T>
  }

  private async post(path: string, body: unknown): Promise<void> {
    const res = await fetch(new URL(path, this.config.baseUrl), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`${path} → ${res.status}`)
  }
}
