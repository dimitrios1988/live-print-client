import { MatDialogConfig } from '@angular/material/dialog';

/**
 * Centralized, responsive dialog sizes. Replaces the hardcoded
 * minWidth/minHeight literals that were scattered across dialog .open() calls.
 * Widths cap at 95vw so dialogs never overflow small service-desk screens.
 */
export const DIALOG_SIZE = {
  medium: {
    width: '600px',
    maxWidth: '95vw',
    minHeight: '420px',
  } as MatDialogConfig,
  large: {
    width: '760px',
    maxWidth: '95vw',
    minHeight: '400px',
  } as MatDialogConfig,
  wide: {
    width: '960px',
    maxWidth: '95vw',
    minHeight: '400px',
  } as MatDialogConfig,
} as const;
