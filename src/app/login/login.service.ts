import { computed, effect, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../header/settings-dialog/settings.service';
import { ILoginResponse } from './interfaces/login-response.interface';
import { ILoginRequest } from './interfaces/login-request.interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiAddress: string = '';
  private _token = signal<string>('');
  private token = computed(() => this._token());
  public isAuthenticated = computed(() => this._token() !== '');

  constructor(
    private httpClient: HttpClient,
    settingsService: SettingsService,
    private router: Router
  ) {
    effect(() => {
      this.apiAddress = settingsService.settings()?.apiAddress || '';
    });
    this._token.set(localStorage.getItem('auth') || '');
  }

  login(loginrequest: ILoginRequest) {
    this.httpClient
      .post<ILoginResponse>(`${this.apiAddress}/api/auth`, loginrequest)
      .subscribe({
        next: (response) => {
          this._token.set(response.token);
          localStorage.setItem('auth', response.token);
          this.router.navigate(['/main']);
        },
      });
  }

  logout() {
    this._token.set('');
    localStorage.removeItem('auth');
    this.router.navigate(['/login']);
  }

  getToken() {
    return this.token();
  }
}
