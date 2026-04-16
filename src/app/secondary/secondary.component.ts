import { Component, OnInit, NgZone } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { IRunner } from '../runner-enquiry/interfaces/runner.interface';

@Component({
  selector: 'app-secondary',
  templateUrl: './secondary.component.html',
  styleUrls: ['./secondary.component.css'],
  imports: [JsonPipe],
})
export class SecondaryComponent implements OnInit {
  receivedData: IRunner | null = null;

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    (window as any).electronAPI.onReceiveData((data: IRunner) => {
      this.ngZone.run(() => {
        this.receivedData = data;
      });
    });
  }
}
