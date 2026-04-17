'use client';
import { useState } from 'react';
import { useT } from '../../../components/LocaleProvider';

export default function BuscarEmailsPage() {
  const t = useT('buscarEmails');
  const [url, setUrl]         = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null); // { emails: [], url } | { error: string }
  const [copied, setCopied]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setCopied(false);

    const res = await fetch(`/api/buscar-emails?url=${encodeURIComponent(url.trim())}`);
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const handleCopy = () => {
    if (!result?.emails?.length) return;
    navigator.clipboard.writeText(result.emails.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1><span className="highlight">{t.title}</span></h1>
        <p className="subtitle">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '680px', flexWrap: 'wrap' }}>
        <input
          className="yt-input"
          type="text"
          placeholder={t.placeholder}
          value={url}
          onChange={e => setUrl(e.target.value)}
          style={{ flex: 1, minWidth: '260px' }}
          disabled={loading}
        />
        <button type="submit" className="btn-primary" disabled={loading || !url.trim()}>
          {loading ? t.buscando : t.buscar}
        </button>
      </form>

      {loading && (
        <div style={{ marginTop: '32px', opacity: 0.6, fontSize: '15px' }}>
          {t.buscando}
        </div>
      )}

      {result?.error && (
        <div style={{ marginTop: '24px', color: '#f87171', fontSize: '14px', maxWidth: '680px',
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: '8px', padding: '12px 16px' }}>
          ❌ {result.error}
        </div>
      )}

      {result?.emails && (
        <div style={{ marginTop: '28px', maxWidth: '680px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600 }}>
              {result.emails.length === 0 ? t.noEmails : t.found(result.emails.length)}
            </span>
            {result.emails.length > 0 && (
              <button onClick={handleCopy} style={ghostBtn}>
                {copied ? t.copied : t.copyAll}
              </button>
            )}
          </div>

          {result.emails.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {result.emails.map(email => (
                <div key={email} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', padding: '10px 14px', fontSize: '14px', gap: '12px',
                }}>
                  <a href={`mailto:${email}`} style={{ color: 'var(--accent, #a78bfa)', textDecoration: 'none', wordBreak: 'break-all' }}>
                    {email}
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(email)}
                    style={{ ...ghostBtn, padding: '4px 10px', fontSize: '12px', flexShrink: 0 }}
                  >
                    {t.copy}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const ghostBtn = {
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.2)',
  color: 'inherit',
  borderRadius: '8px',
  padding: '6px 14px',
  cursor: 'pointer',
  fontSize: '13px',
  opacity: 0.75,
};
