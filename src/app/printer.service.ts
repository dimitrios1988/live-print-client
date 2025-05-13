import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  constructor() {}

  getSystemPrinters(): Promise<any> {
    return (window as any).electronAPI.getPrinters();
  }

  printHTML(
    htmlContent: string,
    printerName: string,
    landscape: boolean,
    duplex: boolean
  ): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve, reject) => {
      if (!(window as any).electronAPI) {
        reject({ success: false, message: 'Electron API is not available' });
        return;
      }

      const electronAPI = (window as any).electronAPI;

      electronAPI.onPrintStatus(
        (response: { success: boolean; message: string }) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );

      electronAPI.printHTML(htmlContent, printerName, landscape, duplex);
    });
  }

  printBinary(
    content: string,
    printerName: string
  ): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve, reject) => {
      if (!(window as any).electronAPI) {
        reject({ success: false, message: 'Electron API is not available' });
        return;
      }

      const electronAPI = (window as any).electronAPI;

      electronAPI.onPrintStatus(
        (response: { success: boolean; message: string }) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );

      electronAPI.printBinary(content, printerName);
    });
  }
}
