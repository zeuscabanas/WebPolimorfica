'use client';
import { useState } from 'react';
import { useT } from '../../components/LocaleProvider';

export default function SolicitudCard({ tipo }) {
  const t = useT('solicitud');
  const [desc, setDesc]     = useState('');
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');

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
      <h3 className="solicitud-title">{t.title}</h3>
      <p className="solicitud-desc">
        {esJuego ? t.descJuego : t.descHerramienta}
      </p>

      {status === 'idle' && (
        <form onSubmit={onSubmit} className="solicitud-form">
          <textarea
            className="solicitud-textarea"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder={esJuego ? t.placeholderJuego : t.placeholderHerramienta}
            rows={3}
            maxLength={500}
            required
          />
          <button type="submit" className="btn-primary solicitud-btn">
            {t.enviar}
          </button>
        </form>
      )}

      {status === 'loading' && (
        <p className="solicitud-feedback">{t.enviando}</p>
      )}

      {status === 'done' && (
        <p className="solicitud-feedback solicitud-ok">{t.ok}</p>
      )}

      {status === 'error' && (
        <div>
          <p className="solicitud-feedback solicitud-err">{errMsg || t.error}</p>
          <button
            className="btn-secondary"
            style={{ marginTop: '8px' }}
            onClick={() => { setStatus('idle'); setDesc(''); }}
          >
            {t.reintentar}
          </button>
        </div>
      )}
    </div>
  );
}
