export interface TranslationMessage {
  message: string;
  context?: string;
}

export type TranslationDefinitions = Record<string, TranslationMessage | string>;
