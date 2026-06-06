// Main-process translation helper. Reads the persisted language from settings so
// backend-produced strings (install log, detection-backend status, IPC errors,
// simulated-flight progress) match the language chosen in the UI.

import { translate, type Vars } from '../shared/i18n'
import { settings } from './store'

export function mt(key: string, vars?: Vars): string {
  return translate(settings.get().language, key, vars)
}
