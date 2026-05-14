import en from "../data/locales/en.json";
import ko from "../data/locales/ko.json";

export const locales = {
  ko,
  en,
};

export type LocaleCode = keyof typeof locales;

export function t(key: string, locale: LocaleCode = "ko"): string {
  return locales[locale][key as keyof (typeof locales)[LocaleCode]] ?? locales.ko[key as keyof typeof ko] ?? key;
}
