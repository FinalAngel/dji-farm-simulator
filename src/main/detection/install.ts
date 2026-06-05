// In-app setup for the detection engine. Creates a Python virtual
// environment in userData and pip-installs the detector's requirements, streaming
// every line of output so the UI can show live progress. Requires a base Python 3
// to already be on the system (we can create a venv from it, but can't install the
// interpreter itself).

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { pythonExecutable, pythonRequirementsPath, venvDir, venvPython } from '../paths'

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
    return { ok: false, error: 'Python 3 was not found on your system. Install Python 3 (python.org), then run the installer again.' }
  }
  const reqs = pythonRequirementsPath()
  if (!existsSync(reqs)) return { ok: false, error: 'Could not locate python/requirements.txt.' }

  const venv = venvDir()
  const py = venvPython()

  try {
    onLog(`▸ Using ${basePy}`)
    onLog(`▸ Creating virtual environment at ${venv} …`)
    let code = await run(basePy, ['-m', 'venv', venv], onLog)
    if (code !== 0) return { ok: false, error: `Virtual environment creation failed (exit ${code}).` }

    onLog('▸ Upgrading pip …')
    await run(py, ['-m', 'pip', 'install', '--upgrade', 'pip'], onLog)

    onLog('▸ Installing ultralytics + OpenCV (this downloads PyTorch — can take several minutes) …')
    code = await run(py, ['-m', 'pip', 'install', '-r', reqs], onLog)
    if (code !== 0) return { ok: false, error: `pip install failed (exit ${code}). See the log above.` }

    onLog('▸ Verifying the install …')
    code = await run(py, ['-c', 'import ultralytics, cv2; print("imports OK")'], onLog)
    if (code !== 0) return { ok: false, error: 'Packages installed but the import check failed.' }

    onLog('✓ Detection engine installed.')
    return { ok: true, pythonPath: py }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
