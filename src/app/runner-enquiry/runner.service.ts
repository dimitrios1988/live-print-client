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
import { IGetGroupResponse } from './interfaces/get-group.resp';

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

  private getRunnerIdByBib(
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

  private getRunnerById(id: number): Observable<IGetRunnerResponse[]> {
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
                    birthdate: getRunnerResponse[0]['0(runner)'].birthdate
                      ? new Date(
                          getRunnerResponse[0]['0(runner)'].birthdate * 1000
                        )
                      : null,
                    chip_2_go_qr_data:
                      getRunnerResponse[0]['0(runner)'].chip_2_go_qr_data || '',
                    club: getRunnerResponse[0]['0(runner)'].club || '',
                    fathers_name:
                      getRunnerResponse[0]['0(runner)'].fathers_name || '',
                    first_name:
                      getRunnerResponse[0]['0(runner)'].first_name_greek !==
                        null &&
                      getRunnerResponse[0]['0(runner)'].first_name_greek !== ''
                        ? getRunnerResponse[0]['0(runner)'].first_name_greek
                        : getRunnerResponse[0]['0(runner)'].first_name_latin ||
                          '',
                    id: getRunnerResponse[0]['0(runner)'].id,
                    is_printed: getRunnerResponse[0]['0(runner)'].is_printed,
                    last_name:
                      getRunnerResponse[0]['0(runner)'].last_name_greek !==
                        null &&
                      getRunnerResponse[0]['0(runner)'].last_name_greek !== ''
                        ? getRunnerResponse[0]['0(runner)'].last_name_greek
                        : getRunnerResponse[0]['0(runner)'].last_name_latin ||
                          '',
                    event_name:
                      getRunnerResponse[0]['1(event)'].printed_text || '',
                    event_id: getRunnerResponse[0]['1(event)'].id,
                    allow_reprinting:
                      getRunnerResponse[0]['1(event)'].allow_reprinting,
                    tshirt_size:
                      getRunnerResponse[0]['7(t_shirt_size)'].printed_text ||
                      '',
                    gender:
                      getRunnerResponse[0]['2(gender)'].printed_text || '',
                    block: getRunnerResponse[0]['0(runner)'].block,
                    nationality:
                      getRunnerResponse[0]['10(nationality)'].printed_text ||
                      '',
                    group_name: getRunnerResponse[0]['5(group)'].name || '',
                    group_id: getRunnerResponse[0]['5(group)'].id,
                    printed_at: getRunnerResponse[0]['6(print_log)']?.printed_at
                      ? new Date(
                          getRunnerResponse[0]['6(print_log)'].printed_at * 1000
                        )
                      : null,
                    registration_level:
                      getRunnerResponse[0]['9(registration_level)']
                        .printed_text || '',
                    has_tshirt:
                      getRunnerResponse[0]['9(registration_level)'].has_tshirt,
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

  getGroupRunners(groupId: number, eventIds: number[]): Observable<IRunner[]> {
    return this.httpClient
      .get<IGetGroupResponse[]>(
        `${this.apiAddress}/api/${this.appName}/group/v1/${groupId}`
      )
      .pipe(
        map((response: IGetGroupResponse[]) => {
          return response.filter((runner: IGetGroupResponse) => {
            return eventIds.includes(runner['2(event)'].id);
          });
        }),
        map((response: IGetGroupResponse[]) => {
          const data = response.map<IRunner>((runner: IGetGroupResponse) => ({
            bib: runner['1(runner)'].bib,
            birthdate: runner['1(runner)'].birthdate
              ? new Date(runner['1(runner)'].birthdate * 1000)
              : null,
            chip_2_go_qr_data: runner['1(runner)'].chip_2_go_qr_data,
            club: runner['1(runner)'].club,
            fathers_name: runner['1(runner)'].fathers_name || '',
            first_name:
              runner['1(runner)'].first_name_greek !== null &&
              runner['1(runner)'].first_name_greek !== ''
                ? runner['1(runner)'].first_name_greek
                : runner['1(runner)'].first_name_latin || '',
            id: runner['1(runner)'].id,
            is_printed: runner['1(runner)'].is_printed,
            last_name:
              runner['1(runner)'].last_name_greek !== null &&
              runner['1(runner)'].last_name_greek !== ''
                ? runner['1(runner)'].last_name_greek
                : runner['1(runner)'].last_name_latin || '',
            event_name: runner['2(event)'].printed_text || '',
            event_id: runner['2(event)'].id,
            allow_reprinting: runner['2(event)'].allow_reprinting,
            tshirt_size: runner['6(t_shirt_size)'].printed_text,
            gender: runner['3(gender)'].printed_text || '',
            block: runner['1(runner)'].block,
            nationality: runner['9(nationality)'].printed_text,
            group_name: runner['0(group)'].name,
            group_id: runner['0(group)'].id,
            printed_at: runner['5(print_log)'].printed_at
              ? new Date(runner['5(print_log)'].printed_at * 1000)
              : null,
            registration_level: runner['8(registration_level)'].printed_text,
            has_tshirt: runner['8(registration_level)'].has_tshirt,
          }));
          const uniqueData = data.reduce((acc: IRunner[], current: IRunner) => {
            const existing = acc.find((item) => item.id === current.id);
            if (
              !existing ||
              (current.printed_at &&
                existing.printed_at &&
                current.printed_at > existing.printed_at)
            ) {
              return acc
                .filter((item) => item.id !== current.id)
                .concat(current);
            }
            return acc;
          }, []);
          return uniqueData;
        })
      );
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
