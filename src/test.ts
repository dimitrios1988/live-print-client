import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

// Providing a `main` file overrides the builder's default test bootstrap, so
// initialise the Angular test environment here.
getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
);

// Several services call window.electronAPI at construction time (e.g.
// SettingsService.getSettings). In the browser test environment there is no
// Electron preload bridge, so install a no-op double before any spec runs.
(window as any).electronAPI = {
  getSettings: () =>
    Promise.resolve({ apiAddress: '', appName: '', secondaryScreen: false }),
  saveSettings: () => Promise.resolve(),
  getPrinters: () => Promise.resolve([]),
  openSecondWindow: () => Promise.resolve(),
  closeSecondWindow: () => Promise.resolve(),
  sendToSecondWindow: () => {},
  onReceiveData: () => () => {},
  onSecondaryWindowClosed: () => () => {},
  onPrintStatus: () => {},
  printHTML: () => {},
  printBinary: () => {},
};
