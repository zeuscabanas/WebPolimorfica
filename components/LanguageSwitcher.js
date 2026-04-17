'use client';
import { useLocale } from './LocaleProvider';
import { LOCALES } from '../lib/i18n/translations';

const FLAG = { es: '🇪🇸', en: '🇬🇧' };
const LABEL = { es: 'ES', en: 'EN' };

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {LOCALES.map(l => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          title={l.toUpperCase()}
          style={{
            background: locale === l ? 'rgba(167,139,250,0.15)' : 'transparent',
            border: `1px solid ${locale === l ? 'var(--accent, #a78bfa)' : 'rgba(255,255,255,0.15)'}`,
            color: locale === l ? 'var(--accent, #a78bfa)' : 'inherit',
            borderRadius: '6px',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: locale === l ? 700 : 400,
            lineHeight: 1,
            transition: 'all 0.15s',
          }}
        >
          {FLAG[l]} {LABEL[l]}
        </button>
      ))}
    </div>
  );
}
