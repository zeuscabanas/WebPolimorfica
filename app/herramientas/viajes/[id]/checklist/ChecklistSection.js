'use client';
import { useState, useMemo } from 'react';
import { createClient } from '../../../../../lib/supabase/client';

const DEFAULT_ITEMS = [
  'Pasaporte / DNI', 'Billetes y reservas', 'Seguro de viaje',
  'Adaptador de corriente', 'Medicamentos', 'Ropa interior (x7)',
  'Cargadores', 'Auriculares', 'Tarjeta bancaria',
];

export default function ChecklistSection({ tripId, initialItems }) {
  const [items, setItems]   = useState(initialItems);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.from('trip_checklist').insert({
      trip_id: tripId,
      item: newItem.trim(),
    }).select().single();
    if (!error && data) {
      setItems(prev => [...prev, data]);
      setNewItem('');
    }
    setLoading(false);
  };

  const addDefault = async () => {
    const existing = new Set(items.map(i => i.item));
    const toAdd = DEFAULT_ITEMS.filter(d => !existing.has(d));
    if (!toAdd.length) return;
    const { data } = await supabase.from('trip_checklist').insert(
      toAdd.map(item => ({ trip_id: tripId, item }))
    ).select();
    if (data) setItems(prev => [...prev, ...data]);
  };

  const toggleItem = async (item) => {
    const updated = { ...item, checked: !item.checked };
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
    await supabase.from('trip_checklist').update({ checked: updated.checked }).eq('id', item.id);
  };

  const handleDelete = async (id) => {
    await supabase.from('trip_checklist').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const checked   = items.filter(i => i.checked).length;
  const total     = items.length;
  const progress  = total > 0 ? Math.round((checked / total) * 100) : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '16px', opacity: 0.8 }}>Lista de preparación</h2>
          {total > 0 && <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.5 }}>{checked}/{total} completados</p>}
        </div>
        <button onClick={addDefault} style={ghostStyle}>✨ Añadir básicos</button>
      </div>

      {total > 0 && (
        <div style={{ marginBottom: '24px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent, #a78bfa)', borderRadius: '99px', transition: 'width 0.3s' }} />
        </div>
      )}

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          className="yt-input"
          type="text"
          placeholder="Añadir elemento…"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '10px 20px', fontSize: '14px', whiteSpace: 'nowrap' }}>
          + Añadir
        </button>
      </form>

      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 16px', opacity: 0.5 }}>
          <p>La lista está vacía.</p>
          <p style={{ fontSize: '13px' }}>Añade elementos o pulsa "Añadir básicos" para empezar con una lista predeterminada.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {items.map(item => (
          <div
            key={item.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 14px', borderRadius: '8px',
              background: item.checked ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${item.checked ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.15s',
            }}
          >
            <button
              onClick={() => toggleItem(item)}
              style={{
                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${item.checked ? '#4ade80' : 'rgba(255,255,255,0.3)'}`,
                background: item.checked ? '#4ade80' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#000', fontSize: '12px', fontWeight: 700, transition: 'all 0.15s',
              }}
            >
              {item.checked ? '✓' : ''}
            </button>
            <span style={{
              flex: 1, fontSize: '15px',
              textDecoration: item.checked ? 'line-through' : 'none',
              opacity: item.checked ? 0.45 : 1,
              transition: 'all 0.15s',
            }}>
              {item.item}
            </span>
            <button onClick={() => handleDelete(item.id)} style={deleteBtn} title="Eliminar">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const ghostStyle = { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'inherit', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', opacity: 0.7 };
const deleteBtn  = { background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.35, fontSize: '14px', padding: '2px 6px' };
