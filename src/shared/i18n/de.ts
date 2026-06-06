// German (Swiss orthography — "ss" not "ß", matching the Swiss Rehkitzrettung context).
import type { Dict } from "./en";

export const de: Dict = {
  common: {
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    delete: "Löschen",
    settings: "Einstellungen",
  },
  nav: {
    fields: "Felder",
    planFly: "Planen & Fliegen",
    flights: "Flüge",
  },
  topbar: {
    tipSaveFirst: "Speichere oder verwirf das Feld zuerst",
    tipSelectField: "Wähle zuerst ein Feld im Tab «Felder»",
    tipActiveDrone: "Aktive Drohne — für Einstellungen klicken",
    tipRealActive: "Echte Erkennung aktiv — für Einstellungen klicken",
    tipInstallReal: "In den Einstellungen die echte Erkennung installieren.",
    operational: "Einsatzbereit",
    simulator: "Simulator",
    satellite: "Satellit",
    map: "Karte",
  },
  app: {
    dismissHint: "(zum Schliessen klicken)",
    settingsSaved: "Einstellungen gespeichert",
    startingInstall: "Installation wird gestartet…",
    installFailed: "Installation fehlgeschlagen.",
  },
  confirm: {
    reset:
      "App zurücksetzen? Dies löscht dauerhaft alle Felder, Flüge, Erkennungen, Einstellungen und die installierte Erkennungs-Engine und beginnt von vorne.",
    deleteField: "Dieses Feld und seine Flüge löschen?",
    deleteFlight: "Diesen Flug löschen?",
  },
  demo: {
    name: "Demo-Wiese (Bern)",
    notes: "Beispielfeld zum Testen",
  },
  fields: {
    editField: "Feld bearbeiten",
    newField: "Neues Feld",
    subtitle:
      "Zeichne eine Feldgrenze, um Abdeckungsflüge zu planen, Rinder zu zählen und Rehe zu markieren.",
    drawHint:
      "Klicke auf die Karte, um Grenzpunkte zu setzen. Ziehe einen Punkt zum Verschieben, Shift-Klick auf einen Punkt zum Löschen.",
    undoPoint: "Punkt rückgängig",
    draftPts: "{count} Pkt.",
    fieldInformation: "Feldinformationen",
    fieldSize: "Feldgrösse",
    noFieldsTitle: "Noch keine Felder",
    noFieldsBody:
      "Zeichne unten dein erstes Feld, um loszulegen, oder lade eine Demo zum Ausprobieren.",
    loadDemo: "Demo-Feld laden 🇨🇭",
    itemSub: "{area} ha · {points} Pkt.",
    actions: "Aktionen",
    actionsAria: "Feldaktionen",
    drawNew: "+ Neues Feld zeichnen",
    nameLabel: "Feldname",
    namePlaceholder: "z. B. Nordwiese",
    notesLabel: "Notizen (optional)",
    notesPlaceholder: "Hangneigung, Tor-Standort, Gefahren…",
    updateField: "Feld aktualisieren",
    saveField: "Feld speichern",
    untitled: "Unbenanntes Feld",
  },
  plan: {
    selectPrompt:
      "Wähle ein Feld im Tab «Felder» und komm dann hierher zurück, um den Flug zu planen.",
    boundaryPoints: "{area} ha · {points} Grenzpunkte",
    tabParameters: "Parameter",
    tabExportFly: "Export & Flug",
    flightParameters: "Flugparameter",
    flightEstimate: "Flugschätzung",
    estFlightTime: "Gesch. Flugzeit",
    pathLength: "Pfadlänge",
    waypoints: "Wegpunkte",
    stripSpacing: "Bahnabstand",
    footprintInfo: "Aufnahmebreite {width} m · gesch. {pct}% eines Akkus",
    batteriesWarn: " · ⚠ benötigt {count} Akkus (Mission aufteilen)",
    exportTitle: "Mission exportieren → DJI Fly",
    exportTo: "Exportieren nach…",
    revealTitle: "Im Dateimanager anzeigen",
    wpmlHelp:
      "Die WPML-Import-Kompatibilität hängt von der Firmware ab — wenn DJI Fly die .kmz ablehnt, nutze die Litchi-CSV. Fliege auf Sicht (VLOS); vollständig unbeaufsichtigte Flüge fallen unter die spezielle Kategorie der EASA/BAZL.",
    flyTitle: "Feld abfliegen",
    simulate: "▶ Flug simulieren (ohne Hardware)",
    importVideo: "⬆ Flugvideo zur Analyse importieren",
    backendLabel: "Erkennungs-Backend:",
    backendReal: "Ultralytics",
    backendMock: "Simulator/Mock",
    backendChecking: "Erkennungs-Backend wird geprüft…",
  },
  params: {
    altitude: "Höhe (über Grund)",
    speed: "Geschwindigkeit",
    sideOverlap: "Seitliche Überlappung",
    sweepAngle: "Bahnwinkel",
    edgeMargin: "Randabstand",
  },
  flights: {
    title: "Flüge",
    subtitle:
      "Jeder simulierte oder analysierte Flug wird hier mit seinen Zählungen und Aufnahmen gespeichert.",
    noneTitle: "Noch keine Flüge",
    noneBody:
      "Plane ein Feld und starte dann eine Simulation oder importiere ein Video, um Ergebnisse zu sehen.",
    allFlights: "← Alle Flüge",
    cows: { one: "🐄 {count} Kuh", other: "🐄 {count} Kühe" },
    deer: { one: "🦌 {count} Reh", other: "🦌 {count} Rehe" },
    deerAlertTitle: {
      one: "🦌 {count} Reh erkannt",
      other: "🦌 {count} Rehe erkannt",
    },
    deerAlertBody:
      "Vor dem Mähen prüfen und freigeben. (RGB nur bedingt zuverlässig; Thermal in der Morgendämmerung ist zuverlässiger.)",
    detections: "Erkennungen",
    cowsLabel: "🐄 Kühe",
    deerLabel: "🦌 Rehe",
    totalAnimals: "Tiere gesamt",
    plannedTime: "Geplante Zeit",
    detectedClasses: "Erkannte Klassen",
    detectionBackend: "Erkennungs-Backend: {name}",
    footage: "Aufnahmen",
    mission: "Mission",
    missionSummary:
      "Höhe {alt} m · Geschwindigkeit {speed} m/s · Überlappung {overlap}% · {waypoints} Wegpunkte",
    deleteFlight: "Flug löschen",
  },
  status: {
    planned: "Geplant",
    flying: "Im Flug",
    completed: "Abgeschlossen",
    failed: "Fehlgeschlagen",
    aborted: "Abgebrochen",
  },
  controller: {
    offline: "Offline-Export",
    simulated: "Simulator",
    bridge: "Live-Bridge",
  },
  cls: {
    cow: "Kuh",
    deer: "Reh",
    sheep: "Schaf",
    horse: "Pferd",
    dog: "Hund",
    person: "Person",
    other: "Andere",
  },
  stats: {
    area: "Fläche",
    areaSqM: "Fläche (m²)",
    perimeter: "Umfang",
    boundaryPoints: "Grenzpunkte",
  },
  mapSearch: {
    placeholder: "Ort oder Adresse suchen…",
    clear: "Löschen",
    unnamed: "Unbenannter Ort",
  },
  settings: {
    welcomeTitle: "Willkommen 👋",
    title: "Einstellungen",
    welcomeSub:
      "Wähle die Drohne, die du fliegst, und prüfe die Erkennungs-Engine. Du kannst alles später über die ⚙-Schaltfläche ändern.",
    sub: "Konfiguriere dein Fluggerät, die Erkennungs-Engine und die Standardwerte.",
    yourDrone: "Deine Drohne",
    droneHelp:
      "Bestimmt Bahnabstand, Flugzeitschätzungen und Pixel→Boden-Geolokalisierung.",
    badgeMsdk: "MSDK",
    badgeNoSdk: "Kein SDK",
    droneSpecs: "~{min} min nutzbar · {hfov}°×{vfov}° FOV · {w}×{h}",
    detectionEngine: "Erkennungs-Engine",
    realActive: "● Echte Erkennung aktiv",
    simulatorMock: "● Simulator (Mock-Erkennungen)",
    checking: "Wird geprüft…",
    engineHelp:
      "Der Simulator erzeugt synthetische, gesäte Zählungen, sodass du den gesamten Ablauf ohne Einrichtung testen kannst — er treibt «Flug simulieren» an. Ultralytics führt echte Objekterkennung auf importierten Flugvideos aus: Kühe werden gut gezählt; Rehe sind mit RGB nur bedingt zuverlässig.",
    installEngine: "⬇ Erkennungs-Engine installieren",
    installing: "⏳ Installation läuft… App offen lassen",
    recheck: "↻ Engine erneut prüfen",
    installHelp:
      "Richtet alles in der App ein — erstellt eine Python-Umgebung und lädt Ultralytics + OpenCV herunter (~1 GB, einige Minuten). Erfordert Python 3 auf deinem System.",
    confidence: "Erkennungssicherheit",
    confidenceHelp:
      "Niedriger erfasst mehr Tiere, bringt aber mehr Fehlalarme; höher ist strenger.",
    defaultParams: "Standard-Flugparameter",
    defaultParamsHelp:
      "Wird auf ein neues Feld angewendet, bis du es in «Planen & Fliegen» anpasst.",
    map: "Karte",
    defaultBasemap: "Standard-Grundkarte",
    language: "Sprache",
    languageHelp: "Wähle die in der App verwendete Sprache.",
    reset: "Zurücksetzen",
    resetHelp:
      "Löscht dauerhaft alle Felder, Flüge, Erkennungen, Einstellungen und die installierte Erkennungs-Engine und beginnt von vorne.",
    resetButton: "App zurücksetzen & alle Daten löschen",
    getStarted: "Loslegen →",
  },
  backend: {
    pythonNotFound:
      "Python 3 nicht gefunden. Lege in den Einstellungen einen Python-Pfad fest oder nutze den integrierten Simulator.",
    ready: "Ultralytics-Detektor bereit.",
    packagesMissing:
      "Python gefunden, aber die Pakete sind noch nicht installiert. Nutze unten «Erkennungs-Engine installieren».",
    unavailable:
      "Erkennungs-Backend nicht verfügbar. Installiere die Pakete in den Einstellungen oder nutze die Simulation.",
    ultralytics: "Ultralytics",
    noTelemetry:
      "Ultralytics (keine Telemetrie — Erkennungen nicht geolokalisiert)",
  },
  install: {
    pythonNotFound:
      "Python 3 wurde auf deinem System nicht gefunden. Installiere Python 3 (python.org) und starte den Installer erneut.",
    noRequirements: "python/requirements.txt konnte nicht gefunden werden.",
    venvFailed:
      "Erstellung der virtuellen Umgebung fehlgeschlagen (Code {code}).",
    pipFailed:
      "pip-Installation fehlgeschlagen (Code {code}). Siehe Protokoll oben.",
    importCheckFailed:
      "Pakete installiert, aber die Importprüfung ist fehlgeschlagen.",
    logUsing: "▸ Verwende {path}",
    logCreatingVenv: "▸ Erstelle virtuelle Umgebung in {venv} …",
    logUpgradingPip: "▸ Aktualisiere pip …",
    logInstalling:
      "▸ Installiere ultralytics + OpenCV (lädt PyTorch herunter — kann einige Minuten dauern) …",
    logVerifying: "▸ Überprüfe die Installation …",
    done: "✓ Erkennungs-Engine installiert.",
  },
  sim: {
    takeoff: "Scharfschalten und Start…",
    scanning: "Scanne Bahn {n}…",
    returning: "Rückkehr zum Startpunkt…",
    analyzing: "Analysiere Aufnahmen nach Tieren…",
    landed: {
      one: "Gelandet. {count} Tier erkannt.",
      other: "Gelandet. {count} Tiere erkannt.",
    },
  },
  bridge: {
    uploading: "Lade Mission auf Companion hoch…",
    complete:
      "Mission abgeschlossen. Importiere das SD-Karten-Video zur Analyse.",
    noUrl: "Keine Bridge-URL konfiguriert.",
    unavailable: "Bridge nicht verfügbar",
  },
  errors: {
    fieldMin3: "Ein Feld benötigt mindestens 3 Punkte.",
    fieldNotFound: "Feld {id} nicht gefunden",
  },
};
