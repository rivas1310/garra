const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al contexto del renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Información de la aplicación
    getVersion: () => {
        return process.versions.electron;
    },
    
    // Plataforma
    getPlatform: () => {
        return process.platform;
    },
    
    // Configuración
    getConfig: (key) => {
        return ipcRenderer.invoke('get-config', key);
    },
    
    setConfig: (key, value) => {
        return ipcRenderer.invoke('set-config', key, value);
    }
});

// Inyectar estilos para mejorar la apariencia en Electron
window.addEventListener('DOMContentLoaded', () => {
    // Agregar clase para identificar que estamos en Electron
    document.body.classList.add('electron-app');
    
    // Estilos específicos para Electron
    const style = document.createElement('style');
    style.textContent = `
        .electron-app {
            /* Mejorar el scrollbar */
            scrollbar-width: thin;
            scrollbar-color: #888 #f1f1f1;
        }
        
        .electron-app::-webkit-scrollbar {
            width: 8px;
        }
        
        .electron-app::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        
        .electron-app::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }
        
        .electron-app::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        
        /* Ocultar elementos innecesarios en desktop */
        .electron-app .mobile-only {
            display: none !important;
        }
        
        /* Mejorar el contraste */
        .electron-app {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
    `;
    document.head.appendChild(style);
    
    console.log('Garras Felinas Admin - Aplicación de Escritorio cargada');
});
