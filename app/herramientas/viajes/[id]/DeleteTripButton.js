'use client';
import { createClient } from '../../../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteTripButton({ tripId }) {
  const [confirm, setConfirm] = useState(false);
  const supabase = createClient();
  const router   = useRouter();

  const handleDelete = async () => {
    await supabase.from('trips').delete().eq('id', tripId);
    router.push('/herramientas/viajes');
    router.refresh();
  };

  if (!confirm) {
    return (
      <button onClick={() => setConfirm(true)} style={ghostStyle}>
        🗑 Eliminar viaje
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', opacity: 0.7 }}>¿Seguro?</span>
      <button onClick={handleDelete} style={{ ...ghostStyle, borderColor: '#f87171', color: '#f87171' }}>Sí, eliminar</button>
      <button onClick={() => setConfirm(false)} style={ghostStyle}>Cancelar</button>
    </div>
  );
}

const ghostStyle = {
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.2)',
  color: 'inherit',
  borderRadius: '8px',
  padding: '6px 14px',
  cursor: 'pointer',
  fontSize: '13px',
  opacity: 0.7,
};
