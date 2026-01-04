import i18n from "i18next";
import en from "@/api/locales/en.json";
import ptBR from "@/api/locales/pt-BR.json";

i18n.init({
  resources: {
    en: { translation: en },
    "pt-BR": { translation: ptBR },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export function translate(key: string, defaultValue?: string): string {
  return i18n.t(key, { defaultValue: defaultValue ?? key });
}

// TODO: Extract locale from request headers and set i18n language accordingly

export default i18n;
