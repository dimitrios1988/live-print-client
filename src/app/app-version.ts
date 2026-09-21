import { version } from '../../package.json';

/**
 * Single source of truth for the displayed version: the same `version` field
 * electron-builder stamps onto the installer artifact. Bumping package.json is
 * the only edit a release needs.
 */
export const APP_VERSION: string = version;
