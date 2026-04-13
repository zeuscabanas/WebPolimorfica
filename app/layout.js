import './globals.css';
import NavLink from './components/NavLink';

export const metadata = {
  title: 'WebPolimorfica',
  description: 'Una web viva. Cada nueva función se despliega automáticamente desde GitHub.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <div className="header-inner">
            <span className="logo">WebPolimorfica</span>
            <nav className="main-nav">
              <NavLink href="/">Inicio</NavLink>
              {/* Nuevas pestañas se añadirán aquí */}
            </nav>
          </div>
        </header>

        <main className="content">
          {children}
        </main>

        <footer className="site-footer">
          <p>
            WebPolimorfica ·{' '}
            <a href="https://github.com/zeuscabanas/WebPolimorfica" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
