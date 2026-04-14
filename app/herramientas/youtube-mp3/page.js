'use client';
import { useState } from 'react';

export default function YoutubeMp3Page() {
  const [url, setUrl]       = useState('');
  const [info, setInfo]     = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [errMsg, setErrMsg] = useState('');

  const fetchInfo = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setStatus('loading');
    setInfo(null);
    setErrMsg('');

    try {
      const res  = await fetch(`/api/youtube-mp3?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInfo(data);
      setStatus('ready');
    } catch (err) {
      setErrMsg(err.message);
      setStatus('error');
    }
  };

  const downloadUrl = `/api/youtube-mp3/download?url=${encodeURIComponent(url.trim())}`;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🎵 <span className="highlight">YouTube → MP3</span></h1>
        <p className="subtitle">
          Pega la URL de cualquier vídeo y descarga el audio en MP3. Máx. 20 min.
        </p>
      </div>

      <form onSubmit={fetchInfo} className="yt-form">
        <input
          className="yt-input"
          type="url"
          value={url}
          onChange={e => { setUrl(e.target.value); setStatus('idle'); setInfo(null); }}
          placeholder="https://www.youtube.com/watch?v=..."
          required
        />
        <button type="submit" className="btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'Cargando…' : 'Obtener info'}
        </button>
      </form>

      {status === 'error' && (
        <p className="solicitud-feedback solicitud-err" style={{ textAlign: 'center', marginTop: '16px' }}>
          {errMsg}
        </p>
      )}

      {status === 'ready' && info && (
        <div className="yt-result">
          <div className="yt-card">
            <img src={info.thumbnail} alt={info.title} className="yt-thumb" />
            <div className="yt-meta">
              <p className="yt-title">{info.title}</p>
              <p className="yt-sub">{info.author} · {info.duration}</p>
            </div>
          </div>
          <a href={downloadUrl} className="btn-primary yt-dl-btn">
            ⬇ Descargar MP3
          </a>
          <p className="drop-hint" style={{ textAlign: 'center', marginTop: '8px' }}>
            La conversión puede tardar unos segundos según la duración del vídeo.
          </p>
        </div>
      )}
    </div>
  );
}
