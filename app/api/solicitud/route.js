import nodemailer from 'nodemailer';

export async function POST(req) {
  const { tipo, descripcion } = await req.json();

  if (!tipo || !descripcion?.trim()) {
    return Response.json({ error: 'Faltan campos.' }, { status: 400 });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  if (!user || !pass) {
    return Response.json({ error: 'Correo no configurado.' }, { status: 503 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const subject = tipo === 'juego'
    ? 'mejoras_polimorfico_juegos'
    : 'mejoras_polimorfico_herramientas';
  const emoji = tipo === 'juego' ? '🎮' : '🛠️';

  await transporter.sendMail({
    from: `"Portfolio" <${user}>`,
    to: user,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#0f1117;color:#e2e8f0;border-radius:12px;padding:32px;">
        <h2 style="color:#6c63ff;margin-top:0;">${emoji} Nueva solicitud de ${tipo}</h2>
        <p style="white-space:pre-wrap;line-height:1.7;background:#1a1d27;padding:16px;border-radius:8px;border:1px solid #2e3248;">
          ${descripcion.trim()}
        </p>
        <p style="font-size:0.8rem;color:#64748b;margin-top:24px;">Enviado desde el portfolio.</p>
      </div>
    `,
  });

  return Response.json({ ok: true });
}
