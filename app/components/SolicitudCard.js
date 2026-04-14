'use client';
import { useState } from 'react';

const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1493615490952728778/Ksp2Ru3zX5ngDMxusUruo77N0sUfmSzarcfg3S7hgBPDkUki94wonPdvbDEFLVpcP2hs';

export default function SolicitudCard({ tipo }) {
  const [desc, setDesc]     = useState('');
  const [status, setStatus] = useState('idle');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!desc.trim()) return;
    setStatus('loading');

    const esJuego = tipo === 'juego';
    const label   = esJuego ? '🎮 Juego' : '🛠️ Herramienta';
    const color   = esJuego ? 0x6c63ff : 0xa855f7;

    try {
      const res = await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `${label} solicitado`,
            description: desc.trim(),
            color,
            footer: { text: 'Portfolio · Solicitud de usuario' },
            timestamp: new Date().toISOString(),
          }],
        }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const esJuego = tipo === 'juego';

  return (
    <div className="solicitud-card">
      <div className="solicitud-icon">{esJuego ? '🙋' : '💡'}</div>
      <h3 className="solicitud-title">Pide el tuyo propio</h3>
      <p className="solicitud-desc">
        ¿Tienes en mente {esJuego ? 'un juego' : 'una herramienta'}? Descríbelo y lo implementamos.
      </p>

      {status === 'idle' && (
        <form onSubmit={onSubmit} className="solicitud-form">
          <textarea
            className="solicitud-textarea"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder={esJuego
              ? 'Ej: "Un juego de Snake donde la serpiente va acelerando con cada manzana"'
              : 'Ej: "Un conversor de imágenes a WebP con control de calidad"'}
            rows={3}
            maxLength={500}
            required
          />
          <button type="submit" className="btn-primary solicitud-btn">
            Enviar solicitud
          </button>
        </form>
      )}

      {status === 'loading' && (
        <p className="solicitud-feedback">Enviando…</p>
      )}

      {status === 'done' && (
        <p className="solicitud-feedback solicitud-ok">
          ✓ Solicitud enviada. En breve nos ponemos con ello.
        </p>
      )}

      {status === 'error' && (
        <div>
          <p className="solicitud-feedback solicitud-err">Error al enviar. Inténtalo de nuevo.</p>
          <button className="btn-secondary" style={{ marginTop: '8px' }} onClick={() => setStatus('idle')}>
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
