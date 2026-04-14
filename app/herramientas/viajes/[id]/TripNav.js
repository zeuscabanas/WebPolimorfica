'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: '🗓 Itinerario',  path: '' },
  { label: '📍 Lugares',     path: '/lugares' },
  { label: '🚆 Transporte',  path: '/transporte' },
  { label: '✅ Checklist',   path: '/checklist' },
  { label: '💸 Gastos',      path: '/gastos' },
];

export default function TripNav({ tripId }) {
  const pathname = usePathname();
  const base = `/herramientas/viajes/${tripId}`;

  return (
    <nav style={{
      display: 'flex', gap: '4px', flexWrap: 'wrap',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      margin: '20px 0 24px',
      paddingBottom: '0',
    }}>
      {tabs.map(tab => {
        const href    = `${base}${tab.path}`;
        const isExact = tab.path === '';
        const active  = isExact ? pathname === base : pathname.startsWith(href);
        return (
          <Link
            key={tab.path}
            href={href}
            style={{
              textDecoration: 'none',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--accent, #a78bfa)' : 'inherit',
              borderBottom: `2px solid ${active ? 'var(--accent, #a78bfa)' : 'transparent'}`,
              opacity: active ? 1 : 0.65,
              whiteSpace: 'nowrap',
              transition: 'opacity 0.15s',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
