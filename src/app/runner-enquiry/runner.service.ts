import { HttpClient } from '@angular/common/http';
import { effect, Injectable } from '@angular/core';
import { SettingsService } from '../header/settings-dialog/settings.service';
import { IGetRunnerIdResponse } from './interfaces/get-runner-id.resp';
import { forkJoin, map, Observable, pipe } from 'rxjs';
import { IGetRunnerResponse } from './interfaces/get-runner.resp';
import { IRunner } from './interfaces/runner.interface';
import { IGetRunnerIdCmd } from './interfaces/get-runner-id.cmd';
import { SetRunnerPrintedCmd } from './interfaces/set-runner-printed.cmd';
import { SetRunnerPrintedResp } from './interfaces/set-runner-printed.resp';

@Injectable({
  providedIn: 'root',
})
export class RunnerService {
  private appName: string = '';
  private apiAddress: string = '';

  constructor(
    private httpClient: HttpClient,
    settingsService: SettingsService
  ) {
    effect(() => {
      this.appName = settingsService.settings()?.appName || '';
      this.apiAddress = settingsService.settings()?.apiAddress || '';
    });
  }

  getRunnerIdByBib(
    bib: number,
    eventids: number[]
  ): Observable<IGetRunnerIdResponse> {
    const obs = eventids.map((eventid) => {
      const data: IGetRunnerIdCmd = {
        '0(runner)': {
          bib: bib,
        },
        '1(event)': {
          id: eventid,
        },
      };
      return this.httpClient.post<IGetRunnerIdResponse>(
        `${this.apiAddress}/api/${this.appName}/runner_id/v1`,
        data
      );
    });
    return forkJoin(obs).pipe(
      map((responses: IGetRunnerIdResponse[]) => {
        return responses.filter((response) => {
          return response[0] != null;
        })[0];
      })
    );
  }

  getRunnerById(id: number): Observable<IGetRunnerResponse[]> {
    return this.httpClient.get<IGetRunnerResponse[]>(
      `${this.apiAddress}/api/${this.appName}/runners/v1/${id}?limit=1`
    );
  }

  getRunner(bib: number, eventids: number[]): Observable<IRunner> {
    return new Observable<IRunner>((observer) => {
      this.getRunnerIdByBib(bib, eventids).subscribe({
        next: (getRunnerIdResponse: IGetRunnerIdResponse) => {
          if (
            getRunnerIdResponse === null ||
            getRunnerIdResponse === undefined
          ) {
            observer.next(getRunnerIdResponse);
          } else if (getRunnerIdResponse[1] != null) {
            this.getRunnerById(getRunnerIdResponse[0])
              .pipe(
                map((getRunnerResponse: IGetRunnerResponse[]) => {
                  const runner: IRunner = {
                    bib: getRunnerResponse[0]['0(runner)'].bib,
                    birthdate: new Date(
                      getRunnerResponse[0]['0(runner)'].birthdate * 1000
                    ),
                    chip_2_go_qr_data:
                      getRunnerResponse[0]['0(runner)'].chip_2_go_qr_data,
                    club: getRunnerResponse[0]['0(runner)'].club,
                    fathers_name:
                      getRunnerResponse[0]['0(runner)'].fathers_name,
                    first_name_greek:
                      getRunnerResponse[0]['0(runner)'].first_name_greek,
                    first_name_latin:
                      getRunnerResponse[0]['0(runner)'].first_name_latin,
                    id: getRunnerResponse[0]['0(runner)'].id,
                    is_printed: getRunnerResponse[0]['0(runner)'].is_printed,
                    last_name_greek:
                      getRunnerResponse[0]['0(runner)'].last_name_greek,
                    last_name_latin:
                      getRunnerResponse[0]['0(runner)'].last_name_latin,
                    event: getRunnerResponse[0]['1(event)'].name_for_printing,
                    allow_reprinting:
                      getRunnerResponse[0]['1(event)'].allow_reprinting,
                    tshirt_size: getRunnerResponse[0]['4(tshirt_size)'].size,
                    gender:
                      getRunnerResponse[0]['2(runner_gender)'].printed_text,
                    block: getRunnerResponse[0]['0(runner)'].block,
                    nationality: getRunnerResponse[0]['0(runner)'].nationality,
                    group: getRunnerResponse[0]['5(group)'].name,
                    printed_at: new Date(
                      getRunnerResponse[0]['6(print_log)'].printed_at * 1000
                    ),
                  };
                  return runner;
                })
              )
              .subscribe({
                next: (runnerResponse: IRunner) => {
                  observer.next(runnerResponse);
                  observer.complete();
                },
                error: (err) => observer.error(err),
              });
          } else {
            observer.error('Runner ID not found');
          }
        },
        error: (err) => observer.error(err),
      });
    });
  }

  setRunnerAsPrinted(runnerId: number): Observable<SetRunnerPrintedResp> {
    const data: SetRunnerPrintedCmd = {
      '0(print_log)': {
        runner: runnerId,
      },
    };
    return this.httpClient.post<SetRunnerPrintedResp>(
      `${this.apiAddress}/api/${this.appName}/print_log/v1`,
      data
    );
  }
}
