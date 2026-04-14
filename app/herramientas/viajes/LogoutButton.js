'use client';
import { createClient } from '../../../lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const supabase = createClient();
  const router   = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/herramientas/viajes/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'inherit',
        borderRadius: '8px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        opacity: 0.7,
      }}
    >
      Cerrar sesión
    </button>
  );
}
