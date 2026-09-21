import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { UserOptions } from './interfaces/user-options.interface';

const STORAGE_KEY = 'user-options';

@Injectable({
  providedIn: 'root',
})
export class UserOptionsService {
  /**
   * Backed by a signal so components that render the options — notably the
   * print button in RunnerEnquiryComponent — re-check when a sibling component
   * changes them. localStorage on its own is invisible to change detection.
   */
  private readonly _userOptions: WritableSignal<UserOptions> = signal(
    this.readUserOptions(),
  );
  readonly userOptions: Signal<UserOptions> = computed(() =>
    this._userOptions(),
  );

  getUserOptions(): UserOptions {
    return this._userOptions();
  }

  setUserOptions(userOptions: UserOptions): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userOptions));
    this._userOptions.set(userOptions);
  }

  private readUserOptions(): UserOptions {
    try {
      const userOptions = localStorage.getItem(STORAGE_KEY);
      return userOptions
        ? (JSON.parse(userOptions) as UserOptions)
        : this.getDefaultUserOptions();
    } catch (error) {
      console.error('Failed to parse user options from localStorage:', error);
      return this.getDefaultUserOptions();
    }
  }

  private getDefaultUserOptions(): UserOptions {
    return {
      printNumbers: [],
      printTickets: [],
      continuousPrint: [],
      turboPrint: [],
    } as UserOptions;
  }
}
