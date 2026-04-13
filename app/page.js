export default function Home() {
  return (
    <>
      <div className="hero">
        <h1>
          Bienvenido a <span className="highlight">WebPolimorfica</span>
        </h1>
        <p className="subtitle">
          Una web viva. Cada nueva función que pidamos se despliega aquí
          automáticamente desde GitHub.
        </p>
        <div className="badge">Desplegado con DeployFast · GitHub → Auto-deploy</div>
      </div>

      <div className="cards">
        <div className="card">
          <div className="card-icon">⚡</div>
          <h3>Despliegue automático</h3>
          <p>
            Cada cambio que hacemos en el repositorio de GitHub se refleja aquí
            al instante.
          </p>
        </div>
        <div className="card">
          <div className="card-icon">🧩</div>
          <h3>Modular</h3>
          <p>
            Nuevas secciones o herramientas se añaden como rutas independientes
            sin romper nada.
          </p>
        </div>
        <div className="card">
          <div className="card-icon">🔄</div>
          <h3>Siempre actualizado</h3>
          <p>
            El repositorio es la fuente de verdad. Lo que está en GitHub es lo
            que ves aquí.
          </p>
        </div>
      </div>
    </>
  );
}
