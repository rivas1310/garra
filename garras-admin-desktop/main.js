const { app, BrowserWindow, dialog, shell, ipcMain, session } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Inicializar store para configuración
const store = new Store();

let mainWindow;

function createWindow() {
    // Crear la ventana principal
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets', 'icon.png'),
        title: 'Garras Felinas - Panel de Administración',
        show: false // No mostrar hasta que esté listo
    });

    // URL del admin (puede ser localhost o producción)
    const adminUrl = store.get('adminUrl', 'http://localhost:3000/admin');
    console.log('Cargando admin desde:', adminUrl);
    
    // Cargar la URL del admin
    mainWindow.loadURL(adminUrl).catch(err => {
        console.error('Error cargando admin:', err);
        // Si falla localhost, intentar con producción
        if (adminUrl.includes('localhost')) {
            const productionUrl = 'https://www.garrasfelinas.com/admin';
            console.log('Intentando con producción:', productionUrl);
            mainWindow.loadURL(productionUrl);
        } else {
            // Mostrar página de error
            showErrorPage();
        }
    });

    // Mostrar ventana cuando esté lista
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // Abrir DevTools solo en desarrollo
        if (process.argv.includes('--dev')) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Manejar enlaces externos
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Manejar cierre de ventana
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Manejar errores de carga
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('Error de carga:', errorCode, errorDescription, validatedURL);
        showErrorPage();
    });
}

// Forzar URL localhost desde CLI
const forceLocalhost = process.argv.includes('--localhost') || process.env.ELECTRON_ADMIN_LOCALHOST === '1'
if (forceLocalhost) {
    store.set('adminUrl', 'http://localhost:3000/admin')
}

function showErrorPage() {
    const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error de Conexión</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background: #f5f5f5;
                }
                .error-container {
                    text-align: center;
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    max-width: 500px;
                }
                .error-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
                h1 {
                    color: #333;
                    margin-bottom: 1rem;
                }
                p {
                    color: #666;
                    line-height: 1.5;
                }
                .retry-btn {
                    background: #007cba;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                    margin-top: 1rem;
                }
                .retry-btn:hover {
                    background: #005a87;
                }
                .pos-btn {
                    background: #16a34a;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                    margin-top: 1rem;
                }
                .pos-btn:hover {
                    background: #15803d;
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h1>No se puede conectar al Panel de Administración</h1>
                <p>
                    Asegúrate de que el servidor de desarrollo esté ejecutándose en:
                    <br><strong>http://localhost:3000</strong>
                </p>
                <p>
                    O verifica tu conexión a internet para acceder a la versión en línea.
                </p>
                <button class="retry-btn" onclick="location.reload()">
                    🔄 Reintentar
                </button>
                <button class="pos-btn" onclick="window.electronAPI.openOfflinePOS()">
                    🛒 Abrir Punto de Venta Offline
                </button>
            </div>
        </body>
        </html>
    `;
    
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
}

// Configuración de la aplicación
app.whenReady().then(async () => {
    // Limpiar completamente todos los datos para asegurar que no haya Service Workers activos
    try {
        await session.defaultSession.clearCache()
        await session.defaultSession.clearStorageData({
            storages: ['serviceworkers', 'cachestorage', 'websql', 'indexdb']
        })
        console.log('✅ Caché y Service Workers limpiados')
    } catch (error) {
        console.error('Error limpiando caché:', error)
    }
    
    createWindow();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Configurar el menú de la aplicación
const { Menu } = require('electron');

const template = [
    {
        label: 'Archivo',
        submenu: [
            {
                label: 'Recargar',
                accelerator: 'F5',
                click: () => {
                    if (mainWindow) {
                        mainWindow.webContents.reloadIgnoringCache();
                    }
                }
            },
            {
                label: 'Configurar URL',
                click: async () => {
                    const current = store.get('adminUrl', 'http://localhost:3000/admin')
                    const buttons = ['Usar localhost', 'Usar producción', 'Cancelar']
                    const choice = await dialog.showMessageBox(mainWindow, {
                        type: 'question',
                        title: 'Configurar URL del Admin',
                        message: `URL actual: ${current}`,
                        detail: 'Selecciona una opción rápida. Puedes cambiar manualmente más tarde.',
                        buttons,
                        cancelId: 2,
                        defaultId: 0
                    })
                    if (choice.response === 0) {
                        store.set('adminUrl', 'http://localhost:3000/admin')
                        mainWindow.loadURL('http://localhost:3000/admin')
                    } else if (choice.response === 1) {
                        const productionUrl = 'https://www.garrasfelinas.com/admin'
                        store.set('adminUrl', productionUrl)
                        mainWindow.loadURL(productionUrl)
                    }
                }
            },
            {
                label: 'Abrir Punto de Venta Offline',
                accelerator: 'Ctrl+O',
                click: () => {
                    if (mainWindow) {
                        mainWindow.loadFile(path.join(__dirname, 'assets', 'offline-pos.html'))
                        mainWindow.setFullScreen(true)
                    }
                }
            },
            {
                label: 'Exportar Ventas Offline',
                click: async () => {
                    const sales = store.get('offline.sales.history', [])
                    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
                        title: 'Exportar Ventas Offline',
                        filters: [{ name: 'JSON', extensions: ['json'] }],
                        defaultPath: `ventas-offline-${Date.now()}.json`
                    })
                    if (!canceled && filePath) {
                        const fs = require('fs')
                        fs.writeFileSync(filePath, JSON.stringify(sales, null, 2), 'utf-8')
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Salir',
                accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                click: () => {
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'Ver',
        submenu: [
            {
                label: 'Recargar',
                accelerator: 'CmdOrCtrl+R',
                click: () => {
                    if (mainWindow) {
                        mainWindow.reload();
                    }
                }
            },
            {
                label: 'Herramientas de Desarrollador',
                accelerator: 'F12',
                click: () => {
                    if (mainWindow) {
                        mainWindow.webContents.toggleDevTools();
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Pantalla Completa',
                accelerator: 'F11',
                click: () => {
                    if (mainWindow) {
                        mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    }
                }
            }
        ]
    },
    {
        label: 'Ayuda',
        submenu: [
            {
                label: 'Acerca de',
                click: () => {
                    dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: 'Acerca de Garras Felinas Admin',
                        message: 'Garras Felinas - Panel de Administración',
                        detail: 'Versión 1.0.0\n\nAplicación de escritorio para administrar la tienda Garras Felinas.'
                    });
                }
            }
        ]
    }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

ipcMain.handle('get-config', (event, key) => {
    return store.get(key)
})

ipcMain.handle('set-config', (event, key, value) => {
    store.set(key, value)
    return true
})

ipcMain.handle('offline-get', (event, key) => {
    return store.get(`offline.${key}`)
})

ipcMain.handle('offline-set', (event, key, value) => {
    store.set(`offline.${key}`, value)
    return true
})

ipcMain.handle('open-offline-pos', () => {
    if (mainWindow) {
        mainWindow.loadFile(path.join(__dirname, 'assets', 'offline-pos.html'))
    }
    return true
})

ipcMain.handle('import-products', async () => {
    if (!mainWindow) return []
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Importar catálogo',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile']
    })
    if (canceled || !filePaths || filePaths.length === 0) return []
    const fs = require('fs')
    const content = fs.readFileSync(filePaths[0], 'utf-8')
    let products = []
    try {
        products = JSON.parse(content)
    } catch (e) {
        products = []
    }
    store.set('offline.products', products)
    return products
})

ipcMain.handle('export-offline-sales', async () => {
    if (!mainWindow) return false
    const sales = store.get('offline.sales.history', [])
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
        title: 'Exportar Ventas Offline',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        defaultPath: `ventas-offline-${Date.now()}.json`
    })
    if (canceled || !filePath) return false
    const fs = require('fs')
    fs.writeFileSync(filePath, JSON.stringify(sales, null, 2), 'utf-8')
    return true
})
app.commandLine.appendSwitch('disable-http-cache')
// Siempre deshabilitar Service Workers en Electron
app.commandLine.appendSwitch('disable-features', 'ServiceWorker,BackgroundSync')
// Deshabilitar site isolation para mejor compatibilidad
app.commandLine.appendSwitch('disable-site-isolation-trials')
if (process.argv.includes('--dev')) {
    // Más opciones de depuración en modo dev
    app.commandLine.appendSwitch('enable-logging')
}
