import { NextResponse } from 'next/server';

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const SKIP_EXT = /\.(png|jpe?g|gif|svg|webp|css|js|woff2?|ttf|eot|ico)$/i;
const SKIP_DOMAINS = /^(sentry\.|cloudfront\.|amazonaws\.|googleusercontent\.|gstatic\.|jsdelivr\.)/i;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function decodeHtml(html) {
  return html
    .replace(/&amp;/g, '&').replace(/&#64;/g, '@').replace(/&#x40;/gi, '@')
    .replace(/\[at\]/gi, '@').replace(/\(at\)/gi, '@')
    .replace(/\s*\[dot\]\s*/gi, '.').replace(/\s*\(dot\)\s*/gi, '.');
}

function extractEmails(text) {
  const decoded = decodeHtml(text);
  return (decoded.match(EMAIL_RE) ?? [])
    .filter(e => !SKIP_EXT.test(e))
    .filter(e => {
      const domain = e.split('@')[1] ?? '';
      return !SKIP_DOMAINS.test(domain);
    });
}

function extractUrls(html) {
  const urls = new Set();
  for (const m of html.matchAll(/href="(https?:\/\/[^"&]{10,})"/g)) {
    const u = m[1];
    if (!u.includes('duckduckgo') && !u.includes('google.com') && !u.includes('bing.com'))
      urls.add(u.split('?')[0]); // quitar query string para URLs de páginas
  }
  return [...urls].slice(0, 8);
}

async function ddgSearch(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=es-es`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Accept-Language': 'es-ES,es;q=0.9' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`DDG ${res.status}`);
  return res.text();
}

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'text/html' },
    signal: AbortSignal.timeout(7000),
    redirect: 'follow',
  });
  if (!res.ok) return '';
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('text')) return '';
  return res.text();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const nombre   = searchParams.get('nombre')?.trim();
  const apellido = searchParams.get('apellido')?.trim();
  const empresa  = searchParams.get('empresa')?.trim() ?? '';

  if (!nombre || !apellido) {
    return NextResponse.json({ error: 'Nombre y apellido son obligatorios' }, { status: 400 });
  }

  const fullName = `${nombre} ${apellido}`;

  const queries = [
    `"${fullName}" email`,
    `"${fullName}" correo`,
    empresa ? `"${fullName}" "${empresa}"` : `"${fullName}" contact`,
    `"${fullName}" "@"`,
    empresa ? `site:linkedin.com "${fullName}" "${empresa}"` : `site:linkedin.com "${fullName}"`,
  ];

  // email → Set de fuentes donde se encontró
  const emailMap = new Map();
  const pageUrls = new Set();

  const addEmail = (email, source) => {
    const key = email.toLowerCase();
    if (!emailMap.has(key)) emailMap.set(key, { email, sources: new Set() });
    emailMap.get(key).sources.add(source);
  };

  // 1. Buscar en DDG
  await Promise.allSettled(queries.map(async (q) => {
    try {
      const html = await ddgSearch(q);
      extractEmails(html).forEach(e => addEmail(e, `Resultado: "${q}"`));
      extractUrls(html).forEach(u => pageUrls.add(u));
    } catch {}
  }));

  // 2. Visitar las páginas encontradas y buscar emails
  const toVisit = [...pageUrls].slice(0, 6);
  await Promise.allSettled(toVisit.map(async (url) => {
    try {
      const html = await fetchPage(url);
      if (!html) return;
      // Solo añadir emails si el nombre aparece en la página (más relevante)
      const nameMentioned = html.toLowerCase().includes(nombre.toLowerCase()) &&
                            html.toLowerCase().includes(apellido.toLowerCase());
      extractEmails(html).forEach(e => {
        if (nameMentioned) addEmail(e, url);
      });
    } catch {}
  }));

  // Construir resultados ordenados por número de fuentes (más fiable primero)
  const results = [...emailMap.values()]
    .map(({ email, sources }) => ({
      email,
      sources: [...sources],
      apariciones: sources.size,
    }))
    .sort((a, b) => b.apariciones - a.apariciones)
    .slice(0, 20); // máximo 20 resultados

  return NextResponse.json({ results, name: fullName, paginasAnalizadas: toVisit.length });
}
