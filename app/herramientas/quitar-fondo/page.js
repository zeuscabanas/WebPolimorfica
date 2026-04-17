'use client';
import { useState, useRef, useCallback } from 'react';
import { useT } from '../../../components/LocaleProvider';

export default function QuitarFondoPage() {
  const t = useT('quitarFondo');
  const [original, setOriginal] = useState(null);
  const [result, setResult]     = useState(null);
  const [status, setStatus]     = useState('idle'); // idle | loading | done | error
  const [progress, setProgress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setResult(null);
    setStatus('loading');
    setProgress(t.loadingModel);
    setOriginal(URL.createObjectURL(file));

    try {
      const { removeBackground } = await import('@imgly/background-removal');
      setProgress(t.processing);
      const blob = await removeBackground(file, {
        publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.4.5/dist/',
        model: 'small',
        progress: (key, current, total) => {
          if (key.startsWith('fetch:')) {
            const pct = Math.round((current / total) * 100);
            setProgress(`${t.downloadingModel} ${pct}%`);
          }
        },
      });
      setResult(URL.createObjectURL(blob));
      setStatus('done');
    } catch (e) {
      console.error(e);
      setErrorMsg(e?.message || String(e));
      setStatus('error');
    }
  }, [t]);

  const onFileChange = (e) => processFile(e.target.files[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const onDownload = () => {
    const a = document.createElement('a');
    a.href = result;
    a.download = 'sin-fondo.png';
    a.click();
  };

  const onReset = () => {
    setOriginal(null);
    setResult(null);
    setStatus('idle');
    setProgress('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1><span className="highlight">{t.title}</span></h1>
        <p className="subtitle">{t.subtitle}</p>
      </div>

      {status === 'idle' && (
        <div
          className={`drop-zone${dragging ? ' drop-zone--active' : ''}`}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <div className="drop-icon">🖼</div>
          <p className="drop-label">{t.drop}</p>
          <p className="drop-sub">{t.dropSub}</p>
          <p className="drop-hint">JPG, PNG, WEBP — máx. 10 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
        </div>
      )}

      {status === 'loading' && (
        <div className="tool-loading">
          <div className="spinner" />
          <p>{progress}</p>
          <p className="drop-hint">{t.modelHint}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="tool-error">
          <p>{t.error}</p>
          {errorMsg && (
            <pre style={{ fontSize: '0.75rem', color: '#f87171', background: '#1a1d27', padding: '12px', borderRadius: '8px', maxWidth: '100%', overflowX: 'auto', textAlign: 'left', marginTop: '8px' }}>
              {errorMsg}
            </pre>
          )}
          <button className="btn-primary" onClick={onReset}>{t.retry}</button>
        </div>
      )}

      {status === 'done' && (
        <div className="tool-result">
          <div className="result-grid">
            <div className="result-card">
              <p className="result-label">{t.original}</p>
              <img src={original} alt={t.original} className="result-img" />
            </div>
            <div className="result-card">
              <p className="result-label">{t.result}</p>
              <div className="checker-bg">
                <img src={result} alt={t.result} className="result-img" />
              </div>
            </div>
          </div>
          <div className="result-actions">
            <button className="btn-primary" onClick={onDownload}>{t.download}</button>
            <button className="btn-secondary" onClick={onReset}>{t.newImage}</button>
          </div>
        </div>
      )}
    </div>
  );
}
