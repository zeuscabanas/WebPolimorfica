'use client';
import { useState, useMemo } from 'react';
import { createClient } from '../../../../../lib/supabase/client';

const TYPES = [
  { value: 'flight', label: '✈️ Vuelo' },
  { value: 'train',  label: '🚂 Tren' },
  { value: 'bus',    label: '🚌 Bus' },
  { value: 'ferry',  label: '⛴ Ferry' },
  { value: 'car',    label: '🚗 Coche' },
  { value: 'other',  label: '🚀 Otro' },
];

const typeLabel = (v) => TYPES.find(t => t.value === v)?.label ?? v;

export default function TransporteSection({ tripId, initialTransport }) {
  const [items, setItems]     = useState(initialTransport);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ type: 'flight', from_location: '', to_location: '', departure_date: '', departure_time: '', arrival_date: '', arrival_time: '', company: '', booking_ref: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const toISO = (date, time) => {
    if (!date) return null;
    return time ? `${date}T${time}:00` : `${date}T00:00:00`;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.from_location.trim() || !form.to_location.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.from('trip_transport').insert({
      trip_id:      tripId,
      type:         form.type,
      from_location: form.from_location.trim(),
      to_location:   form.to_location.trim(),
      departure_at:  toISO(form.departure_date, form.departure_time),
      arrival_at:    toISO(form.arrival_date, form.arrival_time),
      company:       form.company.trim() || null,
      booking_ref:   form.booking_ref.trim() || null,
      notes:         form.notes.trim() || null,
    }).select().single();
    if (!error && data) {
      setItems(prev => [...prev, data].sort((a, b) => {
        if (!a.departure_at) return 1;
        if (!b.departure_at) return -1;
        return new Date(a.departure_at) - new Date(b.departure_at);
      }));
      setForm({ type: 'flight', from_location: '', to_location: '', departure_date: '', departure_time: '', arrival_date: '', arrival_time: '', company: '', booking_ref: '', notes: '' });
      setShowForm(false);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await supabase.from('trip_transport').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const fmtDT = (dt) => {
    if (!dt) return null;
    const d = new Date(dt);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ' · ' +
           d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', opacity: 0.8 }}>Transportes</h2>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)} style={{ padding: '8px 16px', fontSize: '14px' }}>
          {showForm ? '✕ Cancelar' : '+ Añadir transporte'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ ...cardStyle, marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Tipo</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {TYPES.map(t => (
                <button key={t.value} type="button"
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', fontSize: '13px',
                    border: `1px solid ${form.type === t.value ? 'var(--accent, #a78bfa)' : 'rgba(255,255,255,0.15)'}`,
                    background: form.type === t.value ? 'rgba(167,139,250,0.15)' : 'transparent',
                    color: 'inherit', cursor: 'pointer',
                  }}
                >{t.label}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Origen *</label>
              <input className="yt-input" type="text" placeholder="Ej: Madrid (MAD)"
                value={form.from_location} onChange={e => setForm(f => ({ ...f, from_location: e.target.value }))} required style={{ marginTop: '6px' }} />
            </div>
            <div>
              <label style={labelStyle}>Destino *</label>
              <input className="yt-input" type="text" placeholder="Ej: Tokio (NRT)"
                value={form.to_location} onChange={e => setForm(f => ({ ...f, to_location: e.target.value }))} required style={{ marginTop: '6px' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Salida fecha</label>
              <input className="yt-input" type="date" value={form.departure_date}
                onChange={e => setForm(f => ({ ...f, departure_date: e.target.value }))} style={{ marginTop: '6px' }} />
            </div>
            <div>
              <label style={labelStyle}>Salida hora</label>
              <input className="yt-input" type="time" value={form.departure_time}
                onChange={e => setForm(f => ({ ...f, departure_time: e.target.value }))} style={{ marginTop: '6px' }} />
            </div>
            <div>
              <label style={labelStyle}>Llegada fecha</label>
              <input className="yt-input" type="date" value={form.arrival_date}
                onChange={e => setForm(f => ({ ...f, arrival_date: e.target.value }))} style={{ marginTop: '6px' }} />
            </div>
            <div>
              <label style={labelStyle}>Llegada hora</label>
              <input className="yt-input" type="time" value={form.arrival_time}
                onChange={e => setForm(f => ({ ...f, arrival_time: e.target.value }))} style={{ marginTop: '6px' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Compañía</label>
              <input className="yt-input" type="text" placeholder="Ej: Iberia"
                value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} style={{ marginTop: '6px' }} />
            </div>
            <div>
              <label style={labelStyle}>Localizador / Ref.</label>
              <input className="yt-input" type="text" placeholder="Ej: ABC123"
                value={form.booking_ref} onChange={e => setForm(f => ({ ...f, booking_ref: e.target.value }))} style={{ marginTop: '6px' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Notas</label>
            <textarea className="yt-input" placeholder="Notas opcionales…" rows={2}
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              style={{ marginTop: '6px', resize: 'vertical' }} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      )}

      {items.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '48px 16px', opacity: 0.5 }}>
          <p>Aún no hay transportes registrados.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map(item => (
          <div key={item.id} style={{ ...cardStyle, display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '28px', lineHeight: 1, paddingTop: '2px' }}>
              {TYPES.find(t => t.value === item.type)?.label.split(' ')[0] ?? '🚀'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '16px' }}>{item.from_location}</span>
                <span style={{ opacity: 0.5 }}>→</span>
                <span style={{ fontWeight: 700, fontSize: '16px' }}>{item.to_location}</span>
                {item.booking_ref && (
                  <span style={{ fontSize: '12px', background: 'rgba(167,139,250,0.15)', color: 'var(--accent, #a78bfa)', borderRadius: '4px', padding: '2px 8px', fontWeight: 600 }}>
                    {item.booking_ref}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', opacity: 0.6 }}>
                {item.departure_at && <span>Salida: {fmtDT(item.departure_at)}</span>}
                {item.arrival_at   && <span>Llegada: {fmtDT(item.arrival_at)}</span>}
                {item.company      && <span>{item.company}</span>}
              </div>
              {item.notes && <p style={{ margin: '6px 0 0', fontSize: '13px', opacity: 0.55 }}>{item.notes}</p>}
            </div>
            <button onClick={() => handleDelete(item.id)} style={deleteBtn} title="Eliminar">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle  = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px' };
const labelStyle = { fontSize: '12px', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' };
const deleteBtn  = { background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.4, fontSize: '14px', padding: '2px 6px', flexShrink: 0 };
