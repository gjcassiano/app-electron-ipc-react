import { app, BrowserWindow, ipcMain } from 'electron';
import { IpcMessages } from '../common/ipc-messages';

export const initializeIpcListeners = (): void => {
	ipcMain.on(IpcMessages.QUIT, () => {
		console.log('QUIT');
		app.quit();
	});
	ipcMain.on(IpcMessages.MINIMIZE, () => {
		for (const win of BrowserWindow.getAllWindows()) {
			win.minimize();
		}
	});
};
