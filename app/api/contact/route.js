import nodemailer from 'nodemailer';

export async function POST(req) {
  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return Response.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  if (!user || !pass) {
    return Response.json({ error: 'Servidor de correo no configurado.' }, { status: 503 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: `"WebPolimorfica Contacto" <${user}>`,
      to: user,
      replyTo: email,
      subject: `[WebPolimorfica] Mensaje de ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:12px;padding:32px;">
          <h2 style="color:#6c63ff;margin-top:0;">Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#a78bfa;">${email}</a></p>
          <hr style="border-color:#1e293b;margin:20px 0;"/>
          <p style="white-space:pre-wrap;line-height:1.7;">${message}</p>
          <p style="font-size:0.75rem;color:#64748b;margin-top:24px;">Enviado desde webpolimorfica.com</p>
        </div>
      `,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Error sending email:', err);
    return Response.json({ error: 'Error al enviar el correo.' }, { status: 500 });
  }
}
