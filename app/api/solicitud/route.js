import nodemailer from 'nodemailer';

export async function POST(req) {
  const { tipo, descripcion } = await req.json();

  if (!tipo || !descripcion) {
    return Response.json({ error: 'Faltan campos.' }, { status: 400 });
  }

  const user  = process.env.GMAIL_USER;
  const pass  = process.env.GMAIL_PASS;
  const token = process.env.GITHUB_ISSUE_TOKEN;

  // ── 1. Email notification ──────────────────────────────────────────────────
  if (user && pass) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    const label = tipo === 'juego' ? '🎮 Juego' : '🛠 Herramienta';
    await transporter.sendMail({
      from: `"Portfolio Solicitudes" <${user}>`,
      to: user,
      subject: `[Solicitud] Nueva ${tipo}: ${descripcion.slice(0, 60)}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:12px;padding:32px;">
          <h2 style="color:#6c63ff;margin-top:0;">Nueva solicitud de ${label}</h2>
          <p style="white-space:pre-wrap;line-height:1.7;background:#1a1d27;padding:16px;border-radius:8px;">${descripcion}</p>
          <p style="font-size:0.8rem;color:#64748b;margin-top:24px;">
            La IA procesará esto automáticamente vía GitHub Actions.
          </p>
        </div>
      `,
    }).catch(err => console.error('Email error:', err));
  }

  // ── 2. GitHub Issue ────────────────────────────────────────────────────────
  if (token) {
    const title = `[auto-dev] Nueva ${tipo}: ${descripcion.slice(0, 80)}`;
    const body  = [
      `**Tipo:** ${tipo}`,
      `**Descripción del usuario:**`,
      `> ${descripcion}`,
      ``,
      `---`,
      `_Solicitud recibida desde el portfolio. La IA implementará esto automáticamente._`,
    ].join('\n');

    const ghRes = await fetch('https://api.github.com/repos/zeuscabanas/WebPolimorfica/issues', {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        title,
        body,
        labels: ['auto-dev', tipo],
      }),
    });

    if (!ghRes.ok) {
      console.error('GitHub issue error:', await ghRes.text());
    }
  }

  return Response.json({ ok: true });
}
