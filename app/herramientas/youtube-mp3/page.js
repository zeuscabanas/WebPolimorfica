'use client';
import { useState } from 'react';
import { useT } from '../../../components/LocaleProvider';

export default function YoutubeMp3Page() {
  const t = useT('youtubeMp3');
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
        <h1><span className="highlight">{t.title}</span></h1>
        <p className="subtitle">{t.subtitle}</p>
      </div>

      <form onSubmit={fetchInfo} className="yt-form">
        <input
          className="yt-input"
          type="url"
          value={url}
          onChange={e => { setUrl(e.target.value); setStatus('idle'); setInfo(null); }}
          placeholder={t.placeholder}
          required
        />
        <button type="submit" className="btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? t.loading : t.fetch}
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
            {t.download}
          </a>
          <p className="drop-hint" style={{ textAlign: 'center', marginTop: '8px' }}>
            {t.hint}
          </p>
        </div>
      )}
    </div>
  );
}
