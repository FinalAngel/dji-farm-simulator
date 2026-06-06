// In-app setup for the detection engine. Creates a Python virtual
// environment in userData and pip-installs the detector's requirements, streaming
// every line of output so the UI can show live progress. Requires a base Python 3
// to already be on the system (we can create a venv from it, but can't install the
// interpreter itself).

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { pythonExecutable, pythonRequirementsPath, venvDir, venvPython } from '../paths'
import { mt } from '../i18n'

export interface InstallResult {
  ok: boolean
  pythonPath?: string
  error?: string
}

function run(cmd: string, args: string[], onLog: (line: string) => void): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args)
    const emit = (buf: Buffer): void => {
      buf.toString().split(/\r?\n/).forEach((ln) => {
        const t = ln.trimEnd()
        if (t) onLog(t)
      })
    }
    child.stdout.on('data', emit)
    child.stderr.on('data', emit)
    child.on('error', reject)
    child.on('close', (code) => resolve(code ?? 1))
  })
}

export async function installBackend(onLog: (line: string) => void): Promise<InstallResult> {
  const basePy = pythonExecutable()
  if (!basePy) {
    return { ok: false, error: mt('install.pythonNotFound') }
  }
  const reqs = pythonRequirementsPath()
  if (!existsSync(reqs)) return { ok: false, error: mt('install.noRequirements') }

  const venv = venvDir()
  const py = venvPython()

  try {
    onLog(mt('install.logUsing', { path: basePy }))
    onLog(mt('install.logCreatingVenv', { venv }))
    let code = await run(basePy, ['-m', 'venv', venv], onLog)
    if (code !== 0) return { ok: false, error: mt('install.venvFailed', { code }) }

    onLog(mt('install.logUpgradingPip'))
    await run(py, ['-m', 'pip', 'install', '--upgrade', 'pip'], onLog)

    onLog(mt('install.logInstalling'))
    code = await run(py, ['-m', 'pip', 'install', '-r', reqs], onLog)
    if (code !== 0) return { ok: false, error: mt('install.pipFailed', { code }) }

    onLog(mt('install.logVerifying'))
    code = await run(py, ['-c', 'import ultralytics, cv2; print("imports OK")'], onLog)
    if (code !== 0) return { ok: false, error: mt('install.importCheckFailed') }

    onLog(mt('install.done'))
    return { ok: true, pythonPath: py }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
