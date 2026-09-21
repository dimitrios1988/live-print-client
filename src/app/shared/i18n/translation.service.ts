import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import el from '../../../assets/i18n/el.json';
import en from '../../../assets/i18n/en.json';
import { ITranslations, Language } from './translation.interface';

const DICTIONARIES: Record<Language, ITranslations> = { el, en };

/**
 * Nationality values (as returned by the API) that keep the display in Greek.
 * Everything else — including a missing nationality — falls back to English.
 */
const GREEK_NATIONALITIES = ['GRE', 'GRC'];

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly _language: WritableSignal<Language> = signal('en');
  readonly language = computed(() => this._language());

  /** The active dictionary. Templates bind to this, e.g. {{ t().club }}. */
  readonly dictionary = computed(() => DICTIONARIES[this._language()]);

  setLanguage(language: Language): void {
    this._language.set(language);
  }

  /**
   * Picks the language for a runner. Greek runners get Greek; every other
   * nationality — and a runner that was not found at all — gets English.
   */
  setLanguageFromNationality(nationality: string | null | undefined): void {
    const code = (nationality ?? '').trim().toUpperCase();
    this.setLanguage(GREEK_NATIONALITIES.includes(code) ? 'el' : 'en');
  }
}
