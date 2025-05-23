import { Injectable } from '@angular/core';
import { UserOptions } from './interfaces/user-options.interface';

@Injectable({
  providedIn: 'root',
})
export class UserOptionsService {
  constructor() {}

  getUserOptions(): UserOptions {
    try {
      const userOptions = localStorage.getItem('user-options');
      return userOptions
        ? (JSON.parse(userOptions) as UserOptions)
        : this.getDefaultUserOptions();
    } catch (error) {
      console.error('Failed to parse user options from localStorage:', error);
      return this.getDefaultUserOptions();
    }
  }

  setUserOptions(userOptions: UserOptions): void {
    localStorage.setItem('user-options', JSON.stringify(userOptions));
  }
  private getDefaultUserOptions(): UserOptions {
    return {
      printNumbers: [true],
      printTickets: [true],
      continuousPrint: [true],
    } as UserOptions;
  }
}
