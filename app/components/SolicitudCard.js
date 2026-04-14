'use client';
import { useState } from 'react';

export default function SolicitudCard({ tipo }) {
  const [desc, setDesc]       = useState('');
  const [status, setStatus]   = useState('idle');
  const [errMsg, setErrMsg]   = useState('');

  const esJuego = tipo === 'juego';

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!desc.trim()) return;
    setStatus('loading');
    try {
      const res  = await fetch('/api/solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, descripcion: desc.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('done');
      } else {
        setErrMsg(data.error || `Error ${res.status}`);
        setStatus('error');
      }
    } catch (e) {
      setErrMsg(e.message || 'Error de red');
      setStatus('error');
    }
  };

  return (
    <div className="solicitud-card">
      <div className="solicitud-icon">{esJuego ? '🙋' : '💡'}</div>
      <h3 className="solicitud-title">Pide el tuyo propio</h3>
      <p className="solicitud-desc">
        ¿Tienes en mente {esJuego ? 'un juego' : 'una herramienta'}?
        Descríbelo y lo revisamos para añadirlo.
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
          ✓ Solicitud enviada. Lo revisamos pronto.
        </p>
      )}

      {status === 'error' && (
        <div>
          <p className="solicitud-feedback solicitud-err">{errMsg || 'Error al enviar.'}</p>
          <button className="btn-secondary" style={{ marginTop: '8px' }} onClick={() => { setStatus('idle'); setDesc(''); }}>
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
