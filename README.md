# Lito X1 Cockpit

A desktop (Electron) **mission-planning & analysis cockpit** for flying farm fields with a
**DJI Lito X1** and counting livestock (focus: cows) while flagging deer/fawns before mowing.

Draw fields on a map → generate an optimal coverage path → export a DJI-importable
mission → fly it in DJI Fly → import the recorded footage → get geolocated animal
counts, a deer-safety alert, and a stored flight history with the video for reference.

---

## ⚠️ Read this first — three realities that shaped the design

1. **You cannot control a DJI Lito X1 from a desktop app.** DJI's flight-control SDK
   (Mobile SDK v5) is Android/iOS only and **per-model** — the Lito X1 is *not* on the
   supported list (it has on-board waypoints in DJI Fly but **no SDK**). Bridges like
   [DJIControlServer](https://github.com/dkapur17/DJIControlServer) work only on
   MSDK-supported drones (e.g. Mini 4 Pro). So this app **plans and analyzes**; DJI Fly
   flies. The `DroneController` abstraction (`src/main/drone/`) leaves a clean seam for a
   live bridge if you later use an MSDK drone — see **Live control** below.

2. **For deer/fawns, RGB is best-effort — thermal is the real tool.** Swiss
   *Rehkitzrettung* runs on **thermal cameras at dawn** because fawns freeze and hide in
   tall grass. The Lito X1 is RGB-only, and COCO YOLO has no "deer" class. Cow counting on
   RGB is solid (~93–95% in the literature); deer detection here is a clearly-labeled
   best-effort that needs a custom/thermal setup to be dependable.

3. **Unattended autonomous flight isn't legal in the CH/EASA open category.** Sub-250 g
   (C0) lets you overfly people, but BVLOS / out-of-sight autonomy is the *specific*
   category (FOCA authorization). Fly the exported mission **in visual line of sight**.

## Workflow

```
Draw field ─► Plan coverage ─► Export (.kmz/.csv) ─► DJI Fly: import + fly (VLOS)
                                                          │
   Flight history ◄─ Count + geolocate + store ◄─ Import SD-card video (+ .SRT)
```

You can also hit **Simulate flight** to run the whole pipeline end-to-end with synthetic,
geolocated detections — no hardware, no video needed.

## Quick start

```bash
npm install
npm run dev
```

Then: **Fields → Load a demo field**, switch to **Plan & Fly**, tweak the sliders, and
press **▶ Simulate flight**. A flight with cow/deer counts appears under **Flights**.

> Map imagery is Esri World Imagery / OpenStreetMap raster tiles (no API key needed).

## Real detection (YOLO)

The simulator needs nothing. To analyze **real video**, install the Python sidecar:

```bash
python3 -m venv python/.venv
python/.venv/bin/pip install -r python/requirements.txt
LITOX1_PYTHON="$(pwd)/python/.venv/bin/python" npm run dev
```

The pill in the top-right flips to **YOLO ready**. Use **Plan & Fly → Import flight
video** and (optionally) select the DJI `.SRT` sidecar so detections get geolocated.
Deer detection needs a custom model: `python/detect.py --model your_deer.pt`.

## How the pieces fit

| Area | Where |
|---|---|
| Coverage path (boustrophedon) | `src/main/geo/coverage.ts` |
| Camera footprint / strip spacing | `src/main/geo/footprint.ts`, `src/shared/camera.ts` |
| Pixel → GPS geolocation | `src/main/geo/geolocate.ts` |
| Mission export (WPML/KMZ, Litchi, KML, GeoJSON) | `src/main/export/` |
| Drone abstraction (offline / simulated / bridge) | `src/main/drone/` |
| Detection (YOLO sidecar + SRT + mock) | `src/main/detection/`, `python/detect.py` |
| Storage (JSON, no native deps) | `src/main/store.ts` |
| UI (map, planning, history) | `src/renderer/` |

## Live control (future, MSDK drones only)

`src/main/drone/bridge.ts` is a working HTTP client for a DJIControlServer-style
companion app. It refuses to fly non-MSDK aircraft (including the Lito X1). To enable
true one-tap live flight, use an MSDK drone (e.g. **Mini 4 Pro + RC-N2 + Android**), run
the companion, and point the bridge at its LAN URL.

## Caveats

- **WPML/KMZ import varies by firmware.** Always verify in DJI Fly before flying; the
  **Litchi CSV** export is the most reliable fallback.
- Coverage edge-margin is an end-trim + half-spacing inset, not a true polygon buffer.
- Geolocation assumes a nadir (-90°) gimbal and approximate lens FOVs — tune
  `src/shared/camera.ts` against a calibration flight for survey-grade accuracy.

## Build

```bash
npm run build      # compile main/preload/renderer into out/
npm run typecheck  # optional: full TS check
```
