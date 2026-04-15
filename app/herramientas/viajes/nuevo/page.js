'use client';
import { useState } from 'react';
import { createClient } from '../../../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const EMOJIS = ['✈️','🏖️','🗺️','🏔️','🌍','🚂','🚢','🎒','🏕️','🌴','🏙️','⛷️','🤿','🧳','🌅'];

export default function NuevoViajePage() {
  const [form, setForm] = useState({ name: '', destination: '', start_date: '', end_date: '', cover_emoji: '✈️' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Sesión expirada. Vuelve a iniciar sesión.'); setLoading(false); return; }
    const { data, error: err } = await supabase.from('trips').insert({
      user_id:     user.id,
      name:        form.name.trim(),
      destination: form.destination.trim() || null,
      start_date:  form.start_date || null,
      end_date:    form.end_date   || null,
      cover_emoji: form.cover_emoji,
    }).select().single();

    if (err) { setError(err.message); setLoading(false); return; }
    router.push(`/herramientas/viajes/${data.id}`);
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <Link href="/herramientas/viajes" style={{ textDecoration: 'none', opacity: 0.6, fontSize: '14px' }}>
          ← Volver a viajes
        </Link>
        <h1 style={{ marginTop: '12px' }}>✨ <span className="highlight">Nuevo viaje</span></h1>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div>
          <label style={labelStyle}>Ícono</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {EMOJIS.map(e => (
              <button
                key={e} type="button"
                onClick={() => setForm(f => ({ ...f, cover_emoji: e }))}
                style={{
                  fontSize: '24px', padding: '8px', border: '2px solid',
                  borderColor: form.cover_emoji === e ? 'var(--accent, #a78bfa)' : 'transparent',
                  borderRadius: '8px', background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
              >{e}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Nombre del viaje *</label>
          <input
            className="yt-input"
            type="text"
            placeholder="Ej: Japón 2025"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
            style={{ marginTop: '8px' }}
          />
        </div>

        <div>
          <label style={labelStyle}>Destino</label>
          <input
            className="yt-input"
            type="text"
            placeholder="Ej: Tokio, Osaka, Kioto"
            value={form.destination}
            onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
            style={{ marginTop: '8px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Fecha de ida</label>
            <input className="yt-input" type="date" value={form.start_date}
              onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} style={{ marginTop: '8px' }} />
          </div>
          <div>
            <label style={labelStyle}>Fecha de vuelta</label>
            <input className="yt-input" type="date" value={form.end_date}
              onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} style={{ marginTop: '8px' }} />
          </div>
        </div>

        {error && <p style={{ color: 'var(--accent, #f87171)', fontSize: '14px' }}>{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
          {loading ? 'Creando…' : 'Crear viaje →'}
        </button>
      </form>
    </div>
  );
}

const labelStyle = { fontSize: '13px', fontWeight: 600, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' };
