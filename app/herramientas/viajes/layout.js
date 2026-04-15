// force-dynamic hace que todo el segmento /herramientas/viajes/* se renderice
// en el servidor por cada request, así process.env lee las vars en runtime
// (no en build-time) y las inyecta en window para los componentes cliente.
export const dynamic = 'force-dynamic';

export default function ViajesRootLayout({ children }) {
  const sbScript =
    `window.__SB_URL__=${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || '')};` +
    `window.__SB_KEY__=${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')};`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: sbScript }} />
      {children}
    </>
  );
}
