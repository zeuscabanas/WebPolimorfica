import { createClient } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

export const metadata = { title: 'Mis Viajes — César Cabanas' };

const EMOJIS = ['✈️','🏖️','🗺️','🏔️','🌍','🚂','🚢','🎒','🏕️','🌴'];

export default async function ViajesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/herramientas/viajes/login');

  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .order('start_date', { ascending: true });

  const now = new Date();

  const upcoming = trips?.filter(t => !t.end_date || new Date(t.end_date) >= now) ?? [];
  const past     = trips?.filter(t => t.end_date && new Date(t.end_date) < now) ?? [];

  return (
    <div className="tool-page">
      <div className="tool-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>🗺️ <span className="highlight">Mis viajes</span></h1>
          <p className="subtitle">Hola, {user.user_metadata?.full_name?.split(' ')[0] ?? 'viajero'} 👋</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/herramientas/viajes/nuevo" className="btn-primary" style={{ textDecoration: 'none' }}>
            + Nuevo viaje
          </Link>
          <LogoutButton />
        </div>
      </div>

      {(!trips || trips.length === 0) && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', marginTop: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✈️</div>
          <h3 style={{ marginBottom: '8px' }}>Aún no tienes viajes</h3>
          <p style={{ marginBottom: '24px', opacity: 0.7 }}>Crea tu primer viaje y empieza a organizarlo todo.</p>
          <Link href="/herramientas/viajes/nuevo" className="btn-primary" style={{ textDecoration: 'none' }}>
            Crear viaje
          </Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <section style={{ marginTop: '32px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '18px', opacity: 0.8 }}>Próximos viajes</h2>
          <div className="cards">
            {upcoming.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section style={{ marginTop: '40px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '18px', opacity: 0.8 }}>Viajes pasados</h2>
          <div className="cards" style={{ opacity: 0.65 }}>
            {past.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TripCard({ trip }) {
  const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
  const dateStr = trip.start_date
    ? trip.end_date
      ? `${fmt(trip.start_date)} → ${fmt(trip.end_date)}`
      : `Desde ${fmt(trip.start_date)}`
    : 'Sin fechas';

  return (
    <Link href={`/herramientas/viajes/${trip.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ cursor: 'pointer' }}>
        <div className="card-icon">{trip.cover_emoji ?? '✈️'}</div>
        <h3>{trip.name}</h3>
        {trip.destination && <p style={{ fontWeight: 600, marginBottom: '4px' }}>{trip.destination}</p>}
        <p style={{ fontSize: '13px', opacity: 0.65 }}>{dateStr}</p>
      </div>
    </Link>
  );
}
