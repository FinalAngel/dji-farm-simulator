// Bundle the pure TS domain logic with esbuild (already present via vite) and run it.
import { build } from 'esbuild'
import { pathToFileURL } from 'node:url'

await build({
  entryPoints: ['scripts/_smoke_entry.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  outfile: 'scratch/smoke.bundle.mjs',
  external: ['electron']
})

await import(pathToFileURL(process.cwd() + '/scratch/smoke.bundle.mjs').href)
