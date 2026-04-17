import './globals.css';
import NavLink from './components/NavLink';
import { LocaleProvider } from '../components/LocaleProvider';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getLocale } from '../lib/i18n/server';
import { serverT } from '../lib/i18n/server';

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
  const locale = getLocale();
  const nav = serverT('nav');

  return (
    <html lang={locale}>
      <body>
        <LocaleProvider initialLocale={locale}>
          <header className="site-header">
            <div className="header-inner">
              <span className="logo">César Cabanas</span>
              <nav className="main-nav">
                <NavLink href="/">{nav.inicio}</NavLink>
                <NavLink href="/curriculum">{nav.curriculum}</NavLink>
                <NavLink href="/juegos">{nav.juegos}</NavLink>
                <NavLink href="/herramientas">{nav.herramientas}</NavLink>
              </nav>
              <LanguageSwitcher />
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
        </LocaleProvider>
      </body>
    </html>
  );
}
