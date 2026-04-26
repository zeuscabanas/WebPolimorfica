import Link from 'next/link';
import SolicitudCard from '../components/SolicitudCard';
import { serverT } from '../../lib/i18n/server';

export const metadata = {
  title: 'Herramientas — César Cabanas',
};

export default function HerramientasPage() {
  const t = serverT('herramientas');
  const tools = [
    { href: '/herramientas/quitar-fondo',        icon: '✂️', ...t.quitarFondo },
    { href: '/herramientas/youtube-mp3',          icon: '🎵', ...t.youtubeMp3 },
    { href: '/herramientas/buscar-emails',        icon: '📧', ...t.buscarEmails },
    { href: '/herramientas/buscar-persona-email', icon: '🕵️', ...t.buscarPersonaEmail },
    { href: '/herramientas/leer-qr',             icon: '📷', ...t.leerQr },
    { href: '/herramientas/generar-qr',          icon: '⬛', ...t.generarQr },
    { href: '/herramientas/fuente-cercana',      icon: '💧', ...t.fuenteCercana },
  ];

  return (
    <>
      <div className="hero" style={{ marginBottom: '40px' }}>
        <h1>🛠 <span className="highlight">{t.title}</span></h1>
        <p className="subtitle">{t.subtitle}</p>
      </div>

      <div className="cards">
        {tools.map(tool => (
          <Link key={tool.href} href={tool.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer' }}>
              <div className="card-icon">{tool.icon}</div>
              <h3>{tool.name}</h3>
              <p>{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <SolicitudCard tipo="herramienta" />
    </>
  );
}
