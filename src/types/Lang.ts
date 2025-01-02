export enum Lang {
  en = "en",
  ru = "ru",
}

export interface ILang {
  [key: string]: { value: string; label: string }
}
