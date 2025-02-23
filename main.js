const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const serve = require('electron-serve');
const loadURL = serve({ directory: 'frontend' });

// Iniciar o servidor Express
require('./backend/server');

let mainWindow;
let adminWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'assets/icon.ico')
    });

    if (isDev) {
        mainWindow.loadFile('./frontend/index.html');
        mainWindow.webContents.openDevTools();
    } else {
        loadURL(mainWindow);
    }
}

function createAdminWindow() {
    adminWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'assets/icon.ico')
    });

    if (isDev) {
        adminWindow.loadFile('./frontend/admin/index.html');
        adminWindow.webContents.openDevTools();
    } else {
        loadURL(adminWindow, 'admin/index.html');
    }
}

app.whenReady().then(() => {
    createMainWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handlers
ipcMain.on('open-admin', () => {
    createAdminWindow();
});

// Configurar atualizações automáticas
if (!isDev) {
    require('update-electron-app')({
        repo: 'seu-usuario/sistema-emprestimos',
        updateInterval: '1 hour'
    });
} 