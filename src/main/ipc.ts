import { randomUUID } from 'node:crypto'
import { BrowserWindow, dialog, ipcMain, shell } from 'electron'
import type {
  AppSettings,
  ExportFormat,
  Field,
  Flight,
  FlightProgress,
  MissionParams
} from '../shared/types'
import { getDrone } from '../shared/camera'
import { areaHectares, centroid } from './geo/geo'
import { planMission } from './geo/coverage'
import { offlineController } from './drone/offline'
import { simulatedController } from './drone/simulated'
import { BridgeController } from './drone/bridge'
import { analyzeVideo, checkBackend } from './detection/service'
import { computeStats } from './stats'
import { detections, fields, flights, settings } from './store'

const now = () => new Date().toISOString()
const activeDrone = () => getDrone(settings.get().droneId)

function requireField(id: string): Field {
  const f = fields.get(id)
  if (!f) throw new Error(`Field ${id} not found`)
  return f
}

export function registerIpc(): void {
  // ---- Fields ---------------------------------------------------------------
  ipcMain.handle('fields:list', () =>
    fields.all().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  )

  ipcMain.handle('fields:get', (_e, id: string) => fields.get(id))

  ipcMain.handle('fields:create', (_e, input: Pick<Field, 'name' | 'polygon' | 'notes' | 'homePoint'>) => {
    if (!input.polygon || input.polygon.length < 3) throw new Error('A field needs at least 3 points.')
    const ts = now()
    return fields.insert({
      id: randomUUID(),
      name: input.name?.trim() || 'Untitled field',
      notes: input.notes,
      polygon: input.polygon,
      homePoint: input.homePoint ?? centroid(input.polygon),
      areaHa: Number(areaHectares(input.polygon).toFixed(3)),
      createdAt: ts,
      updatedAt: ts
    })
  })

  ipcMain.handle('fields:update', (_e, id: string, patch: Partial<Field>) => {
    const next: Partial<Field> = { ...patch, updatedAt: now() }
    if (patch.polygon) next.areaHa = Number(areaHectares(patch.polygon).toFixed(3))
    return fields.update(id, next)
  })

  ipcMain.handle('fields:delete', (_e, id: string) => {
    flights.removeWhere((f) => f.fieldId === id)
    return fields.remove(id)
  })

  // ---- Mission planning -----------------------------------------------------
  ipcMain.handle('mission:plan', (_e, fieldId: string, params: MissionParams) => {
    const field = requireField(fieldId)
    return planMission(field.id, field.polygon, params, field.homePoint, activeDrone())
  })

  ipcMain.handle(
    'mission:export',
    async (_e, fieldId: string, params: MissionParams, formats: ExportFormat[], chooseDir: boolean) => {
      const field = requireField(fieldId)
      const plan = planMission(field.id, field.polygon, params, field.homePoint, activeDrone())
      let dir: string | undefined
      if (chooseDir) {
        const win = BrowserWindow.getFocusedWindow()
        const res = await dialog.showOpenDialog(win!, { properties: ['openDirectory', 'createDirectory'] })
        if (res.canceled || !res.filePaths[0]) return []
        dir = res.filePaths[0]
      }
      return offlineController.exportMission(field, plan, formats, dir)
    }
  )

  // ---- Flights --------------------------------------------------------------
  ipcMain.handle('flights:list', () =>
    flights.all().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  )

  ipcMain.handle('flights:get', (_e, id: string) => flights.get(id))

  ipcMain.handle('detections:list', (_e, flightId: string) =>
    detections.all().filter((d) => d.flightId === flightId)
  )

  ipcMain.handle('flights:delete', (_e, id: string) => {
    detections.removeWhere((d) => d.flightId === id)
    return flights.remove(id)
  })

  // Simulated end-to-end flight (no hardware).
  ipcMain.handle('flights:simulate', async (event, fieldId: string, params: MissionParams) => {
    const field = requireField(fieldId)
    const plan = planMission(field.id, field.polygon, params, field.homePoint, activeDrone())
    const flight: Flight = {
      id: randomUUID(),
      fieldId: field.id,
      fieldName: field.name,
      controller: 'simulated',
      status: 'flying',
      plan,
      createdAt: now(),
      startedAt: now(),
      detectionCount: 0
    }
    flights.insert(flight)

    const onProgress = (p: FlightProgress) => event.sender.send('flight:progress', p)
    try {
      const result = await simulatedController.fly(field, flight, onProgress)
      detections.insertMany(result.detections)
      const stats = computeStats(result.detections)
      return flights.update(flight.id, {
        status: 'completed',
        endedAt: now(),
        stats,
        detectionCount: result.detections.length,
        detectionBackend: result.detectionBackend
      })
    } catch (e) {
      flights.update(flight.id, { status: 'failed', endedAt: now(), notes: (e as Error).message })
      throw e
    }
  })

  // Offline workflow step 2: you've flown the field in DJI Fly — import the
  // recorded video (+ optional .SRT) to create a completed, analyzed flight.
  ipcMain.handle(
    'flights:analyzeVideo',
    async (_e, fieldId: string, params: MissionParams, videoPath: string, telemetryPath?: string) => {
      const field = requireField(fieldId)
      const plan = planMission(field.id, field.polygon, params, field.homePoint, activeDrone())
      const flight: Flight = {
        id: randomUUID(),
        fieldId: field.id,
        fieldName: field.name,
        controller: 'offline',
        status: 'flying',
        plan,
        createdAt: now(),
        videoPath,
        telemetryPath,
        detectionCount: 0
      }
      flights.insert(flight)
      try {
        const s = settings.get()
        const { detections: dets, backend } = await analyzeVideo(flight.id, videoPath, telemetryPath, {
          minConfidence: s.minConfidence,
          pythonPath: s.pythonPath,
          cam: activeDrone()
        })
        detections.insertMany(dets)
        return flights.update(flight.id, {
          status: 'completed',
          endedAt: now(),
          stats: computeStats(dets),
          detectionCount: dets.length,
          detectionBackend: backend
        })
      } catch (e) {
        flights.update(flight.id, { status: 'failed', endedAt: now(), notes: (e as Error).message })
        throw e
      }
    }
  )

  // ---- Settings -------------------------------------------------------------
  ipcMain.handle('settings:get', () => settings.get())
  ipcMain.handle('settings:set', (_e, patch: Partial<AppSettings>) => settings.set(patch))

  // ---- System / dialogs -----------------------------------------------------
  ipcMain.handle('system:backend', () => checkBackend(settings.get().pythonPath))

  ipcMain.handle('dialog:openVideo', async () => {
    const win = BrowserWindow.getFocusedWindow()
    const res = await dialog.showOpenDialog(win!, {
      properties: ['openFile'],
      filters: [{ name: 'Video', extensions: ['mp4', 'mov', 'mkv', 'avi'] }]
    })
    return res.canceled ? null : res.filePaths[0]
  })

  ipcMain.handle('dialog:openSrt', async () => {
    const win = BrowserWindow.getFocusedWindow()
    const res = await dialog.showOpenDialog(win!, {
      properties: ['openFile'],
      filters: [{ name: 'DJI telemetry', extensions: ['srt', 'SRT'] }]
    })
    return res.canceled ? null : res.filePaths[0]
  })

  ipcMain.handle('system:revealPath', (_e, path: string) => {
    shell.showItemInFolder(path)
  })

  ipcMain.handle('bridge:test', async (_e, baseUrl: string, model?: string) => {
    const c = new BridgeController({ baseUrl, model })
    return c.available()
  })
}
