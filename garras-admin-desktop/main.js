const { app, BrowserWindow, dialog, shell } = require('electron');
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
            store.set('adminUrl', productionUrl);
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
            </div>
        </body>
        </html>
    `;
    
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
}

// Configuración de la aplicación
app.whenReady().then(() => {
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
                        mainWindow.reload();
                    }
                }
            },
            {
                label: 'Configurar URL',
                click: async () => {
                    const result = await dialog.showInputBox(mainWindow, {
                        title: 'Configurar URL del Admin',
                        label: 'URL del Panel de Administración:',
                        value: store.get('adminUrl', 'http://localhost:3000/admin')
                    });
                    
                    if (result && result.trim()) {
                        store.set('adminUrl', result.trim());
                        mainWindow.loadURL(result.trim());
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
