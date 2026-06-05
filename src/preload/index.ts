import { contextBridge, ipcRenderer } from 'electron'
import type {
  AppSettings,
  DetectionBackendInfo,
  Detection,
  ExportFormat,
  ExportResult,
  Field,
  Flight,
  FlightProgress,
  MissionParams,
  MissionPlan
} from '../shared/types'

const api = {
  fields: {
    list: (): Promise<Field[]> => ipcRenderer.invoke('fields:list'),
    get: (id: string): Promise<Field | undefined> => ipcRenderer.invoke('fields:get', id),
    create: (input: Pick<Field, 'name' | 'polygon' | 'notes' | 'homePoint'>): Promise<Field> =>
      ipcRenderer.invoke('fields:create', input),
    update: (id: string, patch: Partial<Field>): Promise<Field | undefined> =>
      ipcRenderer.invoke('fields:update', id, patch),
    remove: (id: string): Promise<boolean> => ipcRenderer.invoke('fields:delete', id)
  },
  mission: {
    plan: (fieldId: string, params: MissionParams): Promise<MissionPlan> =>
      ipcRenderer.invoke('mission:plan', fieldId, params),
    exportMission: (
      fieldId: string,
      params: MissionParams,
      formats: ExportFormat[],
      chooseDir: boolean
    ): Promise<ExportResult[]> =>
      ipcRenderer.invoke('mission:export', fieldId, params, formats, chooseDir)
  },
  flights: {
    list: (): Promise<Flight[]> => ipcRenderer.invoke('flights:list'),
    get: (id: string): Promise<Flight | undefined> => ipcRenderer.invoke('flights:get', id),
    remove: (id: string): Promise<boolean> => ipcRenderer.invoke('flights:delete', id),
    simulate: (fieldId: string, params: MissionParams): Promise<Flight> =>
      ipcRenderer.invoke('flights:simulate', fieldId, params),
    analyzeVideo: (
      fieldId: string,
      params: MissionParams,
      videoPath: string,
      telemetryPath?: string
    ): Promise<Flight> =>
      ipcRenderer.invoke('flights:analyzeVideo', fieldId, params, videoPath, telemetryPath),
    detections: (flightId: string): Promise<Detection[]> =>
      ipcRenderer.invoke('detections:list', flightId)
  },
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    set: (patch: Partial<AppSettings>): Promise<AppSettings> => ipcRenderer.invoke('settings:set', patch)
  },
  system: {
    backend: (): Promise<DetectionBackendInfo> => ipcRenderer.invoke('system:backend'),
    revealPath: (path: string): Promise<void> => ipcRenderer.invoke('system:revealPath', path),
    openVideo: (): Promise<string | null> => ipcRenderer.invoke('dialog:openVideo'),
    openSrt: (): Promise<string | null> => ipcRenderer.invoke('dialog:openSrt'),
    testBridge: (baseUrl: string, model?: string): Promise<{ ok: boolean; reason?: string }> =>
      ipcRenderer.invoke('bridge:test', baseUrl, model),
    installBackend: (): Promise<{ ok: boolean; pythonPath?: string; error?: string }> =>
      ipcRenderer.invoke('backend:install'),
    reset: (): Promise<boolean> => ipcRenderer.invoke('system:reset')
  },
  onFlightProgress: (cb: (p: FlightProgress) => void): (() => void) => {
    const listener = (_e: unknown, p: FlightProgress) => cb(p)
    ipcRenderer.on('flight:progress', listener)
    return () => ipcRenderer.removeListener('flight:progress', listener)
  },
  onBackendInstallProgress: (cb: (line: string) => void): (() => void) => {
    const listener = (_e: unknown, line: string) => cb(line)
    ipcRenderer.on('backend:install-progress', listener)
    return () => ipcRenderer.removeListener('backend:install-progress', listener)
  }
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
