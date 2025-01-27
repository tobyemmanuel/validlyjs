import enMessages from './locales/en.js';
import frMessages from './locales/fr.js';

import { ValidationMessages } from './types/interfaces.js';
type LocaleMessages = typeof enMessages;

const locales: Record<string, LocaleMessages> = {
  en: enMessages,
  fr: frMessages
};

export function setLocale(locale: string) {
  if (locales[locale]) {
    currentConfig.locale = locale;
    currentConfig.messages = locales[locale];
  } else {
    console.warn(`Locale "${locale}" not found. Using default locale.`);
  }
}

// const enMessages: ValidationMessages = {
//     required: 'The :attribute field is required',
//     string: 'The :attribute must be a string',
//     number: 'The :attribute must be a number',
//     date: 'The :attribute must be a valid date',
//     boolean: 'The :attribute must be a boolean value',
//     min: {
//       string: 'The :attribute must be at least :min characters',
//       numeric: 'The :attribute must be at least :min'
//     },
//     max: {
//       string: 'The :attribute may not be greater than :max characters',
//       numeric: 'The :attribute may not be greater than :max'
//     },
//     email: 'The :attribute must be a valid email address',
//     accepted: 'The :attribute must be accepted',
//     required_if: 'The :attribute field is required when :other is :value'
//   };

export interface ValidationConfig {
  bail: boolean;
  autoTrim: boolean;
  convertEmptyStringToNull: boolean;
  locale: string;
  messages: LocaleMessages;
}

export const defaultConfig: ValidationConfig = {
  bail: true,
  autoTrim: true,
  convertEmptyStringToNull: true,
  locale: 'en',
  messages: enMessages
};

let currentConfig = { ...defaultConfig };

export function configure(newConfig: Partial<ValidationConfig>) {
  currentConfig = { ...currentConfig, ...newConfig };
  return currentConfig;
}

export function getConfig(): ValidationConfig {
  return currentConfig;
}