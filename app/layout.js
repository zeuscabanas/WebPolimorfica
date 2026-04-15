import './globals.css';
import NavLink from './components/NavLink';

export const metadata = {
  title: 'César Cabanas · Portfolio',
  description: 'Portfolio personal de César Cabanas — Salesforce Developer & Full Stack.',
  icons: {
    icon: '/cc-logo.svg',
    shortcut: '/cc-logo.svg',
    apple: '/cc-logo.svg',
  },
};

export default function RootLayout({ children }) {
  const sbScript = `window.__SB_URL__=${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL||'')};window.__SB_KEY__=${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'')};`;
  return (
    <html lang="es">
      <body>
        <script dangerouslySetInnerHTML={{ __html: sbScript }} />
        <header className="site-header">
          <div className="header-inner">
            <span className="logo">César Cabanas</span>
            <nav className="main-nav">
              <NavLink href="/">Inicio</NavLink>
              <NavLink href="/curriculum">Currículum</NavLink>
              <NavLink href="/juegos">Juegos</NavLink>
              <NavLink href="/herramientas">Herramientas</NavLink>
            </nav>
          </div>
        </header>

        <main className="content">
          {children}
        </main>

        <footer className="site-footer">
          <p>
            César Cabanas ·{' '}
            <a href="https://github.com/zeuscabanas/WebPolimorfica" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
