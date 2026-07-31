import { TestBed } from '@angular/core/testing';

import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should default to English before any runner is received', () => {
    expect(service.language()).toBe('en');
  });

  describe('setLanguageFromNationality', () => {
    it('should use Greek for GRE', () => {
      service.setLanguageFromNationality('GRE');
      expect(service.language()).toBe('el');
    });

    it('should use Greek for GRC', () => {
      service.setLanguageFromNationality('GRC');
      expect(service.language()).toBe('el');
    });

    it('should ignore casing and surrounding whitespace', () => {
      service.setLanguageFromNationality(' gre ');
      expect(service.language()).toBe('el');
    });

    it('should use English for any other nationality', () => {
      service.setLanguageFromNationality('USA');
      expect(service.language()).toBe('en');
    });

    it('should use English when the nationality is empty', () => {
      service.setLanguageFromNationality('GRE');
      service.setLanguageFromNationality('');
      expect(service.language()).toBe('en');
    });

    it('should use English when there is no runner', () => {
      service.setLanguageFromNationality('GRE');
      service.setLanguageFromNationality(null);
      expect(service.language()).toBe('en');

      service.setLanguageFromNationality('GRE');
      service.setLanguageFromNationality(undefined);
      expect(service.language()).toBe('en');
    });
  });

  describe('dictionary', () => {
    it('should switch with the language', () => {
      service.setLanguageFromNationality('GRE');
      expect(service.dictionary().notFound).toBe('Δε βρέθηκε Δρομέας');

      service.setLanguageFromNationality('USA');
      expect(service.dictionary().notFound).toBe('Runner Not Found');
    });

    it('should expose the same keys in both languages', () => {
      service.setLanguage('el');
      const greekKeys = Object.keys(service.dictionary()).sort();

      service.setLanguage('en');
      const englishKeys = Object.keys(service.dictionary()).sort();

      expect(englishKeys).toEqual(greekKeys);
    });

    it('should have no empty translations', () => {
      for (const language of ['el', 'en'] as const) {
        service.setLanguage(language);
        for (const [key, value] of Object.entries(service.dictionary())) {
          expect(value.trim())
            .withContext(`${language}.${key}`)
            .not.toBe('');
        }
      }
    });
  });
});
