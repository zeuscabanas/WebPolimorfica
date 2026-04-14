import { createClient } from '../../../../lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import TripNav from './TripNav';
import DeleteTripButton from './DeleteTripButton';

export default async function TripLayout({ children, params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/herramientas/viajes/login');

  const { data: trip } = await supabase.from('trips').select('*').eq('id', params.id).single();
  if (!trip) notFound();

  const isOwner = trip.user_id === user.id;

  const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
  const dateStr = trip.start_date
    ? trip.end_date ? `${fmt(trip.start_date)} → ${fmt(trip.end_date)}` : `Desde ${fmt(trip.start_date)}`
    : null;

  return (
    <div className="tool-page">
      <div style={{ marginBottom: '8px' }}>
        <Link href="/herramientas/viajes" style={{ textDecoration: 'none', opacity: 0.6, fontSize: '14px' }}>
          ← Mis viajes
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <span>{trip.cover_emoji ?? '✈️'}</span>
            <span className="highlight">{trip.name}</span>
          </h1>
          {trip.destination && <p style={{ opacity: 0.7, margin: 0 }}>{trip.destination}</p>}
          {dateStr && <p style={{ opacity: 0.5, fontSize: '14px', margin: '2px 0 0' }}>{dateStr}</p>}
        </div>
        {isOwner && <DeleteTripButton tripId={trip.id} />}
      </div>

      <TripNav tripId={params.id} />

      {children}
    </div>
  );
}
