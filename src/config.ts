import enMessages from "./locales/en.js";
import frMessages from "./locales/fr.js";

type LocaleMessages = typeof enMessages;

const locales: Record<string, LocaleMessages> = {
  en: enMessages,
  fr: frMessages,
};

export function setLocale(locale: string) {
  if (locales[locale]) {
    currentConfig.locale = locale;
    currentConfig.messages = locales[locale];
  } else {
    console.warn(`Locale "${locale}" not found. Using default locale.`);
  }
}

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
  locale: "en",
  messages: enMessages,
};

let currentConfig = { ...defaultConfig };

export function configure(newConfig: Partial<ValidationConfig>) {
  currentConfig = { ...currentConfig, ...newConfig };
  return currentConfig;
}

export function getConfig(): ValidationConfig {
  return currentConfig;
}
