// Real-video detection pipeline. Spawns the Python/YOLO sidecar to find animals in
// a recorded flight video, then geolocates each detection using the .SRT telemetry.
// If the sidecar isn't available, callers fall back to the simulator/mock.

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Detection, DetectionBackendInfo, DetectionClass } from '../../shared/types'
import type { CameraSpec } from '../../shared/camera'
import { pixelToLngLat } from '../geo/geolocate'
import { parseSrt, sampleAt } from './srt'
import { pythonExecutable, pythonScriptPath } from '../paths'

// COCO classes the model can emit → our taxonomy. Deer is NOT in COCO; a custom
// model is required for reliable fawn/deer detection (see README).
const CLASS_MAP: Record<string, DetectionClass> = {
  cow: 'cow',
  deer: 'deer',
  sheep: 'sheep',
  horse: 'horse',
  dog: 'dog',
  person: 'person'
}

interface RawDetection {
  cls: string
  confidence: number
  frameTimeS: number
  px: number
  py: number
}

export async function checkBackend(pythonPath?: string): Promise<DetectionBackendInfo> {
  const py = pythonExecutable(pythonPath)
  if (!py) {
    return { available: false, kind: 'mock', detail: 'Python 3 not found. Set a Python path in Settings, or use the built-in simulator.' }
  }
  const ok = await new Promise<boolean>((resolve) => {
    const p = spawn(py, ['-c', 'import ultralytics, cv2'], { stdio: 'ignore' })
    p.on('error', () => resolve(false))
    p.on('close', (code) => resolve(code === 0))
  })
  return ok
    ? { available: true, kind: 'yolo', detail: `YOLO sidecar ready (${py}).` }
    : { available: false, kind: 'mock', detail: 'Python found but ultralytics/opencv not installed (pip install -r python/requirements.txt).' }
}

export async function analyzeVideo(
  flightId: string,
  videoPath: string,
  telemetryPath: string | undefined,
  opts: { sampleFps?: number; modelPath?: string; minConfidence?: number; pythonPath?: string; cam?: CameraSpec } = {}
): Promise<{ detections: Detection[]; backend: string }> {
  const py = pythonExecutable(opts.pythonPath)
  const script = pythonScriptPath()
  if (!py || !existsSync(script)) {
    throw new Error('Python/YOLO backend unavailable. Install python/requirements.txt or use Simulate.')
  }

  const args = [
    script,
    '--video', videoPath,
    '--sample-fps', String(opts.sampleFps ?? 2),
    '--min-conf', String(opts.minConfidence ?? 0.4)
  ]
  if (opts.modelPath) args.push('--model', opts.modelPath)

  const raw = await runPython(py, args)
  const telemetry = telemetryPath && existsSync(telemetryPath) ? parseSrt(telemetryPath) : []

  const detections: Detection[] = []
  for (const r of raw) {
    const cls = CLASS_MAP[r.cls]
    if (!cls) continue
    const t = sampleAt(telemetry, r.frameTimeS)
    let lng = 0
    let lat = 0
    if (t) {
      const ll = pixelToLngLat(
        { lng: t.lng, lat: t.lat, aglAltitude: t.altitude || 40, headingDeg: t.headingDeg },
        r.px,
        r.py,
        opts.cam
      )
      lng = ll.lng
      lat = ll.lat
    }
    detections.push({
      id: randomUUID(),
      flightId,
      cls,
      confidence: Number(r.confidence.toFixed(2)),
      lng,
      lat,
      frameTimeS: r.frameTimeS,
      px: r.px,
      py: r.py
    })
  }
  const backend = telemetry.length
    ? `YOLO + SRT telemetry (${telemetry.length} samples)`
    : 'YOLO (no telemetry — detections not geolocated)'
  return { detections, backend }
}

function runPython(py: string, args: string[]): Promise<RawDetection[]> {
  return new Promise((resolve, reject) => {
    const p = spawn(py, args)
    let out = ''
    let err = ''
    p.stdout.on('data', (d) => (out += d))
    p.stderr.on('data', (d) => (err += d))
    p.on('error', reject)
    p.on('close', (code) => {
      if (code !== 0) return reject(new Error(`detector exited ${code}: ${err.slice(-2000)}`))
      try {
        resolve(JSON.parse(out) as RawDetection[])
      } catch (e) {
        reject(new Error(`could not parse detector output: ${(e as Error).message}\n${out.slice(0, 500)}`))
      }
    })
  })
}
