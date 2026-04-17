'use client';
import { useState, useRef, useCallback } from 'react';
import { useT } from '../../../components/LocaleProvider';

export default function LeerQrPage() {
  const t = useT('leerQr');
  const [status, setStatus] = useState('idle'); // idle | reading | result | error
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const decode = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setStatus('reading');
    setContent('');

    try {
      const jsQR = (await import('jsqr')).default;
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height);

      if (result) {
        setContent(result.data);
        setStatus('result');
      } else {
        setContent('');
        setStatus('noqr');
      }
    } catch {
      setStatus('error');
    }
  }, []);

  const onFileChange = (e) => decode(e.target.files[0]);
  const onDrop = (e) => { e.preventDefault(); setDragging(false); decode(e.dataTransfer.files[0]); };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setStatus('idle'); setContent(''); setCopied(false); if (inputRef.current) inputRef.current.value = ''; };

  const isUrl = content && /^https?:\/\//i.test(content);

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1><span className="highlight">{t.title}</span></h1>
        <p className="subtitle">{t.subtitle}</p>
      </div>

      {(status === 'idle' || status === 'reading') && (
        <>
          <div
            className={`drop-zone${dragging ? ' drop-zone--active' : ''}`}
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <div className="drop-icon">📷</div>
            <p className="drop-label">{status === 'reading' ? t.reading : t.drop}</p>
            {status === 'idle' && <p className="drop-sub">{t.dropSub}</p>}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={onFileChange}
            />
          </div>
        </>
      )}

      {status === 'noqr' && (
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '15px', opacity: 0.6 }}>{t.noQr}</p>
          <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={reset}>{t.tryAnother}</button>
        </div>
      )}

      {status === 'error' && (
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '15px', color: '#f87171' }}>{t.error}</p>
          <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={reset}>{t.tryAnother}</button>
        </div>
      )}

      {status === 'result' && (
        <div style={{ marginTop: '32px', maxWidth: '680px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            {t.result}
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '16px 20px',
          }}>
            <p style={{ wordBreak: 'break-all', fontSize: '15px', margin: 0, color: isUrl ? 'var(--accent, #a78bfa)' : 'inherit' }}>
              {content}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={handleCopy}>
              {copied ? t.copied : t.copy}
            </button>
            {isUrl && (
              <a
                href={content}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-secondary"
                title={t.openWarn}
              >
                {t.open}
              </a>
            )}
            <button className="btn-secondary" onClick={reset}>{t.tryAnother}</button>
          </div>
          {isUrl && (
            <p style={{ fontSize: '12px', opacity: 0.4, marginTop: '10px' }}>{t.openWarn}</p>
          )}
        </div>
      )}
    </div>
  );
}
