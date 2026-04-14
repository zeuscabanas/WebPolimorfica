export async function POST(req) {
  const { tipo, descripcion } = await req.json();

  if (!tipo || !descripcion?.trim()) {
    return Response.json({ error: 'Faltan campos.' }, { status: 400 });
  }

  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) {
    return Response.json({ error: 'Servicio de correo no configurado.' }, { status: 503 });
  }

  const emoji   = tipo === 'juego' ? '🎮' : '🛠️';
  const subject = tipo === 'juego'
    ? 'mejoras_polimorfico_juegos'
    : 'mejoras_polimorfico_herramientas';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio <onboarding@resend.dev>',
        to: 'zeuscabanas@gmail.com',
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
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || JSON.stringify(data));
    return Response.json({ ok: true });

  } catch (err) {
    console.error('[solicitud] Resend error:', err.message);
    return Response.json({ error: `Error al enviar: ${err.message}` }, { status: 500 });
  }
}
