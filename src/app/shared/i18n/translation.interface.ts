/** Languages the secondary (customer-facing) screen can render in. */
export type Language = 'el' | 'en';

/**
 * Every piece of static text on the secondary screen. Both translation files
 * are typed as this, so a key missing from either one is a compile-time error.
 */
export interface ITranslations {
  alreadyPrinted: string;
  notFound: string;
  receivesAsGroup: string;
  bib: string;
  block: string;
  name: string;
  fathersName: string;
  birthdate: string;
  gender: string;
  club: string;
  nationality: string;
}
