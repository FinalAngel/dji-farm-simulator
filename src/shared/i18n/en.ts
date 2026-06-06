// English — the canonical dictionary. Its shape (via `typeof en`, exported as
// `Dict`) is the contract every other locale must satisfy, so a missing or extra
// key in de/fr/it is a compile error. A value is either a plain string or a
// { one, other } pair selected by `vars.count` (see translate() in ./index).
//
// Interpolation: `{name}` placeholders are filled from the vars passed to t().
// Product names (DJI, Litchi, WPML, KML, GeoJSON, Ultralytics, OpenCV, Python,
// PyTorch) are intentionally left untranslated across all locales.

export const en = {
  common: {
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    settings: 'Settings'
  },
  nav: {
    fields: 'Fields',
    planFly: 'Plan & Fly',
    flights: 'Flights'
  },
  topbar: {
    tipSaveFirst: 'Save or cancel the field first',
    tipSelectField: 'Select a field in the Fields tab first',
    tipActiveDrone: 'Active drone — click for Settings',
    tipRealActive: 'Real detection active — click for Settings',
    tipInstallReal: 'Go to settings to install real detection.',
    operational: 'Operational',
    simulator: 'Simulator',
    satellite: 'Satellite',
    map: 'Map'
  },
  app: {
    dismissHint: '(click to dismiss)',
    settingsSaved: 'Settings saved',
    startingInstall: 'Starting installation…',
    installFailed: 'Installation failed.'
  },
  confirm: {
    reset: 'Reset the app? This permanently deletes all fields, flights, detections, settings and the installed detection engine, then starts fresh.',
    deleteField: 'Delete this field and its flights?',
    deleteFlight: 'Delete this flight?'
  },
  demo: {
    name: 'Demo meadow (Bern)',
    notes: 'Sample field for testing'
  },
  fields: {
    editField: 'Edit field',
    newField: 'New field',
    subtitle: 'Draw a field boundary to plan coverage flights, count cattle and flag deer.',
    drawHint: 'Click the map to drop boundary points. Drag a point to move it, shift-click a point to delete it.',
    undoPoint: 'Undo point',
    draftPts: '{count} pts',
    fieldInformation: 'Field information',
    fieldSize: 'Field size',
    noFieldsTitle: 'No fields yet',
    noFieldsBody: 'Draw your first field below to get started, or load a demo to explore.',
    loadDemo: 'Load a demo field 🇨🇭',
    itemSub: '{area} ha · {points} pts',
    actions: 'Actions',
    actionsAria: 'Field actions',
    drawNew: '+ Draw a new field',
    nameLabel: 'Field name',
    namePlaceholder: 'e.g. North meadow',
    notesLabel: 'Notes (optional)',
    notesPlaceholder: 'Slope, gate location, hazards…',
    updateField: 'Update field',
    saveField: 'Save field',
    untitled: 'Untitled field'
  },
  plan: {
    selectPrompt: 'Select a field on the Fields tab, then come back here to plan the flight.',
    boundaryPoints: '{area} ha · {points} boundary points',
    tabParameters: 'Parameters',
    tabExportFly: 'Export & Fly',
    flightParameters: 'Flight parameters',
    flightEstimate: 'Flight estimate',
    estFlightTime: 'Est. flight time',
    pathLength: 'Path length',
    waypoints: 'Waypoints',
    stripSpacing: 'Strip spacing',
    footprintInfo: 'Footprint {width} m wide · est. {pct}% of one battery',
    batteriesWarn: ' · ⚠ needs {count} batteries (split the mission)',
    exportTitle: 'Export mission → DJI Fly',
    exportTo: 'Export to…',
    revealTitle: 'Reveal in file manager',
    wpmlHelp: 'WPML import compatibility varies by firmware — if DJI Fly rejects the .kmz, use the Litchi CSV. Fly in VLOS; fully unattended flight is the EASA/BAZL specific category.',
    flyTitle: 'Fly the field',
    simulate: '▶ Simulate flight (no hardware)',
    importVideo: '⬆ Import flight video for analysis',
    backendLabel: 'Detection backend:',
    backendReal: 'Ultralytics',
    backendMock: 'Simulator/mock',
    backendChecking: 'Checking detection backend…'
  },
  params: {
    altitude: 'Altitude (AGL)',
    speed: 'Speed',
    sideOverlap: 'Side overlap',
    sweepAngle: 'Sweep angle',
    edgeMargin: 'Edge margin'
  },
  flights: {
    title: 'Flights',
    subtitle: 'Every simulated or analyzed flight is stored here with its counts and footage.',
    noneTitle: 'No flights yet',
    noneBody: 'Plan a field, then run a simulation or import a video to see results here.',
    allFlights: '← All flights',
    cows: { one: '🐄 {count} cow', other: '🐄 {count} cows' },
    deer: { one: '🦌 {count} deer', other: '🦌 {count} deer' },
    deerAlertTitle: { one: '🦌 {count} deer detected', other: '🦌 {count} deer detected' },
    deerAlertBody: 'Verify and clear before mowing. (RGB best-effort; thermal at dawn is more reliable.)',
    detections: 'Detections',
    cowsLabel: '🐄 Cows',
    deerLabel: '🦌 Deer',
    totalAnimals: 'Total animals',
    plannedTime: 'Planned time',
    detectedClasses: 'Detected classes',
    detectionBackend: 'Detection backend: {name}',
    footage: 'Footage',
    mission: 'Mission',
    missionSummary: 'Altitude {alt} m · speed {speed} m/s · overlap {overlap}% · {waypoints} waypoints',
    deleteFlight: 'Delete flight'
  },
  status: {
    planned: 'Planned',
    flying: 'Flying',
    completed: 'Completed',
    failed: 'Failed',
    aborted: 'Aborted'
  },
  controller: {
    offline: 'Offline export',
    simulated: 'Simulator',
    bridge: 'Live bridge'
  },
  cls: {
    cow: 'cow',
    deer: 'deer',
    sheep: 'sheep',
    horse: 'horse',
    dog: 'dog',
    person: 'person',
    other: 'other'
  },
  stats: {
    area: 'Area',
    areaSqM: 'Area (m²)',
    perimeter: 'Perimeter',
    boundaryPoints: 'Boundary points'
  },
  mapSearch: {
    placeholder: 'Search a place or address…',
    clear: 'Clear',
    unnamed: 'Unnamed place'
  },
  settings: {
    welcomeTitle: 'Welcome 👋 — set up your cockpit',
    title: 'Settings',
    welcomeSub: 'Pick the drone you fly and review the detection engine. You can change all of this later from the ⚙ button.',
    sub: 'Configure your aircraft, detection engine and defaults.',
    yourDrone: 'Your drone',
    droneHelp: 'Drives coverage spacing, flight-time estimates and pixel→ground geolocation.',
    badgeMsdk: 'MSDK',
    badgeNoSdk: 'No SDK',
    droneSpecs: '~{min} min usable · {hfov}°×{vfov}° FOV · {w}×{h}',
    detectionEngine: 'Detection engine',
    realActive: '● Real detection active',
    simulatorMock: '● Simulator (mock detections)',
    checking: 'Checking…',
    engineHelp: 'The Simulator generates synthetic, seeded counts so you can try the whole workflow with no setup — it powers “Simulate flight”. Ultralytics runs real object detection on imported flight video: cows count well; deer is RGB best-effort.',
    installEngine: '⬇ Install detection engine',
    installing: '⏳ Installing… keep the app open',
    recheck: '↻ Re-check engine',
    installHelp: 'Sets everything up inside the app — creates a Python environment and downloads Ultralytics + OpenCV (~1 GB, a few minutes). Requires Python 3 on your system.',
    confidence: 'Detection confidence',
    confidenceHelp: 'Lower catches more animals but adds false positives; higher is stricter.',
    defaultParams: 'Default flight parameters',
    defaultParamsHelp: 'Applied to a new field until you tune it in Plan & Fly.',
    map: 'Map',
    defaultBasemap: 'Default basemap',
    language: 'Language',
    languageHelp: 'Choose the language used throughout the app.',
    reset: 'Reset',
    resetHelp: 'Permanently delete all fields, flights, detections, settings and the installed detection engine, then start fresh.',
    resetButton: 'Reset app & delete all data',
    getStarted: 'Get started →'
  },
  backend: {
    pythonNotFound: 'Python 3 not found. Set a Python path in Settings, or use the built-in simulator.',
    ready: 'Ultralytics detector ready.',
    packagesMissing: 'Python found, but the packages aren’t installed yet. Use “Install detection engine” below.',
    unavailable: 'Detection backend unavailable. Install the packages from Settings, or use Simulate.',
    ultralytics: 'Ultralytics',
    noTelemetry: 'Ultralytics (no telemetry — detections not geolocated)'
  },
  install: {
    pythonNotFound: 'Python 3 was not found on your system. Install Python 3 (python.org), then run the installer again.',
    noRequirements: 'Could not locate python/requirements.txt.',
    venvFailed: 'Virtual environment creation failed (exit {code}).',
    pipFailed: 'pip install failed (exit {code}). See the log above.',
    importCheckFailed: 'Packages installed but the import check failed.',
    logUsing: '▸ Using {path}',
    logCreatingVenv: '▸ Creating virtual environment at {venv} …',
    logUpgradingPip: '▸ Upgrading pip …',
    logInstalling: '▸ Installing ultralytics + OpenCV (this downloads PyTorch — can take several minutes) …',
    logVerifying: '▸ Verifying the install …',
    done: '✓ Detection engine installed.'
  },
  sim: {
    takeoff: 'Arming and taking off…',
    scanning: 'Scanning strip {n}…',
    returning: 'Returning to home point…',
    analyzing: 'Analyzing footage for animals…',
    landed: { one: 'Landed. {count} animal detected.', other: 'Landed. {count} animals detected.' }
  },
  bridge: {
    uploading: 'Uploading mission to companion…',
    complete: 'Mission complete. Import the SD-card video to analyze.',
    noUrl: 'No bridge URL configured.',
    unavailable: 'Bridge unavailable'
  },
  errors: {
    fieldMin3: 'A field needs at least 3 points.',
    fieldNotFound: 'Field {id} not found'
  }
}

export type Dict = typeof en
