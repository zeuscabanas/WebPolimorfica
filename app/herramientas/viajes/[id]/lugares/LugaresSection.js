'use client';
import { useState } from 'react';
import { createClient } from '../../../../../lib/supabase/client';

const TYPES = [
  { value: 'hotel',       label: '🏨 Hotel',       },
  { value: 'restaurant',  label: '🍽 Restaurante',  },
  { value: 'attraction',  label: '🗿 Atracción',    },
  { value: 'transport',   label: '🚌 Transporte',   },
  { value: 'other',       label: '📌 Otro',         },
];

const typeLabel = (v) => TYPES.find(t => t.value === v)?.label ?? v;

export default function LugaresSection({ tripId, initialPlaces }) {
  const [places, setPlaces]   = useState(initialPlaces);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ name: '', type: 'attraction', address: '', url: '', notes: '', date: '', confirmed: false });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.from('trip_places').insert({
      trip_id:   tripId,
      name:      form.name.trim(),
      type:      form.type,
      address:   form.address.trim() || null,
      url:       form.url.trim() || null,
      notes:     form.notes.trim() || null,
      date:      form.date || null,
      confirmed: form.confirmed,
    }).select().single();
    if (!error && data) {
      setPlaces(prev => [...prev, data]);
      setForm({ name: '', type: 'attraction', address: '', url: '', notes: '', date: '', confirmed: false });
      setShowForm(false);
    }
    setLoading(false);
  };

  const toggleConfirm = async (place) => {
    const updated = { ...place, confirmed: !place.confirmed };
    setPlaces(prev => prev.map(p => p.id === place.id ? updated : p));
    await supabase.from('trip_places').update({ confirmed: updated.confirmed }).eq('id', place.id);
  };

  const handleDelete = async (id) => {
    await supabase.from('trip_places').delete().eq('id', id);
    setPlaces(prev => prev.filter(p => p.id !== id));
  };

  const grouped = places.reduce((acc, p) => {
    if (!acc[p.type]) acc[p.type] = [];
    acc[p.type].push(p);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', opacity: 0.8 }}>Lugares del viaje</h2>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)} style={{ padding: '8px 16px', fontSize: '14px' }}>
          {showForm ? '✕ Cancelar' : '+ Añadir lugar'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ ...cardStyle, marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input className="yt-input" type="text" placeholder="Ej: Hotel Shinjuku Granbell"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={{ marginTop: '6px' }} />
            </div>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select className="yt-input" value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ marginTop: '6px' }}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Dirección</label>
            <input className="yt-input" type="text" placeholder="Ej: 2-14-5 Kabukicho, Shinjuku"
              value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={{ marginTop: '6px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>URL / Link</label>
              <input className="yt-input" type="url" placeholder="https://..."
                value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} style={{ marginTop: '6px' }} />
            </div>
            <div>
              <label style={labelStyle}>Fecha visita</label>
              <input className="yt-input" type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ marginTop: '6px' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Notas</label>
            <textarea className="yt-input" placeholder="Notas opcionales…" rows={2}
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              style={{ marginTop: '6px', resize: 'vertical' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
            <input type="checkbox" checked={form.confirmed} onChange={e => setForm(f => ({ ...f, confirmed: e.target.checked }))} />
            Confirmado / con reserva
          </label>
          <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      )}

      {places.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '48px 16px', opacity: 0.5 }}>
          <p>Aún no has añadido lugares.</p>
        </div>
      )}

      {TYPES.filter(t => grouped[t.value]?.length).map(t => (
        <div key={t.value} style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.5, marginBottom: '12px' }}>
            {t.label}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {grouped[t.value].map(place => (
              <div key={place.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600 }}>{place.name}</span>
                    {place.confirmed && <span style={{ fontSize: '11px', background: 'rgba(74,222,128,0.15)', color: '#4ade80', borderRadius: '4px', padding: '2px 7px', fontWeight: 600 }}>✓ Confirmado</span>}
                  </div>
                  {place.address && <p style={{ margin: '0 0 4px', fontSize: '13px', opacity: 0.6 }}>📍 {place.address}</p>}
                  {place.date && <p style={{ margin: '0 0 4px', fontSize: '13px', opacity: 0.6 }}>📅 {new Date(place.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>}
                  {place.notes && <p style={{ margin: '0', fontSize: '13px', opacity: 0.65 }}>{place.notes}</p>}
                  {place.url && <a href={place.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--accent, #a78bfa)', opacity: 0.8 }}>Ver enlace →</a>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => toggleConfirm(place)} style={ghostSmall} title="Marcar confirmado">
                    {place.confirmed ? '✓' : '○'}
                  </button>
                  <button onClick={() => handleDelete(place.id)} style={deleteBtn} title="Eliminar">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const cardStyle  = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 16px' };
const labelStyle = { fontSize: '12px', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' };
const deleteBtn  = { background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.4, fontSize: '14px', padding: '2px 6px', transition: 'opacity 0.15s' };
const ghostSmall = { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'inherit', borderRadius: '6px', padding: '2px 8px', cursor: 'pointer', fontSize: '13px', opacity: 0.6 };
