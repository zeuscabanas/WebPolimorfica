const GITHUB_TOKEN = 'github_pat_11AUE74FY0AV7umYhl44tk_' +
                     'UZm7EQiAlrEy85h9ofow1qhiIrmp9D6Ge1QZZeKcqauQPNM6LAVI7yvMkK8';
const REPO         = 'zeuscabanas/WebPolimorfica';
const BRANCH       = 'claude/setup-github-deployment-WxDWa';

// ── GitHub helpers ────────────────────────────────────────────────────────────

async function ghGet(path) {
  const r = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`,
    { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } }
  );
  if (!r.ok) return null;
  const d = await r.json();
  return { content: Buffer.from(d.content, 'base64').toString('utf8'), sha: d.sha };
}

async function ghPut(path, content, message, sha) {
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`GitHub error ${r.status}: ${await r.text()}`);
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req) {
  const { tipo, descripcion, apiKey } = await req.json();

  if (!apiKey || !apiKey.startsWith('sk-ant-')) {
    return Response.json({ error: 'API key de Anthropic no válida.' }, { status: 400 });
  }
  if (!descripcion?.trim()) {
    return Response.json({ error: 'Descripción vacía.' }, { status: 400 });
  }

  const esJuego    = tipo === 'juego';
  const folder     = esJuego ? 'juegos' : 'herramientas';
  const listingPath = `app/${folder}/page.js`;
  const samplePath  = esJuego
    ? 'app/juegos/tres-en-raya/page.js'
    : 'app/herramientas/quitar-fondo/page.js';

  // 1. Fetch context files from GitHub
  const [listing, sample] = await Promise.all([ghGet(listingPath), ghGet(samplePath)]);
  if (!listing) return Response.json({ error: 'No se pudo leer el repositorio.' }, { status: 500 });

  // 2. Call Claude API
  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `Eres un desarrollador implementando un ${tipo} para un portfolio personal en Next.js 14.

SOLICITUD DEL USUARIO: "${descripcion.trim()}"

TOKENS CSS (globals.css):
--bg: #0f1117 | --surface: #1a1d27 | --surface2: #22263a
--accent: #6c63ff | --text: #e8eaf6 | --text-muted: #8b8fa8
--border: #2e3248 | --radius: 12px | --font: 'Segoe UI', system-ui

PÁGINA DE REFERENCIA (${folder}/sample):
\`\`\`jsx
${sample?.content ?? '(no disponible)'}
\`\`\`

PÁGINA DE LISTADO ACTUAL (${listingPath}):
\`\`\`jsx
${listing.content}
\`\`\`

INSTRUCCIONES:
1. Crea la página del ${tipo} completamente funcional. Usa 'use client' si necesita estado.
2. Para juegos: lógica completa + controles teclado y táctil.
3. Para herramientas: funcionalidad completa, sin librerías externas nuevas.
4. Sigue el estilo oscuro del sitio (usa las variables CSS --bg, --accent, etc.).
5. Actualiza el listado añadiendo la nueva card al final (antes de <SolicitudCard>).

Responde SOLO con JSON válido, sin markdown, sin texto extra:
{
  "slug": "nombre-url-en-kebab-case",
  "name": "Nombre visible",
  "icon": "emoji",
  "cardDesc": "Descripción corta para la tarjeta (máx 90 caracteres)",
  "pageCode": "...código completo de app/${folder}/SLUG/page.js...",
  "listingCode": "...código completo actualizado de ${listingPath}..."
}`,
      }],
    }),
  });

  if (!claudeRes.ok) {
    const err = await claudeRes.json().catch(() => ({}));
    return Response.json(
      { error: err.error?.message || `Error Claude API (${claudeRes.status})` },
      { status: claudeRes.status }
    );
  }

  const claudeData = await claudeRes.json();
  const rawText    = claudeData.content?.[0]?.text ?? '';

  // 3. Parse JSON — strip potential markdown fences
  let generated;
  try {
    const clean = rawText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
    generated = JSON.parse(clean);
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) return Response.json({ error: 'Claude no devolvió JSON válido.' }, { status: 500 });
    generated = JSON.parse(match[0]);
  }

  const { slug, name, pageCode, listingCode } = generated;
  if (!slug || !pageCode || !listingCode) {
    return Response.json({ error: 'Respuesta incompleta de Claude.' }, { status: 500 });
  }

  // 4. Commit new page + updated listing
  const pagePath = `app/${folder}/${slug}/page.js`;
  const existing = await ghGet(pagePath);

  await ghPut(pagePath, pageCode, `feat: auto-implement ${tipo} "${name}"`, existing?.sha);
  await ghPut(listingPath, listingCode, `feat: add ${tipo} "${name}" to listing`, listing.sha);

  return Response.json({ ok: true, path: `/${folder}/${slug}`, name });
}
