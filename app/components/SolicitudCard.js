'use client';
import { useState } from 'react';

const DISCORD_WEBHOOK  = 'https://discord.com/api/webhooks/1493615490952728778/Ksp2Ru3zX5ngDMxusUruo77N0sUfmSzarcfg3S7hgBPDkUki94wonPdvbDEFLVpcP2hs';
const GITHUB_TOKEN     = 'github_pat_11AUE74FY0AV7umYhl44tk_' +
                         'UZm7EQiAlrEy85h9ofow1qhiIrmp9D6Ge1QZZeKcqauQPNM6LAVI7yvMkK8';
const GITHUB_REPO      = 'zeuscabanas/WebPolimorfica';

export default function SolicitudCard({ tipo }) {
  const [desc, setDesc]     = useState('');
  const [status, setStatus] = useState('idle');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!desc.trim()) return;
    setStatus('loading');

    const esJuego  = tipo === 'juego';
    const emoji    = esJuego ? '🎮' : '🛠️';
    const color    = esJuego ? 0x6c63ff : 0xa855f7;
    const texto    = desc.trim();

    try {
      // 1. Discord notification
      await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `${emoji} Nueva solicitud de ${tipo}`,
            description: texto,
            color,
            footer: { text: 'Portfolio · auto-dev activado' },
            timestamp: new Date().toISOString(),
          }],
        }),
      });

      // 2. GitHub Issue → triggers the auto-dev Action
      await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
        method: 'POST',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          title: `[auto-dev] ${emoji} ${texto.slice(0, 80)}`,
          body: [
            `**Tipo:** ${tipo}`,
            `**Solicitud:**`,
            `> ${texto}`,
            ``,
            `---`,
            `_Recibido desde el portfolio. La IA implementará esto automáticamente._`,
          ].join('\n'),
          labels: ['auto-dev', tipo],
        }),
      });

      setStatus('done');
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
