import { autoUpdater } from 'electron-updater';
import { app, BrowserWindow } from 'electron';
import windowStateKeeper from 'electron-window-state';
import { join as joinPath } from 'path';
import { format as formatUrl } from 'url';
import { initializeIpcListeners } from './ipc-handlers';

const isDevelopment = process.env.NODE_ENV !== 'production';

let mainWindow: BrowserWindow | null = null;

app.commandLine.appendSwitch('disable-pinch');

function createMainWindow() {
	const mainWindowState = windowStateKeeper({});
	const sizeW = 800;
	const sizeH = 400;
	const window = new BrowserWindow({
		width: sizeW,
		height: sizeH,
		maxWidth: sizeW,
		minWidth: sizeW,
		maxHeight: sizeH,
		minHeight: sizeH,
		x: mainWindowState.x,
		y: mainWindowState.y,
		alwaysOnTop: true,
		resizable: false,
		frame: false,
		fullscreenable: false,
		maximizable: false,
		transparent: true,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
		},
	});

	window.show();
	mainWindowState.manage(window);

	if (isDevelopment) {
		window.loadURL(
			`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}?version=DEV&view=app`
		);
	} else {
		window.loadURL(
			formatUrl({
				pathname: joinPath(__dirname, 'index.html'),
				protocol: 'file',
				query: {
					version: autoUpdater.currentVersion.version,
					view: 'app',
				},
				slashes: true,
			})
		);
	}
	window.webContents.userAgent = `Gio/ (${process.platform})`;
	return window;
}

app.on('second-instance', () => {
	// Someone tried to run a second instance, we should focus our window.
	if (mainWindow) {
		if (mainWindow.isMinimized()) mainWindow.restore();
		mainWindow.focus();
	}
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.whenReady().then(() => {
	mainWindow = createMainWindow();
	initializeIpcListeners();
});
