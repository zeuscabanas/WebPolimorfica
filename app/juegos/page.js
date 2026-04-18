import Link from 'next/link';
import SolicitudCard from '../components/SolicitudCard';
import { serverT } from '../../lib/i18n/server';

export const metadata = {
  title: 'Juegos — César Cabanas',
};

export default function JuegosPage() {
  const t = serverT('juegos');
  const games = [
    { href: '/juegos/buscaminas',    icon: '💣', ...t.buscaminas },
    { href: '/juegos/ajedrez',       icon: '♟',  ...t.ajedrez },
    { href: '/juegos/tres-en-raya',  icon: '✖',  ...t.tresEnRaya },
    { href: '/juegos/cuatro-en-raya',icon: '🔴', ...t.cuatroEnRaya },
    { href: '/juegos/tetris',        icon: '🧩', ...t.tetris },
    { href: '/juegos/lanzador',      icon: '🐦', ...t.lanzador },
  ];

  return (
    <>
      <div className="hero" style={{ marginBottom: '40px' }}>
        <h1>🎮 <span className="highlight">{t.title}</span></h1>
        <p className="subtitle">{t.subtitle}</p>
      </div>

      <div className="cards">
        {games.map(g => (
          <Link key={g.href} href={g.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer' }}>
              <div className="card-icon">{g.icon}</div>
              <h3>{g.name}</h3>
              <p>{g.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <SolicitudCard tipo="juego" />
    </>
  );
}
