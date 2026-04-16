import { NextResponse } from 'next/server';

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
// Extensiones que producen falsos positivos (ej: icon@2x.png)
const FALSE_POSITIVE = /\.(png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot)$/i;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let url = searchParams.get('url')?.trim();

  if (!url) return NextResponse.json({ error: 'Falta la URL' }, { status: 400 });
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  try {
    new URL(url); // valida que sea una URL bien formada
  } catch {
    return NextResponse.json({ error: 'La URL no es válida' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(12000),
      redirect: 'follow',
    });

    if (!res.ok) {
      return NextResponse.json({ error: `La página devolvió ${res.status}` }, { status: 400 });
    }

    const html = await res.text();

    // Decodificar entidades HTML comunes usadas para ofuscar emails
    const decoded = html
      .replace(/&amp;/g, '&')
      .replace(/&#64;/g, '@')
      .replace(/&#x40;/gi, '@')
      .replace(/\[at\]/gi, '@')
      .replace(/\(at\)/gi, '@');

    const matches = decoded.match(EMAIL_REGEX) ?? [];
    const emails = [...new Set(matches)].filter(e => !FALSE_POSITIVE.test(e));

    return NextResponse.json({ emails, url });
  } catch (err) {
    const msg = err.name === 'TimeoutError'
      ? 'La página tardó demasiado en responder (>12 s)'
      : `No se pudo acceder: ${err.message}`;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
