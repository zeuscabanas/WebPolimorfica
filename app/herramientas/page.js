import Link from 'next/link';
import SolicitudCard from '../components/SolicitudCard';

export const metadata = {
  title: 'Herramientas — César Cabanas',
};

const tools = [
  {
    href: '/herramientas/quitar-fondo',
    icon: '✂️',
    name: 'Quitar fondo',
    desc: 'Elimina el fondo de cualquier imagen en segundos. Funciona en el navegador, sin subir nada a ningún servidor.',
  },
  {
    href: '/herramientas/youtube-mp3',
    icon: '🎵',
    name: 'YouTube → MP3',
    desc: 'Pega la URL de cualquier vídeo de YouTube y descarga el audio en MP3. Máx. 20 minutos.',
  },
  {
    href: '/herramientas/buscar-emails',
    icon: '📧',
    name: 'Buscar emails',
    desc: 'Pega la URL de cualquier página web y extrae todos los correos electrónicos que aparezcan en ella.',
  },
];

export default function HerramientasPage() {
  return (
    <>
      <div className="hero" style={{ marginBottom: '40px' }}>
        <h1>🛠 <span className="highlight">Herramientas</span></h1>
        <p className="subtitle">Utilidades que funcionan directamente en el navegador, sin registro ni servidores.</p>
      </div>

      <div className="cards">
        {tools.map(t => (
          <Link key={t.href} href={t.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer' }}>
              <div className="card-icon">{t.icon}</div>
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <SolicitudCard tipo="herramienta" />
    </>
  );
}
