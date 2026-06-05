# CLAUDE.md — Lito X1 Cockpit

Working reference for this codebase. Read before making changes.

## What this is

An **Electron desktop app** to plan coverage flights over farm fields with a **DJI Lito X1**,
count cows, and flag deer/fawns before mowing. It is a **plan + export + analyze cockpit**,
*not* a live flight controller (see constraint #1).

Built from scratch in June 2026. Owner is Angelo Dini; the deer use-case is the Swiss
*Rehkitzrettung* (fawn rescue) context.

## Three hard constraints that shaped every design decision

1. **The DJI Lito X1 has NO Mobile SDK support.** It only has on-board waypoints in DJI Fly.
   So we *cannot* fly it from the desktop. Workflow is: draw field → generate path → export a
   DJI/Litchi mission → fly it in DJI Fly (in VLOS) → import the SD-card video → analyze.
   DJIControlServer-style live control only works on MSDK drones (e.g. Mini 4 Pro). The
   `DroneController` interface (`src/main/drone/`) is the seam for that future; `bridge.ts` is a
   working client that *refuses* non-MSDK aircraft on purpose.
2. **Deer detection is RGB best-effort only.** Real fawn rescue uses thermal at dawn; the Lito
   X1 is RGB and off-the-shelf COCO models have no "deer" class. Cows count well (~93–95% in the literature);
   deer needs a custom/thermal model. The UI says so explicitly — keep that honesty.
3. **Unattended autonomous flight is illegal in the CH/EASA open category.** Fly exports in
   visual line of sight. This note lives next to the export buttons — don't remove it.

## Commands

```bash
npm install            # no native modules — should "just work"
npm run dev            # launch app (electron-vite, HMR for renderer, devtools attached)
npm run build          # bundle main + preload + renderer into out/
npm run typecheck      # tsc --noEmit (clean as of last edit)
node scripts/smoke.mjs # pure-logic tests (coverage, exports, geolocation, SRT, mock) — 22 checks

# Real detection (optional — simulator needs none of this):
python3 -m venv python/.venv
python/.venv/bin/pip install -r python/requirements.txt
LITOX1_PYTHON="$(pwd)/python/.venv/bin/python" npm run dev
```

To try it: **Fields → Load a demo field → Plan & Fly → ▶ Simulate flight**.

## Architecture

Electron, three processes. Main does all domain logic + persistence; renderer is presentational
and talks to main only through the preload `window.api` bridge over IPC.

```
src/
  shared/            types.ts (domain model), camera.ts (Lito X1 specs — tune FOV here)
  main/
    index.ts         app lifecycle, BrowserWindow, media:// protocol (local video playback),
                     dev-only renderer-console forwarding
    ipc.ts           ALL ipcMain.handle channels (the API surface)
    store.ts         JSON-file persistence (fields/flights/detections) — no native deps
    paths.ts         userData dirs, python interpreter discovery (LITOX1_PYTHON override)
    stats.ts         detection → FlightStats
    geo/
      geo.ts         projection (lng/lat ↔ local metres), area, point-in-polygon, bearing
      footprint.ts   camera footprint + strip spacing from altitude/overlap
      coverage.ts    *** boustrophedon coverage-path planner (the core algorithm) ***
      geolocate.ts   pixel → lng/lat (nadir gimbal assumption)
    export/
      exporters.ts   Litchi CSV, KML, GeoJSON
      wpml.ts        DJI WPML/KMZ (zip via jszip) — best-effort, see gotchas
    drone/
      types.ts       DroneController interface (offline | simulated | bridge)
      offline.ts     writes mission files (the real Lito X1 path)
      simulated.ts   "flies" waypoints, emits progress, makes mock detections
      bridge.ts      DJIControlServer-style HTTP client; guards out non-MSDK drones
    detection/
      service.ts     spawns python sidecar, geolocates results via SRT
      srt.ts         DJI .SRT telemetry parser (defensive regexes)
      mock.ts        synthetic geolocated detections (seeded per flight id)
  renderer/
    src/
      App.tsx        orchestrator: state, IPC calls, view routing, map composition
      api.ts         typed window.api wrapper (mirror of preload)
      format.ts      duration/date/length formatters
      components/
        MapView.tsx  MapLibre map: field drawing, path preview, detections, live aircraft
        FieldsView.tsx  PlanView.tsx  FlightsView.tsx   (the three sidebar panels)
python/
  detect.py          Ultralytics detector → JSON of {cls, conf, frameTimeS, px, py}
  requirements.txt
scripts/             smoke.mjs (+ _smoke_entry.ts) — esbuild-bundled logic tests
```

### Data flow
- **Plan:** renderer → `mission:plan` → `coverage.planMission()` → `MissionPlan` (waypoints +
  estimates) → drawn on map + shown in PlanView.
- **Export:** `mission:export` → `OfflineController.exportMission()` → files in userData/exports.
- **Simulate:** `flights:simulate` → `SimulatedController.fly()` emits `flight:progress` events
  (animates aircraft) → `mock.generateMockDetections()` → stored → Flights view.
- **Real video:** `flights:analyzeVideo` → `detection/service.analyzeVideo()` spawns `detect.py`,
  matches each detection's frame time to an SRT sample, `geolocate.pixelToLngLat()` → stored.

## Conventions

- **All domain logic lives in main**, behind IPC. Renderer never imports from `src/main`.
  Shared types only, via `@shared/*` (alias configured for renderer; main uses relative paths).
- **No native node modules** — keep `npm install` painless. Persistence is plain JSON.
- TypeScript is loose (`strict: false`); esbuild (electron-vite) doesn't type-check, so run
  `npm run typecheck` before claiming done.
- New IPC: add handler in `ipc.ts`, expose in `preload/index.ts`, mirror in `renderer/src/api.ts`.
- Map layers are GeoJSON sources updated via `setData` in `useEffect`s keyed on props — follow
  the existing pattern in `MapView.tsx` rather than recreating sources.

## Gotchas / lessons learned

- **MapLibre blank-map bug (fixed):** a zero-height container makes MapLibre request no tiles and
  paint blank *without throwing*. Caused here by a double-nested `.map-wrap`. MapView now renders
  the `inset:0` container directly into App's sized `.map-wrap`, plus a `ResizeObserver` →
  `map.resize()`. If the map ever goes blank again, **check container height first.**
- **WPML/KMZ import varies by firmware.** It's best-effort; always verify in DJI Fly before
  flying. **Litchi CSV is the reliable fallback** — keep it as an export option.
- **Local video playback** goes through the custom `media://stream?path=...` protocol registered
  in `main/index.ts` (file:// is blocked by CSP/web-security). CSP `media-src` must include
  `media:`.
- **Map tiles** are key-free Esri World Imagery + OSM raster. CSP `connect-src https:` must allow
  them. No glyphs/text layers, so no font server needed.
- **Geolocation** assumes a nadir (-90°) gimbal and approximate Lito X1 FOVs in
  `shared/camera.ts` — tune against a calibration flight for survey-grade accuracy.
- Mock detector is **seeded by flight id**, so re-running a flight reproduces counts.

## Sensible next steps (not yet built)

- A real **deer/thermal model** (custom-trained; COCO has no deer).
- **Track-and-dedup counting** across frames instead of summing per-frame detections.
- **Field import** from KML/Shapefile (existing farm GIS).
- True polygon **buffer/inset** for edge margin (currently end-trim + half-spacing).
- Harden **WPML** against a specific firmware once there's a device to test on.
- Live bridge wiring if an **MSDK drone** (Mini 4 Pro + RC-N2 + Android) is added.
