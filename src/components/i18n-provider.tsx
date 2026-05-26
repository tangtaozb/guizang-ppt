"use client";

import { useLocaleInit } from "@/i18n";

/**
 * Mount-once client-side initializer: reads localStorage / navigator.language
 * and sets the locale store. Wrap in root layout to enable i18n everywhere.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  useLocaleInit();
  return <>{children}</>;
}
