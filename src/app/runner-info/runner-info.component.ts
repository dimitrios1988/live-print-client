import { Component, effect, ElementRef, ViewChild } from '@angular/core';
import { RunnerPrinterService } from '../runner-printer.service';
import { IRunner } from '../runner-enquiry/interfaces/runner.interface';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule, DatePipe } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-runner-info',
  imports: [MatDividerModule, CommonModule, QRCodeComponent],
  templateUrl: './runner-info.component.html',
  styleUrl: './runner-info.component.css',
  providers: [DatePipe],
})
export class RunnerInfoComponent {
  @ViewChild('chip2goqrcode', { static: false, read: ElementRef })
  chip2GoQrElement!: ElementRef;
  runner: IRunner | null = null;

  constructor(private runnerPrinterService: RunnerPrinterService) {
    effect(() => {
      this.runner = this.runnerPrinterService.runnerForPrint();
    });
  }

  private getChip2GoQrBase64(): string {
    const qrCanvas =
      this.chip2GoQrElement.nativeElement.querySelectorAll('canvas')[
        this.chip2GoQrElement.nativeElement.querySelectorAll('canvas').length -
          1
      ];
    if (qrCanvas) {
      const base64Image = qrCanvas.toDataURL('image/png');
      return base64Image;
    } else {
      throw new Error('QR code canvas not found.');
    }
  }

  qrChanged(): void {
    if (this.runner) {
      this.runner.chip_2_go_qr_base64 = this.getChip2GoQrBase64();
      this.runnerPrinterService.updateRunnerForPrint(this.runner);
    }
  }
}
