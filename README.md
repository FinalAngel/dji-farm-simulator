<div align="center">

# 🚁 DJI Farm Simulator

**Plan coverage flights over farm fields, export DJI-ready missions, and count cows / flag deer from the footage.**

Draw a field on a map → generate an optimal coverage path → export a DJI-importable mission → fly it in DJI Fly → import the recorded footage → get geolocated animal counts, a deer-safety alert, and a stored flight history with the video for reference.

![License](https://img.shields.io/badge/license-MIT-blue)
![Electron](https://img.shields.io/badge/Electron-31-47848F?logo=electron&logoColor=white)
![Platforms](https://img.shields.io/badge/platform-macOS%20·%20Windows%20·%20Linux-lightgrey)
![No native modules](https://img.shields.io/badge/npm%20install-painless-success)

<!-- Once pushed to GitHub, replace OWNER/REPO to enable the live status badge:
![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg) -->

</div>

> The focus is the **DJI Lito X1** (the drone in use), but you pick your aircraft in Settings from a catalog of DJI drones, and the camera/airframe specs drive the planning math.

---

## ⚠️ Read this first — three realities that shaped the design

1. **You cannot control a DJI Lito X1 from a desktop app.** DJI's flight-control SDK (Mobile SDK v5) is Android/iOS only and **per-model** — the Lito X1 is *not* supported (it has on-board waypoints in DJI Fly but **no SDK**). Bridges like [DJIControlServer](https://github.com/dkapur17/DJIControlServer) work only on MSDK drones (e.g. Mini 4 Pro). So this app **plans and analyzes**; DJI Fly flies. The `DroneController` abstraction (`src/main/drone/`) leaves a clean seam for a live bridge — see [Live control](#live-control-future-msdk-drones-only).

2. **For deer/fawns, RGB is best-effort — thermal is the real tool.** Swiss *Rehkitzrettung* runs on **thermal cameras at dawn** because fawns freeze and hide in tall grass. The Lito X1 is RGB-only and COCO YOLO has no "deer" class. Cow counting on RGB is solid (~93–95% in the literature); deer detection here is a clearly-labeled best-effort that needs a custom/thermal model to be dependable.

3. **Unattended autonomous flight isn't legal in the CH/EASA open category.** Fly the exported mission **in visual line of sight**. BVLOS / out-of-sight autonomy is the *specific* category (FOCA authorization).

---

## ✨ Features

- 🗺️ **Field drawing & editing** — sketch boundaries on satellite/street basemaps; drag vertices, shift-click to delete, live area/perimeter readout.
- 🧭 **Coverage planning** — boustrophedon ("lawnmower") path with altitude, speed, side-overlap, sweep-angle and edge-margin controls, plus flight-time and battery estimates.
- 📦 **Mission export** — DJI **WPML/KMZ**, **Litchi CSV**, **KML**, **GeoJSON**.
- ▶️ **Simulate flight** — runs the whole pipeline end-to-end with synthetic, geolocated detections. No hardware, no video, no setup.
- 🐄 **Real detection (YOLO)** — analyze imported SD-card video; detections are geolocated from the DJI `.SRT` telemetry. **Installable in one click** from Settings.
- 🦌 **Deer-safety alert** — flagged prominently on any flight before mowing.
- 🛩️ **Drone catalog** — pick your DJI aircraft; its camera FOV and flight time feed the planning math.
- ⚙️ **Settings & first-run setup** — drone, detection engine, default flight parameters, basemap, and a one-click reset.

## Workflow

```
Draw field ─► Plan coverage ─► Export (.kmz/.csv) ─► DJI Fly: import + fly (VLOS)
                                                          │
   Flight history ◄─ Count + geolocate + store ◄─ Import SD-card video (+ .SRT)
```

---

## 🚀 Installation & launch

**Requirements:** [Node.js](https://nodejs.org) 18+ (20 recommended). No native modules — `npm install` is painless.

```bash
git clone <your-fork-url> dji-farm-simulator
cd dji-farm-simulator
npm install
npm run dev          # launch the app (hot-reload for the UI, devtools attached)
```

On first launch you'll land on a **Settings / welcome** screen to pick your drone. Then:
**Fields → Load a demo field 🇨🇭 → Plan & Fly → ▶ Simulate flight** — a flight with cow/deer counts appears under **Flights**.

> Map imagery is key-free Esri World Imagery + OpenStreetMap raster tiles.

## 🧠 Real detection (YOLO)

The simulator needs nothing. To analyze **real video**, install the detection engine — **right inside the app**:

> **Settings → Detection engine → ⬇ Install detection engine**

This creates a Python virtual environment and installs Ultralytics YOLO + OpenCV (~1 GB; a few minutes), streaming live progress. It only needs **Python 3** already on your system. When it finishes, the top-right badge turns green to **● Operational** and `Plan & Fly → Import flight video` runs real detection (select the DJI `.SRT` sidecar to geolocate the hits).

<details>
<summary>Prefer the command line?</summary>

```bash
python3 -m venv python/.venv
python/.venv/bin/pip install -r python/requirements.txt
```

Then point at it via **Settings → Detection engine** (or the `LITOX1_PYTHON` env var) and hit **↻ Re-check engine**. Deer detection needs a custom model: `python/detect.py --model your_deer.pt`.
</details>

---

## 🛠️ Development

```bash
npm run dev          # run with hot-reload + devtools
npm run typecheck    # tsc --noEmit (esbuild doesn't type-check — run this before "done")
npm test             # pure-logic smoke tests (coverage, exports, geolocation, SRT, mock)
npm run build        # bundle main + preload + renderer into out/
npm start            # preview the production build
```

### Project structure

| Area | Where |
|---|---|
| Domain types · drone catalog | `src/shared/types.ts`, `src/shared/camera.ts` |
| Coverage path (boustrophedon) | `src/main/geo/coverage.ts` |
| Camera footprint / strip spacing | `src/main/geo/footprint.ts` |
| Pixel → GPS geolocation | `src/main/geo/geolocate.ts` |
| Mission export (WPML/KMZ, Litchi, KML, GeoJSON) | `src/main/export/` |
| Drone abstraction (offline / simulated / bridge) | `src/main/drone/` |
| Detection (YOLO sidecar + in-app installer + SRT + mock) | `src/main/detection/`, `python/detect.py` |
| Settings & storage (JSON, no native deps) | `src/main/store.ts`, `src/main/ipc.ts` |
| UI (map, planning, flights, settings) | `src/renderer/` |

All domain logic lives in the **main** process behind IPC; the **renderer** is presentational and talks to main only through the preload `window.api` bridge.

---

## 📦 Shipping (packaging installers)

Packaging uses [electron-builder](https://www.electron.build).

```bash
npm run pack         # unpacked app in release/ (fast sanity check)
npm run dist         # installers for the current OS (.dmg/.zip, .exe, .AppImage) in release/
```

The bundled `python/` detector ships as an `extraResource`, so the in-app YOLO installer works in a packaged build too (the venv is created in the per-user data directory).

To cut a cross-platform release, push a tag — the **Release** workflow builds and uploads installers for macOS, Windows and Linux:

```bash
git tag v0.1.0 && git push --tags
```

> Code-signing/notarization isn't configured; add your certs to the electron-builder config and CI secrets for distributable, signed builds.

## ✅ Continuous integration

`.github/workflows/ci.yml` runs on every push/PR:

- **Typecheck** (`tsc --noEmit`)
- **Logic tests** (`npm test` — 22 checks across coverage, exports, geolocation, SRT, mock)
- **Build** (main + preload + renderer)
- **Headless boot** — launches the built app under `xvfb` and asserts it starts cleanly (the app self-quits via the `LITOX1_SMOKE_EXIT` hook)
- **Cross-platform build** — also compiles on macOS and Windows

---

## 🔌 Live control (future, MSDK drones only)

`src/main/drone/bridge.ts` is a working HTTP client for a DJIControlServer-style companion app. It **refuses to fly non-MSDK aircraft** (including the Lito X1) on purpose. To enable true one-tap live flight, use an MSDK drone (e.g. **Mini 4 Pro + RC-N2 + Android**), run the companion, and point the bridge at its LAN URL.

## Caveats

- **WPML/KMZ import varies by firmware.** Always verify in DJI Fly before flying; the **Litchi CSV** export is the most reliable fallback.
- Coverage edge-margin is an end-trim + half-spacing inset, not a true polygon buffer.
- Geolocation assumes a nadir (−90°) gimbal and approximate lens FOVs — tune the drone specs in `src/shared/camera.ts` against a calibration flight for survey-grade accuracy.
- Detection counts are summed per frame (no cross-frame track-and-dedup yet), so fast-moving herds can be over-counted.

## License

[MIT](LICENSE) © Angelo Dini
