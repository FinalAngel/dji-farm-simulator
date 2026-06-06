// French (Swiss French context).
import type { Dict } from "./en";

export const fr: Dict = {
  common: {
    cancel: "Annuler",
    edit: "Modifier",
    delete: "Supprimer",
    settings: "Paramètres",
  },
  nav: {
    fields: "Champs",
    planFly: "Planifier & Voler",
    flights: "Vols",
  },
  topbar: {
    tipSaveFirst: "Enregistrez ou annulez le champ d’abord",
    tipSelectField: "Sélectionnez d’abord un champ dans l’onglet Champs",
    tipActiveDrone: "Drone actif — cliquez pour les paramètres",
    tipRealActive: "Détection réelle active — cliquez pour les paramètres",
    tipInstallReal:
      "Allez dans les paramètres pour installer la détection réelle.",
    operational: "Opérationnel",
    simulator: "Simulateur",
    satellite: "Satellite",
    map: "Carte",
  },
  app: {
    dismissHint: "(cliquez pour fermer)",
    settingsSaved: "Paramètres enregistrés",
    startingInstall: "Démarrage de l’installation…",
    installFailed: "Échec de l’installation.",
  },
  confirm: {
    reset:
      "Réinitialiser l’application ? Cela supprime définitivement tous les champs, vols, détections, paramètres et le moteur de détection installé, puis repart de zéro.",
    deleteField: "Supprimer ce champ et ses vols ?",
    deleteFlight: "Supprimer ce vol ?",
  },
  demo: {
    name: "Prairie de démo (Berne)",
    notes: "Champ d’exemple pour les tests",
  },
  fields: {
    editField: "Modifier le champ",
    newField: "Nouveau champ",
    subtitle:
      "Tracez la limite d’un champ pour planifier des vols de couverture, compter le bétail et signaler les chevreuils.",
    drawHint:
      "Cliquez sur la carte pour placer des points de limite. Glissez un point pour le déplacer, Maj+clic sur un point pour le supprimer.",
    undoPoint: "Annuler le point",
    draftPts: "{count} pts",
    fieldInformation: "Informations du champ",
    fieldSize: "Taille du champ",
    noFieldsTitle: "Aucun champ pour l’instant",
    noFieldsBody:
      "Dessinez votre premier champ ci-dessous pour commencer, ou chargez une démo pour explorer.",
    loadDemo: "Charger un champ de démo 🇨🇭",
    itemSub: "{area} ha · {points} pts",
    actions: "Actions",
    actionsAria: "Actions du champ",
    drawNew: "+ Dessiner un nouveau champ",
    nameLabel: "Nom du champ",
    namePlaceholder: "p. ex. Prairie nord",
    notesLabel: "Notes (facultatif)",
    notesPlaceholder: "Pente, emplacement du portail, dangers…",
    updateField: "Mettre à jour le champ",
    saveField: "Enregistrer le champ",
    untitled: "Champ sans titre",
  },
  plan: {
    selectPrompt:
      "Sélectionnez un champ dans l’onglet Champs, puis revenez ici pour planifier le vol.",
    boundaryPoints: "{area} ha · {points} points de limite",
    tabParameters: "Paramètres",
    tabExportFly: "Export & Vol",
    flightParameters: "Paramètres de vol",
    flightEstimate: "Estimation du vol",
    estFlightTime: "Temps de vol est.",
    pathLength: "Longueur du parcours",
    waypoints: "Points de passage",
    stripSpacing: "Espacement des bandes",
    footprintInfo:
      "Empreinte de {width} m de large · est. {pct}% d’une batterie",
    batteriesWarn: " · ⚠ nécessite {count} batteries (divisez la mission)",
    exportTitle: "Exporter la mission → DJI Fly",
    exportTo: "Exporter vers…",
    revealTitle: "Afficher dans le gestionnaire de fichiers",
    wpmlHelp:
      "La compatibilité d’import WPML varie selon le firmware — si DJI Fly refuse le .kmz, utilisez le CSV Litchi. Volez à vue (VLOS) ; le vol entièrement automatisé relève de la catégorie spécifique EASA/OFAC.",
    flyTitle: "Survoler le champ",
    simulate: "▶ Simuler le vol (sans matériel)",
    importVideo: "⬆ Importer une vidéo de vol pour analyse",
    backendLabel: "Moteur de détection :",
    backendReal: "Ultralytics",
    backendMock: "Simulateur/mock",
    backendChecking: "Vérification du moteur de détection…",
  },
  params: {
    altitude: "Altitude (sol)",
    speed: "Vitesse",
    sideOverlap: "Recouvrement latéral",
    sweepAngle: "Angle de balayage",
    edgeMargin: "Marge de bord",
  },
  flights: {
    title: "Vols",
    subtitle:
      "Chaque vol simulé ou analysé est enregistré ici avec ses comptages et ses images.",
    noneTitle: "Aucun vol pour l’instant",
    noneBody:
      "Planifiez un champ, puis lancez une simulation ou importez une vidéo pour voir les résultats ici.",
    allFlights: "← Tous les vols",
    cows: { one: "🐄 {count} vache", other: "🐄 {count} vaches" },
    deer: { one: "🦌 {count} chevreuil", other: "🦌 {count} chevreuils" },
    deerAlertTitle: {
      one: "🦌 {count} chevreuil détecté",
      other: "🦌 {count} chevreuils détectés",
    },
    deerAlertBody:
      "Vérifiez et dégagez avant la fauche. (RGB au mieux ; le thermique à l’aube est plus fiable.)",
    detections: "Détections",
    cowsLabel: "🐄 Vaches",
    deerLabel: "🦌 Chevreuils",
    totalAnimals: "Total des animaux",
    plannedTime: "Temps planifié",
    detectedClasses: "Classes détectées",
    detectionBackend: "Moteur de détection : {name}",
    footage: "Images",
    mission: "Mission",
    missionSummary:
      "Altitude {alt} m · vitesse {speed} m/s · recouvrement {overlap}% · {waypoints} points de passage",
    deleteFlight: "Supprimer le vol",
  },
  status: {
    planned: "Planifié",
    flying: "En vol",
    completed: "Terminé",
    failed: "Échoué",
    aborted: "Interrompu",
  },
  controller: {
    offline: "Export hors ligne",
    simulated: "Simulateur",
    bridge: "Pont en direct",
  },
  cls: {
    cow: "vache",
    deer: "chevreuil",
    sheep: "mouton",
    horse: "cheval",
    dog: "chien",
    person: "personne",
    other: "autre",
  },
  stats: {
    area: "Surface",
    areaSqM: "Surface (m²)",
    perimeter: "Périmètre",
    boundaryPoints: "Points de limite",
  },
  mapSearch: {
    placeholder: "Rechercher un lieu ou une adresse…",
    clear: "Effacer",
    unnamed: "Lieu sans nom",
  },
  settings: {
    welcomeTitle: "Bienvenue 👋",
    title: "Paramètres",
    welcomeSub:
      "Choisissez le drone que vous pilotez et vérifiez le moteur de détection. Vous pourrez tout modifier plus tard via le bouton ⚙.",
    sub: "Configurez votre aéronef, le moteur de détection et les valeurs par défaut.",
    yourDrone: "Votre drone",
    droneHelp:
      "Détermine l’espacement de couverture, les estimations de temps de vol et la géolocalisation pixel→sol.",
    badgeMsdk: "MSDK",
    badgeNoSdk: "Pas de SDK",
    droneSpecs: "~{min} min utiles · {hfov}°×{vfov}° FOV · {w}×{h}",
    detectionEngine: "Moteur de détection",
    realActive: "● Détection réelle active",
    simulatorMock: "● Simulateur (détections fictives)",
    checking: "Vérification…",
    engineHelp:
      "Le Simulateur génère des comptages synthétiques et reproductibles pour essayer tout le flux sans installation — il alimente « Simuler le vol ». Ultralytics effectue une détection d’objets réelle sur les vidéos de vol importées : les vaches sont bien comptées ; les chevreuils restent du RGB au mieux.",
    installEngine: "⬇ Installer le moteur de détection",
    installing: "⏳ Installation… gardez l’app ouverte",
    recheck: "↻ Revérifier le moteur",
    installHelp:
      "Configure tout dans l’app — crée un environnement Python et télécharge Ultralytics + OpenCV (~1 Go, quelques minutes). Nécessite Python 3 sur votre système.",
    confidence: "Confiance de détection",
    confidenceHelp:
      "Plus bas capte plus d’animaux mais ajoute des faux positifs ; plus haut est plus strict.",
    defaultParams: "Paramètres de vol par défaut",
    defaultParamsHelp:
      "Appliqués à un nouveau champ jusqu’à ce que vous les ajustiez dans Planifier & Voler.",
    map: "Carte",
    defaultBasemap: "Fond de carte par défaut",
    language: "Langue",
    languageHelp: "Choisissez la langue utilisée dans toute l’application.",
    reset: "Réinitialiser",
    resetHelp:
      "Supprime définitivement tous les champs, vols, détections, paramètres et le moteur de détection installé, puis repart de zéro.",
    resetButton: "Réinitialiser l’app & supprimer toutes les données",
    getStarted: "Commencer →",
  },
  backend: {
    pythonNotFound:
      "Python 3 introuvable. Définissez un chemin Python dans les paramètres, ou utilisez le simulateur intégré.",
    ready: "Détecteur Ultralytics prêt.",
    packagesMissing:
      "Python trouvé, mais les paquets ne sont pas encore installés. Utilisez « Installer le moteur de détection » ci-dessous.",
    unavailable:
      "Moteur de détection indisponible. Installez les paquets depuis les paramètres, ou utilisez la simulation.",
    ultralytics: "Ultralytics",
    noTelemetry:
      "Ultralytics (pas de télémétrie — détections non géolocalisées)",
  },
  install: {
    pythonNotFound:
      "Python 3 est introuvable sur votre système. Installez Python 3 (python.org), puis relancez l’installateur.",
    noRequirements: "Impossible de localiser python/requirements.txt.",
    venvFailed:
      "Échec de la création de l’environnement virtuel (code {code}).",
    pipFailed:
      "Échec de l’installation pip (code {code}). Voir le journal ci-dessus.",
    importCheckFailed:
      "Paquets installés mais la vérification d’import a échoué.",
    logUsing: "▸ Utilisation de {path}",
    logCreatingVenv: "▸ Création de l’environnement virtuel dans {venv} …",
    logUpgradingPip: "▸ Mise à jour de pip …",
    logInstalling:
      "▸ Installation d’ultralytics + OpenCV (télécharge PyTorch — peut prendre plusieurs minutes) …",
    logVerifying: "▸ Vérification de l’installation …",
    done: "✓ Moteur de détection installé.",
  },
  sim: {
    takeoff: "Armement et décollage…",
    scanning: "Balayage de la bande {n}…",
    returning: "Retour au point de départ…",
    analyzing: "Analyse des images à la recherche d’animaux…",
    landed: {
      one: "Atterri. {count} animal détecté.",
      other: "Atterri. {count} animaux détectés.",
    },
  },
  bridge: {
    uploading: "Envoi de la mission au compagnon…",
    complete:
      "Mission terminée. Importez la vidéo de la carte SD pour l’analyse.",
    noUrl: "Aucune URL de pont configurée.",
    unavailable: "Pont indisponible",
  },
  errors: {
    fieldMin3: "Un champ nécessite au moins 3 points.",
    fieldNotFound: "Champ {id} introuvable",
  },
};
