import { cookies } from 'next/headers';
import { getT, DEFAULT_LOCALE } from './translations';

export function getLocale() {
  return cookies().get('locale')?.value ?? DEFAULT_LOCALE;
}

// Usage in server components: const t = serverT('section')
export function serverT(section) {
  return getT(getLocale(), section);
}
