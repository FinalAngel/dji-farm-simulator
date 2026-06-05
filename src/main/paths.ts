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

/** Path to the detector's requirements.txt (works in dev and packaged). */
export function pythonRequirementsPath(): string {
  const candidates = [
    join(app.getAppPath(), 'python', 'requirements.txt'),
    join(process.cwd(), 'python', 'requirements.txt'),
    join(__dirname, '..', '..', 'python', 'requirements.txt')
  ]
  return candidates.find((p) => existsSync(p)) ?? candidates[0]
}

/** Where the in-app installer creates its virtual environment (always writable). */
export function venvDir(): string {
  return join(app.getPath('userData'), 'python-venv')
}

/** The Python interpreter inside the managed venv (platform-specific). */
export function venvPython(): string {
  return process.platform === 'win32'
    ? join(venvDir(), 'Scripts', 'python.exe')
    : join(venvDir(), 'bin', 'python')
}

/**
 * First usable Python 3 interpreter, or null. Tries, in order: an explicit
 * `override` (from Settings), the LITOX1_PYTHON env var, then python3/python on PATH.
 * Not cached — the override can change at runtime when the user edits Settings.
 */
export function pythonExecutable(override?: string): string | null {
  const candidates = [override, process.env.LITOX1_PYTHON, 'python3', 'python'].filter(Boolean) as string[]
  for (const c of candidates) {
    try {
      execSync(`${c} --version`, { stdio: 'ignore' })
      return c
    } catch {
      /* try next */
    }
  }
  return null
}
