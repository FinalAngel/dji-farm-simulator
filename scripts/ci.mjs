// Reproduce the GitHub `test` job locally: typecheck → logic tests → build →
// headless boot. Run with `npm run ci`. Cross-platform; on Linux it wraps the
// boot in xvfb-run when available (matching CI), elsewhere it boots directly.
import { spawnSync } from 'node:child_process'
import { platform } from 'node:os'

const isWin = platform() === 'win32'
const npm = isWin ? 'npm.cmd' : 'npm'

function run(label, cmd, args, env = {}) {
  process.stdout.write(`\n[1m▶ ${label}[0m\n`)
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } })
  if (r.status !== 0) {
    process.stderr.write(`\n[31m✗ ${label} failed (exit ${r.status ?? 'signal ' + r.signal})[0m\n`)
    process.exit(r.status || 1)
  }
}

run('Typecheck', npm, ['run', 'typecheck'])
run('Logic tests', npm, ['test'])
run('Build (main + preload + renderer)', npm, ['run', 'build'])

// Headless boot: the app self-exits 0 once the UI renders (see src/main/index.ts).
const hasXvfb = platform() === 'linux' &&
  spawnSync('which', ['xvfb-run'], { stdio: 'ignore' }).status === 0
if (hasXvfb) {
  run('Headless boot (xvfb)', 'xvfb-run', ['-a', npm, 'start'], { LITOX1_SMOKE_EXIT: '1' })
} else {
  run('Headless boot', npm, ['start'], { LITOX1_SMOKE_EXIT: '1' })
}

process.stdout.write('\n[32m✓ CI passed[0m\n')
