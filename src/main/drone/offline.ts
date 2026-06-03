// Offline controller — the buildable-today path for the Lito X1. It doesn't fly the
// drone; it prepares an importable mission you fly via DJI Fly (in VLOS), then you
// import the recorded video for analysis.

import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ExportFormat, ExportResult, Field, MissionPlan } from '../../shared/types'
import type { DroneController } from './types'
import { exportsDir } from '../paths'
import { toGeoJson, toKml, toLitchiCsv } from '../export/exporters'
import { buildWpmlKmz } from '../export/wpml'

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'field'
}

export class OfflineController implements DroneController {
  readonly kind = 'offline' as const
  readonly label = 'Offline export → DJI Fly'
  readonly autonomous = false

  async available() {
    return { ok: true }
  }

  /** Write every requested format to disk and return their paths. */
  async exportMission(
    field: Field,
    plan: MissionPlan,
    formats: ExportFormat[],
    dir?: string
  ): Promise<ExportResult[]> {
    const base = dir ?? exportsDir()
    const stem = `${slug(field.name)}-${Date.now()}`
    const results: ExportResult[] = []

    for (const format of formats) {
      let path: string
      if (format === 'wpml') {
        path = join(base, `${stem}.kmz`)
        await writeFile(path, await buildWpmlKmz(field, plan))
      } else if (format === 'litchi') {
        path = join(base, `${stem}-litchi.csv`)
        await writeFile(path, toLitchiCsv(plan), 'utf8')
      } else if (format === 'kml') {
        path = join(base, `${stem}.kml`)
        await writeFile(path, toKml(field, plan), 'utf8')
      } else {
        path = join(base, `${stem}.geojson`)
        await writeFile(path, toGeoJson(field, plan), 'utf8')
      }
      results.push({ format, path })
    }
    return results
  }
}

export const offlineController = new OfflineController()
