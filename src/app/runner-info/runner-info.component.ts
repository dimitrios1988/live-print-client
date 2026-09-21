import {
  Component,
  effect,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { RunnerPrinterService } from '../runner-printer.service';
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

  private readonly runnerPrinterService = inject(RunnerPrinterService);

  /** The loaded runner, read straight from the service by the template. */
  readonly runner = this.runnerPrinterService.runnerForPrint;

  constructor() {
    // Side effect only — mirror whatever is loaded onto the secondary display.
    effect(() => {
      (window as any).electronAPI.sendToSecondWindow(
        this.runnerPrinterService.runnerForPrint(),
      );
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
    const runner = this.runner();
    if (runner) {
      // Push a new object through the service instead of mutating what the
      // signal holds. chip_2_go_data is unchanged, so the qrcode input does
      // not change and this cannot re-trigger itself.
      this.runnerPrinterService.updateRunnerForPrint({
        ...runner,
        chip_2_go_qr_base64: this.getChip2GoQrBase64(),
      });
    }
  }
}
