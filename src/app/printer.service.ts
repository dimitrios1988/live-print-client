import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  constructor() {}

  getSystemPrinters(): Promise<any> {
    return (window as any).electronAPI.getPrinters();
  }
}
