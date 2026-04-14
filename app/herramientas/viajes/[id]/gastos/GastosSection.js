'use client';
import { useState } from 'react';
import { createClient } from '../../../../../lib/supabase/client';

const CURRENCIES = ['EUR','USD','GBP','JPY','MXN','ARS','CLP','COP','BRL'];

export default function GastosSection({ tripId, initialExpenses, userId }) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ description: '', amount: '', currency: 'EUR', date: '' });
  const [loading, setLoading]   = useState(false);
  const supabase = createClient();

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) return;
    setLoading(true);
    const { data, error } = await supabase.from('trip_expenses').insert({
      trip_id:     tripId,
      description: form.description.trim(),
      amount:      parseFloat(form.amount),
      currency:    form.currency,
      paid_by:     userId,
      date:        form.date || null,
    }).select().single();
    if (!error && data) {
      setExpenses(prev => [...prev, data]);
      setForm({ description: '', amount: '', currency: 'EUR', date: '' });
      setShowForm(false);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await supabase.from('trip_expenses').delete().eq('id', id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const byCurrency = expenses.reduce((acc, e) => {
    if (!acc[e.currency]) acc[e.currency] = 0;
    acc[e.currency] += parseFloat(e.amount);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', opacity: 0.8 }}>Gastos del viaje</h2>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)} style={{ padding: '8px 16px', fontSize: '14px' }}>
          {showForm ? '✕ Cancelar' : '+ Añadir gasto'}
        </button>
      </div>

      {Object.keys(byCurrency).length > 0 && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {Object.entries(byCurrency).map(([cur, total]) => (
            <div key={cur} style={{ ...cardStyle, padding: '12px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 700 }}>{total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div style={{ fontSize: '12px', opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cur}</div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} style={{ ...cardStyle, marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Concepto *</label>
            <input className="yt-input" type="text" placeholder="Ej: Cena en Shibuya"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required style={{ marginTop: '6px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Importe *</label>
              <input className="yt-input" type="number" step="0.01" min="0" placeholder="0.00"
                value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required style={{ marginTop: '6px' }} />
            </div>
            <div>
              <label style={labelStyle}>Divisa</label>
              <select className="yt-input" value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} style={{ marginTop: '6px' }}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Fecha</label>
              <input className="yt-input" type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ marginTop: '6px' }} />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      )}

      {expenses.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '48px 16px', opacity: 0.5 }}>
          <p>Aún no hay gastos registrados.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[...expenses].reverse().map(exp => (
          <div key={exp.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600 }}>{exp.description}</span>
              {exp.date && <span style={{ fontSize: '13px', opacity: 0.5, marginLeft: '10px' }}>
                {new Date(exp.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>}
            </div>
            <span style={{ fontWeight: 700, fontSize: '16px' }}>
              {parseFloat(exp.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })} {exp.currency}
            </span>
            <button onClick={() => handleDelete(exp.id)} style={deleteBtn} title="Eliminar">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle  = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 16px' };
const labelStyle = { fontSize: '12px', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' };
const deleteBtn  = { background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.4, fontSize: '14px', padding: '2px 6px' };
