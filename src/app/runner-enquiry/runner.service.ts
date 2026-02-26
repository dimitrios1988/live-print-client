import { HttpClient } from '@angular/common/http';
import { effect, Injectable } from '@angular/core';
import { SettingsService } from '../header/settings-dialog/settings.service';
import { forkJoin, map, Observable } from 'rxjs';
import { IRunner } from './interfaces/runner.interface';
import { SetRunnerPrintedCmd } from './interfaces/set-runner-printed.cmd';
import { SetRunnerPrintedResp } from './interfaces/set-runner-printed.resp';
import { IGetGroupResponse } from './interfaces/get-group.resp';
import { IGetRunnerResponse } from './interfaces/get-runner.resp';

@Injectable({
  providedIn: 'root',
})
export class RunnerService {
  private appName: string = '';
  private apiAddress: string = '';

  constructor(
    private httpClient: HttpClient,
    settingsService: SettingsService,
  ) {
    effect(() => {
      this.appName = settingsService.settings()?.appName || '';
      this.apiAddress = settingsService.settings()?.apiAddress || '';
    });
  }

  getRunner2(bib: number, eventids: number[]): Observable<IRunner | undefined> {
    const obs = eventids.map((eventid) => {
      const data = { bib, event: eventid };
      return this.httpClient.get<IGetRunnerResponse[]>(
        `${this.apiAddress}/api/${this.appName}/runners/v1`,
        { params: data as any },
      );
    });
    return forkJoin(obs).pipe(
      map((responses: IGetRunnerResponse[][]) => {
        return responses.filter((r) => r.length > 0).length > 0
          ? responses.filter((r) => r.length > 0)[0][0]
          : null;
      }),
      map((response: IGetRunnerResponse | null) => {
        if (response !== null) {
          const runner: IRunner = {
            bib: response['0(runner)'].bib,
            birthdate: response['0(runner)'].birthdate
              ? new Date(response['0(runner)'].birthdate * 1000)
              : null,
            chip_2_go_data: response['0(runner)'].chip_2_go_data || '',
            club: response['0(runner)'].club.trim() || '',
            fathers_name: response['0(runner)'].fathers_name || '',
            first_name:
              response['0(runner)'].first_name_greek !== null &&
              response['0(runner)'].first_name_greek.trim() !== ''
                ? response['0(runner)'].first_name_greek
                : response['0(runner)'].first_name_latin || '',
            id: response['0(runner)'].id,
            is_printed: response['0(runner)'].is_printed,
            last_name:
              response['0(runner)'].last_name_greek !== null &&
              response['0(runner)'].last_name_greek.trim() !== ''
                ? response['0(runner)'].last_name_greek
                : response['0(runner)'].last_name_latin || '',
            event_name: response['1(event)'].printed_text || '',
            event_id: response['1(event)'].id,
            allow_reprinting: response['1(event)'].allow_reprinting,
            tshirt_size: response['5(t_shirt_size)'].printed_text || '',
            gender: response['2(gender)'].printed_text || '',
            block: response['0(runner)'].block,
            nationality: response['7(nationality)'].printed_text || '',
            group_name: response['3(group)'].name.trim() || '',
            group_id: response['3(group)'].id,
            printed_at: response['4(print_log)']?.printed_at
              ? new Date(response['4(print_log)'].printed_at * 1000)
              : null,
            registration_level:
              response['6(registration_level)'].printed_text || '',
            has_tshirt: response['6(registration_level)'].has_tshirt,
            receives_as_a_group: response['0(runner)'].receives_as_a_group,
          };
          return runner;
        }
        return undefined;
      }),
    );
  }

  getGroupRunners(groupId: number, eventIds: number[]): Observable<IRunner[]> {
    return this.httpClient
      .get<
        IGetGroupResponse[]
      >(`${this.apiAddress}/api/${this.appName}/group/v1/${groupId}`)
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
            chip_2_go_data: runner['1(runner)'].chip_2_go_data || '',
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
            receives_as_a_group: runner['1(runner)'].receives_as_a_group,
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
        }),
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
      data,
    );
  }
}
