/**
 * Get translated value from a translations JSON object.
 * Priority: currentLang > en (fallback) > ""
 */
export function getTranslation(
  translations: string,
  lang: string,
  field: string
): string {
  try {
    const t = JSON.parse(translations);
    // 1. Try current language
    if (t[lang]?.[field]) return t[lang][field];
    // 2. Try zh for zh-CN, etc
    const short = lang.split('-')[0];
    if (short !== lang && t[short]?.[field]) return t[short][field];
    // 3. Fallback to en
    if (t.en?.[field]) return t.en[field];
    // 4. Fallback to first available language
    for (const k of Object.keys(t)) {
      if (t[k]?.[field]) return t[k][field];
    }
  } catch {}
  return '';
}

/**
 * Get translated string from a top-level translations JSON where
 * the structure is: { "en": "...", "zh": "..." }
 */
export function getTranslationText(
  translations: string,
  lang: string
): string {
  try {
    const t = JSON.parse(translations);
    if (t[lang]) return t[lang];
    const short = lang.split('-')[0];
    if (short !== lang && t[short]) return t[short];
    if (t.en) return t.en;
    for (const k of Object.keys(t)) { if (t[k]) return t[k]; }
  } catch {}
  return '';
}
