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
} from '@shared/types'

export interface CockpitApi {
  fields: {
    list(): Promise<Field[]>
    get(id: string): Promise<Field | undefined>
    create(input: Pick<Field, 'name' | 'polygon' | 'notes' | 'homePoint'>): Promise<Field>
    update(id: string, patch: Partial<Field>): Promise<Field | undefined>
    remove(id: string): Promise<boolean>
  }
  mission: {
    plan(fieldId: string, params: MissionParams): Promise<MissionPlan>
    exportMission(
      fieldId: string,
      params: MissionParams,
      formats: ExportFormat[],
      chooseDir: boolean
    ): Promise<ExportResult[]>
  }
  flights: {
    list(): Promise<Flight[]>
    get(id: string): Promise<Flight | undefined>
    remove(id: string): Promise<boolean>
    simulate(fieldId: string, params: MissionParams): Promise<Flight>
    analyzeVideo(
      fieldId: string,
      params: MissionParams,
      videoPath: string,
      telemetryPath?: string
    ): Promise<Flight>
    detections(flightId: string): Promise<Detection[]>
  }
  settings: {
    get(): Promise<AppSettings>
    set(patch: Partial<AppSettings>): Promise<AppSettings>
  }
  system: {
    backend(): Promise<DetectionBackendInfo>
    revealPath(path: string): Promise<void>
    openVideo(): Promise<string | null>
    openSrt(): Promise<string | null>
    testBridge(baseUrl: string, model?: string): Promise<{ ok: boolean; reason?: string }>
    installBackend(): Promise<{ ok: boolean; pythonPath?: string; error?: string }>
  }
  onFlightProgress(cb: (p: FlightProgress) => void): () => void
  onBackendInstallProgress(cb: (line: string) => void): () => void
}

declare global {
  interface Window {
    api: CockpitApi
  }
}

export const api: CockpitApi = window.api
