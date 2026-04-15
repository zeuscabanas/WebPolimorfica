'use client';
import { useState, useMemo } from 'react';
import { createClient } from '../../../../../lib/supabase/client';

export default function ItinerarioSection({ tripId, initialItems }) {
  const [items, setItems]   = useState(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]     = useState({ date: '', time: '', title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const grouped = items.reduce((acc, item) => {
    const key = item.date ?? 'sin-fecha';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    setLoading(true);
    const { data, error } = await supabase.from('trip_itinerary').insert({
      trip_id: tripId,
      date: form.date,
      time: form.time || null,
      title: form.title.trim(),
      description: form.description.trim() || null,
    }).select().single();
    if (!error && data) {
      setItems(prev => [...prev, data].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      }));
      setForm({ date: '', time: '', title: '', description: '' });
      setShowForm(false);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await supabase.from('trip_itinerary').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', opacity: 0.8 }}>Agenda del viaje</h2>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)} style={{ padding: '8px 16px', fontSize: '14px' }}>
          {showForm ? '✕ Cancelar' : '+ Añadir evento'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ ...cardStyle, marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Fecha *</label>
              <input className="yt-input" type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required style={{ marginTop: '6px' }} />
            </div>
            <div>
              <label style={labelStyle}>Hora</label>
              <input className="yt-input" type="time" value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={{ marginTop: '6px' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Actividad *</label>
            <input className="yt-input" type="text" placeholder="Ej: Visita al templo Senso-ji"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required style={{ marginTop: '6px' }} />
          </div>
          <div>
            <label style={labelStyle}>Notas</label>
            <textarea className="yt-input" placeholder="Detalles opcionales…" rows={2}
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ marginTop: '6px', resize: 'vertical' }} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      )}

      {sortedDates.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '48px 16px', opacity: 0.5 }}>
          <p>Aún no hay nada en el itinerario.</p>
          <p style={{ fontSize: '13px' }}>Añade tu primer evento con el botón de arriba.</p>
        </div>
      )}

      {sortedDates.map(date => (
        <div key={date} style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.5, marginBottom: '12px' }}>
            {date === 'sin-fecha' ? 'Sin fecha' : fmtDate(date)}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {grouped[date].map(item => (
              <div key={item.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: item.description ? '6px' : 0 }}>
                    {item.time && <span style={{ fontSize: '13px', fontWeight: 700, opacity: 0.6, minWidth: '46px' }}>{item.time.slice(0,5)}</span>}
                    <span style={{ fontWeight: 600 }}>{item.title}</span>
                  </div>
                  {item.description && <p style={{ margin: 0, fontSize: '13px', opacity: 0.65 }}>{item.description}</p>}
                </div>
                <button onClick={() => handleDelete(item.id)} style={deleteBtn} title="Eliminar">✕</button>
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
const deleteBtn  = { background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.4, fontSize: '14px', padding: '2px 6px', flexShrink: 0, transition: 'opacity 0.15s' };
