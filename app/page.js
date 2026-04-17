import { serverT } from '../lib/i18n/server';

export default function Home() {
  const t = serverT('home');

  return (
    <>
      <div className="hero">
        <h1>
          {t.title} <span className="highlight">WebPolimorfica</span>
        </h1>
        <p className="subtitle">{t.subtitle}</p>
        <div className="badge">{t.badge}</div>
      </div>

      <div className="cards">
        <div className="card">
          <div className="card-icon">⚡</div>
          <h3>{t.card1Title}</h3>
          <p>{t.card1Desc}</p>
        </div>
        <div className="card">
          <div className="card-icon">🧩</div>
          <h3>{t.card2Title}</h3>
          <p>{t.card2Desc}</p>
        </div>
        <div className="card">
          <div className="card-icon">🔄</div>
          <h3>{t.card3Title}</h3>
          <p>{t.card3Desc}</p>
        </div>
      </div>
    </>
  );
}
