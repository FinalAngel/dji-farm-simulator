// Simulated controller — "flies" the planned waypoints in software, emitting live
// progress (so the UI animates a moving aircraft) and producing geolocated mock
// detections. Lets you exercise the entire app end-to-end with zero hardware.

import type { Field, Flight, FlightProgress } from '../../shared/types'
import type { DroneController, FlyResult, ProgressFn } from './types'
import { generateMockDetections } from '../detection/mock'
import { mt } from '../i18n'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export class SimulatedController implements DroneController {
  readonly kind = 'simulated' as const
  readonly label = 'Simulated flight (no hardware)'
  readonly autonomous = true

  async available() {
    return { ok: true }
  }

  async fly(field: Field, flight: Flight, onProgress: ProgressFn): Promise<FlyResult> {
    const wps = flight.plan.waypoints
    const emit = (p: Omit<FlightProgress, 'flightId'>) => onProgress({ flightId: flight.id, ...p })

    emit({ phase: 'takeoff', progress: 0, message: mt('sim.takeoff'), position: wps[0] })
    await sleep(400)

    // Compress the real ETA into a short, watchable animation (~6s total).
    const steps = Math.min(wps.length, 60)
    const stride = Math.max(1, Math.floor(wps.length / steps))
    const frameDelay = 5000 / Math.max(1, steps)

    for (let i = 0; i < wps.length; i += stride) {
      const w = wps[i]
      emit({
        phase: 'scanning',
        progress: i / wps.length,
        message: mt('sim.scanning', { n: Math.floor(i / 2) + 1 }),
        position: { lng: w.lng, lat: w.lat }
      })
      await sleep(frameDelay)
    }

    emit({ phase: 'returning', progress: 0.97, message: mt('sim.returning'), position: wps[0] })
    await sleep(400)

    emit({ phase: 'analyzing', progress: 0.99, message: mt('sim.analyzing') })
    const detections = generateMockDetections(flight.id, field, flight.plan.estDurationS)
    await sleep(400)

    emit({
      phase: 'done',
      progress: 1,
      message: mt('sim.landed', { count: detections.length }),
      position: wps[0],
      detectionsSoFar: detections.length
    })

    return { detections, detectionBackend: 'Simulator (synthetic detections)' }
  }
}

export const simulatedController = new SimulatedController()
