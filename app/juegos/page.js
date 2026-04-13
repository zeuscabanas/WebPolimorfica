import Link from 'next/link';

export const metadata = {
  title: 'Juegos — WebPolimorfica',
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
      </div>
    </>
  );
}
