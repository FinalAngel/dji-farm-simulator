// Italian (Swiss Italian context).
import type { Dict } from "./en";

export const it: Dict = {
  common: {
    cancel: "Annulla",
    edit: "Modifica",
    delete: "Elimina",
    settings: "Impostazioni",
  },
  nav: {
    fields: "Campi",
    planFly: "Pianifica & Vola",
    flights: "Voli",
  },
  topbar: {
    tipSaveFirst: "Salva o annulla prima il campo",
    tipSelectField: "Seleziona prima un campo nella scheda Campi",
    tipActiveDrone: "Drone attivo — clicca per le impostazioni",
    tipRealActive: "Rilevamento reale attivo — clicca per le impostazioni",
    tipInstallReal:
      "Vai alle impostazioni per installare il rilevamento reale.",
    operational: "Operativo",
    simulator: "Simulatore",
    satellite: "Satellite",
    map: "Mappa",
  },
  app: {
    dismissHint: "(clicca per chiudere)",
    settingsSaved: "Impostazioni salvate",
    startingInstall: "Avvio dell’installazione…",
    installFailed: "Installazione non riuscita.",
  },
  confirm: {
    reset:
      "Reimpostare l’app? Questo elimina definitivamente tutti i campi, i voli, i rilevamenti, le impostazioni e il motore di rilevamento installato, poi riparte da zero.",
    deleteField: "Eliminare questo campo e i suoi voli?",
    deleteFlight: "Eliminare questo volo?",
  },
  demo: {
    name: "Prato demo (Berna)",
    notes: "Campo di esempio per i test",
  },
  fields: {
    editField: "Modifica campo",
    newField: "Nuovo campo",
    subtitle:
      "Traccia il confine di un campo per pianificare voli di copertura, contare il bestiame e segnalare i caprioli.",
    drawHint:
      "Clicca sulla mappa per posizionare i punti di confine. Trascina un punto per spostarlo, Shift+clic su un punto per eliminarlo.",
    undoPoint: "Annulla punto",
    draftPts: "{count} pti",
    fieldInformation: "Informazioni sul campo",
    fieldSize: "Dimensione del campo",
    noFieldsTitle: "Ancora nessun campo",
    noFieldsBody:
      "Disegna qui sotto il tuo primo campo per iniziare, oppure carica una demo per esplorare.",
    loadDemo: "Carica un campo demo 🇨🇭",
    itemSub: "{area} ha · {points} pti",
    actions: "Azioni",
    actionsAria: "Azioni del campo",
    drawNew: "+ Disegna un nuovo campo",
    nameLabel: "Nome del campo",
    namePlaceholder: "es. Prato nord",
    notesLabel: "Note (facoltativo)",
    notesPlaceholder: "Pendenza, posizione del cancello, pericoli…",
    updateField: "Aggiorna campo",
    saveField: "Salva campo",
    untitled: "Campo senza titolo",
  },
  plan: {
    selectPrompt:
      "Seleziona un campo nella scheda Campi, poi torna qui per pianificare il volo.",
    boundaryPoints: "{area} ha · {points} punti di confine",
    tabParameters: "Parametri",
    tabExportFly: "Export & Volo",
    flightParameters: "Parametri di volo",
    flightEstimate: "Stima del volo",
    estFlightTime: "Tempo di volo stim.",
    pathLength: "Lunghezza del percorso",
    waypoints: "Waypoint",
    stripSpacing: "Distanza tra le strisce",
    footprintInfo: "Impronta larga {width} m · stim. {pct}% di una batteria",
    batteriesWarn: " · ⚠ richiede {count} batterie (dividi la missione)",
    exportTitle: "Esporta missione → DJI Fly",
    exportTo: "Esporta in…",
    revealTitle: "Mostra nel gestore file",
    wpmlHelp:
      "La compatibilità di importazione WPML varia in base al firmware — se DJI Fly rifiuta il .kmz, usa il CSV Litchi. Vola a vista (VLOS); il volo completamente autonomo rientra nella categoria specifica EASA/UFAC.",
    flyTitle: "Sorvola il campo",
    simulate: "▶ Simula il volo (senza hardware)",
    importVideo: "⬆ Importa un video di volo per l’analisi",
    backendLabel: "Motore di rilevamento:",
    backendReal: "Ultralytics",
    backendMock: "Simulatore/mock",
    backendChecking: "Verifica del motore di rilevamento…",
  },
  params: {
    altitude: "Altitudine (dal suolo)",
    speed: "Velocità",
    sideOverlap: "Sovrapposizione laterale",
    sweepAngle: "Angolo di scansione",
    edgeMargin: "Margine di bordo",
  },
  flights: {
    title: "Voli",
    subtitle:
      "Ogni volo simulato o analizzato viene salvato qui con i suoi conteggi e le riprese.",
    noneTitle: "Ancora nessun volo",
    noneBody:
      "Pianifica un campo, poi avvia una simulazione o importa un video per vedere i risultati qui.",
    allFlights: "← Tutti i voli",
    cows: { one: "🐄 {count} mucca", other: "🐄 {count} mucche" },
    deer: { one: "🦌 {count} capriolo", other: "🦌 {count} caprioli" },
    deerAlertTitle: {
      one: "🦌 {count} capriolo rilevato",
      other: "🦌 {count} caprioli rilevati",
    },
    deerAlertBody:
      "Verifica e libera prima dello sfalcio. (RGB nei limiti del possibile; il termico all’alba è più affidabile.)",
    detections: "Rilevamenti",
    cowsLabel: "🐄 Mucche",
    deerLabel: "🦌 Caprioli",
    totalAnimals: "Totale animali",
    plannedTime: "Tempo pianificato",
    detectedClasses: "Classi rilevate",
    detectionBackend: "Motore di rilevamento: {name}",
    footage: "Riprese",
    mission: "Missione",
    missionSummary:
      "Altitudine {alt} m · velocità {speed} m/s · sovrapposizione {overlap}% · {waypoints} waypoint",
    deleteFlight: "Elimina volo",
  },
  status: {
    planned: "Pianificato",
    flying: "In volo",
    completed: "Completato",
    failed: "Fallito",
    aborted: "Interrotto",
  },
  controller: {
    offline: "Esportazione offline",
    simulated: "Simulatore",
    bridge: "Bridge live",
  },
  cls: {
    cow: "mucca",
    deer: "capriolo",
    sheep: "pecora",
    horse: "cavallo",
    dog: "cane",
    person: "persona",
    other: "altro",
  },
  stats: {
    area: "Superficie",
    areaSqM: "Superficie (m²)",
    perimeter: "Perimetro",
    boundaryPoints: "Punti di confine",
  },
  mapSearch: {
    placeholder: "Cerca un luogo o un indirizzo…",
    clear: "Cancella",
    unnamed: "Luogo senza nome",
  },
  settings: {
    welcomeTitle: "Benvenuto 👋",
    title: "Impostazioni",
    welcomeSub:
      "Scegli il drone che piloti e controlla il motore di rilevamento. Potrai modificare tutto in seguito dal pulsante ⚙.",
    sub: "Configura il tuo aeromobile, il motore di rilevamento e i valori predefiniti.",
    yourDrone: "Il tuo drone",
    droneHelp:
      "Determina la spaziatura della copertura, le stime del tempo di volo e la geolocalizzazione pixel→suolo.",
    badgeMsdk: "MSDK",
    badgeNoSdk: "Nessun SDK",
    droneSpecs: "~{min} min utili · {hfov}°×{vfov}° FOV · {w}×{h}",
    detectionEngine: "Motore di rilevamento",
    realActive: "● Rilevamento reale attivo",
    simulatorMock: "● Simulatore (rilevamenti fittizi)",
    checking: "Verifica…",
    engineHelp:
      "Il Simulatore genera conteggi sintetici e riproducibili per provare l’intero flusso senza configurazione — alimenta « Simula il volo ». Ultralytics esegue un rilevamento di oggetti reale sui video di volo importati: le mucche vengono contate bene; i caprioli restano RGB nei limiti del possibile.",
    installEngine: "⬇ Installa il motore di rilevamento",
    installing: "⏳ Installazione… tieni l’app aperta",
    recheck: "↻ Ricontrolla il motore",
    installHelp:
      "Configura tutto nell’app — crea un ambiente Python e scarica Ultralytics + OpenCV (~1 GB, alcuni minuti). Richiede Python 3 sul tuo sistema.",
    confidence: "Affidabilità del rilevamento",
    confidenceHelp:
      "Più basso rileva più animali ma aggiunge falsi positivi; più alto è più severo.",
    defaultParams: "Parametri di volo predefiniti",
    defaultParamsHelp:
      "Applicati a un nuovo campo finché non li regoli in Pianifica & Vola.",
    map: "Mappa",
    defaultBasemap: "Mappa di base predefinita",
    language: "Lingua",
    languageHelp: "Scegli la lingua usata in tutta l’applicazione.",
    reset: "Reimposta",
    resetHelp:
      "Elimina definitivamente tutti i campi, i voli, i rilevamenti, le impostazioni e il motore di rilevamento installato, poi riparte da zero.",
    resetButton: "Reimposta l’app & elimina tutti i dati",
    getStarted: "Inizia →",
  },
  backend: {
    pythonNotFound:
      "Python 3 non trovato. Imposta un percorso Python nelle impostazioni, oppure usa il simulatore integrato.",
    ready: "Rilevatore Ultralytics pronto.",
    packagesMissing:
      "Python trovato, ma i pacchetti non sono ancora installati. Usa « Installa il motore di rilevamento » qui sotto.",
    unavailable:
      "Motore di rilevamento non disponibile. Installa i pacchetti dalle impostazioni, oppure usa la simulazione.",
    ultralytics: "Ultralytics",
    noTelemetry:
      "Ultralytics (nessuna telemetria — rilevamenti non geolocalizzati)",
  },
  install: {
    pythonNotFound:
      "Python 3 non è stato trovato sul tuo sistema. Installa Python 3 (python.org), poi riavvia l’installatore.",
    noRequirements: "Impossibile trovare python/requirements.txt.",
    venvFailed:
      "Creazione dell’ambiente virtuale non riuscita (codice {code}).",
    pipFailed:
      "Installazione pip non riuscita (codice {code}). Vedi il registro qui sopra.",
    importCheckFailed:
      "Pacchetti installati ma la verifica di importazione non è riuscita.",
    logUsing: "▸ Uso di {path}",
    logCreatingVenv: "▸ Creazione dell’ambiente virtuale in {venv} …",
    logUpgradingPip: "▸ Aggiornamento di pip …",
    logInstalling:
      "▸ Installazione di ultralytics + OpenCV (scarica PyTorch — può richiedere alcuni minuti) …",
    logVerifying: "▸ Verifica dell’installazione …",
    done: "✓ Motore di rilevamento installato.",
  },
  sim: {
    takeoff: "Armamento e decollo…",
    scanning: "Scansione della striscia {n}…",
    returning: "Ritorno al punto di partenza…",
    analyzing: "Analisi delle riprese alla ricerca di animali…",
    landed: {
      one: "Atterrato. {count} animale rilevato.",
      other: "Atterrato. {count} animali rilevati.",
    },
  },
  bridge: {
    uploading: "Caricamento della missione sul companion…",
    complete:
      "Missione completata. Importa il video della scheda SD per l’analisi.",
    noUrl: "Nessun URL del bridge configurato.",
    unavailable: "Bridge non disponibile",
  },
  errors: {
    fieldMin3: "Un campo richiede almeno 3 punti.",
    fieldNotFound: "Campo {id} non trovato",
  },
};
