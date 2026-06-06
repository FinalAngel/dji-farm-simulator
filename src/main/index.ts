import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { app, BrowserWindow, net, protocol, shell } from 'electron'
import { registerIpc } from './ipc'
import { settings } from './store'
import { resolveLang } from '../shared/i18n'

// Headless CI launch (no display sandbox available on the runner).
if (process.env.LITOX1_SMOKE_EXIT) app.commandLine.appendSwitch('no-sandbox')

// Allow the renderer to play local video files via media://stream?path=...
// (loading file:// directly is blocked under the app's CSP / web security).
protocol.registerSchemesAsPrivileged([
  { scheme: 'media', privileges: { stream: true, supportFetchAPI: true, secure: true, bypassCSP: true } }
])

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 680,
    backgroundColor: '#0f1419',
    title: 'DJI Farm Simulator',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  // Open external links in the default browser, not inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  const devUrl = process.env['ELECTRON_RENDERER_URL']
  if (devUrl) {
    // Forward renderer console to the terminal so map/tile errors are visible.
    win.webContents.on('console-message', (_e, level, message, line, source) => {
      console.log(`[renderer:${level}] ${message} (${source}:${line})`)
    })
    win.loadURL(devUrl)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // CI smoke launch: quit shortly after the UI renders so a headless boot can be
  // asserted (exit 0) without the app hanging the runner.
  if (process.env.LITOX1_SMOKE_EXIT) {
    win.webContents.once('did-finish-load', () => setTimeout(() => app.exit(0), 2000))
  }
}

app.whenReady().then(() => {
  protocol.handle('media', (request) => {
    const url = new URL(request.url)
    const filePath = url.searchParams.get('path') ?? ''
    return net.fetch(pathToFileURL(filePath).toString())
  })

  // First launch ever: seed the UI language from the OS locale (de/fr/it/en),
  // then leave it under the user's control via Settings.
  if (!settings.exists()) settings.set({ language: resolveLang(app.getLocale()) })

  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
