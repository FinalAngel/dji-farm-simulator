import { execSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'

export function dataDir(): string {
  const d = join(app.getPath('userData'), 'data')
  mkdirSync(d, { recursive: true })
  return d
}

export function exportsDir(): string {
  const d = join(app.getPath('userData'), 'exports')
  mkdirSync(d, { recursive: true })
  return d
}

/** Repo-relative path to the Python detector (works in dev and packaged). */
export function pythonScriptPath(): string {
  const candidates = [
    join(app.getAppPath(), 'python', 'detect.py'),
    join(process.cwd(), 'python', 'detect.py'),
    join(__dirname, '..', '..', 'python', 'detect.py')
  ]
  return candidates.find((p) => existsSync(p)) ?? candidates[0]
}

let cachedPy: string | null | undefined
/** First usable Python 3 interpreter, or null. Result is cached. */
export function pythonExecutable(): string | null {
  if (cachedPy !== undefined) return cachedPy
  const override = process.env.LITOX1_PYTHON
  const candidates = [override, 'python3', 'python'].filter(Boolean) as string[]
  for (const c of candidates) {
    try {
      execSync(`${c} --version`, { stdio: 'ignore' })
      cachedPy = c
      return c
    } catch {
      /* try next */
    }
  }
  cachedPy = null
  return null
}
