import Link from 'next/link';
import SolicitudCard from '../components/SolicitudCard';

export const metadata = {
  title: 'Juegos — César Cabanas',
};

export default function JuegosPage() {
  return (
    <>
      <div className="hero" style={{ marginBottom: '40px' }}>
        <h1>🎮 <span className="highlight">Juegos</span></h1>
        <p className="subtitle">Juega directamente en el navegador, sin instalaciones ni registros.</p>
      </div>

      <div className="cards">
        <Link href="/juegos/buscaminas" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <div className="card-icon">💣</div>
            <h3>Buscaminas</h3>
            <p>El clásico juego de descubrir las minas. Tres niveles de dificultad.</p>
          </div>
        </Link>
        <Link href="/juegos/ajedrez" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <div className="card-icon">♟</div>
            <h3>Ajedrez</h3>
            <p>Partida completa para dos jugadores por turnos en el mismo dispositivo.</p>
          </div>
        </Link>
        <Link href="/juegos/tres-en-raya" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <div className="card-icon">✖</div>
            <h3>Tres en Raya</h3>
            <p>El clásico X y O. Marcador acumulado para llevar la cuenta entre partidas.</p>
          </div>
        </Link>
        <Link href="/juegos/cuatro-en-raya" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <div className="card-icon">🔴</div>
            <h3>Cuatro en Raya</h3>
            <p>Conecta 4 fichas en línea antes que tu rival. Rojo contra Amarillo.</p>
          </div>
        </Link>
        <Link href="/juegos/tetris" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <div className="card-icon">🧩</div>
            <h3>Tetris</h3>
            <p>El clásico de bloques. Ghost piece, niveles, y controles táctiles para móvil.</p>
          </div>
        </Link>
      </div>

      <SolicitudCard tipo="juego" />
    </>
  );
}
